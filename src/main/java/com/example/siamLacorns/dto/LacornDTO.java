package com.example.siamLacorns.dto;


import com.example.siamLacorns.exception.ValidationException;
import com.example.siamLacorns.model.Lacorn;
import lombok.Builder;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Builder
public class LacornDTO {
    private Long id;
    private String title;
    private String description;
    private Integer releaseYear;
    private Integer totalEpisodes;
    private Integer episodeDuration;
    private String posterUrl;
    private String trailerUrl;
    private List<String> genres;
    private String ageRating;
    private Double rating;
    private List<EpisodeDTO> episodes;
    private WatchProgressDTO watchProgress;
    private List<ActorDTO> actors;
    private String status;
    private List<String> availableVoiceovers;
    private List<String> productionCountries;
    // Конструкторы, геттеры и сеттеры
    public LacornDTO() {}

    public LacornDTO(Lacorn lacorn) {
        this.id = lacorn.getId();
        this.title = lacorn.getTitle();
        this.description = lacorn.getDescription();
        this.releaseYear = lacorn.getReleaseYear();
        this.totalEpisodes = lacorn.getTotalEpisodes();
        this.episodeDuration = lacorn.getEpisodeDuration();
        this.posterUrl = lacorn.getPosterUrl();
        this.trailerUrl = lacorn.getTrailerUrl();
        this.genres = lacorn.getGenres();
        this.ageRating = lacorn.getAgeRating();
        this.rating = lacorn.getRating();
        this.status = lacorn.getStatus() != null ? lacorn.getStatus().name() : "ONGOING";
        this.productionCountries = lacorn.getProductionCountries();

        // Конвертируем актёров
        if (lacorn.getActors() != null) {
            this.actors = lacorn.getActors().stream()
                    .map(actor -> {
                        ActorDTO actorDTO = new ActorDTO();
                        actorDTO.setId(actor.getId());
                        actorDTO.setName(actor.getName());
                        actorDTO.setPhotoUrl(actor.getPhotoUrl());
                        actorDTO.setBiography(actor.getBiography());
                        actorDTO.setBirthDate(actor.getBirthDate());
                        actorDTO.setNationality(actor.getNationality());
                        return actorDTO;
                    })
                    .collect(Collectors.toList());
        }
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
    public void setRating(Double rating) {
        if (rating != null && (rating < 0 || rating > 10)) {
            throw new ValidationException("Рейтинг должен быть от 0 до 10");
        }
        this.rating = rating;
    }

    public List<EpisodeDTO> getEpisodes() { return episodes; }
    public void setEpisodes(List<EpisodeDTO> episodes) { this.episodes = episodes; }

    public WatchProgressDTO getWatchProgress() { return watchProgress; }
    public void setWatchProgress(WatchProgressDTO watchProgress) { this.watchProgress = watchProgress; }

    public List<ActorDTO> getActors() { return actors; }
    public void setActors(List<ActorDTO> actors) { this.actors = actors; }

    public String getStatus() {
        return status != null ? status : "ONGOING";
    }
    public void setStatus(String status) { this.status = status; }

    public List<String> getAvailableVoiceovers() { return availableVoiceovers; }
    public void setAvailableVoiceovers(List<String> availableVoiceovers) {
        this.availableVoiceovers = availableVoiceovers;
    }

    @Override
    public String toString() {
        return "LacornDTO{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", releaseYear=" + releaseYear +
                ", rating=" + rating +
                '}';
    }
}
