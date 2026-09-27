package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.Lesson;
import com.codecraft.domain.course.entity.VideoType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

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
    private String description;
    private String contentMarkdown;
    private Integer displayOrder;
    private Integer estimatedMinutes;
    private boolean published;

    // Primary video
    private VideoType videoType;
    private String videoUrl;
    private String videoId;
    private String videoFileName;
    private String videoMimeType;
    private Long videoFileSize;

    // Student progress
    private Boolean completed;
    private Integer videoPositionSeconds;

    // Navigation
    private Long nextLessonId;
    private Long prevLessonId;
    /** True when this is the last lesson of its chapter. */
    private boolean lastInChapter;
    /** Chapter quiz to take after the last lesson (null if none / disabled). */
    private Long chapterQuizId;
    private boolean chapterQuizRequired;
    /** First lesson of the next chapter, if any. */
    private Long nextChapterFirstLessonId;

    private List<ContentBlockDto> contentBlocks;
    private List<CourseResourceDto> resources;

    public static LessonDetailDto fromEntity(
            Lesson lesson,
            Boolean completed,
            Long nextLessonId,
            Long prevLessonId
    ) {
        List<ContentBlockDto> blocks = lesson.getContentBlocks() != null ?
                lesson.getContentBlocks().stream().map(ContentBlockDto::fromEntity).toList() :
                Collections.emptyList();

        return LessonDetailDto.builder()
                .id(lesson.getId())
                .topicId(lesson.getTopic().getId())
                .topicTitle(lesson.getTopic().getTitle())
                .courseId(lesson.getTopic().getCourse().getId())
                .courseTitle(lesson.getTopic().getCourse().getTitle())
                .courseSlug(lesson.getTopic().getCourse().getSlug())
                .title(lesson.getTitle())
                .slug(lesson.getSlug())
                .description(lesson.getDescription())
                .contentMarkdown(lesson.getContentMarkdown())
                .displayOrder(lesson.getDisplayOrder())
                .estimatedMinutes(lesson.getEstimatedMinutes())
                .published(lesson.isPublished())
                .videoType(lesson.getVideoType() != null ? lesson.getVideoType() : VideoType.NONE)
                .videoUrl(lesson.getVideoUrl())
                .videoId(lesson.getVideoId())
                .videoFileName(lesson.getVideoFileName())
                .videoMimeType(lesson.getVideoMimeType())
                .videoFileSize(lesson.getVideoFileSize())
                .completed(completed != null ? completed : false)
                .videoPositionSeconds(0)
                .nextLessonId(nextLessonId)
                .prevLessonId(prevLessonId)
                .contentBlocks(blocks)
                .resources(Collections.emptyList())
                .build();
    }
}
