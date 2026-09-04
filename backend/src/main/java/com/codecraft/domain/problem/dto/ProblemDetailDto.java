package com.codecraft.domain.problem.dto;

import com.codecraft.domain.problem.entity.Difficulty;
import com.codecraft.domain.problem.entity.Problem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDetailDto {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String constraints;
    private Difficulty difficulty;
    private String supportedLanguage;
    private Integer timeLimitMs;
    private Integer memoryLimitMb;
    private String starterCode;
    private String explanation;
    private String topicTitle;
    private String topicSlug;
    private Long courseId;
    private String courseSlug;
    private Boolean isDailyChallenge;
    private Boolean solvedByUser;
    private Double acceptanceRate;
    private Long totalSubmissions;
    private List<TestCaseDto> sampleTestCases;

    public static ProblemDetailDto fromEntity(
            Problem problem,
            boolean solvedByUser,
            double acceptanceRate,
            long totalSubmissions,
            List<TestCaseDto> sampleTestCases
    ) {
        String courseSlug = null;
        Long courseId = null;
        if (problem.getTopic() != null && problem.getTopic().getCourse() != null) {
            courseSlug = problem.getTopic().getCourse().getSlug();
            courseId = problem.getTopic().getCourse().getId();
        }

        return ProblemDetailDto.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .slug(problem.getSlug())
                .description(problem.getDescription())
                .constraints(problem.getConstraints())
                .difficulty(problem.getDifficulty())
                .supportedLanguage(problem.getSupportedLanguage())
                .timeLimitMs(problem.getTimeLimitMs())
                .memoryLimitMb(problem.getMemoryLimitMb())
                .starterCode(problem.getStarterCode())
                .explanation(problem.getExplanation())
                .topicTitle(problem.getTopic() != null ? problem.getTopic().getTitle() : null)
                .topicSlug(problem.getTopic() != null ? problem.getTopic().getSlug() : null)
                .courseId(courseId)
                .courseSlug(courseSlug)
                .isDailyChallenge(problem.isDailyChallenge())
                .solvedByUser(solvedByUser)
                .acceptanceRate(acceptanceRate)
                .totalSubmissions(totalSubmissions)
                .sampleTestCases(sampleTestCases)
                .build();
    }
}
