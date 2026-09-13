package com.codecraft.domain.quiz.service;

import com.codecraft.common.exception.ResourceNotFoundException;
import com.codecraft.domain.course.entity.Lesson;
import com.codecraft.domain.course.entity.Topic;
import com.codecraft.domain.course.repository.LessonRepository;
import com.codecraft.domain.course.repository.TopicRepository;
import com.codecraft.domain.quiz.dto.CreateQuizRequest;
import com.codecraft.domain.quiz.dto.QuizResultDto;
import com.codecraft.domain.quiz.dto.StudentQuizDto;
import com.codecraft.domain.quiz.dto.SubmitQuizRequest;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAttemptAnswerRepository quizAttemptAnswerRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;

    @Transactional(readOnly = true)
    public StudentQuizDto getQuizForStudent(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
        return StudentQuizDto.fromEntity(quiz);
    }

    @Transactional(readOnly = true)
    public List<StudentQuizDto> getQuizzesByLesson(Long lessonId) {
        return quizRepository.findAll().stream()
                .filter(q -> q.getLesson() != null && q.getLesson().getId().equals(lessonId))
                .map(StudentQuizDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentQuizDto> getQuizzesByTopic(Long topicId) {
        return quizRepository.findByTopicId(topicId).stream()
                .map(StudentQuizDto::fromEntity)
                .toList();
    }

    @Transactional
    public QuizResultDto submitQuiz(Long quizId, SubmitQuizRequest request, User student) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        Map<Long, Long> answers = request.getAnswers() != null ? request.getAnswers() : Map.of();
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
                .timeSpentSeconds(request.getTimeSpentSeconds())
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
            boolean isCorrect = selectedOptId != null && selectedOptId.equals(correctOptId);
            int pointsEarned = isCorrect ? q.getPoints() : 0;
            totalScore += pointsEarned;

            QuestionOption selectedOption = selectedOptId != null ?
                    q.getOptions().stream().filter(o -> o.getId().equals(selectedOptId)).findFirst().orElse(null) :
                    null;

            QuizAttemptAnswer attemptAnswer = QuizAttemptAnswer.builder()
                    .attempt(savedAttempt)
                    .question(q)
                    .selectedOption(selectedOption)
                    .correct(isCorrect)
                    .pointsAwarded(pointsEarned)
                    .build();
            attemptAnswers.add(attemptAnswer);

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

        return QuizResultDto.builder()
                .attemptId(savedAttempt.getId())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .score(totalScore)
                .maxScore(maxScore)
                .percentage(percentage)
                .passed(passed)
                .timeSpentSeconds(request.getTimeSpentSeconds())
                .questionResults(questionResults)
                .build();
    }

    @Transactional
    public StudentQuizDto createQuiz(CreateQuizRequest request, User teacher) {
        Topic topic = null;
        if (request.getTopicId() != null) {
            topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + request.getTopicId()));
        }

        Lesson lesson = null;
        if (request.getLessonId() != null) {
            lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + request.getLessonId()));
        }

        Quiz quiz = Quiz.builder()
                .topic(topic)
                .lesson(lesson)
                .title(request.getTitle())
                .description(request.getDescription())
                .timeLimitMinutes(request.getTimeLimitMinutes() > 0 ? request.getTimeLimitMinutes() : 15)
                .passingScorePercentage(request.getPassingScorePercentage() > 0 ? request.getPassingScorePercentage() : 70)
                .build();

        if (request.getQuestions() != null) {
            int qOrder = 1;
            for (CreateQuizRequest.QuestionInputDto qDto : request.getQuestions()) {
                Question question = Question.builder()
                        .quiz(quiz)
                        .questionText(qDto.getQuestionText())
                        .questionType(qDto.getQuestionType() != null ? qDto.getQuestionType() : QuestionType.SINGLE_CHOICE)
                        .points(qDto.getPoints() > 0 ? qDto.getPoints() : 10)
                        .explanation(qDto.getExplanation())
                        .displayOrder(qDto.getDisplayOrder() > 0 ? qDto.getDisplayOrder() : qOrder++)
                        .build();

                if (qDto.getOptions() != null) {
                    int optOrder = 1;
                    for (CreateQuizRequest.OptionInputDto optDto : qDto.getOptions()) {
                        QuestionOption option = QuestionOption.builder()
                                .question(question)
                                .optionText(optDto.getOptionText())
                                .correct(optDto.isCorrect())
                                .displayOrder(optDto.getDisplayOrder() > 0 ? optDto.getDisplayOrder() : optOrder++)
                                .build();
                        question.getOptions().add(option);
                    }
                }
                quiz.getQuestions().add(question);
            }
        }

        Quiz saved = quizRepository.save(quiz);
        log.info("Teacher {} created quiz: {} (id={})", teacher.getUsername(), saved.getTitle(), saved.getId());
        return StudentQuizDto.fromEntity(saved);
    }
}
