package com.example.siamLacorns.dto;

import java.time.LocalDateTime;

public class WatchProgressDTO {
    private Long episodeId;
    private Integer currentTime;
    private Boolean completed;  // Исправлено: было сompleted с кириллической с
    private LocalDateTime lastWatched;
    private Long lacornId;
    private String lacornTitle;

    // Конструкторы
    public WatchProgressDTO() {}

    public WatchProgressDTO(Long episodeId, Integer currentTime, Boolean completed, LocalDateTime lastWatched) {
        this.episodeId = episodeId;
        this.currentTime = currentTime;
        this.completed = completed;
        this.lastWatched = lastWatched;
    }

    // Геттеры и сеттеры
    public Long getEpisodeId() {
        return episodeId;
    }

    public void setEpisodeId(Long episodeId) {
        this.episodeId = episodeId;
    }

    public Integer getCurrentTime() {
        return currentTime;
    }

    public void setCurrentTime(Integer currentTime) {
        this.currentTime = currentTime;
    }

    public Boolean isCompleted() {  // Стандартное название для boolean
        return completed;
    }

    public Boolean getCompleted() {  // Альтернативный геттер для совместимости
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getLastWatched() {
        return lastWatched;
    }

    public void setLastWatched(LocalDateTime lastWatched) {
        this.lastWatched = lastWatched;
    }

    public Long getLacornId() {
        return lacornId;
    }

    public void setLacornId(Long lacornId) {
        this.lacornId = lacornId;
    }

    public String getLacornTitle() {
        return lacornTitle;
    }

    public void setLacornTitle(String lacornTitle) {
        this.lacornTitle = lacornTitle;
    }
}