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
    private String category;
    private String estimatedDuration;
    private com.codecraft.domain.course.entity.CourseStatus status;
    private Integer estimatedHours;
    private String iconUrl;
    private Boolean published;
    private Integer topicCount;
    private Integer lessonCount;
    private InstructorDto instructor;

    public static CourseSummaryDto fromEntity(Course course, int topicCount, int lessonCount, int estimatedHours) {
        return CourseSummaryDto.builder()
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
                .published(course.isPublished())
                .topicCount(topicCount)
                .lessonCount(lessonCount)
                .instructor(InstructorDto.fromUser(course.getTeacher()))
                .build();
    }
}
