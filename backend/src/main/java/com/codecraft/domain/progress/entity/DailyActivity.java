package com.codecraft.domain.progress.entity;

import com.codecraft.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(
        name = "daily_activity",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_date", columnNames = {"user_id", "activity_date"})
        },
        indexes = {
                @Index(name = "idx_activity_user", columnList = "user_id"),
                @Index(name = "idx_activity_date", columnList = "activity_date")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "submission_count", nullable = false)
    @Builder.Default
    private int submissionCount = 0;

    @Column(name = "quiz_count", nullable = false)
    @Builder.Default
    private int quizCount = 0;

    @Column(name = "lesson_count", nullable = false)
    @Builder.Default
    private int lessonCount = 0;
}
