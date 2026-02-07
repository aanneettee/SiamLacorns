// LacornWatchPage.js (версия с поддержкой YouTube)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lacornService, userCollectionService } from '../../services/lacorns';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { collectionService } from '../../services/collections';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(true);
  const [userCollections, setUserCollections] = useState([]);
  const [isInCollections, setIsInCollections] = useState({
    favourites: false,
    watchLater: false,
    started: false,
    forsaken: false
  });

  // Функция для извлечения YouTube ID из URL
  const getYouTubeId = (url) => {
    if (!url) return null;

    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Функция для создания embed URL YouTube
  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeId(url);
    if (!videoId) return null;

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  // Функция для определения типа видео
  const getVideoType = (url) => {
    if (!url) return 'unknown';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    } else if (url.endsWith('.mp4') || url.includes('video/mp4')) {
      return 'mp4';
    } else {
      return 'unknown';
    }
  };

  const loadUserCollections = async () => {
    if (!user || !token) return;

    try {
      const collections = await collectionService.getUserCollections(user.id, token);
      setUserCollections(collections);

      // Проверяем, находится ли текущий сериал в коллекциях
      const checkCollectionStatus = (collections) => {
        const status = {
          favourites: false,
          watchLater: false,
          started: false,
          forsaken: false
        };

        collections.forEach(collection => {
          if (collection.seriesIds && collection.seriesIds.includes(parseInt(id))) {
            switch(collection.name.toLowerCase()) {
              case 'favourites':
                status.favourites = true;
                break;
              case 'watch later':
                status.watchLater = true;
                break;
              case 'started':
                status.started = true;
                break;
              case 'forsaken':
                status.forsaken = true;
                break;
            }
          }
        });

        setIsInCollections(status);
      };

      checkCollectionStatus(collections);
    } catch (error) {
      console.error('Error loading user collections:', error);
    }
  };

  // Обновляем handleAddToCollection
  const handleAddToCollection = async (collectionName) => {
    if (!user || !token) {
      alert('Пожалуйста, войдите в систему чтобы добавлять в коллекции');
      navigate('/login');
      return;
    }

    try {
      await collectionService.addToCollection(user.id, collectionName, parseInt(id), token);

      // Обновляем статус коллекции
      setIsInCollections(prev => ({
        ...prev,
        [collectionName.toLowerCase().replace(' ', '')]: true
      }));

      setShowCollections(false);
      alert(`Сериал добавлен в коллекцию "${collectionName}"`);

      // Перезагружаем коллекции
      loadUserCollections();
    } catch (err) {
      console.error('Error adding to collection:', err);
      alert('Ошибка при добавлении в коллекцию');
    }
  };

  // Добавляем вызов в useEffect
  useEffect(() => {
    if (user && token) {
      loadUserCollections();
    }
  }, [user, token, id]);

  useEffect(() => {
    loadLacornData();
  }, [id]);

  useEffect(() => {
    if (isPlayingTrailer && lacorn?.trailerUrl) {
      // Если включен режим трейлера и есть URL трейлера
      const videoType = getVideoType(lacorn.trailerUrl);

      if (videoType === 'youtube') {
        // Для YouTube используем embed URL
        const embedUrl = getYouTubeEmbedUrl(lacorn.trailerUrl);
        setVideoUrl(embedUrl || lacorn.trailerUrl);
      } else {
        // Для других типов видео используем прямой URL
        setVideoUrl(lacorn.trailerUrl);
      }
    } else if (selectedEpisode) {
      // Иначе загружаем обычное видео эпизода
      loadVideoUrl();
    }
  }, [selectedEpisode, selectedVoicecover, isPlayingTrailer, lacorn]);

  const loadLacornData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Current ID:', id);
      console.log('User:', user);
      console.log('Token:', token);

      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(user?.id && { 'X-User-Id': user.id.toString() })
        }
      };

      console.log('Loading lacorn data for ID:', id);
      console.log('Config:', config);

      const lacornData = await lacornService.getLacornById(id, config);
      console.log('Lacorn data loaded:', lacornData);

      const episodesData = await lacornService.getEpisodes(id, config);
      console.log('Episodes data loaded:', episodesData);

      const actorsData = await lacornService.getActors(id, config);
      console.log('Actors data loaded:', actorsData);

      setLacorn(lacornData);
      setEpisodes(episodesData || []);
      setActors(actorsData || []);

      // Автоматически выбираем первый эпизод, но не переключаем видео пока пользователь не выберет
      if (episodesData && episodesData.length > 0) {
        const firstEpisode = episodesData[0];
        setSelectedEpisode(firstEpisode);
        console.log('Selected first episode:', firstEpisode);

        const firstSeason = firstEpisode.seasonNumber || 1;
        setSelectedSeason(firstSeason);
      } else {
        console.warn('No episodes found for lacorn:', id);
      }

    } catch (err) {
      console.error('Error loading lacorn data:', err);
      console.error('Error details:', err.response?.data);
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

      // Проверяем тип видео для эпизода
      const videoType = getVideoType(videoData);
      if (videoType === 'youtube') {
        const embedUrl = getYouTubeEmbedUrl(videoData);
        setVideoUrl(embedUrl || videoData);
      } else {
        setVideoUrl(videoData);
      }
    } catch (err) {
      console.error('Error loading video URL:', err);
      // Используем прямой URL если API не работает
      const fallbackUrl = selectedEpisode.videoUrl || '';
      const videoType = getVideoType(fallbackUrl);
      if (videoType === 'youtube') {
        const embedUrl = getYouTubeEmbedUrl(fallbackUrl);
        setVideoUrl(embedUrl || fallbackUrl);
      } else {
        setVideoUrl(fallbackUrl);
      }
    }
  };

  const handleEpisodeSelect = (episode) => {
    setSelectedEpisode(episode);
    setIsPlayingTrailer(false);
  };

  const handlePlayTrailer = () => {
    if (lacorn?.trailerUrl) {
      setIsPlayingTrailer(true);
    }
  };

  const handleTimeUpdate = async (currentTime) => {
    if (!user || !selectedEpisode || !token || isPlayingTrailer) return;

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
    if (!user || !selectedEpisode || !token || isPlayingTrailer) return;

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleProfile = () => {
    closeMenu();
    console.log('LacornWatchPage.js: Profile button clicked, user:', user);

    if (user && user.id) {
      console.log('LacornWatchPage.js: User is authenticated, navigating to profile');
      navigate('/profile');
    } else {
      console.log('LacornWatchPage.js: User is NOT authenticated, navigating to login');
      navigate('/login', {
        state: {
          message: 'Please log in to access your profile',
          from: { pathname: '/profile' }
        }
      });
    }
  };

  const handleMainPage = () => {
    closeMenu();
    navigate('/');
  };

  const handleLeavePage = () => {
    alert('Leave page functionality would go here!');
    closeMenu();
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
  const videoType = getVideoType(videoUrl);

  return (
    <div className="lacorn-watch-page">
      {/* Кнопка меню в правом верхнем углу */}
      <div className="watch-page-header">
        <button className="menu-button" onClick={toggleMenu}>
          <div className="menu-icon">
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </div>
          Menu
        </button>
      </div>

      {/* Header Section - три колонки */}
      <div className="lacorn-header-section">
        <div className="lacorn-poster-container">
          <img
            src={lacorn.posterUrl || '/images/default-poster.jpg'}
            alt={lacorn.title}
            className="lacorn-poster"
            onError={(e) => {
              e.target.src = '/images/default-poster.jpg';
            }}
          />
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
        </div>

        <div className="cat-help-section">
          <div className="cat-container">
            <img
              src="/images/Space cat.png"
              alt="Space Cat"
              className="header-cat"
            />
            <div className="help-bubble">
              <p>Let's watch this drama!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="description-section">
        <div className="description-box">
          <p>{lacorn.description || 'Описание отсутствует'}</p>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="player-section">
        <div className="video-container">
          {videoUrl ? (
            <div className="video-player-wrapper">
              {videoType === 'youtube' ? (
                // YouTube iframe для YouTube видео
                <iframe
                  key={isPlayingTrailer ? 'trailer-youtube' : `episode-${selectedEpisode?.id}-youtube`}
                  src={videoUrl}
                  className="video-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={isPlayingTrailer ? `Трейлер: ${lacorn.title}` : `Эпизод: ${selectedEpisode?.title}`}
                ></iframe>
              ) : (
                // Стандартный video элемент для MP4 и других форматов
                <video
                  key={isPlayingTrailer ? 'trailer' : `${selectedEpisode?.id}-${selectedVoicecover}`}
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
                <h4>
                  {isPlayingTrailer ? (
                    `Трейлер: ${lacorn.title}`
                  ) : (
                    `${selectedEpisode.seasonNumber || 1}x${selectedEpisode.episodeNumber?.toString().padStart(2, '0') || '01'} - ${selectedEpisode.title}`
                  )}
                </h4>
                {isPlayingTrailer ? (
                  <p>Трейлер сериала</p>
                ) : (
                  selectedEpisode.description && <p>{selectedEpisode.description}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="video-placeholder">
              <p>Выберите эпизод для начала просмотра</p>
              <p>🎬 📺 🍿</p>
            </div>
          )}
        </div>

        <div className="player-controls-panel">
          {/* Кнопка для переключения на трейлер */}
          {lacorn.trailerUrl && (
            <button
              className={`control-button ${isPlayingTrailer ? 'active' : ''}`}
              onClick={handlePlayTrailer}
            >
              🎬 Смотреть трейлер
            </button>
          )}

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
                      handleEpisodeSelect(seasonEpisodes[0]);
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
          {!isPlayingTrailer && videoType !== 'youtube' && (
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
          {!isPlayingTrailer && videoType !== 'youtube' && selectedEpisode?.currentTime > 0 && (
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

      {/* Модальное окно меню */}
      {isMenuOpen && (
        <div className="menu-modal-overlay" onClick={closeMenu}>
          <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="menu-modal-title">Menu</h2>
            <div className="menu-modal-content">
              <div className="menu-modal-column">
                <button className="menu-modal-button" onClick={handleProfile}>
                  <img src="/images/icons/my-profile.png" alt="Profile" className="menu-modal-button-icon" />
                  My profile
                </button>
                <button className="menu-modal-button"
                  onClick={() => navigate('/collections/favourites')}>
                  <img src="/images/icons/favourite.png" alt="Favourites" className="menu-modal-button-icon" />
                  Favourites
                </button>
                <button className="menu-modal-button"
                  onClick={() => navigate('/collections/watch-later')}>
                  <img src="/images/icons/watch-later.png" alt="Watch later" className="menu-modal-button-icon" />
                  Watch later
                </button>
              </div>
              <div className="menu-modal-column">
                <button className="menu-modal-button"
                  onClick={() => navigate('/collections/started')}>
                  <img src="/images/icons/started.png" alt="Started" className="menu-modal-button-icon" />
                  Started
                </button>
                <button className="menu-modal-button"
                  onClick={() => navigate('/collections/forsaken')}>
                  <img src="/images/icons/forsaken.png" alt="Forsaken" className="menu-modal-button-icon" />
                  Forsaken
                </button>
                <button className="menu-modal-button" onClick={handleMainPage}>
                  <img src="/images/icons/main-page.png" alt="Main page" className="menu-modal-button-icon" />
                  Main page
                </button>
              </div>
            </div>

            <div className="menu-modal-footer">
              <button className="leave-page-button" onClick={handleLeavePage}>
                <img src="/images/icons/leave-page.png" alt="Leave page" className="menu-modal-button-icon" />
                Leave page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LacornWatchPage;