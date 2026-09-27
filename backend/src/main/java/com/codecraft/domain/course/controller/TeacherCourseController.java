package com.codecraft.domain.course.controller;

import com.codecraft.common.response.ApiResponse;
import com.codecraft.domain.course.dto.*;
import com.codecraft.domain.course.entity.Lesson;
import com.codecraft.domain.course.entity.Topic;
import com.codecraft.domain.course.service.TeacherCourseService;
import com.codecraft.domain.user.entity.User;
import com.codecraft.domain.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@Tag(name = "Teacher Course CMS", description = "Endpoints for course creation, module/lesson hierarchy, content blocks, and publishing")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasAnyRole('TEACHER', 'SUPER_ADMIN')")
public class TeacherCourseController {

    private final TeacherCourseService teacherCourseService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + userDetails.getUsername()));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get teacher studio dashboard statistics")
    public ResponseEntity<ApiResponse<TeacherDashboardStatsDto>> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        TeacherDashboardStatsDto stats = teacherCourseService.getTeacherStats(user);
        return ResponseEntity.ok(ApiResponse.success(stats, "Teacher stats retrieved"));
    }

    @GetMapping("/courses")
    @Operation(summary = "List courses managed by teacher")
    public ResponseEntity<ApiResponse<List<CourseSummaryDto>>> getTeacherCourses(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<CourseSummaryDto> courses = teacherCourseService.getTeacherCourses(user);
        return ResponseEntity.ok(ApiResponse.success(courses, "Teacher courses retrieved"));
    }

    @PostMapping("/courses")
    @Operation(summary = "Create course draft")
    public ResponseEntity<ApiResponse<CourseDetailDto>> createCourse(
            @Valid @RequestBody CreateCourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CourseDetailDto course = teacherCourseService.createCourse(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(course, "Course draft created successfully"));
    }

    @GetMapping("/courses/{id}")
    @Operation(summary = "Get full course details for builder/editing")
    public ResponseEntity<ApiResponse<CourseDetailDto>> getCourseForEdit(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CourseDetailDto course = teacherCourseService.getCourseForEdit(id, user);
        return ResponseEntity.ok(ApiResponse.success(course, "Course retrieved for editing"));
    }

    @PutMapping("/courses/{id}")
    @Operation(summary = "Update course metadata")
    public ResponseEntity<ApiResponse<CourseDetailDto>> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCourseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CourseDetailDto course = teacherCourseService.updateCourse(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(course, "Course updated successfully"));
    }

    @DeleteMapping("/courses/{id}")
    @Operation(summary = "Delete course")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        teacherCourseService.deleteCourse(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Course deleted successfully"));
    }

    @GetMapping("/courses/{id}/validate")
    @Operation(summary = "Validate course completeness for publishing")
    public ResponseEntity<ApiResponse<PublishValidationResultDto>> validatePublish(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        PublishValidationResultDto result = teacherCourseService.validatePublish(id, user);
        return ResponseEntity.ok(ApiResponse.success(result, "Publish validation completed"));
    }

    @RequestMapping(value = "/courses/{id}/publish", method = {RequestMethod.POST, RequestMethod.PATCH})
    @Operation(summary = "Publish course to live platform")
    public ResponseEntity<ApiResponse<CourseDetailDto>> publishCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CourseDetailDto course = teacherCourseService.publishCourse(id, user);
        return ResponseEntity.ok(ApiResponse.success(course, "Course published successfully"));
    }

    @RequestMapping(value = "/courses/{id}/unpublish", method = {RequestMethod.POST, RequestMethod.PATCH})
    @Operation(summary = "Unpublish course back to draft")
    public ResponseEntity<ApiResponse<CourseDetailDto>> unpublishCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CourseDetailDto course = teacherCourseService.unpublishCourse(id, user);
        return ResponseEntity.ok(ApiResponse.success(course, "Course reverted to draft"));
    }

    @RequestMapping(value = "/courses/{id}/archive", method = {RequestMethod.POST, RequestMethod.PATCH})
    @Operation(summary = "Archive course (hidden from students, kept for records)")
    public ResponseEntity<ApiResponse<CourseDetailDto>> archiveCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CourseDetailDto course = teacherCourseService.archiveCourse(id, user);
        return ResponseEntity.ok(ApiResponse.success(course, "Course archived"));
    }

    @PutMapping({"/courses/{courseId}/modules/reorder", "/courses/{courseId}/topics/reorder"})
    @Operation(summary = "Reorder chapters in a course", description = "Body: ordered list of chapter ids")
    public ResponseEntity<ApiResponse<List<TopicDetailDto>>> reorderModules(
            @PathVariable Long courseId,
            @RequestBody List<Long> orderedIds,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<TopicDetailDto> topics = teacherCourseService.reorderModules(courseId, orderedIds, user);
        return ResponseEntity.ok(ApiResponse.success(topics, "Chapters reordered"));
    }

    // --- Modules / Topics ---

    @PostMapping({"/courses/{courseId}/modules", "/courses/{courseId}/topics"})
    @Operation(summary = "Add module to course")
    public ResponseEntity<ApiResponse<TopicDetailDto>> addModule(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateModuleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Topic topic = teacherCourseService.addModule(courseId, request, user);
        TopicDetailDto dto = TopicDetailDto.fromEntity(topic);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(dto, "Module added successfully"));
    }

    @PutMapping({"/modules/{moduleId}", "/topics/{moduleId}"})
    @Operation(summary = "Update module")
    public ResponseEntity<ApiResponse<TopicDetailDto>> updateModule(
            @PathVariable Long moduleId,
            @Valid @RequestBody UpdateModuleRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Topic topic = teacherCourseService.updateModule(moduleId, request, user);
        TopicDetailDto dto = TopicDetailDto.fromEntity(topic);
        return ResponseEntity.ok(ApiResponse.success(dto, "Module updated successfully"));
    }

    @DeleteMapping({"/modules/{moduleId}", "/topics/{moduleId}"})
    @Operation(summary = "Delete module")
    public ResponseEntity<ApiResponse<Void>> deleteModule(
            @PathVariable Long moduleId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        teacherCourseService.deleteModule(moduleId, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Module deleted successfully"));
    }

    @PutMapping({"/modules/{moduleId}/lessons/reorder", "/topics/{moduleId}/lessons/reorder"})
    @Operation(summary = "Reorder lessons in a chapter", description = "Body: ordered list of lesson ids")
    public ResponseEntity<ApiResponse<List<LessonSummaryDto>>> reorderLessons(
            @PathVariable Long moduleId,
            @RequestBody List<Long> orderedIds,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<LessonSummaryDto> lessons = teacherCourseService.reorderLessons(moduleId, orderedIds, user);
        return ResponseEntity.ok(ApiResponse.success(lessons, "Lessons reordered"));
    }

    // --- Lessons ---

    @GetMapping("/lessons/{lessonId}")
    @Operation(summary = "Get full lesson for editing (video, materials, content blocks)")
    public ResponseEntity<ApiResponse<LessonDetailDto>> getLessonForEdit(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        LessonDetailDto lesson = teacherCourseService.getLessonForEdit(lessonId, user);
        return ResponseEntity.ok(ApiResponse.success(lesson, "Lesson retrieved for editing"));
    }

    @PostMapping(value = "/lessons/{lessonId}/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a video file and set it as the lesson video")
    public ResponseEntity<ApiResponse<LessonDetailDto>> uploadLessonVideo(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        LessonDetailDto lesson = teacherCourseService.uploadLessonVideo(lessonId, file, user);
        return ResponseEntity.ok(ApiResponse.success(lesson, "Lesson video uploaded"));
    }

    @DeleteMapping("/lessons/{lessonId}/video")
    @Operation(summary = "Remove the lesson video (deletes uploaded file)")
    public ResponseEntity<ApiResponse<LessonDetailDto>> removeLessonVideo(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        LessonDetailDto lesson = teacherCourseService.removeLessonVideo(lessonId, user);
        return ResponseEntity.ok(ApiResponse.success(lesson, "Lesson video removed"));
    }

    @PostMapping(value = "/lessons/{lessonId}/materials", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a learning material file to a lesson")
    public ResponseEntity<ApiResponse<CourseResourceDto>> uploadLessonMaterial(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CourseResourceDto resource = teacherCourseService.uploadLessonMaterial(lessonId, file, title, description, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(resource, "Learning material uploaded"));
    }

    @PostMapping({"/modules/{moduleId}/lessons", "/topics/{moduleId}/lessons"})
    @Operation(summary = "Add lesson to module")
    public ResponseEntity<ApiResponse<LessonSummaryDto>> addLesson(
            @PathVariable Long moduleId,
            @Valid @RequestBody CreateLessonRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Lesson lesson = teacherCourseService.addLesson(moduleId, request, user);
        LessonSummaryDto dto = LessonSummaryDto.fromEntity(lesson, false);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(dto, "Lesson added successfully"));
    }

    @PutMapping("/lessons/{lessonId}")
    @Operation(summary = "Update lesson")
    public ResponseEntity<ApiResponse<LessonSummaryDto>> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody UpdateLessonRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Lesson lesson = teacherCourseService.updateLesson(lessonId, request, user);
        LessonSummaryDto dto = LessonSummaryDto.fromEntity(lesson, false);
        return ResponseEntity.ok(ApiResponse.success(dto, "Lesson updated successfully"));
    }

    @DeleteMapping("/lessons/{lessonId}")
    @Operation(summary = "Delete lesson")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        teacherCourseService.deleteLesson(lessonId, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Lesson deleted successfully"));
    }

    // --- Content Blocks ---

    @GetMapping("/lessons/{lessonId}/blocks")
    @Operation(summary = "List content blocks of a lesson")
    public ResponseEntity<ApiResponse<List<ContentBlockDto>>> getContentBlocks(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<ContentBlockDto> blocks = teacherCourseService.getContentBlocks(lessonId, user);
        return ResponseEntity.ok(ApiResponse.success(blocks, "Content blocks retrieved"));
    }

    @PostMapping("/lessons/{lessonId}/blocks")
    @Operation(summary = "Add content block to lesson")
    public ResponseEntity<ApiResponse<ContentBlockDto>> addContentBlock(
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateContentBlockRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        ContentBlockDto block = teacherCourseService.addContentBlock(lessonId, request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(block, "Content block added successfully"));
    }

    @PutMapping("/blocks/{blockId}")
    @Operation(summary = "Update content block")
    public ResponseEntity<ApiResponse<ContentBlockDto>> updateContentBlock(
            @PathVariable Long blockId,
            @Valid @RequestBody CreateContentBlockRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        ContentBlockDto block = teacherCourseService.updateContentBlock(blockId, request, user);
        return ResponseEntity.ok(ApiResponse.success(block, "Content block updated successfully"));
    }

    @DeleteMapping("/blocks/{blockId}")
    @Operation(summary = "Delete content block")
    public ResponseEntity<ApiResponse<Void>> deleteContentBlock(
            @PathVariable Long blockId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        teacherCourseService.deleteContentBlock(blockId, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Content block deleted successfully"));
    }

    @PutMapping("/lessons/{lessonId}/blocks/reorder")
    @Operation(summary = "Reorder content blocks in lesson")
    public ResponseEntity<ApiResponse<List<ContentBlockDto>>> reorderBlocks(
            @PathVariable Long lessonId,
            @RequestBody List<Long> blockIds,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<ContentBlockDto> blocks = teacherCourseService.reorderContentBlocks(lessonId, blockIds, user);
        return ResponseEntity.ok(ApiResponse.success(blocks, "Blocks reordered successfully"));
    }

    // --- Resources ---

    @PostMapping("/courses/{courseId}/resources")
    @Operation(summary = "Add resource to course or lesson")
    public ResponseEntity<ApiResponse<CourseResourceDto>> addResource(
            @PathVariable Long courseId,
            @RequestParam(required = false) Long lessonId,
            @RequestBody CourseResourceDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CourseResourceDto resource = teacherCourseService.addResource(courseId, lessonId, dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(resource, "Resource added successfully"));
    }

    @PutMapping("/resources/{resourceId}")
    @Operation(summary = "Update learning material title/description")
    public ResponseEntity<ApiResponse<CourseResourceDto>> updateResource(
            @PathVariable Long resourceId,
            @Valid @RequestBody UpdateResourceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CourseResourceDto resource = teacherCourseService.updateResource(resourceId, request, user);
        return ResponseEntity.ok(ApiResponse.success(resource, "Resource updated"));
    }

    @PostMapping(value = "/resources/{resourceId}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Replace the file behind a learning material")
    public ResponseEntity<ApiResponse<CourseResourceDto>> replaceResourceFile(
            @PathVariable Long resourceId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        CourseResourceDto resource = teacherCourseService.replaceMaterialFile(resourceId, file, user);
        return ResponseEntity.ok(ApiResponse.success(resource, "Resource file replaced"));
    }

    @DeleteMapping("/resources/{resourceId}")
    @Operation(summary = "Delete course resource")
    public ResponseEntity<ApiResponse<Void>> deleteResource(
            @PathVariable Long resourceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        teacherCourseService.deleteResource(resourceId, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Resource deleted successfully"));
    }
}
