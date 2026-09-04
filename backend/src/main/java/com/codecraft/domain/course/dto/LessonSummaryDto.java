package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.Lesson;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonSummaryDto {
    private Long id;
    private String title;
    private String slug;
    private Integer displayOrder;
    private Integer estimatedMinutes;
    private Boolean completed;

    public static LessonSummaryDto fromEntity(Lesson lesson, Boolean completed) {
        return LessonSummaryDto.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .slug(lesson.getSlug())
                .displayOrder(lesson.getDisplayOrder())
                .estimatedMinutes(lesson.getEstimatedMinutes())
                .completed(completed != null ? completed : false)
                .build();
    }
}
