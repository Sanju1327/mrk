package com.codecraft.domain.problem.dto;

import com.codecraft.domain.problem.entity.Difficulty;
import com.codecraft.domain.problem.entity.Problem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemSummaryDto {
    private Long id;
    private String title;
    private String slug;
    private Difficulty difficulty;
    private String topicTitle;
    private String topicSlug;
    private Boolean isDailyChallenge;
    private Double acceptanceRate;
    private Long totalSubmissions;
    private Boolean solvedByUser;

    public static ProblemSummaryDto fromEntity(
            Problem problem,
            double acceptanceRate,
            long totalSubmissions,
            boolean solvedByUser
    ) {
        return ProblemSummaryDto.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .slug(problem.getSlug())
                .difficulty(problem.getDifficulty())
                .topicTitle(problem.getTopic() != null ? problem.getTopic().getTitle() : null)
                .topicSlug(problem.getTopic() != null ? problem.getTopic().getSlug() : null)
                .isDailyChallenge(problem.isDailyChallenge())
                .acceptanceRate(acceptanceRate)
                .totalSubmissions(totalSubmissions)
                .solvedByUser(solvedByUser)
                .build();
    }
}
