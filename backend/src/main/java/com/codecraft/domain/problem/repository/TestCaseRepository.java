package com.codecraft.domain.problem.repository;

import com.codecraft.domain.problem.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {

    List<TestCase> findByProblemIdOrderByDisplayOrderAsc(Long problemId);

    List<TestCase> findByProblemIdAndSampleTrueOrderByDisplayOrderAsc(Long problemId);
}
