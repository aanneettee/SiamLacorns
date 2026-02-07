// ActorRepository.java
package com.example.siamLacorns.repository;

import com.example.siamLacorns.model.Actor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActorRepository extends JpaRepository<Actor, Long> {

    Optional<Actor> findByName(String name);

    List<Actor> findByNameContainingIgnoreCase(String name);

    @Query("SELECT a FROM Actor a JOIN a.lacorns l WHERE l.id = :lacornId")
    List<Actor> findByLacornId(@Param("lacornId") Long lacornId);

    @Query("SELECT a FROM Actor a WHERE LOWER(a.nationality) = LOWER(:nationality)")
    List<Actor> findByNationality(@Param("nationality") String nationality);
}