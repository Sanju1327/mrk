package com.codecraft.domain.quiz.dto;

import com.codecraft.domain.quiz.entity.QuestionType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateQuizRequest {
    private Long topicId;
    private Long lessonId;

    @NotBlank(message = "Quiz title is required")
    private String title;

    private String description;
    private int timeLimitMinutes;
    private int passingScorePercentage;
    private List<QuestionInputDto> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionInputDto {
        private String questionText;
        private QuestionType questionType;
        private int points;
        private String explanation;
        private int displayOrder;
        private List<OptionInputDto> options;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionInputDto {
        private String optionText;
        private boolean isCorrect;
        private int displayOrder;
    }
}
