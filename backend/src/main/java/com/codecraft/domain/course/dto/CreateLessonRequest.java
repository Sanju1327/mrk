package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.VideoType;
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

    /** Optional: generated from the title when blank. */
    @Size(max = 200, message = "Lesson slug cannot exceed 200 characters")
    private String slug;

    private String description;

    @Builder.Default
    private String contentMarkdown = "";

    @Builder.Default
    private int estimatedMinutes = 10;

    private Integer displayOrder;

    /** Optional YouTube video to attach on creation. */
    private VideoType videoType;
    private String videoUrl;

    private Boolean published;
}
