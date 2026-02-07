package com.example.siamLacorns.controller;

import com.example.siamLacorns.dto.AuthRequestDTO;
import com.example.siamLacorns.dto.AuthResponseDTO;
import com.example.siamLacorns.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO authRequest) {
        AuthResponseDTO response = authService.authenticate(authRequest);
        return ResponseEntity.ok(response);
    }
}