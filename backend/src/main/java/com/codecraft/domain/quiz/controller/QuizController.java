package com.codecraft.domain.quiz.controller;

import com.codecraft.common.response.ApiResponse;
import com.codecraft.domain.quiz.dto.CreateQuizRequest;
import com.codecraft.domain.quiz.dto.QuizResultDto;
import com.codecraft.domain.quiz.dto.StudentQuizDto;
import com.codecraft.domain.quiz.dto.SubmitQuizRequest;
import com.codecraft.domain.quiz.service.QuizService;
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

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Quiz System", description = "Endpoints for student quiz taking, evaluation, and teacher quiz management")
@SecurityRequirement(name = "Bearer Authentication")
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found: " + userDetails.getUsername()));
    }

    @GetMapping("/quizzes/{id}")
    @Operation(summary = "Get quiz for student", description = "Returns quiz questions and options without revealing correct answers")
    public ResponseEntity<ApiResponse<StudentQuizDto>> getQuiz(@PathVariable Long id) {
        StudentQuizDto quiz = quizService.getQuizForStudent(id);
        return ResponseEntity.ok(ApiResponse.success(quiz, "Quiz retrieved successfully"));
    }

    @GetMapping("/quizzes/lesson/{lessonId}")
    @Operation(summary = "Get quizzes for a specific lesson")
    public ResponseEntity<ApiResponse<List<StudentQuizDto>>> getQuizzesByLesson(@PathVariable Long lessonId) {
        List<StudentQuizDto> quizzes = quizService.getQuizzesByLesson(lessonId);
        return ResponseEntity.ok(ApiResponse.success(quizzes, "Lesson quizzes retrieved"));
    }

    @GetMapping("/quizzes/topic/{topicId}")
    @Operation(summary = "Get quizzes for a module/topic")
    public ResponseEntity<ApiResponse<List<StudentQuizDto>>> getQuizzesByTopic(@PathVariable Long topicId) {
        List<StudentQuizDto> quizzes = quizService.getQuizzesByTopic(topicId);
        return ResponseEntity.ok(ApiResponse.success(quizzes, "Topic quizzes retrieved"));
    }

    @PostMapping("/quizzes/{id}/submit")
    @Operation(summary = "Submit quiz answers", description = "Evaluates student quiz submission server-side and stores attempt history")
    public ResponseEntity<ApiResponse<QuizResultDto>> submitQuiz(
            @PathVariable Long id,
            @RequestBody SubmitQuizRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User student = getAuthenticatedUser(userDetails);
        QuizResultDto result = quizService.submitQuiz(id, request, student);
        return ResponseEntity.ok(ApiResponse.success(result, "Quiz evaluated successfully"));
    }

    @PostMapping("/teacher/quizzes")
    @PreAuthorize("hasAnyRole('TEACHER', 'SUPER_ADMIN')")
    @Operation(summary = "Create quiz with questions and options")
    public ResponseEntity<ApiResponse<StudentQuizDto>> createQuiz(
            @Valid @RequestBody CreateQuizRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = getAuthenticatedUser(userDetails);
        StudentQuizDto quiz = quizService.createQuiz(request, teacher);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(quiz, "Quiz created successfully"));
    }
}
