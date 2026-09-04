package com.codecraft.domain.problem.controller;

import com.codecraft.common.response.ApiResponse;
import com.codecraft.domain.problem.dto.ProblemDetailDto;
import com.codecraft.domain.problem.dto.ProblemSummaryDto;
import com.codecraft.domain.problem.entity.Difficulty;
import com.codecraft.domain.problem.service.ProblemService;
import com.codecraft.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProblemSummaryDto>>> getProblems(
            @RequestParam(required = false) Long topicId,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<ProblemSummaryDto> problems = problemService.getProblems(topicId, difficulty, search, pageable, userId);
        return ResponseEntity.ok(ApiResponse.ok("Problems retrieved successfully", problems));
    }

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<ProblemDetailDto>> getDailyProblem(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        ProblemDetailDto daily = problemService.getDailyChallenge(userId);
        return ResponseEntity.ok(ApiResponse.ok("Problem of the Day retrieved successfully", daily));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProblemDetailDto>> getProblemBySlug(
            @PathVariable String slug,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        ProblemDetailDto problem = problemService.getProblemBySlug(slug, userId);
        return ResponseEntity.ok(ApiResponse.ok("Problem retrieved successfully", problem));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProblemDetailDto>> getProblemById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        ProblemDetailDto problem = problemService.getProblemById(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Problem retrieved successfully", problem));
    }
}
