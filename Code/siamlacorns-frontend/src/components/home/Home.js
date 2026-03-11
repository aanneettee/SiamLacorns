// Home.js - с новыми улучшениями UX
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../../context/AuthContext';
import { lacornService } from '../../services/lacorns';
import OnboardingTour from '../onboarding/OnboardingTour';
import SmartSearch from '../search/SmartSearch';
import SmartCat from '../common/SmartCat';

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
    const [isFirstVisit, setIsFirstVisit] = useState(() => {
        return !localStorage.getItem('hasVisitedBefore');
    });
    const [catMood, setCatMood] = useState('neutral');
    const [catMessage, setCatMessage] = useState('Привет! Я космический кот!');

    const { user, token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Загрузка популярных лакорнов при монтировании компонента
        fetchPopularLacorns();
    }, []);

    // Обновление настроения кота в зависимости от действий
    useEffect(() => {
        if (loading) {
            setCatMood('thinking');
            setCatMessage('Ищу для тебя лучшие лакорны...');
        } else if (error) {
            setCatMood('sad');
            setCatMessage('Ой! Что-то пошло не так...');
        } else if (filteredLacorns.length === 0) {
            setCatMood('sad');
            setCatMessage('Ничего не нашлось... Попробуй изменить поиск!');
        } else {
            setCatMood('happy');
            setCatMessage(`Нашел ${filteredLacorns.length} лакорнов! Отличный выбор!`);
        }
    }, [loading, error, filteredLacorns]);

    // Функция для загрузки популярных лакорнов
    const fetchPopularLacorns = async () => {
        try {
            setLoading(true);
            setError(null);
            setCatMood('thinking');
            setCatMessage('Загружаю популярные лакорны...');

            const lacornsData = await lacornService.getPopularLacorns(0, 20, token, user?.id);

            setPopularLacorns(lacornsData);
            setFilteredLacorns(lacornsData);

            setCatMood('happy');
            setCatMessage(`Ура! Загружено ${lacornsData.length} популярных лакорнов!`);

        } catch (err) {
            console.error('Error loading popular lacorns:', err);
            setError(err.response?.data?.message || 'Failed to load lacorns');
            setCatMood('sad');
            setCatMessage('Не удалось загрузить лакорны... Попробуй еще раз!');
        } finally {
            setLoading(false);
        }
    };

    // Функция поиска по имени
    const handleSearch = (query) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setFilteredLacorns(popularLacorns);
            setSearchApplied(false);
            setFiltersApplied(false);
            setCatMood('happy');
            setCatMessage('Показываю все популярные лакорны!');
            return;
        }

        const searchResults = popularLacorns.filter(lacorn =>
            lacorn.title?.toLowerCase().includes(query.toLowerCase())
        );

        setFilteredLacorns(searchResults);
        setSearchApplied(true);
        setFiltersApplied(false);

        if (searchResults.length === 0) {
            setCatMood('sad');
            setCatMessage(`Ничего не нашел по запросу "${query}"...`);
        } else {
            setCatMood('happy');
            setCatMessage(`Нашел ${searchResults.length} лакорнов по запросу "${query}"!`);
        }
    };

    // Функция применения фильтров
    const applyFilters = () => {
        if (!searchQuery && !selectedGenre && !selectedYear && !selectedStatus && !selectedVoicecover) {
            setFilteredLacorns(popularLacorns);
            setFiltersApplied(false);
            setSearchApplied(false);
            setCatMood('happy');
            setCatMessage('Показываю все популярные лакорны!');
            return;
        }

        const filtered = popularLacorns.filter(lacorn => {
            const matchesSearch = !searchQuery ||
                lacorn.title?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesGenre = !selectedGenre ||
                (lacorn.genres && lacorn.genres.some(genre =>
                    genre.toLowerCase() === selectedGenre.toLowerCase()
                ));

            const matchesYear = !selectedYear ||
                lacorn.releaseYear?.toString() === selectedYear;

            const matchesStatus = !selectedStatus ||
                lacorn.status?.toLowerCase() === selectedStatus.toLowerCase();

            const matchesVoicecover = !selectedVoicecover ||
                (lacorn.availableVoiceovers && lacorn.availableVoiceovers.some(voiceover =>
                    voiceover.toLowerCase().includes(selectedVoicecover.toLowerCase())
                ));

            return matchesSearch && matchesGenre && matchesYear && matchesStatus && matchesVoicecover;
        });

        setFilteredLacorns(filtered);
        setFiltersApplied(true);
        setSearchApplied(false);

        if (filtered.length === 0) {
            setCatMood('sad');
            setCatMessage('По таким фильтрам ничего не нашлось...');
        } else {
            setCatMood('happy');
            setCatMessage(`Нашел ${filtered.length} лакорнов по фильтрам!`);
        }
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
        setCatMood('happy');
        setCatMessage('Фильтры сброшены! Смотри все лакорны!');
    };

    // Функция для возврата ко всем лакорнам
    const showAllLacorns = () => {
        setFilteredLacorns(popularLacorns);
        setFiltersApplied(false);
        setSearchApplied(false);
        setSearchQuery('');
        setCatMood('happy');
        setCatMessage('Показываю все популярные лакорны!');
    };

    // Обработчик завершения онбординга
    const handleOnboardingComplete = () => {
        localStorage.setItem('hasVisitedBefore', 'true');
        setIsFirstVisit(false);
        setCatMood('happy');
        setCatMessage('Отлично! Теперь ты знаешь все фишки!');
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
        fetchPopularLacorns();
        setCatMood('happy');
        setCatMessage('С возвращением на главную!');
    };

    const handleProfile = () => {
        closeMenu();
        if (user && user.id) {
            navigate('/profile');
            setCatMood('happy');
            setCatMessage('Заглянем в твой профиль!');
        } else {
            navigate('/login', {
                state: {
                    message: 'Please log in to access your profile',
                    from: { pathname: '/profile' }
                }
            });
            setCatMood('thinking');
            setCatMessage('Сначала нужно войти в аккаунт!');
        }
    };

    const handleLeavePage = () => {
        if (window.confirm('Точно хочешь выйти?')) {
            localStorage.removeItem('token');
            navigate('/login');
            setCatMood('sad');
            setCatMessage('До встречи! Возвращайся скорее!');
        }
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
                    <div className="loading-spinner"></div>
                    <p>Загружаю лакорны...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="error-state">
                    <p>😿 {error}</p>
                    <button
                        onClick={fetchPopularLacorns}
                        className="retry-button"
                    >
                        Попробовать снова
                    </button>
                </div>
            );
        }

        if (searchApplied && filteredLacorns.length === 0) {
            return (
                <div className="empty-state">
                    <p>😕 По вашему запросу "{searchQuery}" ничего не найдено</p>
                    <button
                        onClick={showAllLacorns}
                        className="retry-button"
                    >
                        Показать все лакорны
                    </button>
                </div>
            );
        }

        if (filtersApplied && filteredLacorns.length === 0) {
            return (
                <div className="empty-state">
                    <p>😕 По вашему запросу ничего не найдено</p>
                    <button
                        onClick={clearFilters}
                        className="retry-button"
                    >
                        Сбросить фильтры
                    </button>
                </div>
            );
        }

        const lacornsToDisplay = (filtersApplied || searchApplied) ? filteredLacorns : popularLacorns;

        if (lacornsToDisplay.length === 0) {
            return (
                <div className="empty-state">
                    <p>😿 Пока нет лакорнов</p>
                    <button
                        onClick={fetchPopularLacorns}
                        className="retry-button"
                    >
                        Обновить
                    </button>
                </div>
            );
        }

        return (
            <div className="lacorns-grid">
                {lacornsToDisplay.map((lacorn, index) => (
                    <div
                        key={lacorn.id}
                        className="lacorn-item"
                        onClick={() => {
                            navigate(`/watch/${lacorn.id}`);
                            setCatMood('happy');
                            setCatMessage(`Смотрим ${lacorn.title}! Отличный выбор!`);
                        }}
                        style={{ cursor: 'pointer', animation: `fadeInUp 0.5s ease ${index * 0.05}s both` }}
                    >
                        <div className="lacorn-poster">
                            <img
                                src={lacorn.posterUrl || '/images/default-poster.webp'}
                                alt={lacorn.title}
                                onError={(e) => {
                                    e.target.src = '/images/default-poster.webp';
                                }}
                            />
                            <div className="lacorn-overlay">
                                <div className="lacorn-rating">
                                    ⭐ {lacorn.rating ? lacorn.rating.toFixed(1) : 'N/A'}
                                </div>
                            </div>
                        </div>
                        <h3 className="lacorn-title">{lacorn.title}</h3>
                        <p className="lacorn-year">{lacorn.releaseYear}</p>
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
            return 'Результаты фильтрации:';
        } else {
            return 'Популярные лакорны:';
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
                        onClick={() => {
                            setCatMood('surprised');
                            setCatMessage('Мяу! Не щекочи!');
                            setTimeout(() => setCatMood('happy'), 2000);
                        }}
                    />
                    <div className="help-bubble">
                        <p>Нужна помощь?</p>
                        <p>Нажми <Link to="/help" className="help-link">сюда</Link> :3</p>
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
                    Меню
                </button>
            </header>

            <main className="home-main">
                <div className="search-section">
                    <SmartSearch
                        onSearch={handleSearch}
                        placeholder="Поиск лакорнов по названию..."
                    />
                </div>

                <div className="filters-section">
                    <div className="filters-main-container">
                        <button
                            className="filter-button"
                            onClick={applyFilters}
                            title="Применить фильтры"
                        >
                            🔍
                        </button>

                        <div className="filter-group">
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Жанр</option>
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
                                <option value="">Год</option>
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
                                <option value="">Статус</option>
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
                                <option value="">Озвучка</option>
                                {voicecovers.map(voicecover => (
                                    <option key={voicecover} value={voicecover}>{voicecover}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="filter-button"
                            onClick={clearFilters}
                            title="Сбросить фильтры"
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
                        <h2 className="menu-modal-title">Меню</h2>
                        <div className="menu-modal-content">
                            <div className="menu-modal-column">
                                <button className="menu-modal-button" onClick={handleProfile}>
                                    <img src="/images/icons/my-profile.png" alt="Profile" className="menu-modal-button-icon" />
                                    Мой профиль
                                </button>
                                <button className="menu-modal-button" onClick={() => {
                                    closeMenu();
                                    navigate('/actors');
                                    setCatMood('happy');
                                    setCatMessage('Смотрим актёров!');
                                }}>
                                    <img src="/images/icons/actors.png" alt="Actors" className="menu-modal-button-icon" />
                                    Актёры
                                </button>
                                <button className="menu-modal-button" onClick={() => {
                                    closeMenu();
                                    navigate('/collections/favourites');
                                    setCatMood('happy');
                                    setCatMessage('Твоё избранное!');
                                }}>
                                    <img src="/images/icons/favourite.png" alt="Favourites" className="menu-modal-button-icon" />
                                    Избранное
                                </button>
                                <button className="menu-modal-button" onClick={() => {
                                    closeMenu();
                                    navigate('/collections/watch-later');
                                    setCatMood('thinking');
                                    setCatMessage('Что посмотрим позже?');
                                }}>
                                    <img src="/images/icons/watch-later.png" alt="Watch later" className="menu-modal-button-icon" />
                                    Посмотреть позже
                                </button>
                            </div>
                            <div className="menu-modal-column">
                                <button className="menu-modal-button" onClick={() => {
                                    closeMenu();
                                    navigate('/collections/started');
                                    setCatMood('happy');
                                    setCatMessage('Продолжаем просмотр!');
                                }}>
                                    <img src="/images/icons/started.png" alt="Started" className="menu-modal-button-icon" />
                                    Начатое
                                </button>
                                <button className="menu-modal-button" onClick={() => {
                                    closeMenu();
                                    navigate('/collections/forsaken');
                                    setCatMood('sad');
                                    setCatMessage('Может вернёшься к ним?');
                                }}>
                                    <img src="/images/icons/forsaken.png" alt="Forsaken" className="menu-modal-button-icon" />
                                    Брошенное
                                </button>
                                <button className="menu-modal-button" onClick={handleMainPage}>
                                    <img src="/images/icons/main-page.png" alt="Main page" className="menu-modal-button-icon" />
                                    Главная
                                </button>
                            </div>
                        </div>

                        <div className="menu-modal-footer">
                            <button className="leave-page-button" onClick={handleLeavePage}>
                                <img src="/images/icons/leave-page.png" alt="Leave page" className="menu-modal-button-icon" />
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Онбординг для новых пользователей */}
            <OnboardingTour
                isFirstVisit={isFirstVisit}
                onComplete={handleOnboardingComplete}
            />

            {/* Умный кот-помощник */}
            <SmartCat
                mood={catMood}
                message={catMessage}
                position="bottom-left"
            />

            {/* Добавляем анимацию появления для карточек */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;