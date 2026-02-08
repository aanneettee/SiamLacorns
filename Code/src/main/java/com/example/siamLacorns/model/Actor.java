// Actor.java
package com.example.siamLacorns.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
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

    @Column(name = "height_cm")
    private Integer heightCm;

    @ManyToMany(mappedBy = "actors")
    private List<Lacorn> lacorns = new ArrayList<>();
}