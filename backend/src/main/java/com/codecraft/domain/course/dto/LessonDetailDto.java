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
public class LessonDetailDto {
    private Long id;
    private Long topicId;
    private String topicTitle;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private String title;
    private String slug;
    private String contentMarkdown;
    private Integer displayOrder;
    private Integer estimatedMinutes;
    private Boolean completed;
    private Long nextLessonId;
    private Long prevLessonId;
    private java.util.List<ContentBlockDto> contentBlocks;
    private java.util.List<CourseResourceDto> resources;

    public static LessonDetailDto fromEntity(
            Lesson lesson,
            Boolean completed,
            Long nextLessonId,
            Long prevLessonId
    ) {
        java.util.List<ContentBlockDto> blocks = lesson.getContentBlocks() != null ?
                lesson.getContentBlocks().stream().map(ContentBlockDto::fromEntity).toList() :
                java.util.Collections.emptyList();

        return LessonDetailDto.builder()
                .id(lesson.getId())
                .topicId(lesson.getTopic().getId())
                .topicTitle(lesson.getTopic().getTitle())
                .courseId(lesson.getTopic().getCourse().getId())
                .courseTitle(lesson.getTopic().getCourse().getTitle())
                .courseSlug(lesson.getTopic().getCourse().getSlug())
                .title(lesson.getTitle())
                .slug(lesson.getSlug())
                .contentMarkdown(lesson.getContentMarkdown())
                .displayOrder(lesson.getDisplayOrder())
                .estimatedMinutes(lesson.getEstimatedMinutes())
                .completed(completed != null ? completed : false)
                .nextLessonId(nextLessonId)
                .prevLessonId(prevLessonId)
                .contentBlocks(blocks)
                .resources(java.util.Collections.emptyList())
                .build();
    }
}
