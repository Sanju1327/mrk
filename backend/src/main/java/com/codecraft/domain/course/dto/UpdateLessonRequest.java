package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.VideoType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Update a lesson. Null fields are left unchanged.
 * <p>
 * Video: set {@code videoType=YOUTUBE} + {@code videoUrl} to attach a YouTube video, or
 * {@code videoType=NONE} to remove the current video (uploaded files are deleted from storage).
 * Uploaded videos are attached through the dedicated multipart endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLessonRequest {

    @NotBlank(message = "Lesson title is required")
    @Size(max = 200, message = "Lesson title cannot exceed 200 characters")
    private String title;

    private String description;
    private String contentMarkdown;
    private Integer estimatedMinutes;
    private Integer displayOrder;

    private VideoType videoType;
    private String videoUrl;

    private Boolean published;
}
