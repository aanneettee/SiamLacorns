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
    private Episode episode;  // Изменено с currentEpisode на episode

    @Column(name = "current_time_seconds")
    private Integer currentTime;

    @Column(name = "is_completed")
    private Boolean completed = false;  // Изменено с isCompleted на completed

    @Column(name = "last_watched")
    private LocalDateTime lastWatched;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Конструкторы
    public UserWatchHistory() {
        this.createdAt = LocalDateTime.now();
    }

    public UserWatchHistory(User user, Lacorn lacorn, Episode episode) {
        this();
        this.user = user;
        this.lacorn = lacorn;
        this.episode = episode;
        this.lastWatched = LocalDateTime.now();
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Lacorn getLacorn() { return lacorn; }
    public void setLacorn(Lacorn lacorn) { this.lacorn = lacorn; }

    public Episode getEpisode() { return episode; }  // Изменено с getCurrentEpisode
    public void setEpisode(Episode episode) { this.episode = episode; }

    public Integer getCurrentTime() { return currentTime; }
    public void setCurrentTime(Integer currentTime) { this.currentTime = currentTime; }

    public Boolean isCompleted() { return completed; }  // Изменено с getIsCompleted
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public LocalDateTime getLastWatched() { return lastWatched; }
    public void setLastWatched(LocalDateTime lastWatched) {
        this.lastWatched = lastWatched;
    }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}