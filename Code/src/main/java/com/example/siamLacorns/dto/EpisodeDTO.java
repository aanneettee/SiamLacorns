package com.example.siamLacorns.dto;

import com.example.siamLacorns.model.Episode;

import java.util.Arrays;
import java.util.List;

public class EpisodeDTO {
    private Long id;
    private String title;
    private Integer episodeNumber;
    private Integer seasonNumber;
    private String description;
    private Integer duration;
    private String videoUrl;
    private String thumbnailUrl;
    private boolean watched;
    private Integer currentTime;
    private List<String> availableVoiceovers;

    // Конструкторы, геттеры и сеттеры
    public EpisodeDTO() {}

    public EpisodeDTO(Episode episode) {
        this.id = episode.getId();
        this.title = episode.getTitle();
        this.description = episode.getDescription();
        this.episodeNumber = episode.getEpisodeNumber();
        this.seasonNumber = episode.getSeasonNumber();
        this.videoUrl = episode.getVideoUrl();
        this.duration = episode.getDuration();
        this.watched = false;
        this.currentTime = 0;
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
    public boolean isWatched() { return watched; }
    public void setWatched(boolean watched) { this.watched = watched; }
    public Integer getCurrentTime() { return currentTime; }
    public void setCurrentTime(Integer currentTime) { this.currentTime = currentTime; }
    public List<String> getAvailableVoiceovers() {
        if (availableVoiceovers == null) {
            return Arrays.asList("subbed", "dubbed"); // значения по умолчанию
        }
        return availableVoiceovers;
    }
    public void setAvailableVoiceovers(List<String> availableVoiceovers) {
        this.availableVoiceovers = availableVoiceovers;
    }
}
