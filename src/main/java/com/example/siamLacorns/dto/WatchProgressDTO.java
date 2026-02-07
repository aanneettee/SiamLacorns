package com.example.siamLacorns.dto;


import java.time.LocalDateTime;

public class WatchProgressDTO {
    private Long episodeId;
    private Integer currentTime;
    private Boolean isCompleted;
    private LocalDateTime lastWatched;
    private Long lacornId;
    private String lacornTitle;

    // Конструкторы, геттеры и сеттеры
    public WatchProgressDTO() {}

    public WatchProgressDTO(Long episodeId, Integer currentTime, Boolean isCompleted, LocalDateTime lastWatched) {
        this.episodeId = episodeId;
        this.currentTime = currentTime;
        this.isCompleted = isCompleted;
        this.lastWatched = lastWatched;
    }

    // Геттеры и сеттеры
    public Long getEpisodeId() { return episodeId; }
    public void setEpisodeId(Long episodeId) { this.episodeId = episodeId; }
    public Integer getCurrentTime() { return currentTime; }
    public void setCurrentTime(Integer currentTime) { this.currentTime = currentTime; }
    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean completed) { isCompleted = completed; }
    public LocalDateTime getLastWatched() { return lastWatched; }
    public void setLastWatched(LocalDateTime lastWatched) { this.lastWatched = lastWatched; }
    public Long getLacornId() { return lacornId; }
    public void setLacornId(Long lacornId) { this.lacornId = lacornId; }
    public String getLacornTitle() { return lacornTitle; }
    public void setLacornTitle(String lacornTitle) { this.lacornTitle = lacornTitle; }
}
