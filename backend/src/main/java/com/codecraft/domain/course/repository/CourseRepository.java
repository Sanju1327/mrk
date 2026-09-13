package com.codecraft.domain.course.repository;

import com.codecraft.domain.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByPublishedTrueOrderByDisplayOrderAsc();

    List<Course> findByTeacherIdOrderByDisplayOrderAsc(Long teacherId);

    List<Course> findByStatusOrderByDisplayOrderAsc(com.codecraft.domain.course.entity.CourseStatus status);

    long countByStatus(com.codecraft.domain.course.entity.CourseStatus status);

    Optional<Course> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
