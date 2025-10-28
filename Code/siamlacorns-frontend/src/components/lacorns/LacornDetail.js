// LacornDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lacornService, collections } from '../../services/lacorns';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './LacornDetail.css';

const LacornDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lacorn, setLacorn] = useState(null);
  const [actors, setActors] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadLacornData();
  }, [id]);

  const loadLacornData = async () => {
    try {
      setLoading(true);
      const [lacornData, actorsData, episodesData] = await Promise.all([
        lacornService.getLacornById(id),
        lacornService.getActors(id),
        lacornService.getEpisodes(id)
      ]);

      setLacorn(lacornData);
      setActors(actorsData);
      setEpisodes(episodesData);
    } catch (err) {
      setError('Ошибка при загрузке данных сериала');
      console.error('Error loading lacorn data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async (collectionName) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await collectionService.addToCollection(user.id, collectionName, lacorn.id);
      alert(`Сериал добавлен в коллекцию "${collectionName}"`);
    } catch (err) {
      alert('Ошибка при добавлении в коллекцию');
      console.error('Error adding to collection:', err);
    }
  };

  const handleWatchEpisode = (episodeId) => {
    navigate(`/watch/${id}?episode=${episodeId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" text="Загрузка информации о сериале..." />
      </div>
    );
  }

  if (error || !lacorn) {
    return (
      <div className="error-container">
        <h2>{error || 'Сериал не найден'}</h2>
        <button onClick={() => navigate('/lacorns')} className="back-button">
          Вернуться к списку
        </button>
      </div>
    );
  }

  return (
    <div className="lacorn-detail">
      {/* Хедер с постером и основной информацией */}
      <div className="lacorn-header">
        <div className="lacorn-poster">
          <img
            src={lacorn.posterUrl || '/images/default-poster.jpg'}
            alt={lacorn.title}
          />
        </div>

        <div className="lacorn-info">
          <h1>{lacorn.title}</h1>
          <div className="lacorn-meta">
            <span className="year">{lacorn.releaseYear}</span>
            <span className="rating">⭐ {lacorn.rating || 'N/A'}</span>
            <span className="duration">{lacorn.episodeDuration} мин</span>
            <span className="age-rating">{lacorn.ageRating}</span>
          </div>

          <div className="lacorn-genres">
            {lacorn.genres && lacorn.genres.map((genre, index) => (
              <span key={index} className="genre">{genre}</span>
            ))}
          </div>

          <p className="lacorn-description">{lacorn.description}</p>

          <div className="lacorn-actions">
            <button
              className="watch-button primary"
              onClick={() => navigate(`/watch/${lacorn.id}`)}
            >
              ▶ Смотреть
            </button>

            {user && (
              <div className="collection-actions">
                <button
                  className="collection-button"
                  onClick={() => handleAddToCollection('Favourites')}
                >
                  ❤️ В избранное
                </button>
                <button
                  className="collection-button"
                  onClick={() => handleAddToCollection('Watch later')}
                >
                  ⏰ Посмотреть позже
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Табы с дополнительной информацией */}
      <div className="lacorn-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Обзор
        </button>
        <button
          className={`tab ${activeTab === 'episodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('episodes')}
        >
          Эпизоды ({episodes.length})
        </button>
        <button
          className={`tab ${activeTab === 'actors' ? 'active' : ''}`}
          onClick={() => setActiveTab('actors')}
        >
          Актёры ({actors.length})
        </button>
      </div>

      {/* Контент табов */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="details-grid">
              <div className="detail-item">
                <strong>Год выпуска:</strong> {lacorn.releaseYear}
              </div>
              <div className="detail-item">
                <strong>Всего эпизодов:</strong> {lacorn.totalEpisodes}
              </div>
              <div className="detail-item">
                <strong>Длительность эпизода:</strong> {lacorn.episodeDuration} мин
              </div>
              <div className="detail-item">
                <strong>Рейтинг:</strong> ⭐ {lacorn.rating || 'N/A'}
              </div>
            </div>

            {lacorn.trailerUrl && (
              <div className="trailer-section">
                <h3>Трейлер</h3>
                <div className="trailer-container">
                  <iframe
                    width="100%"
                    height="400"
                    src={lacorn.trailerUrl}
                    title={`Трейлер ${lacorn.title}`}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'episodes' && (
          <div className="episodes-content">
            <div className="episodes-list">
              {episodes.map(episode => (
                <div key={episode.id} className="episode-item">
                  <div className="episode-info">
                    <h4>
                      {episode.seasonNumber}x{episode.episodeNumber.toString().padStart(2, '0')} - {episode.title}
                    </h4>
                    <p>{episode.description}</p>
                    <div className="episode-meta">
                      <span>Длительность: {episode.duration} мин</span>
                      {episode.watched && <span className="watched">✓ Просмотрено</span>}
                    </div>
                  </div>
                  <button
                    className="watch-episode-button"
                    onClick={() => handleWatchEpisode(episode.id)}
                  >
                    Смотреть
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'actors' && (
          <div className="actors-content">
            <div className="actors-grid">
              {actors.map(actor => (
                <div key={actor.id} className="actor-card">
                  <div className="actor-photo">
                    <img
                      src={actor.photoUrl || '/images/default-avatar.jpg'}
                      alt={actor.name}
                    />
                  </div>
                  <div className="actor-info">
                    <h4>{actor.name}</h4>
                    {actor.nationality && (
                      <p className="actor-nationality">{actor.nationality}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LacornDetail;