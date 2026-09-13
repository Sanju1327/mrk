package com.codecraft.domain.problem.dto;

import com.codecraft.domain.problem.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProblemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Slug is required")
    private String slug;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Constraints are required")
    private String constraints;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    @Builder.Default
    private String supportedLanguage = "JAVA";

    @Builder.Default
    private int timeLimitMs = 2000;

    @Builder.Default
    private int memoryLimitMb = 256;

    @NotBlank(message = "Starter code is required")
    private String starterCode;

    private String explanation;
    private Long topicId;
    private Long courseId;
    private Long lessonId;

    private List<TestCaseInputDto> testCases;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseInputDto {
        private String inputData;
        private String expectedOutput;
        private boolean isSample;
        private boolean isHidden;
        private String explanation;
        private int displayOrder;
    }
}
