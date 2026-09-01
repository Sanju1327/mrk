package com.codecraft.domain.course.entity;

import com.codecraft.domain.problem.entity.Problem;
import com.codecraft.domain.quiz.entity.Quiz;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "topics",
        indexes = {
                @Index(name = "idx_topics_course_id", columnList = "course_id"),
                @Index(name = "idx_topics_slug", columnList = "slug")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, unique = true, length = 150)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<Lesson> lessons = new ArrayList<>();

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Problem> problems = new ArrayList<>();

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Quiz> quizzes = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
