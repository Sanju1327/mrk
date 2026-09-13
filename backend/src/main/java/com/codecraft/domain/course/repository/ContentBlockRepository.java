package com.codecraft.domain.course.repository;

import com.codecraft.domain.course.entity.ContentBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentBlockRepository extends JpaRepository<ContentBlock, Long> {
    List<ContentBlock> findByLessonIdOrderByDisplayOrderAsc(Long lessonId);
    void deleteByLessonId(Long lessonId);
}
