// Home.js - с функциональностью фильтрации и поиска по имени
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { lacornService } from '../../services/lacorns';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedVoicecover, setSelectedVoicecover] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [popularLacorns, setPopularLacorns] = useState([]);
  const [filteredLacorns, setFilteredLacorns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [searchApplied, setSearchApplied] = useState(false);

  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Загрузка популярных лакорнов при монтировании компонента
    fetchPopularLacorns();
  }, []);

  // Функция для загрузки популярных лакорнов
  const fetchPopularLacorns = async () => {
    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(user?.id && { 'X-User-Id': user.id.toString() })
        }
      };

      // ИСПОЛЬЗУЙТЕ сервис вместо прямого axios
      const lacornsData = await lacornService.getPopularLacorns(0, 20, token, user?.id);

      // Обработка данных...
      setPopularLacorns(lacornsData);
      setFilteredLacorns(lacornsData);

    } catch (err) {
      console.error('Error loading popular lacorns:', err);
      setError(err.response?.data?.message || 'Failed to load lacorns');
    } finally {
      setLoading(false);
    }
  };

  // Функция поиска по имени (вызывается при нажатии Enter)
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // Если поисковый запрос пустой, показываем все лакорны
      setFilteredLacorns(popularLacorns);
      setSearchApplied(false);
      setFiltersApplied(false);
      return;
    }

    const searchResults = popularLacorns.filter(lacorn =>
      lacorn.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredLacorns(searchResults);
    setSearchApplied(true);
    setFiltersApplied(false); // Сбрасываем флаг фильтров при поиске
  };

  // Обработчик нажатия клавиши в поле поиска
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Функция применения фильтров
  const applyFilters = () => {
    if (!searchQuery && !selectedGenre && !selectedYear && !selectedStatus && !selectedVoicecover) {
      // Если фильтры не выбраны, показываем все лакорны
      setFilteredLacorns(popularLacorns);
      setFiltersApplied(false);
      setSearchApplied(false);
      return;
    }

    const filtered = popularLacorns.filter(lacorn => {
      // Проверка поискового запроса
      const matchesSearch = !searchQuery ||
        lacorn.title?.toLowerCase().includes(searchQuery.toLowerCase());

      // Проверка жанра (хотя бы один жанр должен совпадать)
      const matchesGenre = !selectedGenre ||
        (lacorn.genres && lacorn.genres.some(genre =>
          genre.toLowerCase() === selectedGenre.toLowerCase()
        ));

      // Проверка года
      const matchesYear = !selectedYear ||
        lacorn.releaseYear?.toString() === selectedYear;

      // Проверка статуса
      const matchesStatus = !selectedStatus ||
        lacorn.status?.toLowerCase() === selectedStatus.toLowerCase();

      // Проверка озвучки
      const matchesVoicecover = !selectedVoicecover ||
        (lacorn.availableVoiceovers && lacorn.availableVoiceovers.some(voiceover =>
          voiceover.toLowerCase().includes(selectedVoicecover.toLowerCase())
        ));

      // Возвращаем true только если все примененные фильтры совпадают
      return matchesSearch && matchesGenre && matchesYear && matchesStatus && matchesVoicecover;
    });

    setFilteredLacorns(filtered);
    setFiltersApplied(true);
    setSearchApplied(false); // Сбрасываем флаг поиска при применении фильтров
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedStatus('');
    setSelectedVoicecover('');
    setFilteredLacorns(popularLacorns);
    setFiltersApplied(false);
    setSearchApplied(false);
    console.log('Filters cleared');
  };

  // Функция для возврата ко всем лакорнам
  const showAllLacorns = () => {
    setFilteredLacorns(popularLacorns);
    setFiltersApplied(false);
    setSearchApplied(false);
    setSearchQuery('');
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
    // Перезагружаем данные при возврате на главную
    fetchPopularLacorns();
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

  const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi"];
  const years = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"];
  const statuses = ["Ongoing", "Completed", "Upcoming"];
  const voicecovers = ["Subbed", "Dubbed", "Raw", "None"];

  // Функция для отображения контента
  const renderLacornsContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <p>Loading popular lacorns...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <p>{error}</p>
          <button
            onClick={fetchPopularLacorns}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      );
    }

    // Проверка на пустой результат поиска
    if (searchApplied && filteredLacorns.length === 0) {
      return (
        <div className="empty-state">
          <p>По вашему запросу "{searchQuery}" ничего не найдено</p>
          <button
            onClick={showAllLacorns}
            className="retry-button"
          >
            Показать все лакорны
          </button>
        </div>
      );
    }

    // Проверка на пустой результат фильтрации
    if (filtersApplied && filteredLacorns.length === 0) {
      return (
        <div className="empty-state">
          <p>По вашему запросу ничего не найдено</p>
          <button
            onClick={clearFilters}
            className="retry-button"
          >
            Показать все лакорны
          </button>
        </div>
      );
    }

    const lacornsToDisplay = (filtersApplied || searchApplied) ? filteredLacorns : popularLacorns;

    if (lacornsToDisplay.length === 0) {
      return (
        <div className="empty-state">
          <p>No popular lacorns found.</p>
          <button
            onClick={fetchPopularLacorns}
            className="retry-button"
          >
            Refresh
          </button>
        </div>
      );
    }

   return (
     <div className="lacorns-grid">
       {lacornsToDisplay.map(lacorn => (
         <div
           key={lacorn.id}
           className="lacorn-item"
           onClick={() => navigate(`/watch/${lacorn.id}`)}
           style={{cursor: 'pointer'}}
         >
           <div className="lacorn-poster">
             <img
               src={lacorn.posterUrl || '/images/default-poster.jpg'}
               alt={lacorn.title}
               onError={(e) => {
                 e.target.src = '/images/default-poster.jpg';
               }}
             />
             <div className="lacorn-overlay">
               <div className="lacorn-rating">
                 ⭐ {lacorn.rating ? lacorn.rating.toFixed(1) : 'N/A'}
               </div>
             </div>
           </div>
           <h3 className="lacorn-title">{lacorn.title}</h3>
         </div>
       ))}
     </div>
   );
  };

  // Функция для отображения заголовка
  const getSectionTitle = () => {
    if (searchApplied) {
      return `Результаты поиска по "${searchQuery}":`;
    } else if (filtersApplied) {
      return 'Результаты поиска:';
    } else {
      return 'Popular:';
    }
  };

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
            onKeyPress={handleKeyPress}
            placeholder="Search by name (press Enter to search)"
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
          <h2 className="popular-title">
            {getSectionTitle()}
          </h2>
          <div className="lacorns-frame">
            {renderLacornsContent()}
          </div>
        </section>
      </main>

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

export default Home;