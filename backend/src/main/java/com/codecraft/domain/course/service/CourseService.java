package com.codecraft.domain.course.service;

import com.codecraft.common.exception.ForbiddenException;
import com.codecraft.common.exception.ResourceNotFoundException;
import com.codecraft.domain.course.dto.*;
import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.course.entity.Lesson;
import com.codecraft.domain.course.entity.LessonProgress;
import com.codecraft.domain.course.entity.Topic;
import com.codecraft.domain.course.repository.CourseRepository;
import com.codecraft.domain.course.repository.CourseResourceRepository;
import com.codecraft.domain.course.repository.LessonProgressRepository;
import com.codecraft.domain.course.repository.LessonRepository;
import com.codecraft.domain.course.repository.TopicRepository;
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
    private final CourseResourceRepository courseResourceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseProgressService courseProgressService;

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

    private User loadUser(Long userId) {
        return userId != null ? userRepository.findById(userId).orElse(null) : null;
    }

    /** Unpublished courses are only visible to their owner and super admins (preview). */
    private void checkPublishedAccess(Course course, Long userId) {
        if (!course.isPublished() && !CourseAccess.isOwnerOrAdmin(course, loadUser(userId))) {
            throw new ResourceNotFoundException("Course not found or unpublished");
        }
    }

    @Transactional(readOnly = true)
    public LessonDetailDto getLessonById(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        Topic topic = lesson.getTopic();
        Course course = topic.getCourse();
        User user = loadUser(userId);
        boolean isAuthor = CourseAccess.isOwnerOrAdmin(course, user);

        if (!course.isPublished() && !isAuthor) {
            throw new ResourceNotFoundException("Lesson not found or unpublished");
        }
        if (!lesson.isPublished() && !isAuthor) {
            throw new ResourceNotFoundException("Lesson not found or unpublished");
        }

        List<CourseProgressService.ChapterState> states = courseProgressService.computeChapterStates(course, userId);
        CourseProgressService.ChapterState chapterState = courseProgressService.findState(states, topic.getId()).orElse(null);

        // Chapter gating is enforced server-side for students; authors can always preview.
        if (!isAuthor && chapterState != null && chapterState.isLocked()) {
            throw new ForbiddenException("Complete the previous chapter to unlock this lesson");
        }

        boolean completed = false;
        int videoPosition = 0;
        if (userId != null) {
            Optional<LessonProgress> progress = lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId);
            completed = progress.map(LessonProgress::isCompleted).orElse(false);
            videoPosition = progress.map(LessonProgress::getVideoPositionSeconds).orElse(0);
        }

        List<Lesson> topicLessons = chapterState != null
                ? chapterState.getLessons()
                : lessonRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId());
        if (!isAuthor) {
            topicLessons = topicLessons.stream().filter(Lesson::isPublished).toList();
        }

        Long prevLessonId = null;
        Long nextLessonId = null;
        for (int i = 0; i < topicLessons.size(); i++) {
            if (topicLessons.get(i).getId().equals(lessonId)) {
                if (i > 0) prevLessonId = topicLessons.get(i - 1).getId();
                if (i < topicLessons.size() - 1) nextLessonId = topicLessons.get(i + 1).getId();
                break;
            }
        }

        LessonDetailDto dto = LessonDetailDto.fromEntity(lesson, completed, nextLessonId, prevLessonId);
        dto.setVideoPositionSeconds(videoPosition);
        dto.setLastInChapter(nextLessonId == null);
        if (chapterState != null && chapterState.getQuiz() != null) {
            dto.setChapterQuizId(chapterState.getQuiz().getId());
            dto.setChapterQuizRequired(chapterState.isQuizRequired());
        }
        dto.setNextChapterFirstLessonId(courseProgressService.nextChapterFirstLessonId(states, topic.getId()));
        dto.setResources(courseResourceRepository.findByLessonIdOrderByDisplayOrderAscIdAsc(lessonId).stream()
                .map(CourseResourceDto::fromEntity)
                .toList());
        return dto;
    }

    @Transactional
    public void completeLesson(Long lessonId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        Course course = lesson.getTopic().getCourse();
        if (!course.isPublished() && !CourseAccess.isOwnerOrAdmin(course, user)) {
            throw new ResourceNotFoundException("Lesson not found or unpublished");
        }

        LessonProgress progress = lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> LessonProgress.builder().user(user).lesson(lesson).build());
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());
        lessonProgressRepository.save(progress);

        courseProgressService.refreshEnrollmentCompletion(userId, course);
        log.info("Lesson {} marked complete by user {}", lessonId, userId);
    }

    /**
     * Store the student's playback position so the video can resume later. Creates an in-progress record if needed.
     */
    @Transactional
    public void updateLessonProgress(Long lessonId, Long userId, UpdateLessonProgressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        LessonProgress progress = lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> LessonProgress.builder().user(user).lesson(lesson).completed(false).build());
        if (request.getVideoPositionSeconds() != null) {
            progress.setVideoPositionSeconds(Math.max(0, request.getVideoPositionSeconds()));
        }
        lessonProgressRepository.save(progress);
    }

    private CourseDetailDto buildCourseDetail(Course course, Long userId) {
        User user = loadUser(userId);
        boolean isAuthor = CourseAccess.isOwnerOrAdmin(course, user);
        boolean isEnrolled = userId != null && enrollmentRepository.existsByUserIdAndCourseId(userId, course.getId());

        List<CourseProgressService.ChapterState> states = courseProgressService.computeChapterStates(course, userId);

        int totalLessons = 0;
        int completedLessons = 0;
        int totalMinutes = 0;
        List<TopicDetailDto> topicDtos = new ArrayList<>();

        for (CourseProgressService.ChapterState state : states) {
            List<LessonSummaryDto> lessonDtos = new ArrayList<>();
            for (Lesson l : state.getLessons()) {
                if (!l.isPublished() && !isAuthor) continue;
                totalLessons++;
                totalMinutes += l.getEstimatedMinutes();
                boolean done = state.getCompletedLessonIds().contains(l.getId());
                if (done) completedLessons++;
                lessonDtos.add(LessonSummaryDto.fromEntity(l, done));
            }
            TopicProgressDto progress = userId != null ? courseProgressService.toProgressDto(state) : null;
            topicDtos.add(TopicDetailDto.fromEntity(state.getTopic(), lessonDtos, progress));
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

}
