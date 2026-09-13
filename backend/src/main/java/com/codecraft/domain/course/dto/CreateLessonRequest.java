package com.codecraft.domain.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLessonRequest {

    @NotBlank(message = "Lesson title is required")
    @Size(max = 200, message = "Lesson title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Lesson slug is required")
    @Size(max = 200, message = "Lesson slug cannot exceed 200 characters")
    private String slug;

    @Builder.Default
    private String contentMarkdown = "";

    @Builder.Default
    private int estimatedMinutes = 10;

    private Integer displayOrder;
}
