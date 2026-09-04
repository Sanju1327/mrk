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
    private Integer estimatedHours;
    private String iconUrl;
    private Boolean published;
    private Integer totalLessons;
    private Boolean isEnrolled;
    private Integer completedLessons;
    private Double progressPercentage;
    private List<TopicDetailDto> topics;

    public static CourseDetailDto fromEntity(
            Course course,
            int totalLessons,
            int estimatedHours,
            boolean isEnrolled,
            int completedLessons,
            double progressPercentage,
            List<TopicDetailDto> topics
    ) {
        return CourseDetailDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .description(course.getDescription())
                .level(course.getLevel())
                .estimatedHours(estimatedHours)
                .iconUrl(course.getIconUrl())
                .published(course.isPublished())
                .totalLessons(totalLessons)
                .isEnrolled(isEnrolled)
                .completedLessons(completedLessons)
                .progressPercentage(progressPercentage)
                .topics(topics)
                .build();
    }
}
