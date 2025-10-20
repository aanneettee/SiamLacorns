package com.example.siamLacorns.controller;

import com.example.siamLacorns.dto.EpisodeDTO;
import com.example.siamLacorns.dto.LacornDTO;
import com.example.siamLacorns.dto.WatchProgressDTO;
import com.example.siamLacorns.dto.WatchRequestDTO;
import com.example.siamLacorns.model.Episode;
import com.example.siamLacorns.model.Lacorn;
import com.example.siamLacorns.service.LacornService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lacorns")
public class LacornController {

    @Autowired
    private LacornService lacornService;

    // Создание сериала
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Lacorn> createLacorn(@RequestBody Lacorn lacorn) {
        Lacorn createdLacorn = lacornService.createLacorn(lacorn);
        return ResponseEntity.ok(createdLacorn);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLacorn(@PathVariable Long id) {
        lacornService.deleteLacorn(id);
        return ResponseEntity.noContent().build();
    }

    // Получение сериала по ID
    @GetMapping("/{id}")
    public ResponseEntity<LacornDTO> getLacornById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        LacornDTO lacorn = lacornService.getLacornById(id, userId);
        return ResponseEntity.ok(lacorn);
    }

    // Получение всех сериалов
    @GetMapping
    public Page<LacornDTO> getAllLacorns(
            Pageable pageable,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return lacornService.getAllLacorns(pageable, userId);
    }

    // Поиск сериалов
    @GetMapping("/search")
    public Page<LacornDTO> searchLacorns(
            @RequestParam String query,
            Pageable pageable,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return lacornService.searchLacorns(query, pageable, userId);
    }

    // Получение сериалов по жанру
    @GetMapping("/genre/{genre}")
    public List<LacornDTO> getLacornsByGenre(
            @PathVariable String genre,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return lacornService.getLacornsByGenre(genre, userId);
    }

    // Обновление прогресса просмотра - ТЕПЕРЬ С ПРОВЕРКОЙ АУТЕНТИФИКАЦИИ
    @PostMapping("/watch")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WatchProgressDTO> updateWatchProgress(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @RequestBody WatchRequestDTO watchRequest) {
        // Получаем ID из аутентифицированного пользователя, а не из заголовка
        Long userId = getUserIdFromPrincipal(userDetails);
        WatchProgressDTO progress = lacornService.updateWatchProgress(userId, watchRequest);
        return ResponseEntity.ok(progress);
    }

    // Получение прогресса просмотра для сериала - ТЕПЕРЬ С ПРОВЕРКОЙ АУТЕНТИФИКАЦИИ
    @GetMapping("/{lacornId}/progress")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WatchProgressDTO> getWatchProgress(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Long lacornId) {
        Long userId = getUserIdFromPrincipal(userDetails);
        WatchProgressDTO progress = lacornService.getWatchProgress(userId, lacornId);
        return ResponseEntity.ok(progress);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Lacorn> updateLacorn(
            @PathVariable Long id,
            @RequestBody Lacorn lacornDetails) {
        Lacorn updatedLacorn = lacornService.updateLacorn(id, lacornDetails);
        return ResponseEntity.ok(updatedLacorn);
    }

    // Получение истории просмотра - ТЕПЕРЬ С ПРОВЕРКОЙ АУТЕНТИФИКАЦИИ
    @GetMapping("/watch/history")
    @PreAuthorize("isAuthenticated()")
    public List<WatchProgressDTO> getWatchHistory(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        Long userId = getUserIdFromPrincipal(userDetails);
        return lacornService.getWatchHistory(userId);
    }

    // Получение продолжаемых просмотров - ТЕПЕРЬ С ПРОВЕРКОЙ АУТЕНТИФИКАЦИИ
    @GetMapping("/watch/in-progress")
    @PreAuthorize("isAuthenticated()")
    public List<WatchProgressDTO> getInProgress(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        Long userId = getUserIdFromPrincipal(userDetails);
        return lacornService.getInProgress(userId);
    }

    // Добавление эпизода к сериалу
    @PostMapping("/{lacornId}/episodes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Episode> addEpisode(
            @PathVariable Long lacornId,
            @RequestBody Episode episode) {
        Episode createdEpisode = lacornService.addEpisodeToLacorn(lacornId, episode);
        return ResponseEntity.ok(createdEpisode);
    }

    // Получение эпизодов сериала
    @GetMapping("/{lacornId}/episodes")
    public List<EpisodeDTO> getEpisodes(
            @PathVariable Long lacornId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return lacornService.getEpisodesByLacornId(lacornId, userId);
    }

    // Вспомогательный метод для получения ID пользователя из Principal
    private Long getUserIdFromPrincipal(org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails instanceof com.example.siamLacorns.service.UserDetailsImpl) {
            return ((com.example.siamLacorns.service.UserDetailsImpl) userDetails).getId();
        }
        throw new RuntimeException("Не удалось получить ID пользователя из аутентификации");
    }
}