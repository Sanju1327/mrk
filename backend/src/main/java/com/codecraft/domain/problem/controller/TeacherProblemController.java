package com.codecraft.domain.problem.controller;

import com.codecraft.common.response.ApiResponse;
import com.codecraft.domain.problem.dto.CreateProblemRequest;
import com.codecraft.domain.problem.dto.ProblemDetailDto;
import com.codecraft.domain.problem.service.ProblemService;
import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher/problems")
@RequiredArgsConstructor
@Tag(name = "Teacher Problem CMS", description = "Endpoints for creating and managing coding practice problems and test cases")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasAnyRole('TEACHER', 'SUPER_ADMIN')")
public class TeacherProblemController {

    private final ProblemService problemService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create coding problem with public and hidden test cases")
    public ResponseEntity<ApiResponse<ProblemDetailDto>> createProblem(
            @Valid @RequestBody CreateProblemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Teacher not found: " + userDetails.getUsername()));

        ProblemDetailDto problem = problemService.createProblem(request, teacher);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Problem created successfully", problem));
    }
}
