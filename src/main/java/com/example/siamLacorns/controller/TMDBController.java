// TMDBController.java
package com.example.siamLacorns.controller;

import com.example.siamLacorns.dto.TMDBLacornDTO;
import com.example.siamLacorns.model.Lacorn;
import com.example.siamLacorns.service.TMDBIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tmdb")
public class TMDBController {

    @Autowired
    private TMDBIntegrationService tmdbIntegrationService;

    // Поиск контента в TMDB
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TMDBLacornDTO>> searchContent(
            @RequestParam String query,
            @RequestParam(required = false) Integer year) {
        List<TMDBLacornDTO> results = tmdbIntegrationService.searchContent(query, year);
        return ResponseEntity.ok(results);
    }

    // Получение детальной информации из TMDB
    @GetMapping("/details/{tmdbId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TMDBLacornDTO> getDetails(
            @PathVariable Long tmdbId,
            @RequestParam String mediaType) {
        TMDBLacornDTO details = tmdbIntegrationService.getContentDetails(tmdbId, mediaType);
        return ResponseEntity.ok(details);
    }

    // Импорт контента из TMDB в базу данных
    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Lacorn> importFromTMDB(@RequestBody TMDBLacornDTO tmdbData) {
        Lacorn importedLacorn = tmdbIntegrationService.importFromTMDB(tmdbData);
        return ResponseEntity.ok(importedLacorn);
    }

    // Автоматический импорт по названию и году
    @PostMapping("/auto-import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Lacorn> autoImport(
            @RequestParam String title,
            @RequestParam(required = false) Integer year) {
        Lacorn importedLacorn = tmdbIntegrationService.autoImportFromTMDB(title, year);
        return ResponseEntity.ok(importedLacorn);
    }
}