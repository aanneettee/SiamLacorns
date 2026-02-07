package com.example.siamLacorns.repository;

import com.example.siamLacorns.model.SeriesCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeriesCollectionRepository extends JpaRepository<SeriesCollection, Long> {

    List<SeriesCollection> findByUserId(Long userId);

    Optional<SeriesCollection> findByUserIdAndName(Long userId, String name);

    // ИСПРАВЛЕННЫЙ ЗАПРОС: убрали JOIN FETCH с seriesIds
    @Query("SELECT sc FROM SeriesCollection sc LEFT JOIN FETCH sc.lacorns WHERE sc.user.id = :userId")
    List<SeriesCollection> findByUserIdWithSeries(@Param("userId") Long userId);

    boolean existsByUserIdAndName(Long userId, String name);
}