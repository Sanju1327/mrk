package com.codecraft.domain.course.dto;

import com.codecraft.domain.enrollment.entity.Enrollment;
import com.codecraft.domain.enrollment.entity.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDto {
    private Long id;
    private Long userId;
    private Long courseId;
    private String courseTitle;
    private String courseSlug;
    private String courseDescription;
    private String iconUrl;
    private EnrollmentStatus status;
    private Double progressPercentage;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;

    public static EnrollmentDto fromEntity(Enrollment enrollment, double progressPercentage) {
        return EnrollmentDto.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .courseSlug(enrollment.getCourse().getSlug())
                .courseDescription(enrollment.getCourse().getDescription())
                .iconUrl(enrollment.getCourse().getIconUrl())
                .status(enrollment.getStatus())
                .progressPercentage(progressPercentage)
                .enrolledAt(enrollment.getEnrolledAt())
                .completedAt(enrollment.getCompletedAt())
                .build();
    }
}
