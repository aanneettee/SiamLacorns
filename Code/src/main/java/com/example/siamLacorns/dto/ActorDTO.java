package com.example.siamLacorns.dto;

import com.example.siamLacorns.model.Actor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
@NoArgsConstructor
public class ActorDTO {
    private Long id;
    private String name;
    private String biography;
    private String photoUrl;
    private LocalDate birthDate;
    private String nationality;
    private String character;

    public ActorDTO(Actor actor) {
        this.id = actor.getId();
        this.name = actor.getName();
        this.biography = actor.getBiography();
        this.photoUrl = actor.getPhotoUrl();
        this.birthDate = actor.getBirthDate();
        this.nationality = actor.getNationality();
        this.character = actor.getCharacterName();
    }

    public ActorDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public ActorDTO(Long id, String name, String biography, String photoUrl) {
        this.id = id;
        this.name = name;
        this.biography = biography;
        this.photoUrl = photoUrl;
    }
}