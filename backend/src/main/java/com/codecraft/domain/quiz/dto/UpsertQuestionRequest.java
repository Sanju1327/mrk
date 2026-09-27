package com.codecraft.domain.quiz.dto;

import com.codecraft.domain.quiz.entity.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Create or replace a quiz question with its options.
 * Options are replaced wholesale on update (the client sends the full list).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpsertQuestionRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    /** Defaults to SINGLE_CHOICE (multiple choice with one correct answer). */
    private QuestionType questionType;

    @Min(value = 1, message = "Points must be at least 1")
    private Integer points;

    private String explanation;

    @NotNull(message = "Options are required")
    @Size(min = 2, message = "A question needs at least 2 options")
    @Valid
    private List<OptionInput> options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionInput {
        @NotBlank(message = "Option text is required")
        @Size(max = 500, message = "Option text cannot exceed 500 characters")
        private String optionText;

        private boolean correct;
    }
}
