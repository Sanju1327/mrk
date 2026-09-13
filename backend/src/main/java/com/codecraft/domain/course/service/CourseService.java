package com.codecraft.domain.course.service;

import com.codecraft.common.exception.ResourceNotFoundException;
import com.codecraft.domain.course.dto.*;
import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.course.entity.Lesson;
import com.codecraft.domain.course.entity.LessonProgress;
import com.codecraft.domain.course.entity.Topic;
import com.codecraft.domain.course.repository.CourseRepository;
import com.codecraft.domain.course.repository.LessonProgressRepository;
import com.codecraft.domain.course.repository.LessonRepository;
import com.codecraft.domain.course.repository.TopicRepository;
import com.codecraft.domain.enrollment.entity.Enrollment;
import com.codecraft.domain.enrollment.entity.EnrollmentStatus;
import com.codecraft.domain.enrollment.repository.EnrollmentRepository;
import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CourseSummaryDto> getAllPublishedCourses() {
        List<Course> courses = courseRepository.findByPublishedTrueOrderByDisplayOrderAsc();
        return courses.stream().map(course -> {
            List<Topic> topics = topicRepository.findByCourseIdOrderByDisplayOrderAsc(course.getId());
            int topicCount = topics.size();
            int lessonCount = 0;
            int totalMinutes = 0;
            for (Topic t : topics) {
                List<Lesson> lessons = lessonRepository.findByTopicIdOrderByDisplayOrderAsc(t.getId());
                lessonCount += lessons.size();
                for (Lesson l : lessons) {
                    totalMinutes += l.getEstimatedMinutes();
                }
            }
            int estimatedHours = Math.max(1, (int) Math.ceil(totalMinutes / 60.0));
            return CourseSummaryDto.fromEntity(course, topicCount, lessonCount, estimatedHours);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseDetailDto getCourseBySlug(String slug, Long userId) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "slug", slug));
        checkPublishedAccess(course, userId);
        return buildCourseDetail(course, userId);
    }

    @Transactional(readOnly = true)
    public CourseDetailDto getCourseById(Long id, Long userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        checkPublishedAccess(course, userId);
        return buildCourseDetail(course, userId);
    }

    private void checkPublishedAccess(Course course, Long userId) {
        if (!course.isPublished()) {
            boolean isAuthorized = false;
            if (userId != null) {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    boolean isSuperAdmin = user.getRoles().stream()
                            .anyMatch(r -> "ROLE_SUPER_ADMIN".equals(r.getName()));
                    boolean isTeacher = course.getTeacher() != null && course.getTeacher().getId().equals(user.getId());
                    isAuthorized = isSuperAdmin || isTeacher;
                }
            }
            if (!isAuthorized) {
                throw new ResourceNotFoundException("Course not found or unpublished");
            }
        }
    }

    @Transactional(readOnly = true)
    public LessonDetailDto getLessonById(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        boolean completed = false;
        if (userId != null) {
            completed = lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                    .map(LessonProgress::isCompleted)
                    .orElse(false);
        }

        Topic topic = lesson.getTopic();
        List<Lesson> topicLessons = lessonRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId());
        Long prevLessonId = null;
        Long nextLessonId = null;

        for (int i = 0; i < topicLessons.size(); i++) {
            if (topicLessons.get(i).getId().equals(lessonId)) {
                if (i > 0) {
                    prevLessonId = topicLessons.get(i - 1).getId();
                }
                if (i < topicLessons.size() - 1) {
                    nextLessonId = topicLessons.get(i + 1).getId();
                }
                break;
            }
        }

        return LessonDetailDto.fromEntity(lesson, completed, nextLessonId, prevLessonId);
    }

    @Transactional
    public void completeLesson(Long lessonId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        Optional<LessonProgress> existingProgress = lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        if (existingProgress.isPresent()) {
            LessonProgress progress = existingProgress.get();
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            lessonProgressRepository.save(progress);
        } else {
            LessonProgress progress = LessonProgress.builder()
                    .user(user)
                    .lesson(lesson)
                    .completed(true)
                    .completedAt(LocalDateTime.now())
                    .build();
            lessonProgressRepository.save(progress);
        }

        // Update enrollment status if all lessons in course are completed
        Course course = lesson.getTopic().getCourse();
        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByUserIdAndCourseId(userId, course.getId());
        if (enrollmentOpt.isPresent()) {
            Enrollment enrollment = enrollmentOpt.get();
            int totalLessons = countTotalLessonsInCourse(course);
            int completedLessons = countCompletedLessonsForUserInCourse(userId, course);
            if (totalLessons > 0 && completedLessons >= totalLessons) {
                enrollment.setStatus(EnrollmentStatus.COMPLETED);
                enrollment.setCompletedAt(LocalDateTime.now());
                enrollmentRepository.save(enrollment);
            }
        }

        log.info("Lesson {} marked complete by user {}", lessonId, userId);
    }

    private CourseDetailDto buildCourseDetail(Course course, Long userId) {
        boolean isEnrolled = false;
        Set<Long> completedLessonIds = new HashSet<>();

        if (userId != null) {
            isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(userId, course.getId());
            List<LessonProgress> progresses = lessonProgressRepository.findByUserId(userId);
            for (LessonProgress p : progresses) {
                if (p.isCompleted() && p.getLesson() != null) {
                    completedLessonIds.add(p.getLesson().getId());
                }
            }
        }

        List<Topic> topics = topicRepository.findByCourseIdOrderByDisplayOrderAsc(course.getId());
        int totalLessons = 0;
        int completedLessons = 0;
        int totalMinutes = 0;

        List<TopicDetailDto> topicDtos = new ArrayList<>();
        for (Topic topic : topics) {
            List<Lesson> lessons = lessonRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId());
            List<LessonSummaryDto> lessonDtos = new ArrayList<>();
            for (Lesson l : lessons) {
                totalLessons++;
                totalMinutes += l.getEstimatedMinutes();
                boolean done = completedLessonIds.contains(l.getId());
                if (done) {
                    completedLessons++;
                }
                lessonDtos.add(LessonSummaryDto.fromEntity(l, done));
            }
            topicDtos.add(TopicDetailDto.fromEntity(topic, lessonDtos));
        }

        int estimatedHours = Math.max(1, (int) Math.ceil(totalMinutes / 60.0));
        double progressPercentage = totalLessons > 0 ? (double) completedLessons / totalLessons * 100.0 : 0.0;

        return CourseDetailDto.fromEntity(
                course,
                totalLessons,
                estimatedHours,
                isEnrolled,
                completedLessons,
                Math.round(progressPercentage * 10.0) / 10.0,
                topicDtos
        );
    }

    private int countTotalLessonsInCourse(Course course) {
        List<Topic> topics = topicRepository.findByCourseIdOrderByDisplayOrderAsc(course.getId());
        int total = 0;
        for (Topic t : topics) {
            total += lessonRepository.findByTopicIdOrderByDisplayOrderAsc(t.getId()).size();
        }
        return total;
    }

    private int countCompletedLessonsForUserInCourse(Long userId, Course course) {
        List<Topic> topics = topicRepository.findByCourseIdOrderByDisplayOrderAsc(course.getId());
        Set<Long> courseLessonIds = new HashSet<>();
        for (Topic t : topics) {
            for (Lesson l : lessonRepository.findByTopicIdOrderByDisplayOrderAsc(t.getId())) {
                courseLessonIds.add(l.getId());
            }
        }

        List<LessonProgress> progresses = lessonProgressRepository.findByUserId(userId);
        int completed = 0;
        for (LessonProgress lp : progresses) {
            if (lp.isCompleted() && lp.getLesson() != null && courseLessonIds.contains(lp.getLesson().getId())) {
                completed++;
            }
        }
        return completed;
    }
}
