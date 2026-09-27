package com.codecraft.domain.quiz.dto;

import com.codecraft.domain.quiz.entity.Question;
import com.codecraft.domain.quiz.entity.QuestionOption;
import com.codecraft.domain.quiz.entity.QuestionType;
import com.codecraft.domain.quiz.entity.Quiz;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Full quiz representation for course authors, including correct answers and explanations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherQuizDto {
    private Long id;
    private Long topicId;
    private Long lessonId;
    private String title;
    private String description;
    private int timeLimitMinutes;
    private int passingScorePercentage;
    private boolean enabled;
    private int totalQuestions;
    private int totalPoints;
    private List<TeacherQuestionDto> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherQuestionDto {
        private Long id;
        private String questionText;
        private QuestionType questionType;
        private int points;
        private String explanation;
        private int displayOrder;
        private List<TeacherOptionDto> options;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherOptionDto {
        private Long id;
        private String optionText;
        private boolean correct;
        private int displayOrder;
    }

    public static TeacherQuizDto fromEntity(Quiz quiz) {
        if (quiz == null) return null;

        List<TeacherQuestionDto> questionDtos = quiz.getQuestions().stream()
                .sorted(java.util.Comparator.comparingInt(Question::getDisplayOrder))
                .map(q -> TeacherQuestionDto.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .questionType(q.getQuestionType())
                        .points(q.getPoints())
                        .explanation(q.getExplanation())
                        .displayOrder(q.getDisplayOrder())
                        .options(q.getOptions().stream()
                                .sorted(java.util.Comparator.comparingInt(QuestionOption::getDisplayOrder))
                                .map(o -> TeacherOptionDto.builder()
                                        .id(o.getId())
                                        .optionText(o.getOptionText())
                                        .correct(o.isCorrect())
                                        .displayOrder(o.getDisplayOrder())
                                        .build())
                                .toList())
                        .build())
                .toList();

        return TeacherQuizDto.builder()
                .id(quiz.getId())
                .topicId(quiz.getTopic() != null ? quiz.getTopic().getId() : null)
                .lessonId(quiz.getLesson() != null ? quiz.getLesson().getId() : null)
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .passingScorePercentage(quiz.getPassingScorePercentage())
                .enabled(quiz.isEnabled())
                .totalQuestions(quiz.getQuestions().size())
                .totalPoints(quiz.getQuestions().stream().mapToInt(Question::getPoints).sum())
                .questions(questionDtos)
                .build();
    }
}
