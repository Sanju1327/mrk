package com.codecraft.domain.quiz.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "questions",
        indexes = {
                @Index(name = "idx_questions_quiz_id", columnList = "quiz_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 30)
    @Builder.Default
    private QuestionType questionType = QuestionType.SINGLE_CHOICE;

    @Column(nullable = false)
    @Builder.Default
    private int points = 10;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<QuestionOption> options = new ArrayList<>();
}
