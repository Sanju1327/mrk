package com.codecraft.domain.achievement.repository;

import com.codecraft.domain.achievement.entity.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {

    List<UserAchievement> findByUserIdOrderByUnlockedAtDesc(Long userId);

    boolean existsByUserIdAndAchievementId(Long userId, Long achievementId);

    long countByUserId(Long userId);
}
