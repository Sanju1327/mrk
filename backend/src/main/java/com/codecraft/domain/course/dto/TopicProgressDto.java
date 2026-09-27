package com.codecraft.domain.course.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Per-student progress for a chapter.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicProgressDto {
    private ProgressStatus status;
    /** True when a previous chapter's completion requirements are not yet satisfied. */
    private boolean locked;
    private int totalLessons;
    private int completedLessons;
    private boolean lessonsComplete;
    /** Quiz gating fields (only meaningful when the chapter has an enabled quiz). */
    private boolean quizRequired;
    private boolean quizPassed;
    private int quizAttemptsUsed;
    private Integer quizMaxAttempts;
    private Double quizBestPercentage;
    private boolean canAttemptQuiz;
    /** Whether the student may open the quiz now (lessons requirement satisfied and chapter unlocked). */
    private boolean quizUnlocked;
}
