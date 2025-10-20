package com.example.siamLacorns.repository;


import com.example.siamLacorns.model.Lacorn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LacornRepository extends JpaRepository<Lacorn, Long> {

    Page<Lacorn> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    List<Lacorn> findByGenresContaining(String genre);

    List<Lacorn> findByReleaseYear(Integer releaseYear);

    Page<Lacorn> findByReleaseYearBetween(Integer startYear, Integer endYear, Pageable pageable);

    @Query("SELECT l FROM Lacorn l WHERE l.rating >= :minRating ORDER BY l.rating DESC")
    List<Lacorn> findTopRated(@Param("minRating") Double minRating);

    @Query("SELECT l FROM Lacorn l JOIN l.genres g WHERE g IN :genres")
    List<Lacorn> findByMultipleGenres(@Param("genres") List<String> genres);

    Optional<Lacorn> findByTitle(String title);
}