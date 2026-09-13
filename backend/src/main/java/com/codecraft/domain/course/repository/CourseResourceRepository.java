package com.codecraft.domain.course.repository;

import com.codecraft.domain.course.entity.CourseResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseResourceRepository extends JpaRepository<CourseResource, Long> {
    List<CourseResource> findByCourseId(Long courseId);
    List<CourseResource> findByLessonId(Long lessonId);
}
