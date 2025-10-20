// Home.js - с функционалом модального окна меню
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedVoicecover, setSelectedVoicecover] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Только для отладки - удалите в продакшене
    console.log('Home component rendered, user:', user);
  }, [user]);

  const applyFilters = () => {
    console.log('Applying filters:', {
      searchQuery,
      selectedGenre,
      selectedYear,
      selectedStatus,
      selectedVoicecover
    });
    alert('Filters applied!');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedStatus('');
    setSelectedVoicecover('');
    console.log('Filters cleared');
  };

  // Функции для меню
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleMainPage = () => {
    closeMenu();
    window.scrollTo(0, 0);
  };

  const handleProfile = () => {
    closeMenu();
    console.log('Home.js: Profile button clicked, user:', user);

    if (user && user.id) {
      console.log('Home.js: User is authenticated, navigating to profile');
      navigate('/profile');
    } else {
      console.log('Home.js: User is NOT authenticated, navigating to login');
      navigate('/login', {
        state: {
          message: 'Please log in to access your profile',
          from: { pathname: '/profile' }
        }
      });
    }
  };

  const handleLeavePage = () => {
    // Здесь можно добавить логику для выхода или перехода на другую страницу
    alert('Leave page functionality would go here!');
    closeMenu();
  };

  const popularLacorns = [];

  const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi"];
  const years = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"];
  const statuses = ["Ongoing", "Completed", "Upcoming"];
  const voicecovers = ["Subbed", "Dubbed", "Raw"];

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="cat-help-section">
          <img
            src="/images/Space cat.png"
            alt="Space Cat"
            className="header-cat"
          />
          <div className="help-bubble">
            <p>Need help?</p>
            <p>Click <Link to="/help" className="help-link">here</Link> :3</p>
          </div>
        </div>
        <div className="site-title-section">
          <h1 className="main-title">Siam Lacorns</h1>
          <div className="divider-line"></div>
        </div>
        <button className="menu-button" onClick={toggleMenu}>
          <div className="menu-icon">
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </div>
          Menu
        </button>
      </header>

      <main className="home-main">
        <div className="search-section">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name"
            className="search-input"
          />
        </div>

        <div className="filters-section">
          <div className="filters-main-container">
            <button
              className="filter-button"
              onClick={applyFilters}
              title="Apply filters"
            >
              🔍
            </button>

            <div className="filter-group">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="filter-select"
              >
                <option value="">Genre</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="filter-select"
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={selectedVoicecover}
                onChange={(e) => setSelectedVoicecover(e.target.value)}
                className="filter-select"
              >
                <option value="">Voicecover</option>
                {voicecovers.map(voicecover => (
                  <option key={voicecover} value={voicecover}>{voicecover}</option>
                ))}
              </select>
            </div>

            <button
              className="filter-button"
              onClick={clearFilters}
              title="Clear filters"
            >
              🧹
            </button>
          </div>
        </div>

        <section className="popular-section">
          <h2 className="popular-title">Popular:</h2>
          <div className="lacorns-frame">
            <div className="lacorns-grid">
              {popularLacorns.map(lacorn => (
                <Link key={lacorn.id} to={`/lacorns/${lacorn.id}`} className="lacorn-item">
                  <div className="lacorn-poster">
                    <img
                      src={lacorn.posterUrl}
                      alt={lacorn.title}
                      onError={(e) => {
                        e.target.src = '/default-poster.jpg';
                      }}
                    />
                    <div className="lacorn-overlay">
                      <div className="lacorn-rating">⭐ {lacorn.rating}</div>
                    </div>
                  </div>
                  <h3 className="lacorn-title">{lacorn.title}</h3>
                  <p className="lacorn-year">{lacorn.year}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Модальное окно меню */}
      {isMenuOpen && (
        <div className="menu-modal-overlay" onClick={closeMenu}>
          <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="menu-modal-title">Menu</h2>

            <div className="menu-modal-content">
              {/* Первая колонка */}
              <div className="menu-modal-column">
                <button className="menu-modal-button" onClick={handleProfile}>
                  My profile
                </button>
                <button className="menu-modal-button">Favourites</button>
                <button className="menu-modal-button">Watch later</button>
              </div>

              {/* Вторая колонка */}
              <div className="menu-modal-column">
                <button className="menu-modal-button">Started</button>
                <button className="menu-modal-button">Forsaken</button>
                <button className="menu-modal-button" onClick={handleMainPage}>
                  Main page
                </button>
              </div>
            </div>

            <div className="menu-modal-footer">
              <button className="leave-page-button" onClick={handleLeavePage}>
                Leave page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;