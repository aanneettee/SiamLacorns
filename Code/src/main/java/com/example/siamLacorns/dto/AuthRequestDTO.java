package com.example.siamLacorns.dto;

public class AuthRequestDTO {
    private String username;
    private String password;

    // Конструкторы
    public AuthRequestDTO() {}

    public AuthRequestDTO(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Геттеры и сеттеры
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}