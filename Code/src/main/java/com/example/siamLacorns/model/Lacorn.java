package com.example.siamLacorns.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lacorns")
public class Lacorn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(name = "total_episodes")
    private Integer totalEpisodes;

    @Column(name = "episode_duration")
    private Integer episodeDuration; // в минутах

    @Column(name = "poster_url")
    private String posterUrl;

    @Column(name = "trailer_url")
    private String trailerUrl;

    @ElementCollection
    @CollectionTable(name = "lacorn_genres", joinColumns = @JoinColumn(name = "lacorn_id"))
    @Column(name = "genre")
    private List<String> genres = new ArrayList<>();

    @Column(name = "age_rating")
    private String ageRating;

    private Double rating;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "lacorn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Episode> episodes = new ArrayList<>();

    @OneToMany(mappedBy = "lacorn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserWatchHistory> watchHistories = new ArrayList<>();

    // Конструкторы
    public Lacorn() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Lacorn(String title, String description, Integer releaseYear,
                  Integer totalEpisodes, Integer episodeDuration) {
        this();
        this.title = title;
        this.description = description;
        this.releaseYear = releaseYear;
        this.totalEpisodes = totalEpisodes;
        this.episodeDuration = episodeDuration;
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getReleaseYear() { return releaseYear; }
    public void setReleaseYear(Integer releaseYear) { this.releaseYear = releaseYear; }

    public Integer getTotalEpisodes() { return totalEpisodes; }
    public void setTotalEpisodes(Integer totalEpisodes) { this.totalEpisodes = totalEpisodes; }

    public Integer getEpisodeDuration() { return episodeDuration; }
    public void setEpisodeDuration(Integer episodeDuration) { this.episodeDuration = episodeDuration; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }

    public List<String> getGenres() { return genres; }
    public void setGenres(List<String> genres) { this.genres = genres; }

    public String getAgeRating() { return ageRating; }
    public void setAgeRating(String ageRating) { this.ageRating = ageRating; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Episode> getEpisodes() { return episodes; }
    public void setEpisodes(List<Episode> episodes) { this.episodes = episodes; }
    public List<UserWatchHistory> getWatchHistories() { return watchHistories; }
    public void setWatchHistories(List<UserWatchHistory> watchHistories) { this.watchHistories = watchHistories; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Вспомогательные методы
    public void addGenre(String genre) {
        if (!genres.contains(genre)) {
            genres.add(genre);
        }
    }

    public void addEpisode(Episode episode) {
        episodes.add(episode);
        episode.setLacorn(this);
    }
}