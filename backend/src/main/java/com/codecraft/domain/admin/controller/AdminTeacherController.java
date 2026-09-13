package com.codecraft.domain.admin.controller;

import com.codecraft.common.response.ApiResponse;
import com.codecraft.domain.admin.dto.AdminStatsDto;
import com.codecraft.domain.admin.dto.CreateTeacherRequest;
import com.codecraft.domain.admin.dto.TeacherDto;
import com.codecraft.domain.admin.service.AdminTeacherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Management", description = "Endpoints for platform administration and teacher management")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminTeacherController {

    private final AdminTeacherService adminTeacherService;

    @GetMapping("/teachers")
    @Operation(summary = "List all teachers", description = "Returns a list of all registered teachers on the platform")
    public ResponseEntity<ApiResponse<List<TeacherDto>>> getAllTeachers() {
        List<TeacherDto> teachers = adminTeacherService.getAllTeachers();
        return ResponseEntity.ok(ApiResponse.success(teachers, "Teachers retrieved successfully"));
    }

    @PostMapping("/teachers")
    @Operation(summary = "Create teacher account", description = "Allows Super Admin to register a new teacher account with TEACHER role")
    public ResponseEntity<ApiResponse<TeacherDto>> createTeacher(@Valid @RequestBody CreateTeacherRequest request) {
        TeacherDto teacher = adminTeacherService.createTeacher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(teacher, "Teacher account created successfully"));
    }

    @PatchMapping("/teachers/{id}/status")
    @Operation(summary = "Toggle teacher active status", description = "Enables or disables a teacher account")
    public ResponseEntity<ApiResponse<TeacherDto>> toggleTeacherStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> payload) {
        boolean active = payload.getOrDefault("active", true);
        TeacherDto teacher = adminTeacherService.toggleTeacherStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success(teacher, "Teacher status updated"));
    }

    @PostMapping("/teachers/{id}/reset-password")
    @Operation(summary = "Reset teacher password", description = "Allows Super Admin to reset a teacher's password")
    public ResponseEntity<ApiResponse<Void>> resetTeacherPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String newPassword = payload.get("newPassword");
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        adminTeacherService.resetTeacherPassword(id, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null, "Teacher password reset successfully"));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get platform admin metrics", description = "Returns platform summary statistics for Super Admin dashboard")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getPlatformStats() {
        AdminStatsDto stats = adminTeacherService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Platform statistics retrieved"));
    }
}
