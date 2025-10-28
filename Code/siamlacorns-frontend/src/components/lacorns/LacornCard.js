// LacornCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LacornCard.css';

const LacornCard = ({ lacorn }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/watch/${lacorn.id}`);
  };

  const handleWatchClick = (e) => {
    e.stopPropagation();
    navigate(`/watch/${lacorn.id}`);
  };

  return (
    <div className="lacorn-card" onClick={handleCardClick}>
      <div className="lacorn-card-image">
        <img
          src={lacorn.posterUrl || '/images/default-poster.jpg'}
          alt={lacorn.title}
          onError={(e) => {
            e.target.src = '/images/default-poster.jpg';
          }}
        />
        <div className="lacorn-card-overlay">
          <button
            className="watch-button"
            onClick={handleWatchClick}
          >
            Смотреть
          </button>
        </div>
      </div>

      <div className="lacorn-card-content">
        <h3 className="lacorn-card-title">{lacorn.title}</h3>
        {/* Убрано отображение года */}
        <div className="lacorn-card-genres">
          {lacorn.genres && lacorn.genres.slice(0, 3).map((genre, index) => (
            <span key={index} className="genre-tag">{genre}</span>
          ))}
        </div>
        <div className="lacorn-card-rating">
          ⭐ {lacorn.rating || 'N/A'}
        </div>
        {lacorn.watchProgress && (
          <div className="lacorn-card-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(lacorn.watchProgress.currentTime / (lacorn.episodeDuration * 60)) * 100}%` }}
              ></div>
            </div>
            <span>В процессе</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LacornCard;