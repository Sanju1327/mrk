package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.Topic;
import com.codecraft.domain.quiz.entity.Quiz;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Chapter (stored as {@code Topic}) with its lessons, completion settings, quiz summary and optional student progress.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicDetailDto {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private Integer displayOrder;

    // Completion settings
    private boolean requireAllLessons;
    private boolean requireQuizPass;
    private boolean allowQuizRetakes;
    private Integer maxQuizAttempts;

    private ChapterQuizSummaryDto quiz;
    private List<LessonSummaryDto> lessons;

    /** Null for teacher/builder views; populated for student views. */
    private TopicProgressDto progress;

    public static TopicDetailDto fromEntity(Topic topic, List<LessonSummaryDto> lessons) {
        return fromEntity(topic, lessons, null);
    }

    public static TopicDetailDto fromEntity(Topic topic, List<LessonSummaryDto> lessons, TopicProgressDto progress) {
        return TopicDetailDto.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .slug(topic.getSlug())
                .description(topic.getDescription())
                .displayOrder(topic.getDisplayOrder())
                .requireAllLessons(topic.isRequireAllLessons())
                .requireQuizPass(topic.isRequireQuizPass())
                .allowQuizRetakes(topic.isAllowQuizRetakes())
                .maxQuizAttempts(topic.getMaxQuizAttempts())
                .quiz(ChapterQuizSummaryDto.fromEntity(primaryQuiz(topic)))
                .lessons(lessons)
                .progress(progress)
                .build();
    }

    public static TopicDetailDto fromEntity(Topic topic) {
        List<LessonSummaryDto> lessonDtos = topic.getLessons() != null ?
                topic.getLessons().stream().map(l -> LessonSummaryDto.fromEntity(l, false)).toList() :
                java.util.Collections.emptyList();
        return fromEntity(topic, lessonDtos);
    }

    /**
     * A chapter has at most one chapter quiz in the content-management flow; if legacy data contains
     * several, the first one (lowest id) is treated as the chapter quiz.
     */
    public static Quiz primaryQuiz(Topic topic) {
        if (topic.getQuizzes() == null || topic.getQuizzes().isEmpty()) return null;
        return topic.getQuizzes().stream()
                .filter(q -> q.getLesson() == null)
                .min(java.util.Comparator.comparing(Quiz::getId, java.util.Comparator.nullsLast(Long::compareTo)))
                .orElse(null);
    }
}
