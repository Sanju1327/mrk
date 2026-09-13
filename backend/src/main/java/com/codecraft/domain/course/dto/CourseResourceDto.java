package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.CourseResource;
import com.codecraft.domain.course.entity.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResourceDto {
    private Long id;
    private Long courseId;
    private Long lessonId;
    private String title;
    private String description;
    private ResourceType resourceType;
    private String url;
    private String fileName;
    private String mimeType;
    private Long fileSize;
    private String provider;
    private String attribution;
    private String uploaderName;
    private LocalDateTime createdAt;

    public static CourseResourceDto fromEntity(CourseResource res) {
        if (res == null) return null;
        return CourseResourceDto.builder()
                .id(res.getId())
                .courseId(res.getCourse() != null ? res.getCourse().getId() : null)
                .lessonId(res.getLesson() != null ? res.getLesson().getId() : null)
                .title(res.getTitle())
                .description(res.getDescription())
                .resourceType(res.getResourceType())
                .url(res.getUrl())
                .fileName(res.getFileName())
                .mimeType(res.getMimeType())
                .fileSize(res.getFileSize())
                .provider(res.getProvider())
                .attribution(res.getAttribution())
                .uploaderName(res.getUploadedBy() != null ? res.getUploadedBy().getFullName() : null)
                .createdAt(res.getCreatedAt())
                .build();
    }
}
