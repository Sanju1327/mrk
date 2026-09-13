package com.codecraft.domain.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitQuizRequest {
    private Map<Long, Long> answers; // questionId -> selectedOptionId
    private int timeSpentSeconds;
}
