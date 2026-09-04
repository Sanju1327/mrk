package com.codecraft.domain.problem.dto;

import com.codecraft.domain.problem.entity.TestCase;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseDto {
    private Long id;
    private String inputData;
    private String expectedOutput;
    private String explanation;
    private Boolean sample;
    private Integer displayOrder;

    public static TestCaseDto fromEntity(TestCase tc) {
        return TestCaseDto.builder()
                .id(tc.getId())
                .inputData(tc.getInputData())
                .expectedOutput(tc.getExpectedOutput())
                .explanation(tc.getExplanation())
                .sample(tc.isSample())
                .displayOrder(tc.getDisplayOrder())
                .build();
    }
}
