package com.codecraft.domain.problem.entity;

import com.codecraft.domain.course.entity.Topic;
import com.codecraft.domain.submission.entity.Submission;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "problems",
        indexes = {
                @Index(name = "idx_problems_slug", columnList = "slug"),
                @Index(name = "idx_problems_topic_id", columnList = "topic_id"),
                @Index(name = "idx_problems_difficulty", columnList = "difficulty"),
                @Index(name = "idx_problems_daily", columnList = "is_daily_challenge")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String constraints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty;

    @Column(name = "supported_language", nullable = false, length = 50)
    @Builder.Default
    private String supportedLanguage = "JAVA";

    @Column(name = "time_limit_ms", nullable = false)
    @Builder.Default
    private int timeLimitMs = 2000;

    @Column(name = "memory_limit_mb", nullable = false)
    @Builder.Default
    private int memoryLimitMb = 256;

    @Column(name = "starter_code", nullable = false, columnDefinition = "LONGTEXT")
    private String starterCode;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "is_daily_challenge", nullable = false)
    @Builder.Default
    private boolean dailyChallenge = false;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<TestCase> testCases = new ArrayList<>();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Submission> submissions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
