package com.codecraft.domain.enrollment.entity;

import com.codecraft.domain.course.entity.Course;
import com.codecraft.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "enrollments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_course", columnNames = {"user_id", "course_id"})
        },
        indexes = {
                @Index(name = "idx_enrollment_user", columnList = "user_id"),
                @Index(name = "idx_enrollment_course", columnList = "course_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "enrolled_at", nullable = false, updatable = false)
    private LocalDateTime enrolledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
