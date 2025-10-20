package com.example.siamLacorns.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_watch_history")
public class UserWatchHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lacorn_id", nullable = false)
    private Lacorn lacorn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "episode_id")
    private Episode currentEpisode;

    @Column(name = "current_time_seconds") // Изменено имя колонки
    private Integer currentTime;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "last_watched")
    private LocalDateTime lastWatched;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Конструкторы
    public UserWatchHistory() {
        this.createdAt = LocalDateTime.now();
    }

    public UserWatchHistory(User user, Lacorn lacorn, Episode currentEpisode) {
        this();
        this.user = user;
        this.lacorn = lacorn;
        this.currentEpisode = currentEpisode;
        this.lastWatched = LocalDateTime.now();
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Lacorn getLacorn() { return lacorn; }
    public void setLacorn(Lacorn lacorn) { this.lacorn = lacorn; }

    public Episode getCurrentEpisode() { return currentEpisode; }
    public void setCurrentEpisode(Episode currentEpisode) { this.currentEpisode = currentEpisode; }

    public Integer getCurrentTime() { return currentTime; }
    public void setCurrentTime(Integer currentTime) { this.currentTime = currentTime; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }

    public LocalDateTime getLastWatched() { return lastWatched; }
    public void setLastWatched(LocalDateTime lastWatched) { this.lastWatched = lastWatched; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}