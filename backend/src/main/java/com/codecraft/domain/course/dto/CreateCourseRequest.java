package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.CourseLevel;
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
public class CreateCourseRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    /** Optional: generated from the title when blank. */
    @Size(max = 150, message = "Slug cannot exceed 150 characters")
    private String slug;

    @NotBlank(message = "Description is required")
    private String description;

    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    @Builder.Default
    private CourseLevel level = CourseLevel.BEGINNER;

    @Builder.Default
    private String estimatedDuration = "4 weeks";

    @Size(max = 50, message = "Language cannot exceed 50 characters")
    private String language;

    private String iconUrl;

    @Size(max = 500, message = "Thumbnail URL cannot exceed 500 characters")
    private String thumbnailUrl;

    /** Super Admin only: assign the course to a specific teacher. Ignored for teachers (always self). */
    private Long teacherId;
}
