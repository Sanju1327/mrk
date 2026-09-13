package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.ContentType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateContentBlockRequest {

    @NotNull(message = "Content block type is required")
    private ContentType type;

    private String title;
    private String content;
    private String dataJson;
    private Integer displayOrder;
}
