package com.codecraft.domain.quiz.entity;

import com.codecraft.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "quiz_attempts",
        indexes = {
                @Index(name = "idx_attempts_user_quiz", columnList = "user_id, quiz_id"),
                @Index(name = "idx_attempts_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private int score;

    @Column(name = "max_score", nullable = false)
    private int maxScore;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "is_passed", nullable = false)
    private boolean passed;

    @Column(name = "time_spent_seconds", nullable = false)
    private int timeSpentSeconds;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
