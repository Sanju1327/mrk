package com.codecraft.domain.course.dto;

import com.codecraft.domain.course.entity.Topic;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicDetailDto {
    private Long id;
    private String title;
    private String description;
    private Integer displayOrder;
    private List<LessonSummaryDto> lessons;

    public static TopicDetailDto fromEntity(Topic topic, List<LessonSummaryDto> lessons) {
        return TopicDetailDto.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .displayOrder(topic.getDisplayOrder())
                .lessons(lessons)
                .build();
    }

    public static TopicDetailDto fromEntity(Topic topic) {
        List<LessonSummaryDto> lessonDtos = topic.getLessons() != null ?
                topic.getLessons().stream().map(l -> LessonSummaryDto.fromEntity(l, false)).toList() :
                java.util.Collections.emptyList();
        return fromEntity(topic, lessonDtos);
    }
}
