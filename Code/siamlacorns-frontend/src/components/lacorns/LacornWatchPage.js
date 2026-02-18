// LacornWatchPage.js (исправленная версия с трейлером)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lacornService, userCollectionService } from '../../services/lacorns';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './LacornWatchPage.css';

const LacornWatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [lacorn, setLacorn] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [actors, setActors] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedVoicecover, setSelectedVoicecover] = useState('subbed');
  const [showCollections, setShowCollections] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    loadLacornData();
  }, [id]);

  useEffect(() => {
    if (selectedEpisode) {
      loadVideoUrl();
      setShowTrailer(false);
    } else {
      setShowTrailer(true);
      if (lacorn?.trailerUrl) {
        setVideoUrl(formatTrailerUrl(lacorn.trailerUrl));
      } else {
        setVideoUrl('');
      }
    }
  }, [selectedEpisode, selectedVoicecover, lacorn]);

  const formatTrailerUrl = (url) => {
    if (!url) return '';

    if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v');
      } else if (url.includes('youtu.be')) {
        videoId = url.split('/').pop();
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    return url;
  };

  const loadLacornData = async () => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(user?.id && { 'X-User-Id': user.id.toString() })
        }
      };

      const lacornData = await lacornService.getLacornById(id, config);
      const episodesData = await lacornService.getEpisodes(id, config);
      const actorsData = await lacornService.getActors(id, config);

      setLacorn(lacornData);
      setEpisodes(episodesData || []);
      setActors(actorsData || []);

      if (episodesData && episodesData.length > 0) {
        const firstEpisode = episodesData[0];
        setSelectedEpisode(firstEpisode);

        const firstSeason = firstEpisode.seasonNumber || 1;
        setSelectedSeason(firstSeason);
      } else {
        setShowTrailer(true);
        if (lacornData.trailerUrl) {
          setVideoUrl(formatTrailerUrl(lacornData.trailerUrl));
        }
      }

    } catch (err) {
      console.error('Error loading lacorn data:', err);
      setError(err.response?.data?.message || 'Ошибка при загрузке данных для просмотра');
    } finally {
      setLoading(false);
    }
  };

  const loadVideoUrl = async () => {
    if (!selectedEpisode) return;

    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const videoData = await lacornService.generateVideoUrl(
        selectedEpisode.id,
        selectedVoicecover,
        config
      );
      setVideoUrl(videoData);
    } catch (err) {
      console.error('Error loading video URL:', err);
      setVideoUrl(selectedEpisode.videoUrl || '');
    }
  };

  const handleEpisodeSelect = (episode) => {
    setSelectedEpisode(episode);
    setShowTrailer(false);
  };

  const handleAddToCollection = async (collectionName) => {
    if (!user) {
      alert('Пожалуйста, войдите в систему чтобы добавлять в коллекции');
      navigate('/login');
      return;
    }

    try {
      await userCollectionService.addToCollection(user.id, collectionName, parseInt(id));
      setShowCollections(false);
      alert(`Сериал добавлен в коллекцию "${collectionName}"`);
    } catch (err) {
      console.error('Error adding to collection:', err);
      alert('Ошибка при добавлении в коллекцию');
    }
  };

  const handleTimeUpdate = async (currentTime) => {
    if (!user || !selectedEpisode || !token) return;

    try {
      await lacornService.updateWatchProgress({
        episodeId: selectedEpisode.id,
        currentTime: Math.floor(currentTime)
      }, token);
    } catch (err) {
      console.error('Error updating watch progress:', err);
    }
  };

  const handleVideoEnd = async () => {
    if (!user || !selectedEpisode || !token) return;

    try {
      await lacornService.updateWatchProgress({
        episodeId: selectedEpisode.id,
        currentTime: 0,
        completed: true
      }, token);

      const currentIndex = episodes.findIndex(ep => ep.id === selectedEpisode.id);
      if (currentIndex < episodes.length - 1) {
        handleEpisodeSelect(episodes[currentIndex + 1]);
      }
    } catch (err) {
      console.error('Error marking episode as completed:', err);
    }
  };

  const getUniqueSeasons = () => {
    if (!episodes || episodes.length === 0) return [1];
    return [...new Set(episodes.map(ep => ep.seasonNumber || 1))].sort((a, b) => a - b);
  };

  const getSeasonEpisodes = (season) => {
    if (!episodes) return [];
    return episodes
      .filter(ep => (ep.seasonNumber || 1) === season)
      .sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" text="Загрузка плеера..." />
      </div>
    );
  }

  if (error || !lacorn) {
    return (
      <div className="error-container">
        <h2>{error || 'Сериал не найден'}</h2>
        <button onClick={() => navigate('/')} className="back-button">
          Вернуться на главную
        </button>
      </div>
    );
  }

  const seasons = getUniqueSeasons();
  const currentSeasonEpisodes = getSeasonEpisodes(selectedSeason);

  return (
    <div className="lacorn-watch-page">
      {/* Header Section */}
      <div className="lacorn-header-section">
        <div className="lacorn-poster-container">
          <img
            src={lacorn.posterUrl || '/images/default-poster.webp'}
            alt={lacorn.title}
            className="lacorn-poster"
            onError={(e) => {
              e.target.src = '/images/default-poster.webp';
            }}
          />
          <button
            className="detail-button"
            onClick={() => navigate(`/lacorns/${id}`)}
          >
            ℹ️ Подробнее о сериале
          </button>
        </div>

        <div className="lacorn-info">
          <div className="info-line">Название: {lacorn.title}</div>
          <div className="info-line">Год выпуска: {lacorn.releaseYear}</div>
          <div className="info-line">Жанр: {lacorn.genres?.join(', ') || 'Не указан'}</div>
          <div className="info-line">Рейтинг: ⭐ {lacorn.rating || 'N/A'}</div>
          <div className="info-line">Возрастной рейтинг: {lacorn.ageRating || 'Не указан'}</div>
          <div className="info-line">Длительность эпизода: {lacorn.episodeDuration} мин</div>
          <div className="info-line">
            Актёры: {actors.slice(0, 3).map(actor => actor.name).join(', ')}
            {actors.length > 3 && ` и ещё ${actors.length - 3}`}
          </div>
          {lacorn.trailerUrl && (
            <div className="info-line trailer-indicator">
              🎬 Трейлер доступен
            </div>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="description-section">
        <div className="description-box">
          <h3>Описание</h3>
          <p>{lacorn.description || 'Описание отсутствует'}</p>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="player-section">
        <div className="video-container">
          {videoUrl ? (
            <div className="video-player-wrapper">
              {showTrailer ? (
                videoUrl.includes('youtube.com/embed') ? (
                  <iframe
                    src={videoUrl}
                    title={`${lacorn.title} - Трейлер`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="video-iframe"
                  ></iframe>
                ) : (
                  <video
                    key="trailer"
                    controls
                    autoPlay
                    className="video-element"
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Ваш браузер не поддерживает видео тег.
                  </video>
                )
              ) : (
                <video
                  key={`${selectedEpisode?.id}-${selectedVoicecover}`}
                  controls
                  autoPlay
                  onTimeUpdate={(e) => handleTimeUpdate(e.target.currentTime)}
                  onEnded={handleVideoEnd}
                  className="video-element"
                >
                  <source src={videoUrl} type="video/mp4" />
                  Ваш браузер не поддерживает видео тег.
                </video>
              )}

              <div className="video-info">
                {showTrailer ? (
                  <>
                    <h4>🎬 Трейлер: {lacorn.title}</h4>
                    {lacorn.trailerUrl && (
                      <p>
                        <a
                          href={lacorn.trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="trailer-link"
                        >
                          Смотреть на YouTube
                        </a>
                      </p>
                    )}
                  </>
                ) : (
                  selectedEpisode && (
                    <>
                      <h4>
                        {selectedEpisode.seasonNumber || 1}x{selectedEpisode.episodeNumber?.toString().padStart(2, '0') || '01'} - {selectedEpisode.title}
                      </h4>
                      {selectedEpisode.description && (
                        <p>{selectedEpisode.description}</p>
                      )}
                    </>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="video-placeholder">
              {showTrailer && !lacorn.trailerUrl ? (
                <>
                  <p>Трейлер недоступен</p>
                  <p>Выберите эпизод для начала просмотра</p>
                </>
              ) : (
                <>
                  <p>Выберите эпизод для начала просмотра</p>
                  <p>🎬 📺 🍿</p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="player-controls-panel">
          {/* Season Selector */}
          <div className="control-group">
            <button className="control-button">
              Сезон {selectedSeason} ▼
            </button>
            <div className="dropdown-content">
              {seasons.map(season => (
                <button
                  key={season}
                  onClick={() => {
                    setSelectedSeason(season);
                    const seasonEpisodes = getSeasonEpisodes(season);
                    if (seasonEpisodes.length > 0) {
                      setSelectedEpisode(seasonEpisodes[0]);
                    }
                  }}
                  className={`dropdown-item ${selectedSeason === season ? 'active' : ''}`}
                >
                  Сезон {season}
                </button>
              ))}
            </div>
          </div>

          {/* Episode Selector */}
          <div className="control-group">
            <button className="control-button">
              Эпизоды ▼
            </button>
            <div className="dropdown-content episodes-list">
              {currentSeasonEpisodes.map(episode => (
                <button
                  key={episode.id}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`dropdown-item ${selectedEpisode?.id === episode.id ? 'active' : ''}`}
                >
                  {episode.episodeNumber || 'N/A'}. {episode.title}
                  {episode.watched && <span className="watched-indicator"> ✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Voiceover Selector */}
          {selectedEpisode && (
            <div className="control-group">
              <button className="control-button">
                Озвучка: {selectedVoicecover === 'subbed' ? 'Субтитры' : 'Дубляж'} ▼
              </button>
              <div className="dropdown-content">
                <button
                  onClick={() => setSelectedVoicecover('subbed')}
                  className={`dropdown-item ${selectedVoicecover === 'subbed' ? 'active' : ''}`}
                >
                  🇺🇸 Субтитры
                </button>
                <button
                  onClick={() => setSelectedVoicecover('dubbed')}
                  className={`dropdown-item ${selectedVoicecover === 'dubbed' ? 'active' : ''}`}
                >
                  🇷🇺 Дубляж
                </button>
              </div>
            </div>
          )}

          {/* Watch Progress */}
          {selectedEpisode?.currentTime > 0 && (
            <div className="progress-info">
              <div className="progress-text">
                Прогресс: {Math.floor(selectedEpisode.currentTime / 60)}:
                {(selectedEpisode.currentTime % 60).toString().padStart(2, '0')}
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(selectedEpisode.currentTime / ((selectedEpisode.duration || 24) * 60)) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Trailer Button */}
          {lacorn.trailerUrl && !showTrailer && (
            <button
              className="trailer-button"
              onClick={() => {
                setSelectedEpisode(null);
                setShowTrailer(true);
                setVideoUrl(formatTrailerUrl(lacorn.trailerUrl));
              }}
            >
              🎬 Смотреть трейлер
            </button>
          )}
        </div>
      </div>

      {/* Collection Actions */}
      <div className="collection-section">
        <div className="control-group">
          <button
            className="add-to-button"
            onClick={() => setShowCollections(!showCollections)}
          >
            📁 Добавить в коллекцию ▼
          </button>
          {showCollections && (
            <div className="dropdown-content collections-list">
              <button
                onClick={() => handleAddToCollection('Favourites')}
                className="dropdown-item"
              >
                ❤️ Избранное
              </button>
              <button
                onClick={() => handleAddToCollection('Watch later')}
                className="dropdown-item"
              >
                ⏰ Посмотреть позже
              </button>
              <button
                onClick={() => handleAddToCollection('Started')}
                className="dropdown-item"
              >
                ▶️ Начатые
              </button>
              <button
                onClick={() => handleAddToCollection('Forsaken')}
                className="dropdown-item"
              >
                🗑️ Брошенные
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="action-button"
          onClick={() => navigate(`/lacorns/${id}`)}
        >
          📖 Подробная информация
        </button>
        <button
          className="action-button"
          onClick={() => navigate('/')}
        >
          📋 Все сериалы
        </button>
        {user && (
          <button
            className="action-button"
            onClick={() => navigate('/profile')}
          >
            👤 Мой профиль
          </button>
        )}
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h3>💬 Комментарии</h3>
        <div className="comments-box">
          {user ? (
            <div className="comment-input">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Напишите ваш комментарий..."
                className="comment-textarea"
                rows="4"
              />
              <button className="comment-submit">📤 Отправить комментарий</button>
            </div>
          ) : (
            <div className="login-prompt">
              <p>Войдите в систему, чтобы оставлять комментарии</p>
              <button
                className="login-button"
                onClick={() => navigate('/login')}
              >
                🔑 Войти
              </button>
            </div>
          )}

          <div className="comments-list">
            <div className="no-comments">
              🎭 Комментариев пока нет. Будьте первым!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LacornWatchPage;