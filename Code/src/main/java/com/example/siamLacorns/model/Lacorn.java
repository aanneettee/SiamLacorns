package com.example.siamLacorns.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name = "lacorns")
public class Lacorn {
    // Геттеры и сеттеры
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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "lacorn_genres", joinColumns = @JoinColumn(name = "lacorn_id"))
    @Column(name = "genre")
    private List<String> genres = new ArrayList<>();

    @Column(name = "age_rating")
    private String ageRating;

    private Double rating;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // В классе Lacorn нужно добавить:
/*
    @ElementCollection
    @CollectionTable(name = "lacorn_voiceovers", joinColumns = @JoinColumn(name = "lacorn_id"))
    @Column(name = "voiceover")
*/
//    private List<String> availableVoiceovers = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "lacorn_production_countries", joinColumns = @JoinColumn(name = "lacorn_id"))
    @Column(name = "country")
    private List<String> productionCountries;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "lacorn", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Episode> episodes = new ArrayList<>();

    @OneToMany(mappedBy = "lacorn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserWatchHistory> watchHistories = new ArrayList<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "lacorn_actors",
            joinColumns = @JoinColumn(name = "lacorn_id"),
            inverseJoinColumns = @JoinColumn(name = "actor_id")
    )
    private List<Actor> actors = new ArrayList<>();

    public Lacorn(String title, String description, Integer releaseYear,
                  Integer totalEpisodes, Integer episodeDuration) {
        this();
        this.title = title;
        this.description = description;
        this.releaseYear = releaseYear;
        this.totalEpisodes = totalEpisodes;
        this.episodeDuration = episodeDuration;
    }


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

    public void addActor(Actor actor) {
        if (!actors.contains(actor)) {
            actors.add(actor);
            actor.getLacorns().add(this);
        }
    }

    public void removeActor(Actor actor) {
        actors.remove(actor);
        actor.getLacorns().remove(this);
    }

    public void addEpisode(Episode episode) {
        episodes.add(episode);
        episode.setLacorn(this);
    }

    // ДОБАВИТЬ в класс Lacorn:
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SeriesStatus status; // ONGOING, COMPLETED, UPCOMING

    public enum SeriesStatus {
        ONGOING, COMPLETED, UPCOMING
    }

    // В класс Lacorn.java добавьте:
    @Column(name = "tmdb_id", unique = true)
    private Long tmdbId;
}