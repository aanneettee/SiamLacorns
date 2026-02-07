package com.example.siamLacorns.repository;

import com.example.siamLacorns.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.collections WHERE u.id = :id")
    Optional<User> findByIdWithCollections(@Param("id") Long id);

    // ✅ ДОБАВЛЕНО: Поиск пользователя по username с коллекциями
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.collections WHERE u.username = :username")
    Optional<User> findByUsernameWithCollections(@Param("username") String username);
}