// ActorDTO.java
package com.example.siamLacorns.dto;

import java.time.LocalDate;

public class ActorDTO {
    private Long id;
    private String name;
    private String biography;
    private String photoUrl;
    private LocalDate birthDate;
    private String nationality;
    private String character;
    // Конструкторы
    public ActorDTO() {}

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

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBiography() { return biography; }
    public void setBiography(String biography) { this.biography = biography; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getCharacter() { return character; }
    public void setCharacter(String character) { this.character = character; }


}