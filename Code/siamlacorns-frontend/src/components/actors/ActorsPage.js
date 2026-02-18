import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { actorService } from '../../services/actors';
import ActorCard from './ActorCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './ActorsPage.css';

const ActorsPage = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActors, setFilteredActors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadActors();
  }, []);

  useEffect(() => {
    // Фильтрация актёров при изменении поискового запроса
    if (searchQuery.trim() === '') {
      setFilteredActors(actors);
    } else {
      const filtered = actors.filter(actor =>
        actor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActors(filtered);
    }
  }, [searchQuery, actors]);

  const loadActors = async () => {
    try {
      setLoading(true);
      const data = await actorService.getAllActors();
      setActors(data);
      setFilteredActors(data);
    } catch (err) {
      setError('Ошибка при загрузке списка актёров');
      console.error('Error loading actors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActorClick = (actorId) => {
    navigate(`/actors/${actorId}`); // было /actor/, стало /actors/
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Поиск уже применяется через useEffect
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" text="Загрузка списка актёров..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <button onClick={handleBackToHome} className="back-button">
          ← Вернуться на главную
        </button>
      </div>
    );
  }

  return (
    <div className="actors-page">
      <div className="actors-header">
        <button
          onClick={handleBackToHome}
          className="back-button"
          aria-label="Вернуться на главную"
        >
          ← На главную
        </button>
        <h1>Каталог актёров</h1>
      </div>

      <div className="actors-search-section">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          placeholder="Поиск актёров по имени..."
          className="actors-search-input"
        />
      </div>

      {filteredActors.length === 0 ? (
        <div className="empty-state">
          <p>Актёры не найдены</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="retry-button"
            >
              Сбросить поиск
            </button>
          )}
        </div>
      ) : (
        <div className="actors-grid">
          {filteredActors.map((actor) => (
            <div
              key={actor.id}
              className="actor-card-wrapper"
              onClick={() => handleActorClick(actor.id)}
            >
              <ActorCard actor={actor} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActorsPage;