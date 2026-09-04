package com.codecraft.domain.course.controller;

import com.codecraft.common.response.ApiResponse;
import com.codecraft.domain.course.dto.CourseDetailDto;
import com.codecraft.domain.course.dto.CourseSummaryDto;
import com.codecraft.domain.course.dto.LessonDetailDto;
import com.codecraft.domain.course.service.CourseService;
import com.codecraft.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseSummaryDto>>> getAllCourses() {
        List<CourseSummaryDto> courses = courseService.getAllPublishedCourses();
        return ResponseEntity.ok(ApiResponse.ok("Courses retrieved successfully", courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDetailDto>> getCourseById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        CourseDetailDto course = courseService.getCourseById(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Course retrieved successfully", course));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CourseDetailDto>> getCourseBySlug(
            @PathVariable String slug,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        CourseDetailDto course = courseService.getCourseBySlug(slug, userId);
        return ResponseEntity.ok(ApiResponse.ok("Course retrieved successfully", course));
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<ApiResponse<LessonDetailDto>> getLessonById(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        LessonDetailDto lesson = courseService.getLessonById(lessonId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Lesson retrieved successfully", lesson));
    }

    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<ApiResponse<Void>> completeLesson(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        courseService.completeLesson(lessonId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Lesson marked as completed", null));
    }
}
