package com.codecraft.domain.quiz.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "question_options",
        indexes = {
                @Index(name = "idx_options_question_id", columnList = "question_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "option_text", nullable = false, columnDefinition = "TEXT")
    private String optionText;

    @Column(name = "is_correct", nullable = false)
    @Builder.Default
    private boolean correct = false;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private int displayOrder = 0;
}
