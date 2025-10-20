package com.example.siamLacorns.dto;


import java.util.List;

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

    // Конструкторы, геттеры и сеттеры
    public LacornDTO() {}

    public LacornDTO(Long id, String title, String description, Integer releaseYear,
                     Integer totalEpisodes, Integer episodeDuration) {
        this.id = id;
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
    public List<EpisodeDTO> getEpisodes() { return episodes; }
    public void setEpisodes(List<EpisodeDTO> episodes) { this.episodes = episodes; }
    public WatchProgressDTO getWatchProgress() { return watchProgress; }
    public void setWatchProgress(WatchProgressDTO watchProgress) { this.watchProgress = watchProgress; }
}
