package com.codecraft.domain.quiz.controller;

import com.codecraft.common.response.ApiResponse;
import com.codecraft.domain.quiz.dto.CreateQuizRequest;
import com.codecraft.domain.quiz.dto.TeacherQuizDto;
import com.codecraft.domain.quiz.dto.UpsertQuestionRequest;
import com.codecraft.domain.quiz.dto.UpsertQuizRequest;
import com.codecraft.domain.quiz.service.TeacherQuizService;
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
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@Tag(name = "Teacher Quiz CMS", description = "Chapter quiz authoring: quiz settings, questions, options, ordering")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasAnyRole('TEACHER', 'SUPER_ADMIN')")
public class TeacherQuizController {

    private final TeacherQuizService teacherQuizService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + userDetails.getUsername()));
    }

    // --- Chapter quiz ---

    @GetMapping({"/modules/{moduleId}/quiz", "/topics/{moduleId}/quiz"})
    @Operation(summary = "Get the chapter quiz (with correct answers) or null when none exists")
    public ResponseEntity<ApiResponse<TeacherQuizDto>> getChapterQuiz(
            @PathVariable Long moduleId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        TeacherQuizDto quiz = teacherQuizService.getChapterQuiz(moduleId, user);
        return ResponseEntity.ok(ApiResponse.success(quiz, quiz != null ? "Chapter quiz retrieved" : "Chapter has no quiz"));
    }

    @PostMapping({"/modules/{moduleId}/quiz", "/topics/{moduleId}/quiz"})
    @Operation(summary = "Create the chapter quiz")
    public ResponseEntity<ApiResponse<TeacherQuizDto>> createChapterQuiz(
            @PathVariable Long moduleId,
            @Valid @RequestBody UpsertQuizRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        TeacherQuizDto quiz = teacherQuizService.createChapterQuiz(moduleId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(quiz, "Chapter quiz created"));
    }

    @PutMapping("/quizzes/{quizId}")
    @Operation(summary = "Update quiz settings (title, description, passing score, time limit, enabled)")
    public ResponseEntity<ApiResponse<TeacherQuizDto>> updateQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody UpsertQuizRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(teacherQuizService.updateQuiz(quizId, request, user), "Quiz updated"));
    }

    @DeleteMapping("/quizzes/{quizId}")
    @Operation(summary = "Delete quiz and its questions")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(
            @PathVariable Long quizId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        teacherQuizService.deleteQuiz(quizId, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Quiz deleted"));
    }

    // --- Questions ---

    @PostMapping("/quizzes/{quizId}/questions")
    @Operation(summary = "Add a question with options")
    public ResponseEntity<ApiResponse<TeacherQuizDto>> addQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody UpsertQuestionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        TeacherQuizDto quiz = teacherQuizService.addQuestion(quizId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(quiz, "Question added"));
    }

    @PutMapping("/questions/{questionId}")
    @Operation(summary = "Update a question (options are replaced)")
    public ResponseEntity<ApiResponse<TeacherQuizDto>> updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody UpsertQuestionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(teacherQuizService.updateQuestion(questionId, request, user), "Question updated"));
    }

    @DeleteMapping("/questions/{questionId}")
    @Operation(summary = "Delete a question")
    public ResponseEntity<ApiResponse<TeacherQuizDto>> deleteQuestion(
            @PathVariable Long questionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(teacherQuizService.deleteQuestion(questionId, user), "Question deleted"));
    }

    @PutMapping("/quizzes/{quizId}/questions/reorder")
    @Operation(summary = "Reorder questions", description = "Body: ordered list of question ids")
    public ResponseEntity<ApiResponse<TeacherQuizDto>> reorderQuestions(
            @PathVariable Long quizId,
            @RequestBody List<Long> orderedIds,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success(teacherQuizService.reorderQuestions(quizId, orderedIds, user), "Questions reordered"));
    }

    // --- Legacy bulk create (pre-existing endpoint, now ownership-checked) ---

    @PostMapping("/quizzes")
    @Operation(summary = "Create quiz with questions and options in one request")
    public ResponseEntity<ApiResponse<TeacherQuizDto>> createQuiz(
            @Valid @RequestBody CreateQuizRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        TeacherQuizDto quiz = teacherQuizService.createQuiz(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(quiz, "Quiz created successfully"));
    }
}
