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

    public void setName(String name) {
        this.name = name;
        this.heightCm = genHeight(name);
    }

    private String biography;
    private String photoUrl;
    private LocalDate birthDate;
    private String nationality;
    private String character;
    private Integer heightCm;

    public ActorDTO(Actor actor) {
        this.id = actor.getId();
        this.name = actor.getName();
        this.biography = actor.getBiography();
        this.photoUrl = actor.getPhotoUrl();
        this.birthDate = actor.getBirthDate();
        this.nationality = actor.getNationality();
        this.character = actor.getCharacterName();
        this.heightCm = actor.getHeightCm();

        if (this.heightCm == null) this.heightCm = genHeight(this.name);
    }

    private static double seededRandom(long seed) {
        seed = Math.abs(seed);
        if (seed == 0) seed = 1;
        return (((seed * 16807) % 2147483647) - 1) / 2147483646.0;
    }

    private static double normalRandom(long seedVal, double median, double stdDev) {
        double u1 = seededRandom(seedVal);
        double u2 = seededRandom(seedVal);
        double z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return median + z0 * stdDev;
    }

    // TODO this is temporary before we'll add a height into the database
    public static int genHeight(String actorName) {
        return (int) Math.floor(normalRandom(actorName.hashCode(), 180, 8));
    }
}