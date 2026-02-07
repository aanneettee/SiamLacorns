package com.example.siamLacorns.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public class RegisterRequestDTO {
    private String username;
    private String email;
    @JsonFormat(pattern = "dd.MM.yyyy")  // Добавьте это
    private LocalDate birthDate; // в формате "12.09.2006"
    private String password;

    // Конструкторы
    public RegisterRequestDTO() {}

    public RegisterRequestDTO(String username, String email, LocalDate birthDate, String password) {
        this.username = username;
        this.email = email;
        this.birthDate = birthDate;
        this.password = password;
    }

    // Геттеры и сеттеры
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}