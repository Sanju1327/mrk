package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.course.entity.CourseLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDetailDto {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private CourseLevel level;
    private String category;
    private String estimatedDuration;
    private com.codecraft.domain.course.entity.CourseStatus status;
    private Integer estimatedHours;
    private String iconUrl;
    private String thumbnailUrl;
    private String language;
    private Boolean published;
    private Integer totalLessons;
    private Boolean isEnrolled;
    private Integer completedLessons;
    private Double progressPercentage;
    /** Student-facing progress state (NOT_STARTED when not enrolled / nothing done). */
    private ProgressStatus progressStatus;
    private Integer totalChapters;
    private Integer completedChapters;
    private InstructorDto instructor;
    private List<TopicDetailDto> topics;
    private List<CourseResourceDto> resources;

    public static CourseDetailDto fromEntity(
            Course course,
            int totalLessons,
            int estimatedHours,
            boolean isEnrolled,
            int completedLessons,
            double progressPercentage,
            List<TopicDetailDto> topics
    ) {
        // Course-level resources only; lesson materials are returned with the lesson.
        List<CourseResourceDto> resList = course.getResources() != null ?
                course.getResources().stream()
                        .filter(r -> r.getLesson() == null)
                        .map(CourseResourceDto::fromEntity).toList() :
                java.util.Collections.emptyList();

        int completedChapters = 0;
        if (topics != null) {
            completedChapters = (int) topics.stream()
                    .filter(t -> t.getProgress() != null && t.getProgress().getStatus() == ProgressStatus.COMPLETED)
                    .count();
        }
        ProgressStatus status;
        if (totalLessons > 0 && completedLessons >= totalLessons
                && topics != null && !topics.isEmpty() && completedChapters == topics.size()) {
            status = ProgressStatus.COMPLETED;
        } else if (completedLessons > 0 || completedChapters > 0) {
            status = ProgressStatus.IN_PROGRESS;
        } else {
            status = ProgressStatus.NOT_STARTED;
        }

        return CourseDetailDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .description(course.getDescription())
                .level(course.getLevel())
                .category(course.getCategory())
                .estimatedDuration(course.getEstimatedDuration())
                .status(course.getStatus())
                .estimatedHours(estimatedHours)
                .iconUrl(course.getIconUrl())
                .thumbnailUrl(course.getThumbnailUrl())
                .language(course.getLanguage())
                .published(course.isPublished())
                .totalLessons(totalLessons)
                .isEnrolled(isEnrolled)
                .completedLessons(completedLessons)
                .progressPercentage(progressPercentage)
                .progressStatus(status)
                .totalChapters(topics != null ? topics.size() : 0)
                .completedChapters(completedChapters)
                .instructor(InstructorDto.fromUser(course.getTeacher()))
                .topics(topics)
                .resources(resList)
                .build();
    }
}
