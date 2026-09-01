package com.codecraft.domain.submission.entity;

import com.codecraft.domain.problem.entity.Problem;
import com.codecraft.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "submissions",
        indexes = {
                @Index(name = "idx_sub_user_problem", columnList = "user_id, problem_id"),
                @Index(name = "idx_sub_created_at", columnList = "created_at"),
                @Index(name = "idx_sub_status", columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String language = "JAVA";

    @Column(name = "source_code", nullable = false, columnDefinition = "LONGTEXT")
    private String sourceCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SubmissionStatus status;

    @Column(name = "execution_time_ms")
    private Integer executionTimeMs;

    @Column(name = "memory_used_kb")
    private Integer memoryUsedKb;

    @Column(name = "compiler_output", columnDefinition = "TEXT")
    private String compilerOutput;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "passed_test_cases", nullable = false)
    @Builder.Default
    private int passedTestCases = 0;

    @Column(name = "total_test_cases", nullable = false)
    @Builder.Default
    private int totalTestCases = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
