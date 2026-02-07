// services/tmdbService.js
import axios from 'axios';

const TMDB_API_KEY = 'e549ff12f9d7a942254c46fe7c087900';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

class TMDbService {
  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.baseURL = TMDB_BASE_URL;
  }

  // Поиск фильмов/сериалов
  async searchContent(query, year = null, contentType = 'multi') {
    try {
      const params = {
        api_key: this.apiKey,
        query: query,
        language: 'en-US',
        page: 1
      };

      if (year) {
        params.year = year;
      }

      let endpoint = '';
      switch (contentType) {
        case 'movie':
          endpoint = '/search/movie';
          break;
        case 'tv':
          endpoint = '/search/tv';
          break;
        default:
          endpoint = '/search/multi';
      }

      const response = await axios.get(`${this.baseURL}${endpoint}`, { params });
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching content:', error);
      return [];
    }
  }

  // Получение детальной информации о фильме
  async getMovieDetails(movieId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/movie/${movieId}`,
        {
          params: {
            api_key: this.apiKey,
            language: 'en-US',
            append_to_response: 'videos,credits'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting movie details:', error);
      return null;
    }
  }

  // Получение детальной информации о сериале
  async getTVDetails(tvId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/tv/${tvId}`,
        {
          params: {
            api_key: this.apiKey,
            language: 'en-US',
            append_to_response: 'videos,credits'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting TV details:', error);
      return null;
    }
  }

  // Получение трейлеров
  async getTrailers(contentId, contentType = 'movie') {
    try {
      const endpoint = contentType === 'movie' ?
        `/movie/${contentId}/videos` :
        `/tv/${contentId}/videos`;

      const response = await axios.get(
        `${this.baseURL}${endpoint}`,
        {
          params: {
            api_key: this.apiKey,
            language: 'en-US'
          }
        }
      );

      const videos = response.data.results || [];
      // Ищем трейлеры на YouTube
      const trailers = videos.filter(video =>
        video.type === 'Trailer' &&
        video.site === 'YouTube' &&
        video.official === true
      );

      return trailers;
    } catch (error) {
      console.error('Error getting trailers:', error);
      return [];
    }
  }

  // Получение сезонов и эпизодов
  async getTVSeasons(tvId) {
    try {
      const details = await this.getTVDetails(tvId);
      return details?.seasons || [];
    } catch (error) {
      console.error('Error getting TV seasons:', error);
      return [];
    }
  }

  // Получение эпизодов сезона
  async getSeasonEpisodes(tvId, seasonNumber) {
    try {
      const response = await axios.get(
        `${this.baseURL}/tv/${tvId}/season/${seasonNumber}`,
        {
          params: {
            api_key: this.apiKey,
            language: 'en-US'
          }
        }
      );
      return response.data?.episodes || [];
    } catch (error) {
      console.error('Error getting season episodes:', error);
      return [];
    }
  }

  // Получение URL изображения
  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }

  // Получение YouTube URL
  getYouTubeUrl(videoKey) {
    return `https://www.youtube.com/watch?v=${videoKey}`;
  }

  // Универсальный метод для автоматического заполнения данных
  async autoFillLacornData(title, year = null) {
    try {
      // Ищем контент
      const searchResults = await this.searchContent(title, year, 'multi');

      if (!searchResults || searchResults.length === 0) {
        return null;
      }

      const firstResult = searchResults[0];
      const isMovie = firstResult.media_type === 'movie';
      const contentId = firstResult.id;

      // Получаем детальную информацию
      const details = isMovie ?
        await this.getMovieDetails(contentId) :
        await this.getTVDetails(contentId);

      if (!details) {
        return null;
      }

      // Получаем трейлеры
      const trailers = await this.getTrailers(contentId, isMovie ? 'movie' : 'tv');
      const trailer = trailers.length > 0 ? trailers[0] : null;

      // Форматируем данные для вашего Lacorn формата
      return {
        title: details.title || details.name || '',
        description: details.overview || '',
        releaseYear: details.release_date || details.first_air_date
          ? new Date(details.release_date || details.first_air_date).getFullYear()
          : new Date().getFullYear(),
        totalEpisodes: details.number_of_episodes || (isMovie ? 1 : 0),
        episodeDuration: details.episode_run_time?.[0] || (isMovie ? (details.runtime || 45) : 45),
        posterUrl: this.getImageUrl(details.poster_path) || '',
        trailerUrl: trailer ? this.getYouTubeUrl(trailer.key) : '',
        genres: details.genres?.map(genre => genre.name) || [],
        ageRating: this.mapAgeRating(details.adult),
        rating: details.vote_average || 0.0,
        status: this.mapStatus(details.status),
        availableVoiceovers: ['ORIGINAL_SUBBED'], // По умолчанию
        tmdbId: contentId,
        mediaType: isMovie ? 'MOVIE' : 'TV'
      };
    } catch (error) {
      console.error('Error auto-filling lacorn data:', error);
      return null;
    }
  }

  // Вспомогательные методы
  mapAgeRating(isAdult) {
    return isAdult ? 'R' : 'PG-13';
  }

  mapStatus(status) {
    const statusMap = {
      'Released': 'COMPLETED',
      'Returning Series': 'ONGOING',
      'Ended': 'COMPLETED',
      'In Production': 'ONGOING',
      'Planned': 'UPCOMING',
      'Canceled': 'COMPLETED'
    };
    return statusMap[status] || 'ONGOING';
  }
}

export default new TMDbService();