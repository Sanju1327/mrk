package com.codecraft.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalStudents;
    private long totalTeachers;
    private long totalCourses;
    private long publishedCourses;
    private long draftCourses;
    private long totalQuizzes;
    private long totalProblems;
}
