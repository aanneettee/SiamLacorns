package com.example.siamLacorns.dto;


import com.example.siamLacorns.exception.ValidationException;
import com.example.siamLacorns.model.Lacorn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Builder
@AllArgsConstructor
public class LacornDTO {
    // Конструкторы, геттеры и сеттеры
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
    @Setter
    @Getter
    private Long id;

    @Setter
    @Getter
    private String title;

    @Setter
    @Getter
    private String description;

    @Setter
    @Getter
    private Integer releaseYear;

    @Setter
    @Getter
    private Integer totalEpisodes;

    @Setter
    @Getter
    private Integer episodeDuration;

    @Setter
    @Getter
    private String posterUrl;

    @Setter
    @Getter
    private String trailerUrl;

    @Setter
    @Getter
    private List<String> genres;

    @Setter
    @Getter
    private String ageRating;

    @Getter
    private Double rating;

    public void setRating(Double rating) {
        if (rating != null && (rating < 0 || rating > 10)) {
            throw new ValidationException("Рейтинг должен быть от 0 до 10");
        }
        this.rating = rating;
    }

    @Setter
    @Getter
    private List<EpisodeDTO> episodes;

    @Setter
    @Getter
    private WatchProgressDTO watchProgress;

    @Setter
    @Getter
    private List<ActorDTO> actors;

    @Setter
    private String status;

    @Setter
    @Getter
    private List<String> availableVoiceovers;
    private List<String> productionCountries;


    public String getStatus() {
        return status != null ? status : "ONGOING";
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
