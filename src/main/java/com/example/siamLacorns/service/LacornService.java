package com.example.siamLacorns.service;

import com.example.siamLacorns.dto.*;
import com.example.siamLacorns.exception.AuthenticationException;
import com.example.siamLacorns.exception.ResourceNotFoundException;
import com.example.siamLacorns.exception.ValidationException;
import com.example.siamLacorns.model.*;
import com.example.siamLacorns.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import com.example.siamLacorns.dto.EpisodeDTO;
import com.example.siamLacorns.dto.WatchProgressDTO;
import com.example.siamLacorns.dto.ActorDTO;
import com.example.siamLacorns.dto.WatchRequestDTO;

@Service
@Transactional(readOnly = true)
public class LacornService {

    @Autowired
    private LacornRepository lacornRepository;

    @Autowired
    private EpisodeRepository episodeRepository;

    @Autowired
    private UserWatchHistoryRepository watchHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActorRepository actorRepository;

    @Transactional
    public Lacorn importFromTMDB(TMDBLacornDTO tmdbData) {
        // Проверяем, не существует ли уже сериал с таким tmdbId
        Optional<Lacorn> existingLacorn = lacornRepository.findByTmdbId(tmdbData.getTmdbId());
        if (existingLacorn.isPresent()) {
            return existingLacorn.get();
        }

        // Создаем новый Lacorn из TMDB данных
        Lacorn lacorn = new Lacorn();
        lacorn.setTitle(tmdbData.getTitle());
        lacorn.setDescription(tmdbData.getDescription());
        lacorn.setReleaseYear(tmdbData.getReleaseYear());
        lacorn.setTotalEpisodes(tmdbData.getTotalEpisodes());
        lacorn.setEpisodeDuration(tmdbData.getEpisodeDuration());
        lacorn.setPosterUrl(tmdbData.getPosterUrl());
        lacorn.setTrailerUrl(tmdbData.getTrailerUrl());
        lacorn.setGenres(tmdbData.getGenres());
        lacorn.setAgeRating(tmdbData.getAgeRating());
        lacorn.setRating(tmdbData.getRating());
        lacorn.setTmdbId(tmdbData.getTmdbId());

        // НОВОЕ: устанавливаем страны производства
        lacorn.setProductionCountries(tmdbData.getProductionCountries());

        // Конвертируем статус
        if (tmdbData.getStatus() != null) {
            switch (tmdbData.getStatus().toUpperCase()) {
                case "RELEASED":
                case "ENDED":
                    lacorn.setStatus(Lacorn.SeriesStatus.COMPLETED);
                    break;
                case "RETURNING SERIES":
                case "IN PRODUCTION":
                    lacorn.setStatus(Lacorn.SeriesStatus.ONGOING);
                    break;
                case "PLANNED":
                    lacorn.setStatus(Lacorn.SeriesStatus.UPCOMING);
                    break;
                default:
                    lacorn.setStatus(Lacorn.SeriesStatus.ONGOING);
            }
        } else {
            lacorn.setStatus(Lacorn.SeriesStatus.ONGOING);
        }

        Lacorn savedLacorn = lacornRepository.save(lacorn);

        // НОВОЕ: сохраняем актёров
        if (tmdbData.getActors() != null && !tmdbData.getActors().isEmpty()) {
            for (ActorDTO actorDTO : tmdbData.getActors()) {
                Actor actor = new Actor();
                actor.setName(actorDTO.getName());
                actor.setPhotoUrl(actorDTO.getPhotoUrl());
                // Можно добавить дополнительную логику для поиска существующих актёров

                Actor savedActor = actorRepository.save(actor);
                savedLacorn.addActor(savedActor);
            }
            savedLacorn = lacornRepository.save(savedLacorn);
        }

        return savedLacorn;
    }

    // Создание сериала
    @Transactional
    public Lacorn createLacorn(Lacorn lacorn) {
        try {
            // Установка статуса по умолчанию если не задан
            if (lacorn.getStatus() == null) {
                lacorn.setStatus(Lacorn.SeriesStatus.ONGOING);
            }
            return lacornRepository.save(lacorn);
        } catch (Exception e) {
            throw new ValidationException("Ошибка при создании сериала: " + e.getMessage());
        }
    }

    @Transactional
    public Lacorn addActorToLacorn(Long lacornId, Long actorId) {
        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

        Actor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Актёр не найден с ID: " + actorId));

        lacorn.addActor(actor);
        return lacornRepository.save(lacorn);
    }

    @Transactional
    public Lacorn removeActorFromLacorn(Long lacornId, Long actorId) {
        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

        Actor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Актёр не найден с ID: " + actorId));

        lacorn.removeActor(actor);
        return lacornRepository.save(lacorn);
    }

    @Transactional
    public Actor createActor(Actor actor) {
        try {
            return actorRepository.save(actor);
        } catch (Exception e) {
            throw new ValidationException("Ошибка при создании актёра: " + e.getMessage());
        }
    }

    // Метод для получения актёров лако́рна
    public List<ActorDTO> getActorsByLacornId(Long lacornId) {
        List<Actor> actors = actorRepository.findByLacornId(lacornId);
        return actors.stream()
                .map(this::convertToActorDTO)
                .collect(Collectors.toList());
    }

    // Получение сериала по ID с прогрессом просмотра (если пользователь авторизован)
    @Transactional
    public LacornDTO getLacornById(Long id, Long userId) {
        try {
            Lacorn lacorn = lacornRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Сериал не найден с ID: " + id));

            LacornDTO lacornDTO = new LacornDTO(lacorn);

            // Добавляем эпизоды
            List<EpisodeDTO> episodeDTOs = getEpisodesByLacornId(id, userId);
            lacornDTO.setEpisodes(episodeDTOs);

            // Добавляем актеров
            List<ActorDTO> actorDTOs = getActorsByLacornId(id);
            lacornDTO.setActors(actorDTOs);

            // Добавляем прогресс просмотра, если пользователь авторизован
            if (userId != null) {
                try {
                    WatchProgressDTO progress = getWatchProgress(userId, id);
                    lacornDTO.setWatchProgress(progress);
                } catch (Exception e) {
                    // Игнорируем ошибки прогресса, так как они не критичны
                    System.out.println("Error loading watch progress: " + e.getMessage());
                }
            }

            return lacornDTO;
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при загрузке сериала: " + e.getMessage(), e);
        }
    }

    // Получение всех сериалов с пагинацией
    public Page<LacornDTO> getAllLacorns(Pageable pageable, Long userId) {
        // Используем метод с JOIN FETCH
        Page<Lacorn> lacorns = lacornRepository.findAllWithGenres(pageable);
        return lacorns.map(lacorn -> convertToDTO(lacorn, userId));
    }

    // Поиск сериалов по названию
    public Page<LacornDTO> searchLacorns(String query, Pageable pageable, Long userId) {
        if (query == null || query.trim().isEmpty()) {
            throw new ValidationException("Поисковый запрос не может быть пустым");
        }
        return lacornRepository.findByTitleContainingIgnoreCaseWithGenres(query, pageable)
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
        LacornDTO dto = new LacornDTO(lacorn);

        dto.setId(lacorn.getId());
        dto.setTitle(lacorn.getTitle());
        dto.setDescription(lacorn.getDescription());
        dto.setReleaseYear(lacorn.getReleaseYear());
        dto.setTotalEpisodes(lacorn.getTotalEpisodes());
        dto.setEpisodeDuration(lacorn.getEpisodeDuration());
        dto.setPosterUrl(lacorn.getPosterUrl());
        dto.setTrailerUrl(lacorn.getTrailerUrl());
        dto.setGenres(lacorn.getGenres() != null ? new ArrayList<>(lacorn.getGenres()) : new ArrayList<>());
        dto.setAgeRating(lacorn.getAgeRating());
        dto.setRating(lacorn.getRating());
        dto.setStatus(lacorn.getStatus() != null ? lacorn.getStatus().name() : "ONGOING");
        // Получаем прогресс просмотра, если пользователь авторизован
        if (userId != null) {
            watchHistoryRepository.findByUserIdAndLacornId(userId, lacorn.getId())
                    .ifPresent(history -> dto.setWatchProgress(convertToWatchProgressDTO(history)));
        }

        // Безопасная конвертация эпизодов
        List<EpisodeDTO> episodeDTOs = new ArrayList<>();
        if (lacorn.getEpisodes() != null && !lacorn.getEpisodes().isEmpty()) {
            episodeDTOs = lacorn.getEpisodes().stream()
                    .map(episode -> convertToEpisodeDTO(episode, userId))
                    .collect(Collectors.toList());
        }
        dto.setEpisodes(episodeDTOs);

        // Безопасная конвертация актеров
        List<ActorDTO> actorDTOs = new ArrayList<>();
        if (lacorn.getActors() != null && !lacorn.getActors().isEmpty()) {
            actorDTOs = lacorn.getActors().stream()
                    .map(this::convertToActorDTO)
                    .collect(Collectors.toList());
        }
        dto.setActors(actorDTOs);

        // Безопасное получение доступных озвучек
        List<String> allVoiceovers = new ArrayList<>();
        if (lacorn.getEpisodes() != null && !lacorn.getEpisodes().isEmpty()) {
            allVoiceovers = lacorn.getEpisodes().stream()
                    .flatMap(episode -> episode.getAvailableVoiceovers() != null ?
                            episode.getAvailableVoiceovers().stream().map(Enum::name) :
                            Stream.empty())
                    .distinct()
                    .collect(Collectors.toList());
        }
        dto.setAvailableVoiceovers(allVoiceovers);

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
        dto.setAvailableVoiceovers(episode.getAvailableVoiceovers() != null ?
                episode.getAvailableVoiceovers().stream().map(Enum::name).collect(Collectors.toList()) :
                new ArrayList<>());

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
        lacorn.setStatus(lacornDetails.getStatus()); // Добавить эту строку
        lacorn.preUpdate();

        return lacornRepository.save(lacorn);
    }

    public List<Episode.VoiceoverType> getEpisodeVoiceovers(Long episodeId) {
        Episode episode = episodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Эпизод не найден с ID: " + episodeId));

        return episode.getAvailableVoiceovers() != null ?
                episode.getAvailableVoiceovers() :
                new ArrayList<>();
    }

    @Transactional
    public Episode addVoiceoverToEpisode(Long episodeId, Episode.VoiceoverType voiceoverType) {
        Episode episode = episodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Эпизод не найден с ID: " + episodeId));

        if (episode.getAvailableVoiceovers() == null) {
            episode.setAvailableVoiceovers(new ArrayList<>());
        }

        if (!episode.getAvailableVoiceovers().contains(voiceoverType)) {
            episode.getAvailableVoiceovers().add(voiceoverType);
        }

        return episodeRepository.save(episode);
    }

    // В LacornService.java
    public String generateVideoUrl(Long episodeId, String voicecoverType) {
        Episode episode = episodeRepository.findById(episodeId)
                .orElseThrow(() -> new RuntimeException("Episode not found with id: " + episodeId));

        // Базовая логика - возвращаем URL из эпизода
        String baseUrl = episode.getVideoUrl();

        if (baseUrl == null || baseUrl.trim().isEmpty()) {
            // Fallback URL если нет основного URL
            return "/videos/episode_" + episodeId + "_" + voicecoverType.toLowerCase() + ".mp4";
        }

        // Добавляем параметры озвучки к URL если нужно
        return switch (voicecoverType.toLowerCase()) {
            case "dubbed" -> baseUrl + "?audio=dubbed";
            case "subbed" -> baseUrl + "?audio=original&subtitles=en";
            default -> baseUrl;
        };
    }

    @Transactional
    public boolean deleteLacorn(Long lacornId) {
        Lacorn lacorn = lacornRepository.findById(lacornId)
                .orElseThrow(() -> new ResourceNotFoundException("Сериал не найден с ID: " + lacornId));

        lacornRepository.delete(lacorn);
        return true;
    }

    private ActorDTO convertToActorDTO(Actor actor) {
        ActorDTO dto = new ActorDTO();
        dto.setId(actor.getId());
        dto.setName(actor.getName());
        dto.setBiography(actor.getBiography());
        dto.setPhotoUrl(actor.getPhotoUrl());
        dto.setBirthDate(actor.getBirthDate());
        dto.setNationality(actor.getNationality());
        return dto;
    }
    // LacornService.java - альтернативный метод
    public Page<LacornDTO> getAllLacornsByRatingDesc(Pageable pageable, Long userId) {
        Page<Lacorn> lacorns = lacornRepository.findAll(pageable);
        return lacorns.map(lacorn -> convertToDTO(lacorn, userId));
    }

    // Получение топ-N сериалов по рейтингу
    public List<LacornDTO> getTopRatedLacorns(int limit, Long userId) {
        List<Lacorn> lacorns;
        if (limit > 0) {
            // Используем Pageable для ограничения количества
            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "rating"));
            lacorns = lacornRepository.findAll(pageable).getContent();
        } else {
            lacorns = lacornRepository.findAllByOrderByRatingDesc();
        }

        return lacorns.stream()
                .map(lacorn -> convertToDTO(lacorn, userId))
                .collect(Collectors.toList());
    }

    // Поиск с сортировкой по рейтингу
    public Page<LacornDTO> searchLacornsByRating(String query, Pageable pageable, Long userId) {
        if (query == null || query.trim().isEmpty()) {
            return getAllLacornsByRatingDesc(pageable, userId);
        }
        return lacornRepository.findByTitleContainingIgnoreCaseOrderByRatingDesc(query, pageable)
                .map(lacorn -> convertToDTO(lacorn, userId));
    }

    // Получение по жанру с сортировкой по рейтингу
    public List<LacornDTO> getLacornsByGenreByRating(String genre, Long userId) {
        if (genre == null || genre.trim().isEmpty()) {
            return getTopRatedLacorns(0, userId); // Все сериалы, отсортированные по рейтингу
        }
        return lacornRepository.findByGenresContainingOrderByRatingDesc(genre).stream()
                .map(lacorn -> convertToDTO(lacorn, userId))
                .collect(Collectors.toList());
    }
}