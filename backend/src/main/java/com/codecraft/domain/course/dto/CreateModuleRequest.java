package com.codecraft.domain.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateModuleRequest {

    @NotBlank(message = "Module title is required")
    @Size(max = 150, message = "Module title cannot exceed 150 characters")
    private String title;

    @NotBlank(message = "Module slug is required")
    @Size(max = 150, message = "Module slug cannot exceed 150 characters")
    private String slug;

    private String description;
    private Integer displayOrder;
}
