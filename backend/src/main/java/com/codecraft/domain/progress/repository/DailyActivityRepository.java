package com.codecraft.domain.progress.repository;

import com.codecraft.domain.progress.entity.DailyActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyActivityRepository extends JpaRepository<DailyActivity, Long> {

    Optional<DailyActivity> findByUserIdAndActivityDate(Long userId, LocalDate activityDate);

    List<DailyActivity> findByUserIdAndActivityDateBetweenOrderByActivityDateAsc(Long userId, LocalDate startDate, LocalDate endDate);
}
