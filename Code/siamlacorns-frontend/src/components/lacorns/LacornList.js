// LacornList.js (обновлённая версия)
import React, { useState, useEffect } from 'react';
import { lacornService } from '../../services/lacorns';
import LacornCard from './LacornCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './LacornList.css';

const LacornList = () => {
  const [lacorns, setLacorns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const genres = [
    'Драма', 'Комедия', 'Боевик', 'Фэнтези', 'Научная фантастика',
    'Ужасы', 'Романтика', 'Детектив', 'Триллер', 'Приключения'
  ];

  useEffect(() => {
    loadLacorns();
  }, []);

  const loadLacorns = async () => {
    try {
      setLoading(true);
      const data = await lacornService.getAllLacorns();
      setLacorns(data.content || data);
    } catch (err) {
      setError('Ошибка при загрузке сериалов');
      console.error('Error loading lacorns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadLacorns();
      return;
    }

    try {
      setLoading(true);
      const data = await lacornService.searchLacorns(searchQuery);
      setLacorns(data.content || data);
    } catch (err) {
      setError('Ошибка при поиске');
      console.error('Error searching lacorns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = async (genre) => {
    setSelectedGenre(genre);
    try {
      setLoading(true);
      const data = await lacornService.getLacornsByGenre(genre);
      setLacorns(data);
    } catch (err) {
      setError('Ошибка при фильтрации по жанру');
      console.error('Error filtering by genre:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    loadLacorns();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" text="Загрузка сериалов..." />
      </div>
    );
  }

  return (
    <div className="lacorn-list-container">
      <div className="lacorn-list-header">
        <h1>Все сериалы</h1>

        {/* Поиск */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Поиск сериалов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>

        {/* Фильтры по жанрам */}
        <div className="genre-filters">
          <h3>Жанры:</h3>
          <div className="genre-buttons">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => handleGenreSelect(genre)}
                className={`genre-button ${selectedGenre === genre ? 'active' : ''}`}
              >
                {genre}
              </button>
            ))}
          </div>
          {(searchQuery || selectedGenre) && (
            <button onClick={clearFilters} className="clear-filters">
              Очистить фильтры
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadLacorns} className="retry-button">
            Попробовать снова
          </button>
        </div>
      )}

      <div className="lacorn-grid">
        {lacorns && lacorns.length > 0 ? (
          lacorns.map(lacorn => (
            <LacornCard key={lacorn.id} lacorn={lacorn} />
          ))
        ) : (
          <div className="no-results">
            <h3>Сериалы не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LacornList;