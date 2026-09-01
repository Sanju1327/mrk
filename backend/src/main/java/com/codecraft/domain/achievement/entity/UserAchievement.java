package com.codecraft.domain.achievement.entity;

import com.codecraft.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_achievements",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_achievement", columnNames = {"user_id", "achievement_id"})
        },
        indexes = {
                @Index(name = "idx_user_achievements_user", columnList = "user_id"),
                @Index(name = "idx_user_achievements_achieve", columnList = "achievement_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "achievement_id", nullable = false)
    private Achievement achievement;

    @CreationTimestamp
    @Column(name = "unlocked_at", nullable = false, updatable = false)
    private LocalDateTime unlockedAt;
}
