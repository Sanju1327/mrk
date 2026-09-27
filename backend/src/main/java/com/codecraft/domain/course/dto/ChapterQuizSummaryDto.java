package com.codecraft.domain.course.dto;

import com.codecraft.domain.quiz.entity.Quiz;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Chapter quiz metadata exposed in the course syllabus (no questions).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterQuizSummaryDto {
    private Long id;
    private String title;
    private String description;
    private boolean enabled;
    private int questionCount;
    private int passingScorePercentage;
    private int timeLimitMinutes;

    public static ChapterQuizSummaryDto fromEntity(Quiz quiz) {
        if (quiz == null) return null;
        return ChapterQuizSummaryDto.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .enabled(quiz.isEnabled())
                .questionCount(quiz.getQuestions() != null ? quiz.getQuestions().size() : 0)
                .passingScorePercentage(quiz.getPassingScorePercentage())
                .timeLimitMinutes(quiz.getTimeLimitMinutes())
                .build();
    }
}
