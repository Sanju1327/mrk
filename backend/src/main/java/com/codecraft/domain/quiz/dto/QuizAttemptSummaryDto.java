package com.codecraft.domain.quiz.dto;

import com.codecraft.domain.quiz.entity.QuizAttempt;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptSummaryDto {
    private Long id;
    private int score;
    private int maxScore;
    private double percentage;
    private boolean passed;
    private int timeSpentSeconds;
    private LocalDateTime createdAt;

    public static QuizAttemptSummaryDto fromEntity(QuizAttempt a) {
        return QuizAttemptSummaryDto.builder()
                .id(a.getId())
                .score(a.getScore())
                .maxScore(a.getMaxScore())
                .percentage(a.getPercentage() != null ? a.getPercentage().doubleValue() : 0.0)
                .passed(a.isPassed())
                .timeSpentSeconds(a.getTimeSpentSeconds())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
