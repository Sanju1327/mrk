package com.codecraft.domain.course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Create a chapter (stored as {@code Topic}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateModuleRequest {

    @NotBlank(message = "Chapter title is required")
    @Size(max = 150, message = "Chapter title cannot exceed 150 characters")
    private String title;

    /** Optional: generated from the title when blank. */
    @Size(max = 150, message = "Chapter slug cannot exceed 150 characters")
    private String slug;

    private String description;
    private Integer displayOrder;

    // Completion settings (all optional on create)
    private Boolean requireAllLessons;
    private Boolean requireQuizPass;
    private Boolean allowQuizRetakes;

    @Min(value = 1, message = "Max quiz attempts must be at least 1")
    private Integer maxQuizAttempts;
}
