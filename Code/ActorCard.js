import React, { useState } from 'react';
import ActorAvatar from '../common/ActorAvatar';
import './ActorCard.css';

const ActorCard = ({ actor }) => {
  const [imageError, setImageError] = useState(false);
  const hasPhoto = actor.photoUrl && actor.photoUrl !== '/images/default-avatar.png' && !imageError;

  return (
    <div className="actor-card">
      <div className="actor-photo">
        {hasPhoto ? (
          <img
            src={actor.photoUrl}
            alt={actor.name}
            onError={() => setImageError(true)}
          />
        ) : (
          <ActorAvatar name={actor.name} size="small" />
        )}
      </div>
      <div className="actor-info">
        <h4 className="actor-name">{actor.name}</h4>
        {actor.nationality && (
          <p className="actor-nationality">{actor.nationality}</p>
        )}
        {actor.biography && (
          <p className="actor-bio">{actor.biography.substring(0, 100)}...</p>
        )}
      </div>
    </div>
  );
};

export default ActorCard;