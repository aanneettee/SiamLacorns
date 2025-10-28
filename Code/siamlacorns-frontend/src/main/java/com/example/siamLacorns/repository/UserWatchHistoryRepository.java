package com.example.siamLacorns.repository;


import com.example.siamLacorns.model.UserWatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserWatchHistoryRepository extends JpaRepository<UserWatchHistory, Long> {

    Optional<UserWatchHistory> findByUserIdAndLacornId(Long userId, Long lacornId);

    List<UserWatchHistory> findByUserIdOrderByLastWatchedDesc(Long userId);

    @Query("SELECT wh FROM UserWatchHistory wh WHERE wh.user.id = :userId AND wh.isCompleted = false ORDER BY wh.lastWatched DESC")
    List<UserWatchHistory> findInProgressByUserId(@Param("userId") Long userId);

    @Query("SELECT wh FROM UserWatchHistory wh WHERE wh.user.id = :userId AND wh.isCompleted = true ORDER BY wh.lastWatched DESC")
    List<UserWatchHistory> findCompletedByUserId(@Param("userId") Long userId);

    boolean existsByUserIdAndLacornId(Long userId, Long lacornId);

    @Query("SELECT COUNT(wh) FROM UserWatchHistory wh WHERE wh.lacorn.id = :lacornId AND wh.isCompleted = true")
    Long countCompletedViewsByLacornId(@Param("lacornId") Long lacornId);
}
