package com.codecraft.domain.enrollment.service;

import com.codecraft.common.exception.BadRequestException;
import com.codecraft.common.exception.ResourceNotFoundException;
import com.codecraft.domain.course.dto.EnrollmentDto;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;

    @Transactional
    public EnrollmentDto enroll(Long userId, Long courseId) {
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, courseId)) {
            throw new BadRequestException("You are already enrolled in this course");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .status(EnrollmentStatus.ACTIVE)
                .enrolledAt(LocalDateTime.now())
                .build();

        Enrollment saved = enrollmentRepository.save(enrollment);
        log.info("User {} enrolled in course {} ({})", userId, course.getTitle(), courseId);

        return EnrollmentDto.fromEntity(saved, 0.0);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDto> getUserEnrollments(Long userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        return enrollments.stream().map(enrollment -> {
            double progress = calculateCourseProgress(userId, enrollment.getCourse().getId());
            return EnrollmentDto.fromEntity(enrollment, progress);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(Long userId, Long courseId) {
        return enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    @Transactional(readOnly = true)
    public double calculateCourseProgress(Long userId, Long courseId) {
        List<Topic> topics = topicRepository.findByCourseIdOrderByDisplayOrderAsc(courseId);
        Set<Long> courseLessonIds = new HashSet<>();
        for (Topic t : topics) {
            for (Lesson l : lessonRepository.findByTopicIdOrderByDisplayOrderAsc(t.getId())) {
                courseLessonIds.add(l.getId());
            }
        }

        if (courseLessonIds.isEmpty()) {
            return 0.0;
        }

        List<LessonProgress> progresses = lessonProgressRepository.findByUserId(userId);
        long completed = progresses.stream()
                .filter(p -> p.isCompleted() && p.getLesson() != null && courseLessonIds.contains(p.getLesson().getId()))
                .count();

        double percentage = (double) completed / courseLessonIds.size() * 100.0;
        return Math.round(percentage * 10.0) / 10.0;
    }
}
