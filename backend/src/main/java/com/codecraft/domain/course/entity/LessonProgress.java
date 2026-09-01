package com.codecraft.domain.course.entity;

import com.codecraft.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "lesson_progress",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_lesson", columnNames = {"user_id", "lesson_id"})
        },
        indexes = {
                @Index(name = "idx_progress_user", columnList = "user_id"),
                @Index(name = "idx_progress_lesson", columnList = "lesson_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean completed = true;

    @CreationTimestamp
    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;
}
