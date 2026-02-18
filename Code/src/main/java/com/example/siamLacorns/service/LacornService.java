package com.example.siamLacorns.service;

import com.example.siamLacorns.dto.*;
import com.example.siamLacorns.exception.ResourceNotFoundException;
import com.example.siamLacorns.model.Actor;
import com.example.siamLacorns.model.Episode;
import com.example.siamLacorns.model.Lacorn;
import com.example.siamLacorns.model.UserWatchHistory;
import com.example.siamLacorns.repository.ActorRepository;
import com.example.siamLacorns.repository.EpisodeRepository;
import com.example.siamLacorns.repository.LacornRepository;
import com.example.siamLacorns.repository.UserWatchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LacornService {

    @Autowired
    private LacornRepository lacornRepository;

    @Autowired
    private ActorRepository actorRepository;

    @Autowired
    private EpisodeRepository episodeRepository;

    @Autowired
    private UserWatchHistoryRepository watchHistoryRepository;

    @Transactional
    public Lacorn createLacorn(Lacorn lacorn) {
        // Проверяем уникальность актёров перед сохранением
        if (lacorn.getActors() != null && !lacorn.getActors().isEmpty()) {
            List<Actor> processedActors = lacorn.getActors().stream()
                    .map(actor -> {
                        // Проверяем, существует ли актёр с таким именем
                        return actorRepository.findByName(actor.getName())
                                .map(existingActor -> {
                                    // Если актёр уже существует, используем его
                                    // Обновляем данные, если нужно
                                    if (existingActor.getPhotoUrl() == null && actor.getPhotoUrl() != null) {
                                        existingActor.setPhotoUrl(actor.getPhotoUrl());
                                    }
                                    if (existingActor.getBiography() == null && actor.getBiography() != null) {
                                        existingActor.setBiography(actor.getBiography());
                                    }
                                    return existingActor;
                                })
                                .orElseGet(() -> {
                                    // Если актёра нет, создаём нового
                                    return actorRepository.save(actor);
                                });
                    })
                    .collect(Collectors.toList());

            lacorn.setActors(processedActors);
        }

        return lacornRepository.save(lacorn);
    }

    @Transactional
    public void deleteLacorn(Long id) {
        Lacorn lacorn = lacornRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Лакорн не найден"));

        // Получаем список актёров до удаления связей
        List<Actor> actorsToCheck = lacorn.getActors().stream()
                .map(actor -> actorRepository.findById(actor.getId()).orElse(actor))
                .collect(Collectors.toList());

        // Удаляем все связи с эпизодами
        for (Episode episode : lacorn.getEpisodes()) {
            episodeRepository.delete(episode);
        }

        // Удаляем историю просмотров
        List<UserWatchHistory> watchHistories = watchHistoryRepository.findByLacornId(id);
        watchHistoryRepository.deleteAll(watchHistories);

        // Очищаем связи с актёрами
        lacorn.getActors().clear();

        // Сохраняем изменения перед удалением
        lacornRepository.save(lacorn);

        // Удаляем лакорн
        lacornRepository.delete(lacorn);

        // Проверяем актёров и удаляем тех, у кого не осталось лакорнов
        for (Actor actor : actorsToCheck) {
            Actor refreshedActor = actorRepository.findById(actor.getId()).orElse(null);
            if (refreshedActor != null && refreshedActor.getLacorns().isEmpty()) {
                actorRepository.delete(refreshedActor);
            }
        }
    }

    @Transactional
    public Lacorn updateLacorn(Long id, Lacorn lacornDetails) {
        Lacorn lacorn = lacornRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Лакорн не найден"));

        lacorn.setTitle(lacornDetails.getTitle());
        lacorn.setDescription(lacornDetails.getDescription());
        lacorn.setReleaseYear(lacornDetails.getReleaseYear());
        lacorn.setTotalEpisodes(lacornDetails.getTotalEpisodes());
        lacorn.setEpisodeDuration(lacornDetails.getEpisodeDuration());
        lacorn.setPosterUrl(lacornDetails.getPosterUrl());
        lacorn.setTrailerUrl(lacornDetails.getTrailerUrl());
        lacorn.setGenres(lacornDetails.getGenres());
        lacorn.setAgeRating(lacornDetails.getAgeRating());
        lacorn.setRating(lacornDetails.getRating());
        lacorn.setStatus(lacornDetails.getStatus());
        lacorn.setProductionCountries(lacornDetails.getProductionCountries());

        // Обновляем актёров с проверкой уникальности
        if (lacornDetails.getActors() != null) {
            List<Actor> processedActors = lacornDetails.getActors().stream()
                    .map(actor -> actorRepository.findByName(actor.getName())
                            .orElseGet(() -> actorRepository.save(actor)))
                    .collect(Collectors.toList());

            // Очищаем старые связи
            lacorn.getActors().clear();
            // Добавляем новые
            lacorn.getActors().addAll(processedActors);
        }

        return lacornRepository.save(lacorn);
    }

    @Transactional(readOnly = true)
    public LacornDTO getLacornById(Long id, Long userId) {
        Lacorn lacorn = lacornRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Лакорн не найден"));

        LacornDTO dto = new LacornDTO(lacorn);

        if (userId != null) {
            // Загружаем прогресс просмотра для пользователя
            watchHistoryRepository.findByUserIdAndLacornId(userId, id)
                    .ifPresent(watchHistory -> {
                        WatchProgressDTO progress = new WatchProgressDTO();
                        progress.setEpisodeId(watchHistory.getEpisode().getId());
                        progress.setCurrentTime(watchHistory.getCurrentTime());
                        progress.setCompleted(watchHistory.isCompleted());
                        progress.setLastWatched(watchHistory.getLastWatched());
                        dto.setWatchProgress(progress);
                    });
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public Page<LacornDTO> getAllLacorns(Pageable pageable, Long userId) {
        return lacornRepository.findAll(pageable)
                .map(lacorn -> new LacornDTO(lacorn));
    }

    @Transactional(readOnly = true)
    public Page<LacornDTO> searchLacorns(String query, Pageable pageable, Long userId) {
        return lacornRepository.findByTitleContainingIgnoreCase(query, pageable)
                .map(lacorn -> new LacornDTO(lacorn));
    }

    @Transactional(readOnly = true)
    public List<LacornDTO> getLacornsByGenre(String genre, Long userId) {
        return lacornRepository.findByGenresContaining(genre).stream()
                .map(LacornDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Episode addEpisodeToLacorn(Long lacornId, Episode episode) {
        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Лакорн не найден"));

        episode.setLacorn(lacorn);
        return episodeRepository.save(episode);
    }

    @Transactional(readOnly = true)
    public List<EpisodeDTO> getEpisodesByLacornId(Long lacornId, Long userId) {
        List<Episode> episodes = episodeRepository.findByLacornIdOrderBySeasonNumberAscEpisodeNumberAsc(lacornId);

        return episodes.stream()
                .map(episode -> {
                    EpisodeDTO dto = new EpisodeDTO(episode);

                    if (userId != null) {
                        // Проверяем, просмотрен ли эпизод
                        watchHistoryRepository.findByUserIdAndEpisodeId(userId, episode.getId())
                                .ifPresent(watchHistory -> {
                                    dto.setWatched(watchHistory.isCompleted());
                                    dto.setCurrentTime(watchHistory.getCurrentTime());
                                });
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ДОБАВЛЕННЫЙ МЕТОД для генерации URL видео
    public String generateVideoUrl(Long episodeId, String voicecover) {
        // Здесь должна быть логика генерации URL видео
        // Например, можно получать эпизод из репозитория и формировать URL

        Episode episode = episodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Эпизод не найден"));

        // Формируем URL на основе voicecover
        // Это пример - вы можете изменить логику под свои нужды
        String baseUrl = "/videos/";
        String fileName = "episode_" + episodeId + "_" + voicecover + ".mp4";

        return baseUrl + fileName;
    }

    @Transactional
    public WatchProgressDTO updateWatchProgress(Long userId, WatchRequestDTO watchRequest) {
        // Реализация метода
        return new WatchProgressDTO();
    }

    @Transactional(readOnly = true)
    public WatchProgressDTO getWatchProgress(Long userId, Long lacornId) {
        // Реализация метода
        return new WatchProgressDTO();
    }

    @Transactional(readOnly = true)
    public List<WatchProgressDTO> getWatchHistory(Long userId) {
        // Реализация метода
        return List.of();
    }

    @Transactional(readOnly = true)
    public List<WatchProgressDTO> getInProgress(Long userId) {
        // Реализация метода
        return List.of();
    }

    @Transactional
    public Lacorn addActorToLacorn(Long lacornId, Long actorId) {
        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Лакорн не найден"));

        Actor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Актёр не найден"));

        lacorn.addActor(actor);
        return lacornRepository.save(lacorn);
    }

    @Transactional
    public Lacorn removeActorFromLacorn(Long lacornId, Long actorId) {
        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Лакорн не найден"));

        Actor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Актёр не найден"));

        lacorn.removeActor(actor);

        // Сохраняем изменения
        Lacorn savedLacorn = lacornRepository.save(lacorn);

        // Проверяем, остались ли у актёра другие лакорны
        Actor refreshedActor = actorRepository.findById(actorId).orElse(null);
        if (refreshedActor != null && refreshedActor.getLacorns().isEmpty()) {
            actorRepository.delete(refreshedActor);
        }

        return savedLacorn;
    }

    @Transactional(readOnly = true)
    public List<ActorDTO> getActorsByLacornId(Long lacornId) {
        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Лакорн не найден"));

        return lacorn.getActors().stream()
                .map(ActorDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Actor createActor(Actor actor) {
        // Проверяем, существует ли актёр с таким именем
        return actorRepository.findByName(actor.getName())
                .orElseGet(() -> actorRepository.save(actor));
    }

    @Transactional(readOnly = true)
    public Page<LacornDTO> getAllLacornsByRatingDesc(Pageable pageable, Long userId) {
        return lacornRepository.findAllByOrderByRatingDesc(pageable)
                .map(LacornDTO::new);
    }

    @Transactional(readOnly = true)
    public List<LacornDTO> getTopRatedLacorns(int limit, Long userId) {
        Pageable pageable = Pageable.ofSize(limit);
        return lacornRepository.findAllByOrderByRatingDesc(pageable).stream()
                .map(LacornDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<LacornDTO> searchLacornsByRating(String query, Pageable pageable, Long userId) {
        return lacornRepository.findByTitleContainingIgnoreCaseOrderByRatingDesc(query, pageable)
                .map(LacornDTO::new);
    }

    @Transactional(readOnly = true)
    public List<LacornDTO> getLacornsByGenreByRating(String genre, Long userId) {
        return lacornRepository.findByGenresContainingOrderByRatingDesc(genre).stream()
                .map(LacornDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LacornDTO> getLacornsByActorId(Long actorId) {
        Actor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Актёр не найден"));

        return actor.getLacorns().stream()
                .map(LacornDTO::new)
                .collect(Collectors.toList());
    }
}