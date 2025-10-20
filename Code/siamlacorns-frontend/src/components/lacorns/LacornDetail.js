import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import EpisodePlayer from './EpisodePlayer';
import { lacornService } from '../../services/lacorns';
import { useAuth } from '../../context/AuthContext';
import './LacornDetail.css';

const LacornDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  const { data: lacorn, isLoading, error } = useQuery(
    ['lacorn', id, user?.id],
    () => lacornService.getLacornById(id, user?.id)
  );

  const handleEpisodeSelect = (episode) => {
    setSelectedEpisode(episode);
  };

  if (isLoading) return <div className="loading">Загрузка сериала...</div>;
  if (error) return <div className="error">Ошибка загрузки сериала</div>;
  if (!lacorn) return <div>Сериал не найден</div>;

  return (
    <div className="lacorn-detail">
      {selectedEpisode ? (
        <EpisodePlayer
          episode={selectedEpisode}
          lacorn={lacorn}
          onBack={() => setSelectedEpisode(null)}
        />
      ) : (
        <>
          <div className="lacorn-header">
            <img
              src={lacorn.posterUrl || '/default-poster.jpg'}
              alt={lacorn.title}
              className="poster"
            />
            <div className="lacorn-info">
              <h1>{lacorn.title}</h1>
              <p className="description">{lacorn.description}</p>
              <div className="meta-info">
                <span>Год: {lacorn.releaseYear}</span>
                <span>Эпизоды: {lacorn.totalEpisodes}</span>
                <span>Длительность: {lacorn.episodeDuration} мин</span>
                <span>Рейтинг: {lacorn.ageRating}</span>
              </div>
              <div className="genres">
                {lacorn.genres?.map(genre => (
                  <span key={genre} className="genre-tag">{genre}</span>
                ))}
              </div>
              <div className="rating">
                ⭐ {lacorn.rating || 'Нет оценок'}
              </div>
            </div>
          </div>

          <div className="episodes-section">
            <h2>Эпизоды</h2>
            <div className="episodes-list">
              {lacorn.episodes?.map(episode => (
                <div
                  key={episode.id}
                  className={`episode-card ${episode.watched ? 'watched' : ''}`}
                  onClick={() => handleEpisodeSelect(episode)}
                >
                  <div className="episode-number">
                    S{episode.seasonNumber}E{episode.episodeNumber}
                  </div>
                  <div className="episode-info">
                    <h4>{episode.title}</h4>
                    <p>{episode.description}</p>
                    <span className="duration">{episode.duration} мин</span>
                    {episode.watched && <span className="watched-badge">Просмотрено</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LacornDetail;