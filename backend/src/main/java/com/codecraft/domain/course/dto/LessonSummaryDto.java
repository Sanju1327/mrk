package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.Lesson;
import com.codecraft.domain.course.entity.VideoType;
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
    private String description;
    private Integer displayOrder;
    private Integer estimatedMinutes;
    private VideoType videoType;
    private boolean hasVideo;
    private boolean published;
    private Boolean completed;

    public static LessonSummaryDto fromEntity(Lesson lesson, Boolean completed) {
        VideoType type = lesson.getVideoType() != null ? lesson.getVideoType() : VideoType.NONE;
        return LessonSummaryDto.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .slug(lesson.getSlug())
                .description(lesson.getDescription())
                .displayOrder(lesson.getDisplayOrder())
                .estimatedMinutes(lesson.getEstimatedMinutes())
                .videoType(type)
                .hasVideo(type != VideoType.NONE && lesson.getVideoUrl() != null)
                .published(lesson.isPublished())
                .completed(completed != null ? completed : false)
                .build();
    }
}
