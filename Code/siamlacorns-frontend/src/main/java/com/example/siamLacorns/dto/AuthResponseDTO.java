package com.example.siamLacorns.dto;

public class AuthResponseDTO {
    private String token;
    private String username; // ✅ ИЗМЕНЕНО: email → username
    private String role;
    private Long userId;

    // Конструкторы
    public AuthResponseDTO() {}

    public AuthResponseDTO(String token, String username, String role, Long userId) { // ✅ ИЗМЕНЕНО
        this.token = token;
        this.username = username; // ✅ ИЗМЕНЕНО: email → username
        this.role = role;
        this.userId = userId;
    }

    // Геттеры и сеттеры
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; } // ✅ ИЗМЕНЕНО: getEmail → getUsername
    public void setUsername(String username) { this.username = username; } // ✅ ИЗМЕНЕНО

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}