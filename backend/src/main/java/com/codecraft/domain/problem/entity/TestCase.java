package com.codecraft.domain.problem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "test_cases",
        indexes = {
                @Index(name = "idx_testcases_problem_id", columnList = "problem_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "input_data", nullable = false, columnDefinition = "TEXT")
    private String inputData;

    @Column(name = "expected_output", nullable = false, columnDefinition = "TEXT")
    private String expectedOutput;

    @Column(name = "is_sample", nullable = false)
    @Builder.Default
    private boolean sample = false;

    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private boolean hidden = false;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;
}
