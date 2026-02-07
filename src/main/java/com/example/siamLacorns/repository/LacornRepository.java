package com.example.siamLacorns.repository;


import com.example.siamLacorns.model.Lacorn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Optional;

@Repository
public interface LacornRepository extends JpaRepository<Lacorn, Long> {

    Page<Lacorn> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    List<Lacorn> findByGenresContaining(String genre);

    List<Lacorn> findByReleaseYear(Integer releaseYear);

    Page<Lacorn> findByReleaseYearBetween(Integer startYear, Integer endYear, Pageable pageable);

    // В LacornRepository.java добавьте:
    Optional<Lacorn> findByTmdbId(Long tmdbId);

    @Query("SELECT l FROM Lacorn l WHERE l.rating >= :minRating ORDER BY l.rating DESC")
    List<Lacorn> findTopRated(@Param("minRating") Double minRating);

    @Query("SELECT l FROM Lacorn l JOIN l.genres g WHERE g IN :genres")
    List<Lacorn> findByMultipleGenres(@Param("genres") List<String> genres);

    // LacornRepository.java - добавьте этот метод
    @Query("SELECT DISTINCT l FROM Lacorn l LEFT JOIN FETCH l.episodes LEFT JOIN FETCH l.actors ORDER BY l.rating DESC")
    List<Lacorn> findAllWithEpisodesAndActorsOrderByRatingDesc(Pageable pageable);

    // Добавьте эти методы с JOIN FETCH
    @Query("SELECT DISTINCT l FROM Lacorn l LEFT JOIN FETCH l.genres")
    Page<Lacorn> findAllWithGenres(Pageable pageable);

    @Query("SELECT DISTINCT l FROM Lacorn l LEFT JOIN FETCH l.genres WHERE l.id = :id")
    Optional<Lacorn> findByIdWithGenres(@Param("id") Long id);

    @Query("SELECT DISTINCT l FROM Lacorn l LEFT JOIN FETCH l.genres WHERE l.title LIKE %:query%")
    Page<Lacorn> findByTitleContainingIgnoreCaseWithGenres(@Param("query") String query, Pageable pageable);

    @Query("SELECT DISTINCT l FROM Lacorn l LEFT JOIN FETCH l.genres g WHERE :genre MEMBER OF l.genres")
    List<Lacorn> findByGenresContainingWithGenres(@Param("genre") String genre);

    Optional<Lacorn> findByTitle(String title);

    List<Lacorn> findAllByOrderByRatingDesc();

    Page<Lacorn> findAllByOrderByRatingDesc(Pageable pageable);

    List<Lacorn> findTop10ByOrderByRatingDesc();

    // Для поиска с сортировкой по рейтингу
    Page<Lacorn> findByTitleContainingIgnoreCaseOrderByRatingDesc(String query, Pageable pageable);

    // Для фильтрации по жанру с сортировкой по рейтингу
    List<Lacorn> findByGenresContainingOrderByRatingDesc(String genre);
}