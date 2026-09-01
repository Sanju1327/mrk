package com.codecraft.domain.submission.repository;

import com.codecraft.domain.submission.entity.Submission;
import com.codecraft.domain.submission.entity.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    Page<Submission> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Submission> findByUserIdAndProblemIdOrderByCreatedAtDesc(Long userId, Long problemId, Pageable pageable);

    List<Submission> findByUserIdAndStatus(Long userId, SubmissionStatus status);

    boolean existsByUserIdAndProblemIdAndStatus(Long userId, Long problemId, SubmissionStatus status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, SubmissionStatus status);

    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s WHERE s.user.id = :userId AND s.status = 'ACCEPTED'")
    long countDistinctAcceptedProblemsByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s WHERE s.user.id = :userId AND s.status = 'ACCEPTED' AND s.problem.difficulty = com.codecraft.domain.problem.entity.Difficulty.EASY")
    long countDistinctEasyAcceptedProblemsByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s WHERE s.user.id = :userId AND s.status = 'ACCEPTED' AND s.problem.difficulty = com.codecraft.domain.problem.entity.Difficulty.MEDIUM")
    long countDistinctMediumAcceptedProblemsByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM Submission s WHERE s.user.id = :userId AND s.status = 'ACCEPTED' AND s.problem.difficulty = com.codecraft.domain.problem.entity.Difficulty.HARD")
    long countDistinctHardAcceptedProblemsByUserId(@Param("userId") Long userId);
}
