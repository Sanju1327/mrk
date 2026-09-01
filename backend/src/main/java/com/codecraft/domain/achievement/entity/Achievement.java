package com.codecraft.domain.achievement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "achievements",
        indexes = {
                @Index(name = "idx_achievements_code", columnList = "code")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "icon_url", length = 255)
    private String iconUrl;

    @Column(nullable = false)
    @Builder.Default
    private int points = 50;

    @Column(name = "criteria_type", nullable = false, length = 50)
    private String criteriaType;

    @Column(name = "criteria_threshold", nullable = false)
    @Builder.Default
    private int criteriaThreshold = 1;
}
