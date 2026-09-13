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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentQuizDto {
    private Long id;
    private Long topicId;
    private Long lessonId;
    private String title;
    private String description;
    private int timeLimitMinutes;
    private int passingScorePercentage;
    private int totalQuestions;
    private int totalPoints;
    private List<StudentQuestionDto> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentQuestionDto {
        private Long id;
        private String questionText;
        private QuestionType questionType;
        private int points;
        private int displayOrder;
        private List<StudentOptionDto> options;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentOptionDto {
        private Long id;
        private String optionText;
        private int displayOrder;
        // NOTE: isCorrect is strictly omitted from Student DTO
    }

    public static StudentQuizDto fromEntity(Quiz quiz) {
        if (quiz == null) return null;

        List<StudentQuestionDto> questionDtos = quiz.getQuestions().stream().map(q -> {
            List<StudentOptionDto> optionDtos = q.getOptions().stream()
                    .map(o -> StudentOptionDto.builder()
                            .id(o.getId())
                            .optionText(o.getOptionText())
                            .displayOrder(o.getDisplayOrder())
                            .build())
                    .toList();

            return StudentQuestionDto.builder()
                    .id(q.getId())
                    .questionText(q.getQuestionText())
                    .questionType(q.getQuestionType())
                    .points(q.getPoints())
                    .displayOrder(q.getDisplayOrder())
                    .options(optionDtos)
                    .build();
        }).toList();

        int totalPoints = quiz.getQuestions().stream().mapToInt(Question::getPoints).sum();

        return StudentQuizDto.builder()
                .id(quiz.getId())
                .topicId(quiz.getTopic() != null ? quiz.getTopic().getId() : null)
                .lessonId(quiz.getLesson() != null ? quiz.getLesson().getId() : null)
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .passingScorePercentage(quiz.getPassingScorePercentage())
                .totalQuestions(quiz.getQuestions().size())
                .totalPoints(totalPoints)
                .questions(questionDtos)
                .build();
    }
}
