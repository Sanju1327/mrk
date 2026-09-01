package com.codecraft.domain.quiz.repository;

import com.codecraft.domain.quiz.entity.QuizAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserIdAndQuizIdOrderByCreatedAtDesc(Long userId, Long quizId);

    Page<QuizAttempt> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT AVG(q.percentage) FROM QuizAttempt q WHERE q.user.id = :userId")
    Optional<Double> findAverageScoreByUserId(@Param("userId") Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndPassedTrue(Long userId);
}
