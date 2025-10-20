package com.example.siamLacorns.service;

import com.example.siamLacorns.dto.EpisodeDTO;
import com.example.siamLacorns.dto.LacornDTO;
import com.example.siamLacorns.dto.WatchProgressDTO;
import com.example.siamLacorns.dto.WatchRequestDTO;
import com.example.siamLacorns.exception.AuthenticationException;
import com.example.siamLacorns.exception.ResourceNotFoundException;
import com.example.siamLacorns.exception.ValidationException;
import com.example.siamLacorns.model.Episode;
import com.example.siamLacorns.model.Lacorn;
import com.example.siamLacorns.model.User;
import com.example.siamLacorns.model.UserWatchHistory;
import com.example.siamLacorns.repository.EpisodeRepository;
import com.example.siamLacorns.repository.LacornRepository;
import com.example.siamLacorns.repository.UserRepository;
import com.example.siamLacorns.repository.UserWatchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LacornService {

    @Autowired
    private LacornRepository lacornRepository;

    @Autowired
    private EpisodeRepository episodeRepository;

    @Autowired
    private UserWatchHistoryRepository watchHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    // Создание сериала
    @Transactional
    public Lacorn createLacorn(Lacorn lacorn) {
        try {
            return lacornRepository.save(lacorn);
        } catch (Exception e) {
            throw new ValidationException("Ошибка при создании сериала: " + e.getMessage());
        }
    }

    // Получение сериала по ID с прогрессом просмотра (если пользователь авторизован)
    public LacornDTO getLacornById(Long lacornId, Long userId) {
        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));
        return convertToDTO(lacorn, userId);
    }

    // Получение всех сериалов с пагинацией
    public Page<LacornDTO> getAllLacorns(Pageable pageable, Long userId) {
        return lacornRepository.findAll(pageable)
                .map(lacorn -> convertToDTO(lacorn, userId));
    }

    // Поиск сериалов по названию
    public Page<LacornDTO> searchLacorns(String query, Pageable pageable, Long userId) {
        if (query == null || query.trim().isEmpty()) {
            throw new ValidationException("Поисковый запрос не может быть пустым");
        }
        return lacornRepository.findByTitleContainingIgnoreCase(query, pageable)
                .map(lacorn -> convertToDTO(lacorn, userId));
    }

    // Получение сериалов по жанру
    public List<LacornDTO> getLacornsByGenre(String genre, Long userId) {
        if (genre == null || genre.trim().isEmpty()) {
            throw new ValidationException("Жанр не может быть пустым");
        }
        return lacornRepository.findByGenresContaining(genre).stream()
                .map(lacorn -> convertToDTO(lacorn, userId))
                .collect(Collectors.toList());
    }

    // Обновление прогресса просмотра
    @Transactional
    public WatchProgressDTO updateWatchProgress(Long userId, WatchRequestDTO watchRequest) {
        if (userId == null) {
            throw new AuthenticationException("Пользователь не авторизован");
        }

        if (watchRequest == null || watchRequest.getEpisodeId() == null) {
            throw new ValidationException("Некорректные данные запроса просмотра");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден с ID: " + userId));

        Episode episode = episodeRepository.findById(watchRequest.getEpisodeId())
                .orElseThrow(() -> new ResourceNotFoundException("Эпизод не найден с ID: " + watchRequest.getEpisodeId()));

        Lacorn lacorn = episode.getLacorn();

        // Ищем существующую запись или создаем новую
        UserWatchHistory watchHistory = watchHistoryRepository
                .findByUserIdAndLacornId(userId, lacorn.getId())
                .orElse(new UserWatchHistory(user, lacorn, episode));

        watchHistory.setCurrentEpisode(episode);
        watchHistory.setCurrentTime(watchRequest.getCurrentTime());

        if (watchRequest.getCompleted() != null) {
            watchHistory.setIsCompleted(watchRequest.getCompleted());
        }

        // Автоматически помечаем как завершенное, если просмотрено 95% эпизода
        if (episode.getDuration() != null && watchRequest.getCurrentTime() >= episode.getDuration() * 0.95) {
            watchHistory.setIsCompleted(true);
        }

        watchHistory.setLastWatched(LocalDateTime.now());
        UserWatchHistory savedHistory = watchHistoryRepository.save(watchHistory);

        return convertToWatchProgressDTO(savedHistory);
    }

    // Получение прогресса просмотра для сериала
    public WatchProgressDTO getWatchProgress(Long userId, Long lacornId) {
        UserWatchHistory watchHistory = watchHistoryRepository.findByUserIdAndLacornId(userId, lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Прогресс просмотра не найден"));
        return convertToWatchProgressDTO(watchHistory);
    }

    // Получение истории просмотра пользователя
    public List<WatchProgressDTO> getWatchHistory(Long userId) {
        if (userId == null) {
            throw new AuthenticationException("Пользователь не авторизован");
        }

        return watchHistoryRepository.findByUserIdOrderByLastWatchedDesc(userId).stream()
                .map(this::convertToWatchProgressDTO)
                .collect(Collectors.toList());
    }

    // Получение продолжаемых просмотров
    public List<WatchProgressDTO> getInProgress(Long userId) {
        if (userId == null) {
            throw new AuthenticationException("Пользователь не авторизован");
        }

        return watchHistoryRepository.findInProgressByUserId(userId).stream()
                .map(this::convertToWatchProgressDTO)
                .collect(Collectors.toList());
    }

    // Добавление эпизода к сериалу
    @Transactional
    public Episode addEpisodeToLacorn(Long lacornId, Episode episode) {
        if (episode == null) {
            throw new ValidationException("Данные эпизода не могут быть пустыми");
        }

        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

        episode.setLacorn(lacorn);
        return episodeRepository.save(episode);
    }

    // Получение эпизодов сериала
    public List<EpisodeDTO> getEpisodesByLacornId(Long lacornId, Long userId) {
        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

        List<Episode> episodes = episodeRepository.findByLacornIdOrderBySeasonNumberAscEpisodeNumberAsc(lacornId);

        return episodes.stream()
                .map(episode -> convertToEpisodeDTO(episode, userId))
                .collect(Collectors.toList());
    }

    // Конвертация Entity в DTO
    private LacornDTO convertToDTO(Lacorn lacorn, Long userId) {
        LacornDTO dto = new LacornDTO(
                lacorn.getId(),
                lacorn.getTitle(),
                lacorn.getDescription(),
                lacorn.getReleaseYear(),
                lacorn.getTotalEpisodes(),
                lacorn.getEpisodeDuration()
        );

        dto.setPosterUrl(lacorn.getPosterUrl());
        dto.setTrailerUrl(lacorn.getTrailerUrl());
        dto.setGenres(lacorn.getGenres());
        dto.setAgeRating(lacorn.getAgeRating());
        dto.setRating(lacorn.getRating());

        // Получаем прогресс просмотра, если пользователь авторизован
        if (userId != null) {
            watchHistoryRepository.findByUserIdAndLacornId(userId, lacorn.getId())
                    .ifPresent(history -> dto.setWatchProgress(convertToWatchProgressDTO(history)));
        }

        // Конвертируем эпизоды
        List<EpisodeDTO> episodeDTOs = lacorn.getEpisodes().stream()
                .map(episode -> convertToEpisodeDTO(episode, userId))
                .collect(Collectors.toList());
        dto.setEpisodes(episodeDTOs);

        return dto;
    }

    private EpisodeDTO convertToEpisodeDTO(Episode episode, Long userId) {
        EpisodeDTO dto = new EpisodeDTO(
                episode.getId(),
                episode.getTitle(),
                episode.getEpisodeNumber(),
                episode.getSeasonNumber(),
                episode.getVideoUrl()
        );

        dto.setDescription(episode.getDescription());
        dto.setDuration(episode.getDuration());
        dto.setThumbnailUrl(episode.getThumbnailUrl());

        // Проверяем статус просмотра, если пользователь авторизован
        if (userId != null) {
            watchHistoryRepository.findByUserIdAndLacornId(userId, episode.getLacorn().getId())
                    .ifPresent(history -> {
                        if (history.getCurrentEpisode() != null &&
                                history.getCurrentEpisode().getId().equals(episode.getId())) {
                            dto.setWatched(history.getIsCompleted());
                            dto.setCurrentTime(history.getCurrentTime());
                        }
                    });
        }

        return dto;
    }

    private WatchProgressDTO convertToWatchProgressDTO(UserWatchHistory history) {
        WatchProgressDTO dto = new WatchProgressDTO();

        if (history.getCurrentEpisode() != null) {
            dto.setEpisodeId(history.getCurrentEpisode().getId());
        }

        dto.setCurrentTime(history.getCurrentTime());
        dto.setIsCompleted(history.getIsCompleted());
        dto.setLastWatched(history.getLastWatched());

        if (history.getLacorn() != null) {
            dto.setLacornId(history.getLacorn().getId());
            dto.setLacornTitle(history.getLacorn().getTitle());
        }

        return dto;
    }

    @Transactional
    public Lacorn updateLacorn(Long lacornId, Lacorn lacornDetails) {
        if (lacornDetails == null) {
            throw new ValidationException("Данные сериала не могут быть пустыми");
        }

        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

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
        lacorn.preUpdate(); // Обновляем время изменения

        return lacornRepository.save(lacorn);
    }

    @Transactional
    public boolean deleteLacorn(Long lacornId) {
        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

        lacornRepository.delete(lacorn);
        return true;
    }
}