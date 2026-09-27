package com.codecraft.domain.quiz.service;

import com.codecraft.common.exception.BadRequestException;
import com.codecraft.common.exception.ForbiddenException;
import com.codecraft.common.exception.ResourceNotFoundException;
import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.course.service.CourseAccess;
import com.codecraft.domain.course.service.CourseProgressService;
import com.codecraft.domain.quiz.dto.*;
import com.codecraft.domain.quiz.entity.*;
import com.codecraft.domain.quiz.repository.QuizAttemptAnswerRepository;
import com.codecraft.domain.quiz.repository.QuizAttemptRepository;
import com.codecraft.domain.quiz.repository.QuizRepository;
import com.codecraft.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Student-facing quiz flow: fetch, attempt rules, server-side grading, attempt history.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAttemptAnswerRepository quizAttemptAnswerRepository;
    private final CourseProgressService courseProgressService;

    private static Course courseOf(Quiz quiz) {
        if (quiz.getTopic() != null) return quiz.getTopic().getCourse();
        if (quiz.getLesson() != null) return quiz.getLesson().getTopic().getCourse();
        return null;
    }

    private Quiz loadVisibleQuiz(Long quizId, User user) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
        Course course = courseOf(quiz);
        boolean author = course != null && CourseAccess.isOwnerOrAdmin(course, user);
        if (!author) {
            if (course != null && !course.isPublished()) {
                throw new ResourceNotFoundException("Quiz not found or unpublished");
            }
            if (!quiz.isEnabled()) {
                throw new ResourceNotFoundException("This quiz is currently disabled");
            }
        }
        return quiz;
    }

    /**
     * Attempt state for a student; authors always get an unrestricted state (preview).
     */
    private QuizAttemptInfoDto attemptInfoFor(Quiz quiz, User user, boolean author) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndQuizIdOrderByCreatedAtDesc(user.getId(), quiz.getId());
        QuizAttemptInfoDto.QuizAttemptInfoDtoBuilder builder = QuizAttemptInfoDto.builder()
                .attemptsUsed(attempts.size())
                .passed(attempts.stream().anyMatch(QuizAttempt::isPassed))
                .bestPercentage(attempts.stream()
                        .map(a -> a.getPercentage() != null ? a.getPercentage().doubleValue() : 0.0)
                        .max(Double::compareTo).orElse(null))
                .lastPercentage(attempts.isEmpty() ? null
                        : (attempts.get(0).getPercentage() != null ? attempts.get(0).getPercentage().doubleValue() : 0.0))
                .lastAttemptAt(attempts.isEmpty() ? null : attempts.get(0).getCreatedAt());

        if (quiz.getTopic() == null) {
            // Lesson-level quizzes have no chapter settings: unlimited attempts.
            return builder.allowRetakes(true).maxAttempts(null).canAttempt(true).build();
        }

        builder.allowRetakes(quiz.getTopic().isAllowQuizRetakes())
                .maxAttempts(quiz.getTopic().getMaxQuizAttempts());

        if (author) {
            return builder.canAttempt(true).build();
        }

        Course course = quiz.getTopic().getCourse();
        List<CourseProgressService.ChapterState> states = courseProgressService.computeChapterStates(course, user.getId());
        CourseProgressService.ChapterState state = courseProgressService.findState(states, quiz.getTopic().getId()).orElse(null);
        if (state == null) {
            return builder.canAttempt(false).blockedReason("Chapter not found").build();
        }
        return builder.canAttempt(state.isCanAttemptQuiz()).blockedReason(state.getQuizBlockedReason()).build();
    }

    @Transactional(readOnly = true)
    public StudentQuizDto getQuizForStudent(Long quizId, User user) {
        Quiz quiz = loadVisibleQuiz(quizId, user);
        Course course = courseOf(quiz);
        boolean author = course != null && CourseAccess.isOwnerOrAdmin(course, user);

        StudentQuizDto dto = StudentQuizDto.fromEntity(quiz);
        QuizAttemptInfoDto info = attemptInfoFor(quiz, user, author);
        dto.setAttemptInfo(info);
        if (quiz.getTopic() != null) {
            List<CourseProgressService.ChapterState> states = courseProgressService.computeChapterStates(course, user.getId());
            dto.setNextChapterFirstLessonId(courseProgressService.nextChapterFirstLessonId(states, quiz.getTopic().getId()));
        }
        // Never ship questions to a student who is not allowed to attempt right now.
        if (!info.isCanAttempt() && !author) {
            dto.setQuestions(Collections.emptyList());
        }
        return dto;
    }

    @Transactional(readOnly = true)
    public List<StudentQuizDto> getQuizzesByLesson(Long lessonId, User user) {
        return quizRepository.findAll().stream()
                .filter(q -> q.getLesson() != null && q.getLesson().getId().equals(lessonId))
                .filter(q -> q.isEnabled() && courseOf(q) != null && (courseOf(q).isPublished() || CourseAccess.isOwnerOrAdmin(courseOf(q), user)))
                .map(StudentQuizDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentQuizDto> getQuizzesByTopic(Long topicId, User user) {
        return quizRepository.findByTopicId(topicId).stream()
                .filter(q -> q.isEnabled() && courseOf(q) != null && (courseOf(q).isPublished() || CourseAccess.isOwnerOrAdmin(courseOf(q), user)))
                .map(StudentQuizDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptSummaryDto> getMyAttempts(Long quizId, User user) {
        loadVisibleQuiz(quizId, user);
        return quizAttemptRepository.findByUserIdAndQuizIdOrderByCreatedAtDesc(user.getId(), quizId).stream()
                .map(QuizAttemptSummaryDto::fromEntity)
                .toList();
    }

    @Transactional
    public QuizResultDto submitQuiz(Long quizId, SubmitQuizRequest request, User student) {
        Quiz quiz = loadVisibleQuiz(quizId, student);
        Course course = courseOf(quiz);
        boolean author = course != null && CourseAccess.isOwnerOrAdmin(course, student);

        QuizAttemptInfoDto before = attemptInfoFor(quiz, student, author);
        if (!before.isCanAttempt()) {
            throw new ForbiddenException(before.getBlockedReason() != null ? before.getBlockedReason() : "You cannot attempt this quiz right now");
        }
        if (quiz.getQuestions().isEmpty()) {
            throw new BadRequestException("This quiz has no questions yet");
        }

        Map<Long, Long> answers = request.getAnswers() != null ? request.getAnswers() : Map.of();
        Set<Long> questionIds = new HashSet<>();
        quiz.getQuestions().forEach(q -> questionIds.add(q.getId()));
        if (!questionIds.containsAll(answers.keySet())) {
            throw new BadRequestException("Answers reference questions that do not belong to this quiz");
        }

        int totalScore = 0;
        int maxScore = 0;
        List<QuizResultDto.QuestionResultDto> questionResults = new ArrayList<>();
        List<QuizAttemptAnswer> attemptAnswers = new ArrayList<>();

        QuizAttempt attempt = QuizAttempt.builder()
                .user(student)
                .quiz(quiz)
                .score(0)
                .maxScore(0)
                .percentage(BigDecimal.ZERO)
                .passed(false)
                .timeSpentSeconds(Math.max(0, request.getTimeSpentSeconds()))
                .build();
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        for (Question q : quiz.getQuestions()) {
            maxScore += q.getPoints();
            Long selectedOptId = answers.get(q.getId());

            QuestionOption correctOption = q.getOptions().stream()
                    .filter(QuestionOption::isCorrect)
                    .findFirst()
                    .orElse(null);
            Long correctOptId = correctOption != null ? correctOption.getId() : null;

            QuestionOption selectedOption = selectedOptId != null
                    ? q.getOptions().stream().filter(o -> o.getId().equals(selectedOptId)).findFirst().orElse(null)
                    : null;
            if (selectedOptId != null && selectedOption == null) {
                throw new BadRequestException("Selected option does not belong to question " + q.getId());
            }

            boolean isCorrect = selectedOptId != null && selectedOptId.equals(correctOptId);
            int pointsEarned = isCorrect ? q.getPoints() : 0;
            totalScore += pointsEarned;

            attemptAnswers.add(QuizAttemptAnswer.builder()
                    .attempt(savedAttempt)
                    .question(q)
                    .selectedOption(selectedOption)
                    .correct(isCorrect)
                    .pointsAwarded(pointsEarned)
                    .build());

            questionResults.add(QuizResultDto.QuestionResultDto.builder()
                    .questionId(q.getId())
                    .questionText(q.getQuestionText())
                    .selectedOptionId(selectedOptId)
                    .correctOptionId(correctOptId)
                    .isCorrect(isCorrect)
                    .pointsEarned(pointsEarned)
                    .pointsPossible(q.getPoints())
                    .explanation(q.getExplanation())
                    .build());
        }

        quizAttemptAnswerRepository.saveAll(attemptAnswers);

        double percentage = maxScore > 0 ? ((double) totalScore / maxScore) * 100.0 : 0.0;
        boolean passed = percentage >= quiz.getPassingScorePercentage();

        savedAttempt.setScore(totalScore);
        savedAttempt.setMaxScore(maxScore);
        savedAttempt.setPercentage(BigDecimal.valueOf(percentage).setScale(2, RoundingMode.HALF_UP));
        savedAttempt.setPassed(passed);
        quizAttemptRepository.save(savedAttempt);

        log.info("Student {} submitted quiz {} (id={}): Score {}/{} ({}%) Passed={}",
                student.getUsername(), quiz.getTitle(), quizId, totalScore, maxScore, percentage, passed);

        Long nextChapterFirstLessonId = null;
        if (course != null && quiz.getTopic() != null) {
            courseProgressService.refreshEnrollmentCompletion(student.getId(), course);
            List<CourseProgressService.ChapterState> states = courseProgressService.computeChapterStates(course, student.getId());
            nextChapterFirstLessonId = courseProgressService.nextChapterFirstLessonId(states, quiz.getTopic().getId());
        }

        return QuizResultDto.builder()
                .attemptId(savedAttempt.getId())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .score(totalScore)
                .maxScore(maxScore)
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .passed(passed)
                .passingScorePercentage(quiz.getPassingScorePercentage())
                .timeSpentSeconds(request.getTimeSpentSeconds())
                .questionResults(questionResults)
                .attemptInfo(attemptInfoFor(quiz, student, author))
                .courseSlug(course != null ? course.getSlug() : null)
                .nextChapterFirstLessonId(nextChapterFirstLessonId)
                .build();
    }
}
