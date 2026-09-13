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
public class UpdateModuleRequest {

    @NotBlank(message = "Module title is required")
    @Size(max = 150, message = "Module title cannot exceed 150 characters")
    private String title;

    private String description;
    private Integer displayOrder;
}
