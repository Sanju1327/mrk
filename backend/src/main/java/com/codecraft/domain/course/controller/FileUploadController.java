package com.codecraft.domain.course.controller;

import com.codecraft.common.exception.BadRequestException;
import com.codecraft.common.response.ApiResponse;
import com.codecraft.common.storage.FileStorageService;
import com.codecraft.common.storage.StoredFile;
import com.codecraft.common.storage.UploadKind;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Generic upload endpoint for teacher assets (thumbnails, inline images, standalone documents).
 * Lesson videos and learning materials use the dedicated lesson endpoints in {@link TeacherCourseController}
 * so the resulting metadata is bound to the lesson in the same request.
 */
@RestController
@RequestMapping("/api/teacher/uploads")
@RequiredArgsConstructor
@Tag(name = "Teacher File Uploads", description = "Secure image, video and document upload endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasAnyRole('TEACHER', 'SUPER_ADMIN')")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a file", description = "kind = IMAGE (default) | MATERIAL | VIDEO. Type and size are validated server-side.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "kind", required = false, defaultValue = "IMAGE") String kind) {

        UploadKind uploadKind;
        try {
            uploadKind = UploadKind.valueOf(kind.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unknown upload kind '" + kind + "'. Use IMAGE, MATERIAL or VIDEO.");
        }

        StoredFile stored = fileStorageService.store(file, uploadKind);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("url", stored.url());
        result.put("fileName", stored.originalFileName());
        result.put("safeFileName", stored.storedFileName());
        result.put("size", stored.size());
        result.put("mimeType", stored.mimeType());
        result.put("kind", uploadKind.name());

        return ResponseEntity.ok(ApiResponse.success(result, "File uploaded successfully"));
    }
}
