package com.codecraft.domain.enrollment.controller;

import com.codecraft.common.response.ApiResponse;
import com.codecraft.domain.course.dto.EnrollmentDto;
import com.codecraft.domain.enrollment.service.EnrollmentService;
import com.codecraft.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/{courseId}")
    public ResponseEntity<ApiResponse<EnrollmentDto>> enroll(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        EnrollmentDto dto = enrollmentService.enroll(currentUser.getId(), courseId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(dto, "Enrolled in course successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<EnrollmentDto>>> getMyEnrollments(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<EnrollmentDto> list = enrollmentService.getUserEnrollments(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Enrollments retrieved successfully", list));
    }

    @GetMapping("/check/{courseId}")
    public ResponseEntity<ApiResponse<Boolean>> checkEnrollment(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        boolean enrolled = enrollmentService.isEnrolled(currentUser.getId(), courseId);
        return ResponseEntity.ok(ApiResponse.ok("Enrollment status checked", enrolled));
    }
}
