package com.codecraft.domain.problem.repository;

import com.codecraft.domain.problem.entity.Difficulty;
import com.codecraft.domain.problem.entity.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    Optional<Problem> findBySlug(String slug);

    Optional<Problem> findFirstByDailyChallengeTrue();

    Page<Problem> findByTopicId(Long topicId, Pageable pageable);

    Page<Problem> findByDifficulty(Difficulty difficulty, Pageable pageable);

    Page<Problem> findByTopicIdAndDifficulty(Long topicId, Difficulty difficulty, Pageable pageable);

    @Query("SELECT p FROM Problem p WHERE " +
            "(:topicId IS NULL OR p.topic.id = :topicId) AND " +
            "(:difficulty IS NULL OR p.difficulty = :difficulty) AND " +
            "(:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Problem> findProblemsFiltered(
            @Param("topicId") Long topicId,
            @Param("difficulty") Difficulty difficulty,
            @Param("search") String search,
            Pageable pageable
    );
}
