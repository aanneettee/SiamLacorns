package com.example.siamLacorns.dto;

import java.time.LocalDate;
import java.util.List;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String avatar;
    private LocalDate birthDate;
    private List<CollectionDTO> collections;

    // Конструкторы
    public UserDTO() {}

    public UserDTO(Long id, String username,  String email, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getBirthDate() { return birthDate; } // ✅ ДОБАВЬТЕ ЭТОТ ГЕТТЕР
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<CollectionDTO> getCollections() { return collections; }
    public void setCollections(List<CollectionDTO> collections) { this.collections = collections; }
}