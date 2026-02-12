// ActorPage.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { actorService } from '../../services/actors';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import './ActorPage.css';

const ActorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [actor, setActor] = useState(null);
    // const [lacorns, setLacorns] = useState([]);
    // const [filmography, setFilmography] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadActorData();
    }, [id]);

    const loadActorData = async () => {
        try {
            setLoading(true);
            const [actorData/* , lacornsData, filmographyData */] = await Promise.all([
                actorService.getActorById(id),
                // actorService.getLacorns(id),
                // actorService.getFilmography(id)
            ]);

            setActor(actorData);
            // setLacorns(lacornsData);
            // setFilmography(filmographyData);
        } catch (err) {
            setError('Ошибка при загрузке данных актёра');
            console.error('Error loading actor data:', err);
        } finally {
            setLoading(false);
        }
    };

    //  ФУНКЦИЯ ДЛЯ ВОЗВРАТА К СПИСКУ АКТЁРОВ
    const handleBackToActors = () => {
        navigate('/lacorns'); // Возврат к каталогу
    };

    // const handleLacornClick = (lacornId) => {
    //   navigate(`/lacorn/${lacornId}`);
    // };

    if (loading) {
        return (
            <div className="loading-container">
                <LoadingSpinner size="large" text="Загрузка информации об актёре..." />
            </div>
        );
    }

    if (error || !actor) {
        return (
            <div className="error-container">
                <h2>{error || 'Актёр не найден'}</h2>
                <button onClick={() => navigate('/lacorns')} className="back-button">
                    ← Вернуться к списку
                </button>
            </div>
        );
    }

    return (
        <div className="actor-detail">
            {/*  КНОПКА ВОЗВРАТА К СПИСКУ АКТЁРОВ */}
            <button
                onClick={handleBackToActors}
                className="back-button"
                aria-label="Вернуться к списку актёров"
            >
                ← Назад к списку актёров
            </button>

            {/* Хедер с фото и основной информацией */}
            <div className="actor-header">
                <div className="actor-photo-large">
                    <img
                        src={actor.photoUrl || '/images/default-avatar.png'}
                        alt={actor.name}
                        onError={(e) => {
                            e.target.src = '/images/default-avatar.png';
                        }}
                    />
                </div>

                <div className="actor-info">
                    <h1>{actor.name}</h1>
                    <div className="actor-meta">
                        <span className="age">🎂 {Math.floor((Date.now() - new Date(actor.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} лет</span>
                        <span className="nationality">🌍 {actor.nationality || 'N/A'}</span>
                        <span className="height">📏 {actor.heightCm}</span>
                    </div>

                    <div className="actor-roles">
                        {actor.characterName && [actor.characterName].map((role, index) => (
                            <span key={index} className="role-tag">{role}</span>
                        ))}
                    </div>

                    <div className="actor-actions">
                        <button
                            className="share-button"
                            onClick={() => navigator.clipboard.writeText(window.location.href)}
                        >
                            🔗 Поделиться
                        </button>
                    </div>
                </div>
            </div>

            {/* Табы с дополнительной информацией */}
            <div className="actor-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Обзор
                </button>

                {/*<button
          className={`tab ${activeTab === 'lacorns' ? 'active' : ''}`}
          onClick={() => setActiveTab('lacorns')}
        >
          Сериалы ({lacorns.length})
        </button>

        <button
          className={`tab ${activeTab === 'filmography' ? 'active' : ''}`}
          onClick={() => setActiveTab('filmography')}
        >
          Фильмография ({filmography.length})
        </button>*/}
            </div>

            {/* Контент табов */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div className="overview-content">
                        <div className="details-grid">
                            <div className="detail-item">
                                <strong>Полное имя:</strong> {actor.name}
                            </div>
                            <div className="detail-item">
                                <strong>Дата рождения:</strong> {actor.birthDate || 'N/A'}
                            </div>
                            <div className="detail-item">
                                <strong>Национальность:</strong> {actor.nationality || 'N/A'}
                            </div>
                            <div className="detail-item">
                                <strong>Рост:</strong> {actor.heightCm || 'N/A'}
                            </div>
                        </div>

                        {actor.biography && (
                            <div className="bio-section">
                                <h3>Биография</h3>
                                <p className="bio-container">
                                    {actor.biography}
                                </p>
                            </div>
                        )}

                        {actor.awards && actor.awards.length > 0 && (
                            <div className="awards-section">
                                <h3>Награды и номинации</h3>
                                <ul className="awards-list">
                                    {actor.awards.map((award, index) => (
                                        <li key={index} className="award-item">
                                            <span className="award-year">{award.year}</span>
                                            <span className="award-title">{award.title}</span>
                                            <span className="award-category">{award.category}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {actor.socialLinks && (
                            <div className="social-section">
                                <h3>Социальные сети</h3>
                                <div className="social-links">
                                    {actor.socialLinks.instagram && (
                                        <a href={actor.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                                            Instagram
                                        </a>
                                    )}
                                    {actor.socialLinks.twitter && (
                                        <a href={actor.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                                            Twitter
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* activeTab === 'lacorns' && (
          <div className="lacorns-content">
            <div className="lacorns-grid">
              {lacorns.map(lacorn => (
                <div
                  key={lacorn.id}
                  className="lacorn-card"
                  onClick={() => handleLacornClick(lacorn.id)}
                >
                  <div className="lacorn-poster-small">
                    <img
                      src={lacorn.posterUrl || '/images/default-poster.webp'}
                      alt={lacorn.title}
                    />
                  </div>
                  <div className="lacorn-card-info">
                    <h4>{lacorn.title}</h4>
                    <p className="character-name">Роль: {lacorn.characterName}</p>
                    <div className="lacorn-card-meta">
                      <span className="year">{lacorn.releaseYear}</span>
                      <span className="rating">⭐ {lacorn.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) */}

                {/* activeTab === 'filmography' && (
          <div className="filmography-content">
            <div className="filmography-list">
              {filmography.map((work, index) => (
                <div key={index} className="filmography-item">
                  <div className="filmography-year">{work.year}</div>
                  <div className="filmography-info">
                    <h4>{work.title}</h4>
                    <p className="filmography-role">{work.role}</p>
                    <p className="filmography-type">{work.type === 'movie' ? 'Фильм' : 'Сериал'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) */}
            </div>
        </div>
    );
};

export default ActorPage;