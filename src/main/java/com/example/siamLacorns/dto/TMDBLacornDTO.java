// TMDBLacornDTO.java
package com.example.siamLacorns.dto;

import java.util.List;

public class TMDBLacornDTO {
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
    private String status;
    private List<String> availableVoiceovers;
    private Long tmdbId;
    private String mediaType; // "MOVIE" или "TV"
    private List<String> productionCountries; // НОВОЕ: страны производства
    private List<ActorDTO> actors;

    // Конструкторы, геттеры и сеттеры
    public TMDBLacornDTO() {}

    public TMDBLacornDTO(String title, String description, Integer releaseYear,
                         Integer totalEpisodes, Integer episodeDuration) {
        this.title = title;
        this.description = description;
        this.releaseYear = releaseYear;
        this.totalEpisodes = totalEpisodes;
        this.episodeDuration = episodeDuration;
    }

    // Геттеры и сеттеры
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<String> getAvailableVoiceovers() { return availableVoiceovers; }
    public void setAvailableVoiceovers(List<String> availableVoiceovers) { this.availableVoiceovers = availableVoiceovers; }
    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    public List<String> getProductionCountries() { return productionCountries; }
    public void setProductionCountries(List<String> productionCountries) { this.productionCountries = productionCountries; }
    public List<ActorDTO> getActors() { return actors; }
    public void setActors(List<ActorDTO> actors) { this.actors = actors; }
}