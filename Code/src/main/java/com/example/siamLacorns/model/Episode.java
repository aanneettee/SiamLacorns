package com.example.siamLacorns.model;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "episodes")
public class Episode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "episode_number", nullable = false)
    private Integer episodeNumber;

    @Column(name = "season_number", nullable = false)
    private Integer seasonNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration")
    private Integer duration; // в минутах

    @Column(name = "video_url", nullable = false)
    private String videoUrl;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lacorn_id", nullable = false)
    private Lacorn lacorn;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Конструкторы
    public Episode() {
        this.createdAt = LocalDateTime.now();
    }

    public Episode(String title, Integer episodeNumber, Integer seasonNumber, String videoUrl) {
        this();
        this.title = title;
        this.episodeNumber = episodeNumber;
        this.seasonNumber = seasonNumber;
        this.videoUrl = videoUrl;
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getEpisodeNumber() { return episodeNumber; }
    public void setEpisodeNumber(Integer episodeNumber) { this.episodeNumber = episodeNumber; }

    public Integer getSeasonNumber() { return seasonNumber; }
    public void setSeasonNumber(Integer seasonNumber) { this.seasonNumber = seasonNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public Lacorn getLacorn() { return lacorn; }
    public void setLacorn(Lacorn lacorn) { this.lacorn = lacorn; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
