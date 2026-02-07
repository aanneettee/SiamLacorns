// components/lacorns/ActorCard.js
import React from 'react';
import './ActorCard.css';

const ActorCard = ({ actor }) => {
  return (
    <div className="actor-card">
      <div className="actor-photo">
        <img
          src={actor.photoUrl || '/images/default-avatar.jpg'}
          alt={actor.name}
          onError={(e) => {
            e.target.src = '/images/default-avatar.jpg';
          }}
        />
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