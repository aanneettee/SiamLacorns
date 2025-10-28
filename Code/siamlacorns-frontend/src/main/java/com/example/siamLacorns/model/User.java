package com.example.siamLacorns.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private LocalDate birthDate;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "avatar_url")
    private String avatar;

    private String role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SeriesCollection> collections = new ArrayList<>();

    // Конструкторы
    public User() {}

    public User(String username, String email, LocalDate birthDate, String password) {
        this.username = username;
        this.email = email;
        this.birthDate = birthDate;
        this.password = password;
    }

    public User(String username, String name, LocalDate birthDate, String email, String password) {
        this.username = username;
        this.birthDate = birthDate;
        this.email = email;
        this.password = password;
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<SeriesCollection> getCollections() { return collections; }
    public void setCollections(List<SeriesCollection> collections) { this.collections = collections; }

    // Вычисляемый возраст
    public Integer getAge() {
        if (birthDate == null) return null;
        return java.time.Period.between(birthDate, LocalDate.now()).getYears();
    }
}