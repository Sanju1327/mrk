package com.codecraft.domain.quiz.service;

import com.codecraft.common.exception.BadRequestException;
import com.codecraft.common.exception.ConflictException;
import com.codecraft.common.exception.ResourceNotFoundException;
import com.codecraft.domain.course.dto.TopicDetailDto;
import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.course.entity.Lesson;
import com.codecraft.domain.course.entity.Topic;
import com.codecraft.domain.course.repository.LessonRepository;
import com.codecraft.domain.course.repository.TopicRepository;
import com.codecraft.domain.course.service.CourseAccess;
import com.codecraft.domain.quiz.dto.CreateQuizRequest;
import com.codecraft.domain.quiz.dto.TeacherQuizDto;
import com.codecraft.domain.quiz.dto.UpsertQuestionRequest;
import com.codecraft.domain.quiz.dto.UpsertQuizRequest;
import com.codecraft.domain.quiz.entity.Question;
import com.codecraft.domain.quiz.entity.QuestionOption;
import com.codecraft.domain.quiz.entity.QuestionType;
import com.codecraft.domain.quiz.entity.Quiz;
import com.codecraft.domain.quiz.repository.QuestionRepository;
import com.codecraft.domain.quiz.repository.QuizRepository;
import com.codecraft.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Chapter quiz authoring for teachers / super admins. Ownership is validated against the quiz's course.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherQuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;

    // ------------------------------------------------------------------
    // Access helpers
    // ------------------------------------------------------------------

    private static Course courseOf(Quiz quiz) {
        if (quiz.getTopic() != null) return quiz.getTopic().getCourse();
        if (quiz.getLesson() != null) return quiz.getLesson().getTopic().getCourse();
        return null;
    }

    private void checkAccess(Course course, User user) {
        if (course == null || !CourseAccess.isOwnerOrAdmin(course, user)) {
            throw new AccessDeniedException("You do not have permission to modify this quiz");
        }
    }

    private Quiz loadEditableQuiz(Long quizId, User user) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));
        checkAccess(courseOf(quiz), user);
        return quiz;
    }

    private Question loadEditableQuestion(Long questionId, User user) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        checkAccess(courseOf(question.getQuiz()), user);
        return question;
    }

    // ------------------------------------------------------------------
    // Chapter quiz
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public TeacherQuizDto getChapterQuiz(Long topicId, User user) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + topicId));
        checkAccess(topic.getCourse(), user);
        return TeacherQuizDto.fromEntity(TopicDetailDto.primaryQuiz(topic));
    }

    @Transactional
    public TeacherQuizDto createChapterQuiz(Long topicId, UpsertQuizRequest request, User user) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found with id: " + topicId));
        checkAccess(topic.getCourse(), user);

        if (TopicDetailDto.primaryQuiz(topic) != null) {
            throw new ConflictException("This chapter already has a quiz. Edit the existing quiz instead.");
        }

        Quiz quiz = Quiz.builder()
                .topic(topic)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .timeLimitMinutes(request.getTimeLimitMinutes() != null ? request.getTimeLimitMinutes() : 15)
                .passingScorePercentage(request.getPassingScorePercentage() != null ? request.getPassingScorePercentage() : 70)
                .enabled(request.getEnabled() == null || request.getEnabled())
                .build();

        Quiz saved = quizRepository.save(quiz);
        log.info("{} created chapter quiz '{}' (id={}) for chapter {}", user.getUsername(), saved.getTitle(), saved.getId(), topicId);
        return TeacherQuizDto.fromEntity(saved);
    }

    @Transactional
    public TeacherQuizDto updateQuiz(Long quizId, UpsertQuizRequest request, User user) {
        Quiz quiz = loadEditableQuiz(quizId, user);

        quiz.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) quiz.setDescription(request.getDescription());
        if (request.getTimeLimitMinutes() != null) quiz.setTimeLimitMinutes(request.getTimeLimitMinutes());
        if (request.getPassingScorePercentage() != null) quiz.setPassingScorePercentage(request.getPassingScorePercentage());
        if (request.getEnabled() != null) quiz.setEnabled(request.getEnabled());

        return TeacherQuizDto.fromEntity(quizRepository.save(quiz));
    }

    @Transactional
    public void deleteQuiz(Long quizId, User user) {
        Quiz quiz = loadEditableQuiz(quizId, user);
        if (quiz.getTopic() != null) {
            quiz.getTopic().getQuizzes().remove(quiz);
        }
        quizRepository.delete(quiz);
        log.info("Quiz {} deleted by {}", quizId, user.getUsername());
    }

    // ------------------------------------------------------------------
    // Questions
    // ------------------------------------------------------------------

    @Transactional
    public TeacherQuizDto addQuestion(Long quizId, UpsertQuestionRequest request, User user) {
        Quiz quiz = loadEditableQuiz(quizId, user);
        validateQuestion(request);

        int nextOrder = quiz.getQuestions().stream().mapToInt(Question::getDisplayOrder).max().orElse(0) + 1;
        Question question = Question.builder()
                .quiz(quiz)
                .questionText(request.getQuestionText().trim())
                .questionType(resolveType(request.getQuestionType()))
                .points(request.getPoints() != null ? request.getPoints() : 10)
                .explanation(request.getExplanation())
                .displayOrder(nextOrder)
                .build();
        applyOptions(question, request.getOptions());
        quiz.getQuestions().add(question);

        return TeacherQuizDto.fromEntity(quizRepository.save(quiz));
    }

    @Transactional
    public TeacherQuizDto updateQuestion(Long questionId, UpsertQuestionRequest request, User user) {
        Question question = loadEditableQuestion(questionId, user);
        validateQuestion(request);

        question.setQuestionText(request.getQuestionText().trim());
        question.setQuestionType(resolveType(request.getQuestionType()));
        if (request.getPoints() != null) question.setPoints(request.getPoints());
        question.setExplanation(request.getExplanation());
        // Replace options wholesale (orphanRemoval drops the old rows; attempt answers keep SET NULL semantics).
        question.getOptions().clear();
        applyOptions(question, request.getOptions());
        questionRepository.save(question);

        return TeacherQuizDto.fromEntity(question.getQuiz());
    }

    @Transactional
    public TeacherQuizDto deleteQuestion(Long questionId, User user) {
        Question question = loadEditableQuestion(questionId, user);
        Quiz quiz = question.getQuiz();
        quiz.getQuestions().remove(question);
        questionRepository.delete(question);
        renumber(quiz);
        return TeacherQuizDto.fromEntity(quizRepository.save(quiz));
    }

    @Transactional
    public TeacherQuizDto reorderQuestions(Long quizId, List<Long> orderedIds, User user) {
        Quiz quiz = loadEditableQuiz(quizId, user);

        Set<Long> existing = new HashSet<>();
        quiz.getQuestions().forEach(q -> existing.add(q.getId()));
        if (orderedIds == null || new HashSet<>(orderedIds).size() != orderedIds.size() || !existing.equals(new HashSet<>(orderedIds))) {
            throw new BadRequestException("Reorder request must contain each question id exactly once");
        }
        for (Question q : quiz.getQuestions()) {
            q.setDisplayOrder(orderedIds.indexOf(q.getId()) + 1);
        }
        quiz.getQuestions().sort(java.util.Comparator.comparingInt(Question::getDisplayOrder));
        return TeacherQuizDto.fromEntity(quizRepository.save(quiz));
    }

    // ------------------------------------------------------------------
    // Legacy bulk create (kept for backwards compatibility with the existing endpoint)
    // ------------------------------------------------------------------

    @Transactional
    public TeacherQuizDto createQuiz(CreateQuizRequest request, User user) {
        Topic topic = null;
        if (request.getTopicId() != null) {
            topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chapter not found: " + request.getTopicId()));
            checkAccess(topic.getCourse(), user);
        }
        Lesson lesson = null;
        if (request.getLessonId() != null) {
            lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lesson not found: " + request.getLessonId()));
            checkAccess(lesson.getTopic().getCourse(), user);
        }
        if (topic == null && lesson == null) {
            throw new BadRequestException("A quiz must belong to a chapter or a lesson");
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
                        question.getOptions().add(QuestionOption.builder()
                                .question(question)
                                .optionText(optDto.getOptionText())
                                .correct(optDto.isCorrect())
                                .displayOrder(optDto.getDisplayOrder() > 0 ? optDto.getDisplayOrder() : optOrder++)
                                .build());
                    }
                }
                quiz.getQuestions().add(question);
            }
        }

        Quiz saved = quizRepository.save(quiz);
        log.info("{} created quiz '{}' (id={})", user.getUsername(), saved.getTitle(), saved.getId());
        return TeacherQuizDto.fromEntity(saved);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private static QuestionType resolveType(QuestionType requested) {
        // Only single-answer multiple choice is gradable today; the enum/schema stay open for future types.
        if (requested == null || requested == QuestionType.SINGLE_CHOICE) return QuestionType.SINGLE_CHOICE;
        throw new BadRequestException("Question type " + requested + " is not supported yet. Use SINGLE_CHOICE.");
    }

    private static void validateQuestion(UpsertQuestionRequest request) {
        List<UpsertQuestionRequest.OptionInput> options = request.getOptions();
        if (options == null || options.size() < 2) {
            throw new BadRequestException("A question needs at least 2 options");
        }
        long correct = options.stream().filter(UpsertQuestionRequest.OptionInput::isCorrect).count();
        if (correct != 1) {
            throw new BadRequestException("Exactly one option must be marked as the correct answer");
        }
        boolean blank = options.stream().anyMatch(o -> o.getOptionText() == null || o.getOptionText().isBlank());
        if (blank) {
            throw new BadRequestException("Option text cannot be empty");
        }
    }

    private static void applyOptions(Question question, List<UpsertQuestionRequest.OptionInput> options) {
        int order = 1;
        for (UpsertQuestionRequest.OptionInput input : options) {
            question.getOptions().add(QuestionOption.builder()
                    .question(question)
                    .optionText(input.getOptionText().trim())
                    .correct(input.isCorrect())
                    .displayOrder(order++)
                    .build());
        }
    }

    private static void renumber(Quiz quiz) {
        int order = 1;
        for (Question q : quiz.getQuestions()) {
            q.setDisplayOrder(order++);
        }
    }
}
