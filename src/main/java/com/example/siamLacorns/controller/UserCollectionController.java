package com.example.siamLacorns.controller;

import com.example.siamLacorns.dto.CollectionDTO;
import com.example.siamLacorns.model.SeriesCollection;
import com.example.siamLacorns.service.UserCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/user-collections")
public class UserCollectionController {

    @Autowired
    private UserCollectionService userCollectionService;

    // Получение всех коллекций пользователя
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CollectionDTO>> getUserCollections(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long userId) {

        Long authenticatedUserId = getUserIdFromPrincipal(userDetails);
        if (!authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        List<CollectionDTO> collections = userCollectionService.getUserCollections(userId);
        return ResponseEntity.ok(collections);
    }

    // Добавление сериала в коллекцию
    @PostMapping("/{collectionName}/series/{lacornId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CollectionDTO> addToCollection(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long userId,
            @PathVariable String collectionName,
            @PathVariable Long lacornId) {

        Long authenticatedUserId = getUserIdFromPrincipal(userDetails);
        if (!authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        CollectionDTO collection = userCollectionService.addToCollection(userId, collectionName, lacornId);
        return ResponseEntity.ok(collection);
    }

    // Удаление сериала из коллекции
    @DeleteMapping("/{collectionName}/series/{lacornId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> removeFromCollection(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long userId,
            @PathVariable String collectionName,
            @PathVariable Long lacornId) {

        Long authenticatedUserId = getUserIdFromPrincipal(userDetails);
        if (!authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        userCollectionService.removeFromCollection(userId, collectionName, lacornId);
        return ResponseEntity.noContent().build();
    }

    // Получение конкретной коллекции
    @GetMapping("/{collectionName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CollectionDTO> getCollection(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long userId,
            @PathVariable String collectionName) {

        Long authenticatedUserId = getUserIdFromPrincipal(userDetails);
        if (!authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        CollectionDTO collection = userCollectionService.getCollectionByName(userId, collectionName);
        return ResponseEntity.ok(collection);
    }

    private Long getUserIdFromPrincipal(org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails instanceof com.example.siamLacorns.service.UserDetailsImpl) {
            return ((com.example.siamLacorns.service.UserDetailsImpl) userDetails).getId();
        }
        throw new RuntimeException("Не удалось получить ID пользователя из аутентификации");
    }
}