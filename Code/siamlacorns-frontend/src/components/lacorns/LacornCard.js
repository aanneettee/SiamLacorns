import React from 'react';
import { Link } from 'react-router-dom';
import './LacornCard.css';

const LacornCard = ({ lacorn }) => {
  const progress = lacorn.watchProgress;

  return (
    <div className="lacorn-card">
      <Link to={`/lacorns/${lacorn.id}`}>
        <div className="card-image">
          <img src={lacorn.posterUrl || '/default-poster.jpg'} alt={lacorn.title} />
          {progress && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress.isCompleted ? 100 : 50}%` }}
              />
            </div>
          )}
        </div>

        <div className="card-content">
          <h3>{lacorn.title}</h3>
          <p className="year">{lacorn.releaseYear}</p>
          <p className="genres">{lacorn.genres?.join(', ')}</p>
          <div className="rating">
            ⭐ {lacorn.rating || 'Нет оценок'}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default LacornCard;