import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { actorService } from '../../services/actors';
import { lacornService } from '../../services/lacorns';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ActorAvatar from '../common/ActorAvatar';
import './ActorPage.css';

const ActorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [actor, setActor] = useState(null);
    const [filmography, setFilmography] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        loadActorData();
    }, [id]);

    const loadActorData = async () => {
        try {
            setLoading(true);
            const actorData = await actorService.getActorById(id);
            setActor(actorData);

            // Загружаем фильмографию и сортируем по году (новые → старые)
            const actorFilms = await lacornService.getLacornsByActorId(id);
            const sortedFilms = actorFilms.sort((a, b) => {
                const yearA = parseInt(a.releaseYear) || 0;
                const yearB = parseInt(b.releaseYear) || 0;
                return yearB - yearA; // по убыванию
            });
            setFilmography(sortedFilms);

        } catch (err) {
            setError('Ошибка при загрузке данных актёра');
            console.error('Error loading actor data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToActors = () => {
        navigate('/actors');
    };

    const handleLacornClick = (lacornId) => {
        navigate(`/watch/${lacornId}`);
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

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
                <button onClick={() => navigate('/actors')} className="back-button">
                    ← Вернуться к списку
                </button>
            </div>
        );
    }

    const hasValidPhoto = actor.photoUrl &&
                         actor.photoUrl !== '/images/default-avatar.png' &&
                         !imageError;

    return (
        <div className="actor-detail">
            <button
                onClick={handleBackToActors}
                className="back-button"
                aria-label="Вернуться к списку актёров"
            >
                ← Назад к списку актёров
            </button>

            <div className="actor-header">
                <div className="actor-photo-large">
                    {hasValidPhoto ? (
                        <img
                            src={actor.photoUrl}
                            alt={actor.name}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <ActorAvatar name={actor.name} size="large" />
                    )}
                </div>

                <div className="actor-info">
                    <h1>{actor.name}</h1>
                    <div className="actor-meta">
                        {actor.birthDate && (
                            <span className="age">🎂 {calculateAge(actor.birthDate)} лет</span>
                        )}
                        <span className="nationality">🌍 {actor.nationality || 'N/A'}</span>
                        {actor.heightCm && (
                            <span className="height">📏 {actor.heightCm} см</span>
                        )}
                    </div>

                    {actor.characterName && (
                        <div className="actor-roles">
                            <span className="role-tag">Известен по роли: {actor.characterName}</span>
                        </div>
                    )}

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

            <div className="actor-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Обзор
                </button>
                <button
                    className={`tab ${activeTab === 'filmography' ? 'active' : ''}`}
                    onClick={() => setActiveTab('filmography')}
                >
                    Фильмография ({filmography.length})
                </button>
            </div>

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
                                <strong>Рост:</strong> {actor.heightCm ? `${actor.heightCm} см` : 'N/A'}
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
                    </div>
                )}

                {activeTab === 'filmography' && (
                    <div className="filmography-content">
                        <h3>Все лакорны с участием {actor.name}</h3>
                        {filmography.length > 0 ? (
                            <div className="filmography-grid">
                                {filmography.map(lacorn => (
                                    <div
                                        key={lacorn.id}
                                        className="filmography-card"
                                        onClick={() => handleLacornClick(lacorn.id)}
                                    >
                                        <div className="filmography-poster">
                                            <img
                                                src={lacorn.posterUrl || '/images/default-poster.webp'}
                                                alt={lacorn.title}
                                                onError={(e) => {
                                                    e.target.src = '/images/default-poster.webp';
                                                }}
                                            />
                                        </div>
                                        <div className="filmography-info">
                                            <h4>{lacorn.title}</h4>
                                            <p className="filmography-year">{lacorn.releaseYear}</p>
                                            <div className="filmography-meta">
                                                <span className="rating">⭐ {lacorn.rating || 'N/A'}</span>
                                                {lacorn.characterName && (
                                                    <span className="character">в роли: {lacorn.characterName}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-films">
                                <p>У этого актёра пока нет лакорнов в базе</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActorPage;