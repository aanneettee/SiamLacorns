// Actor.java
package com.example.siamLacorns.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "actors")
public class Actor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String biography;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "birth_date")
    private java.time.LocalDate birthDate;

    private String nationality;
    @Column(name = "character_name")
    private String characterName;


    @ManyToMany(mappedBy = "actors")
    private List<Lacorn> lacorns = new ArrayList<>();

    // Конструкторы
    public Actor() {}

    public Actor(String name) {
        this.name = name;
    }

    public Actor(String name, String biography, String photoUrl) {
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

    public java.time.LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(java.time.LocalDate birthDate) { this.birthDate = birthDate; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public List<Lacorn> getLacorns() { return lacorns; }
    public void setLacorns(List<Lacorn> lacorns) { this.lacorns = lacorns; }

    public String getCharacterName() { return characterName; }
    public void setCharacterName(String characterName) { this.characterName = characterName; }

}