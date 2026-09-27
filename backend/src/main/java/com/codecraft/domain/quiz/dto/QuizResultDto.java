package com.codecraft.domain.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDto {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private int score;
    private int maxScore;
    private double percentage;
    private boolean passed;
    private int timeSpentSeconds;
    private int passingScorePercentage;
    private List<QuestionResultDto> questionResults;
    /** Updated attempt state after this submission (drives "Retry" availability). */
    private QuizAttemptInfoDto attemptInfo;
    private String courseSlug;
    private Long nextChapterFirstLessonId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResultDto {
        private Long questionId;
        private String questionText;
        private Long selectedOptionId;
        private Long correctOptionId;
        private boolean isCorrect;
        private int pointsEarned;
        private int pointsPossible;
        private String explanation;
    }
}
