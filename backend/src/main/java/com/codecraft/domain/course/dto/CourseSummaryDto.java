package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.course.entity.CourseLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseSummaryDto {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private CourseLevel level;
    private Integer estimatedHours;
    private String iconUrl;
    private Boolean published;
    private Integer topicCount;
    private Integer lessonCount;

    public static CourseSummaryDto fromEntity(Course course, int topicCount, int lessonCount, int estimatedHours) {
        return CourseSummaryDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .description(course.getDescription())
                .level(course.getLevel())
                .estimatedHours(estimatedHours)
                .iconUrl(course.getIconUrl())
                .published(course.isPublished())
                .topicCount(topicCount)
                .lessonCount(lessonCount)
                .build();
    }
}
