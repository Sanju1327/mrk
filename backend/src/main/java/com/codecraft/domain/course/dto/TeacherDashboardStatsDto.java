package com.codecraft.domain.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardStatsDto {
    private long myCoursesCount;
    private long draftsCount;
    private long publishedCount;
    private long enrolledStudentsCount;
    private double averageProgressPercentage;
}
