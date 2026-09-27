package com.codecraft.domain.course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Update a chapter (stored as {@code Topic}). Null fields are left unchanged.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateModuleRequest {

    @NotBlank(message = "Chapter title is required")
    @Size(max = 150, message = "Chapter title cannot exceed 150 characters")
    private String title;

    private String description;
    private Integer displayOrder;

    // Completion settings
    private Boolean requireAllLessons;
    private Boolean requireQuizPass;
    private Boolean allowQuizRetakes;

    @Min(value = 1, message = "Max quiz attempts must be at least 1")
    private Integer maxQuizAttempts;

    /** When true, {@code maxQuizAttempts} is cleared (unlimited). */
    private Boolean clearMaxQuizAttempts;
}
