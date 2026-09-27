package com.codecraft.domain.course.service;

import com.codecraft.domain.course.dto.ProgressStatus;
import com.codecraft.domain.course.dto.TopicDetailDto;
import com.codecraft.domain.course.dto.TopicProgressDto;
import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.course.entity.Lesson;
import com.codecraft.domain.course.entity.LessonProgress;
import com.codecraft.domain.course.entity.Topic;
import com.codecraft.domain.course.repository.LessonProgressRepository;
import com.codecraft.domain.course.repository.LessonRepository;
import com.codecraft.domain.course.repository.TopicRepository;
import com.codecraft.domain.enrollment.entity.Enrollment;
import com.codecraft.domain.enrollment.entity.EnrollmentStatus;
import com.codecraft.domain.enrollment.repository.EnrollmentRepository;
import com.codecraft.domain.quiz.entity.Quiz;
import com.codecraft.domain.quiz.entity.QuizAttempt;
import com.codecraft.domain.quiz.repository.QuizAttemptRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Computes per-student chapter/course progress and the gating rules derived from chapter completion settings.
 * Builds on the existing {@code LessonProgress} + {@code QuizAttempt} records; nothing is duplicated in the DB.
 */
@Service
@RequiredArgsConstructor
public class CourseProgressService {

    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final EnrollmentRepository enrollmentRepository;

    /** Resolved state of a single chapter for a student. */
    @Getter
    public static class ChapterState {
        private Topic topic;
        private List<Lesson> lessons;
        private Set<Long> completedLessonIds;
        private Quiz quiz;              // enabled chapter quiz, or null
        private boolean quizPassed;
        private int quizAttemptsUsed;
        private Double quizBestPercentage;
        private Double quizLastPercentage;
        private LocalDateTime lastAttemptAt;
        private boolean locked;
        private boolean requirementsMet;
        private ProgressStatus status;
        private boolean quizUnlocked;
        private boolean canAttemptQuiz;
        private String quizBlockedReason;

        public int getTotalLessons() {
            return lessons.size();
        }

        public int getCompletedLessons() {
            return (int) lessons.stream().filter(l -> completedLessonIds.contains(l.getId())).count();
        }

        public boolean isLessonsComplete() {
            return !lessons.isEmpty() && getCompletedLessons() >= lessons.size();
        }

        public boolean isQuizRequired() {
            return quiz != null && topic.isRequireQuizPass();
        }
    }

    /**
     * Compute the ordered chapter states for a user (userId may be null for anonymous views).
     */
    @Transactional(readOnly = true)
    public List<ChapterState> computeChapterStates(Course course, Long userId) {
        List<Topic> topics = topicRepository.findByCourseIdOrderByDisplayOrderAsc(course.getId());
        Set<Long> completedLessonIds = completedLessonIds(userId);

        List<ChapterState> states = new ArrayList<>();
        boolean previousBlocked = false;

        for (Topic topic : topics) {
            ChapterState state = new ChapterState();
            state.topic = topic;
            state.lessons = lessonRepository.findByTopicIdOrderByDisplayOrderAsc(topic.getId());
            state.completedLessonIds = completedLessonIds;
            Quiz quiz = TopicDetailDto.primaryQuiz(topic);
            state.quiz = (quiz != null && quiz.isEnabled()) ? quiz : null;

            if (state.quiz != null && userId != null) {
                List<QuizAttempt> attempts =
                        quizAttemptRepository.findByUserIdAndQuizIdOrderByCreatedAtDesc(userId, state.quiz.getId());
                state.quizAttemptsUsed = attempts.size();
                state.quizPassed = attempts.stream().anyMatch(QuizAttempt::isPassed);
                state.quizBestPercentage = attempts.stream()
                        .map(a -> a.getPercentage() != null ? a.getPercentage().doubleValue() : 0.0)
                        .max(Double::compareTo).orElse(null);
                if (!attempts.isEmpty()) {
                    QuizAttempt last = attempts.get(0);
                    state.quizLastPercentage = last.getPercentage() != null ? last.getPercentage().doubleValue() : 0.0;
                    state.lastAttemptAt = last.getCreatedAt();
                }
            }

            state.locked = previousBlocked;

            boolean lessonsOk = !topic.isRequireAllLessons() || state.isLessonsComplete();
            boolean quizOk = !state.isQuizRequired() || state.quizPassed;
            state.requirementsMet = lessonsOk && quizOk;

            // Status: complete when all lessons are done and (if a quiz gate exists) the quiz is passed.
            if (!state.lessons.isEmpty() && state.isLessonsComplete() && quizOk) {
                state.status = ProgressStatus.COMPLETED;
            } else if (state.getCompletedLessons() > 0 || state.quizAttemptsUsed > 0) {
                state.status = ProgressStatus.IN_PROGRESS;
            } else {
                state.status = ProgressStatus.NOT_STARTED;
            }

            // Quiz availability
            state.quizUnlocked = state.quiz != null && !state.locked
                    && (!topic.isRequireAllLessons() || state.isLessonsComplete());
            resolveQuizAttemptability(state);

            if (!state.requirementsMet) {
                previousBlocked = true;
            }
            states.add(state);
        }
        return states;
    }

    private void resolveQuizAttemptability(ChapterState state) {
        Topic topic = state.topic;
        if (state.quiz == null) {
            state.canAttemptQuiz = false;
            state.quizBlockedReason = "This chapter has no active quiz";
            return;
        }
        if (state.locked) {
            state.canAttemptQuiz = false;
            state.quizBlockedReason = "Complete the previous chapter first";
            return;
        }
        if (topic.isRequireAllLessons() && !state.isLessonsComplete()) {
            state.canAttemptQuiz = false;
            state.quizBlockedReason = "Complete all lessons in this chapter to unlock the quiz";
            return;
        }
        if (state.quizAttemptsUsed == 0) {
            state.canAttemptQuiz = true;
            return;
        }
        if (!topic.isAllowQuizRetakes()) {
            state.canAttemptQuiz = false;
            state.quizBlockedReason = "Retakes are not allowed for this quiz";
            return;
        }
        Integer max = topic.getMaxQuizAttempts();
        if (max != null && state.quizAttemptsUsed >= max) {
            state.canAttemptQuiz = false;
            state.quizBlockedReason = "You have used all " + max + " attempts";
            return;
        }
        state.canAttemptQuiz = true;
    }

    public TopicProgressDto toProgressDto(ChapterState s) {
        return TopicProgressDto.builder()
                .status(s.status)
                .locked(s.locked)
                .totalLessons(s.getTotalLessons())
                .completedLessons(s.getCompletedLessons())
                .lessonsComplete(s.isLessonsComplete())
                .quizRequired(s.isQuizRequired())
                .quizPassed(s.quizPassed)
                .quizAttemptsUsed(s.quizAttemptsUsed)
                .quizMaxAttempts(s.topic.getMaxQuizAttempts())
                .quizBestPercentage(s.quizBestPercentage)
                .canAttemptQuiz(s.canAttemptQuiz)
                .quizUnlocked(s.quizUnlocked)
                .build();
    }

    /** Find the state of the chapter that owns the given topic id. */
    public Optional<ChapterState> findState(List<ChapterState> states, Long topicId) {
        return states.stream().filter(s -> s.topic.getId().equals(topicId)).findFirst();
    }

    /** First lesson of the chapter following {@code topicId}, if any. */
    public Long nextChapterFirstLessonId(List<ChapterState> states, Long topicId) {
        for (int i = 0; i < states.size(); i++) {
            if (states.get(i).topic.getId().equals(topicId) && i + 1 < states.size()) {
                List<Lesson> next = states.get(i + 1).lessons;
                return next.isEmpty() ? null : next.get(0).getId();
            }
        }
        return null;
    }

    public boolean isCourseComplete(List<ChapterState> states) {
        return !states.isEmpty() && states.stream().allMatch(s -> s.status == ProgressStatus.COMPLETED);
    }

    /**
     * Mark the enrollment COMPLETED when every chapter is complete (lessons + required quizzes).
     */
    @Transactional
    public void refreshEnrollmentCompletion(Long userId, Course course) {
        Optional<Enrollment> enrollmentOpt = enrollmentRepository.findByUserIdAndCourseId(userId, course.getId());
        if (enrollmentOpt.isEmpty()) return;
        Enrollment enrollment = enrollmentOpt.get();
        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) return;

        if (isCourseComplete(computeChapterStates(course, userId))) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            enrollment.setCompletedAt(LocalDateTime.now());
            enrollmentRepository.save(enrollment);
        }
    }

    private Set<Long> completedLessonIds(Long userId) {
        if (userId == null) return Collections.emptySet();
        Set<Long> ids = new HashSet<>();
        for (LessonProgress p : lessonProgressRepository.findByUserId(userId)) {
            if (p.isCompleted() && p.getLesson() != null) {
                ids.add(p.getLesson().getId());
            }
        }
        return ids;
    }
}
