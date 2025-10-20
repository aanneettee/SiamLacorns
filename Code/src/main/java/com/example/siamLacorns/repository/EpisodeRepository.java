package com.example.siamLacorns.repository;


import com.example.siamLacorns.model.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, Long> {

    List<Episode> findByLacornIdOrderBySeasonNumberAscEpisodeNumberAsc(Long lacornId);

    List<Episode> findByLacornIdAndSeasonNumberOrderByEpisodeNumberAsc(Long lacornId, Integer seasonNumber);

    Optional<Episode> findByLacornIdAndSeasonNumberAndEpisodeNumber(Long lacornId, Integer seasonNumber, Integer episodeNumber);

    @Query("SELECT MAX(e.seasonNumber) FROM Episode e WHERE e.lacorn.id = :lacornId")
    Optional<Integer> findMaxSeasonNumber(@Param("lacornId") Long lacornId);

    @Query("SELECT MAX(e.episodeNumber) FROM Episode e WHERE e.lacorn.id = :lacornId AND e.seasonNumber = :seasonNumber")
    Optional<Integer> findMaxEpisodeNumber(@Param("lacornId") Long lacornId, @Param("seasonNumber") Integer seasonNumber);
}
