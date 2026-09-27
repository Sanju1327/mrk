package com.codecraft.domain.quiz.controller;

import com.codecraft.common.response.ApiResponse;
import com.codecraft.domain.quiz.dto.QuizAttemptSummaryDto;
import com.codecraft.domain.quiz.dto.QuizResultDto;
import com.codecraft.domain.quiz.dto.StudentQuizDto;
import com.codecraft.domain.quiz.dto.SubmitQuizRequest;
import com.codecraft.domain.quiz.service.QuizService;
import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Student quiz endpoints. Teacher authoring lives in {@link TeacherQuizController}.
 */
@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quiz System", description = "Endpoints for student quiz taking, evaluation and attempt history")
@SecurityRequirement(name = "Bearer Authentication")
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found: " + userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get quiz for student", description = "Questions/options without correct answers, plus the caller's attempt state")
    public ResponseEntity<ApiResponse<StudentQuizDto>> getQuiz(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        StudentQuizDto quiz = quizService.getQuizForStudent(id, user);
        return ResponseEntity.ok(ApiResponse.success(quiz, "Quiz retrieved successfully"));
    }

    @GetMapping("/{id}/attempts/me")
    @Operation(summary = "List the caller's attempts for a quiz (latest first)")
    public ResponseEntity<ApiResponse<List<QuizAttemptSummaryDto>>> getMyAttempts(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(quizService.getMyAttempts(id, user), "Attempts retrieved"));
    }

    @GetMapping("/lesson/{lessonId}")
    @Operation(summary = "Get quizzes for a specific lesson")
    public ResponseEntity<ApiResponse<List<StudentQuizDto>>> getQuizzesByLesson(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizzesByLesson(lessonId, user), "Lesson quizzes retrieved"));
    }

    @GetMapping("/topic/{topicId}")
    @Operation(summary = "Get quizzes for a chapter")
    public ResponseEntity<ApiResponse<List<StudentQuizDto>>> getQuizzesByTopic(
            @PathVariable Long topicId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(quizService.getQuizzesByTopic(topicId, user), "Chapter quizzes retrieved"));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit quiz answers", description = "Enforces attempt rules, grades server-side and stores the attempt")
    public ResponseEntity<ApiResponse<QuizResultDto>> submitQuiz(
            @PathVariable Long id,
            @RequestBody SubmitQuizRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User student = getAuthenticatedUser(userDetails);
        QuizResultDto result = quizService.submitQuiz(id, request, student);
        return ResponseEntity.ok(ApiResponse.success(result, "Quiz evaluated successfully"));
    }
}
