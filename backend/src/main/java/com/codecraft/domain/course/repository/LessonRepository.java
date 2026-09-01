package com.codecraft.domain.course.repository;

import com.codecraft.domain.course.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByTopicIdOrderByDisplayOrderAsc(Long topicId);

    Optional<Lesson> findBySlug(String slug);
}
