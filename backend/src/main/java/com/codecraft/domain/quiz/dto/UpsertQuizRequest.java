package com.codecraft.domain.quiz.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Create or update chapter quiz settings (questions are managed separately).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpsertQuizRequest {

    @NotBlank(message = "Quiz title is required")
    @Size(max = 150, message = "Quiz title cannot exceed 150 characters")
    private String title;

    private String description;

    @Min(value = 0, message = "Time limit cannot be negative (0 = no limit)")
    private Integer timeLimitMinutes;

    @Min(value = 1, message = "Passing score must be between 1 and 100")
    @Max(value = 100, message = "Passing score must be between 1 and 100")
    private Integer passingScorePercentage;

    private Boolean enabled;
}
