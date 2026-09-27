package com.codecraft.domain.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Per-student attempt state for a quiz, used to drive retry/lock UI.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptInfoDto {
    private int attemptsUsed;
    /** Null = unlimited. */
    private Integer maxAttempts;
    private boolean allowRetakes;
    private boolean passed;
    private Double bestPercentage;
    private Double lastPercentage;
    private LocalDateTime lastAttemptAt;
    private boolean canAttempt;
    /** Human-readable reason when {@code canAttempt} is false. */
    private String blockedReason;
}
