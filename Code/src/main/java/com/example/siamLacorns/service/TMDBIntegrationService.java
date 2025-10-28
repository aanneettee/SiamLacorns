// TMDBIntegrationService.java
package com.example.siamLacorns.service;

import com.example.siamLacorns.dto.TMDBLacornDTO;
import com.example.siamLacorns.model.Lacorn;
import com.example.siamLacorns.repository.LacornRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.example.siamLacorns.dto.ActorDTO;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TMDBIntegrationService {

    @Value("${tmdb.api.key}")
    private String tmdbApiKey;

    @Value("${tmdb.base.url:https://api.themoviedb.org/3}")
    private String tmdbBaseUrl;

    @Value("${tmdb.image.base:https://image.tmdb.org/t/p}")
    private String tmdbImageBase;

    @Autowired
    private LacornRepository lacornRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<TMDBLacornDTO> searchContent(String query, Integer year) {
        String url = UriComponentsBuilder.fromHttpUrl(tmdbBaseUrl + "/search/multi")
                .queryParam("api_key", tmdbApiKey)
                .queryParam("query", query)
                .queryParam("language", "en-US")
                .queryParam("page", 1)
                .queryParam("year", year)
                .toUriString();

        try {
            TMDBResponse response = restTemplate.getForObject(url, TMDBResponse.class);
            return Arrays.stream(response.getResults())
                    .map(this::convertToTMDBLacornDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при поиске в TMDB: " + e.getMessage());
        }
    }

    public TMDBLacornDTO getContentDetails(Long tmdbId, String mediaType) {
        String endpoint = mediaType.equals("movie") ? "/movie/" : "/tv/";
        String url = UriComponentsBuilder.fromHttpUrl(tmdbBaseUrl + endpoint + tmdbId)
                .queryParam("api_key", tmdbApiKey)
                .queryParam("language", "en-US")
                .queryParam("append_to_response", "videos,credits")
                .toUriString();

        try {
            TMDBDetailResponse response = restTemplate.getForObject(url, TMDBDetailResponse.class);
            return convertDetailToTMDBLacornDTO(response, mediaType);
        } catch (Exception e) {
            throw new RuntimeException("Ошибка при получении деталей из TMDB: " + e.getMessage());
        }
    }

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

        return lacornRepository.save(lacorn);
    }

    public Lacorn autoImportFromTMDB(String title, Integer year) {
        // Ищем контент в TMDB
        List<TMDBLacornDTO> searchResults = searchContent(title, year);
        if (searchResults.isEmpty()) {
            throw new RuntimeException("Контент не найден в TMDB");
        }

        // Берем первый результат
        TMDBLacornDTO firstResult = searchResults.get(0);

        // Получаем детальную информацию
        TMDBLacornDTO details = getContentDetails(firstResult.getTmdbId(), firstResult.getMediaType());

        // Импортируем в базу
        return importFromTMDB(details);
    }

    // Вспомогательные методы для конвертации
    private TMDBLacornDTO convertToTMDBLacornDTO(TMDBResult result) {
        TMDBLacornDTO dto = new TMDBLacornDTO();
        dto.setTmdbId(result.getId());
        dto.setMediaType(result.getMedia_type());

        if ("movie".equals(result.getMedia_type())) {
            dto.setTitle(result.getTitle());
            dto.setReleaseYear(result.getRelease_date() != null ?
                    Integer.parseInt(result.getRelease_date().substring(0, 4)) : null);
        } else {
            dto.setTitle(result.getName());
            dto.setReleaseYear(result.getFirst_air_date() != null ?
                    Integer.parseInt(result.getFirst_air_date().substring(0, 4)) : null);
        }

        dto.setPosterUrl(result.getPoster_path() != null ?
                tmdbImageBase + "/w500" + result.getPoster_path() : null);
        dto.setRating(result.getVote_average());

        return dto;
    }

    private TMDBLacornDTO convertDetailToTMDBLacornDTO(TMDBDetailResponse detail, String mediaType) {
        TMDBLacornDTO dto = new TMDBLacornDTO();
        dto.setTmdbId(detail.getId());
        dto.setMediaType(mediaType);

        if ("movie".equals(mediaType)) {
            dto.setTitle(detail.getTitle());
            dto.setDescription(detail.getOverview());
            dto.setReleaseYear(detail.getRelease_date() != null ?
                    Integer.parseInt(detail.getRelease_date().substring(0, 4)) : null);
            dto.setTotalEpisodes(1);
            dto.setEpisodeDuration(detail.getRuntime());
        } else {
            dto.setTitle(detail.getName());
            dto.setDescription(detail.getOverview());
            dto.setReleaseYear(detail.getFirst_air_date() != null ?
                    Integer.parseInt(detail.getFirst_air_date().substring(0, 4)) : null);
            dto.setTotalEpisodes(detail.getNumber_of_episodes());
            dto.setEpisodeDuration(detail.getEpisode_run_time() != null && !detail.getEpisode_run_time().isEmpty() ?
                    detail.getEpisode_run_time().get(0) : 45);
        }

        dto.setPosterUrl(detail.getPoster_path() != null ?
                tmdbImageBase + "/w500" + detail.getPoster_path() : null);
        dto.setRating(detail.getVote_average());
        dto.setStatus(detail.getStatus());

        // Жанры
        if (detail.getGenres() != null) {
            dto.setGenres(Arrays.stream(detail.getGenres())
                    .map(TMDBGenre::getName)
                    .collect(Collectors.toList()));
        }

        // НОВОЕ: страны производства
        if (detail.getProduction_countries() != null) {
            dto.setProductionCountries(Arrays.stream(detail.getProduction_countries())
                    .map(TMDBProductionCountry::getName)
                    .collect(Collectors.toList()));
        }

        // НОВОЕ: актёры
        if (detail.getCredits() != null && detail.getCredits().getCast() != null) {
            List<ActorDTO> actors = Arrays.stream(detail.getCredits().getCast())
                    .limit(10) // Берем первых 10 актёров
                    .map(this::convertToActorDTO)
                    .collect(Collectors.toList());
            dto.setActors(actors);
        }

        // Возрастной рейтинг
        dto.setAgeRating(detail.getAdult() != null && detail.getAdult() ? "R" : "PG-13");

        // Трейлер
        if (detail.getVideos() != null && detail.getVideos().getResults() != null) {
            Optional<TMDBVideo> trailer = Arrays.stream(detail.getVideos().getResults())
                    .filter(v -> "Trailer".equals(v.getType()) && "YouTube".equals(v.getSite()))
                    .findFirst();
            if (trailer.isPresent()) {
                dto.setTrailerUrl("https://www.youtube.com/watch?v=" + trailer.get().getKey());
            }
        }

        return dto;
    }

    private ActorDTO convertToActorDTO(TMDBCast cast) {
        ActorDTO actorDTO = new ActorDTO();
        actorDTO.setName(cast.getName());
        actorDTO.setCharacter(cast.getCharacter());
        actorDTO.setPhotoUrl(cast.getProfile_path() != null ?
                tmdbImageBase + "/w300" + cast.getProfile_path() : null);
        return actorDTO;
    }



    // Внутренние классы для парсинга ответов TMDB
    private static class TMDBResponse {
        private TMDBResult[] results;
        public TMDBResult[] getResults() { return results; }
        public void setResults(TMDBResult[] results) { this.results = results; }

    }

    private static class TMDBResult {
        private Long id;
        private String media_type;
        private String title;
        private String name;
        private String release_date;
        private String first_air_date;
        private String poster_path;
        private Double vote_average;

        // Геттеры и сеттеры
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getMedia_type() { return media_type; }
        public void setMedia_type(String media_type) { this.media_type = media_type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRelease_date() { return release_date; }
        public void setRelease_date(String release_date) { this.release_date = release_date; }
        public String getFirst_air_date() { return first_air_date; }
        public void setFirst_air_date(String first_air_date) { this.first_air_date = first_air_date; }
        public String getPoster_path() { return poster_path; }
        public void setPoster_path(String poster_path) { this.poster_path = poster_path; }
        public Double getVote_average() { return vote_average; }
        public void setVote_average(Double vote_average) { this.vote_average = vote_average; }
    }

    private static class TMDBDetailResponse {
        private Long id;
        private String title;
        private String name;
        private String overview;
        private String release_date;
        private String first_air_date;
        private Integer runtime;
        private List<Integer> episode_run_time;
        private Integer number_of_episodes;
        private String poster_path;
        private Double vote_average;
        private String status;
        private Boolean adult;
        private TMDBGenre[] genres;
        private TMDBVideoResults videos;
        private TMDBProductionCountry[] production_countries;
        private TMDBCredits credits;

        // Геттеры и сеттеры
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getOverview() { return overview; }
        public void setOverview(String overview) { this.overview = overview; }
        public String getRelease_date() { return release_date; }
        public void setRelease_date(String release_date) { this.release_date = release_date; }
        public String getFirst_air_date() { return first_air_date; }
        public void setFirst_air_date(String first_air_date) { this.first_air_date = first_air_date; }
        public Integer getRuntime() { return runtime; }
        public void setRuntime(Integer runtime) { this.runtime = runtime; }
        public List<Integer> getEpisode_run_time() { return episode_run_time; }
        public void setEpisode_run_time(List<Integer> episode_run_time) { this.episode_run_time = episode_run_time; }
        public Integer getNumber_of_episodes() { return number_of_episodes; }
        public void setNumber_of_episodes(Integer number_of_episodes) { this.number_of_episodes = number_of_episodes; }
        public String getPoster_path() { return poster_path; }
        public void setPoster_path(String poster_path) { this.poster_path = poster_path; }
        public Double getVote_average() { return vote_average; }
        public void setVote_average(Double vote_average) { this.vote_average = vote_average; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Boolean getAdult() { return adult; }
        public void setAdult(Boolean adult) { this.adult = adult; }
        public TMDBGenre[] getGenres() { return genres; }
        public void setGenres(TMDBGenre[] genres) { this.genres = genres; }
        public TMDBVideoResults getVideos() { return videos; }
        public void setVideos(TMDBVideoResults videos) { this.videos = videos; }
        public TMDBProductionCountry[] getProduction_countries() { return production_countries; }
        public void setProduction_countries(TMDBProductionCountry[] production_countries) { this.production_countries = production_countries; }
        public TMDBCredits getCredits() { return credits; }
        public void setCredits(TMDBCredits credits) { this.credits = credits; }}

    private static class TMDBGenre {
        private String name;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    private static class TMDBVideoResults {
        private TMDBVideo[] results;
        public TMDBVideo[] getResults() { return results; }
        public void setResults(TMDBVideo[] results) { this.results = results; }
    }

    private static class TMDBCredits {
        private TMDBCast[] cast;
        public TMDBCast[] getCast() { return cast; }
        public void setCast(TMDBCast[] cast) { this.cast = cast; }
    }

    private static class TMDBCast {
        private String name;
        private String character;
        private String profile_path;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCharacter() { return character; }
        public void setCharacter(String character) { this.character = character; }

        public String getProfile_path() { return profile_path; }
        public void setProfile_path(String profile_path) { this.profile_path = profile_path; }
    }

    private static class TMDBProductionCountry {
        private String name;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    private static class TMDBVideo {
        private String key;
        private String site;
        private String type;
        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        public String getSite() { return site; }
        public void setSite(String site) { this.site = site; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}