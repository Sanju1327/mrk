package com.codecraft.domain.course.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight progress heartbeat from the student lesson player.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLessonProgressRequest {

    @Min(value = 0, message = "Video position cannot be negative")
    private Integer videoPositionSeconds;
}
