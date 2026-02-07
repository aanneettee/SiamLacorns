package com.example.siamLacorns.dto;

public class WatchRequestDTO {
    private Long episodeId;
    private Integer currentTime;
    private Boolean completed;

    // Конструкторы, геттеры и сеттеры
    public WatchRequestDTO() {}

    public WatchRequestDTO(Long episodeId, Integer currentTime) {
        this.episodeId = episodeId;
        this.currentTime = currentTime;
    }

    public Long getEpisodeId() { return episodeId; }
    public void setEpisodeId(Long episodeId) { this.episodeId = episodeId; }
    public Integer getCurrentTime() { return currentTime; }
    public void setCurrentTime(Integer currentTime) { this.currentTime = currentTime; }
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }
}

