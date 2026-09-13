package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.ContentBlock;
import com.codecraft.domain.course.entity.ContentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentBlockDto {
    private Long id;
    private Long lessonId;
    private ContentType type;
    private String title;
    private String content;
    private String dataJson;
    private Integer displayOrder;
    private LocalDateTime createdAt;

    public static ContentBlockDto fromEntity(ContentBlock block) {
        if (block == null) {
            return null;
        }
        return ContentBlockDto.builder()
                .id(block.getId())
                .lessonId(block.getLesson() != null ? block.getLesson().getId() : null)
                .type(block.getType())
                .title(block.getTitle())
                .content(block.getContent())
                .dataJson(block.getDataJson())
                .displayOrder(block.getDisplayOrder())
                .createdAt(block.getCreatedAt())
                .build();
    }
}
