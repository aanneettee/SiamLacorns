// CollectionPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collectionService } from '../../services/collections';
import { lacornService } from '../../services/lacorns';
import './CollectionPage.css';

const CollectionPage = ({ collectionType, collectionName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [collectionLacorns, setCollectionLacorns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const getIconPath = () => {
    const iconMap = {
      'favourites': '/images/icons/favourite.png',
      'watch-later': '/images/icons/watch-later.png',
      'started': '/images/icons/started.png',
      'forsaken': '/images/icons/forsaken.png'
    };
    return iconMap[collectionType] || '/images/icons/default.png';
  };

  const loadCollectionData = async () => {
    if (!user?.id || !token) {
      setLoading(false);
      return;
    }

    try {
      // Получаем коллекцию с сервера
      const collection = await collectionService.getCollection(
        user.id,
        collectionName,
        token
      );

      if (collection.seriesIds && collection.seriesIds.length > 0) {
        // Загружаем данные каждого сериала
        const lacornPromises = collection.seriesIds.map(seriesId =>
          lacornService.getLacornById(seriesId, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error(`Error loading lacorn ${seriesId}:`, err);
            return null;
          })
        );

        const lacornsData = await Promise.all(lacornPromises);
        const validLacorns = lacornsData.filter(lacorn => lacorn !== null);
        setCollectionLacorns(validLacorns);
      } else {
        setCollectionLacorns([]);
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      setCollectionLacorns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollectionData();
  }, [user, token, collectionName]);

  // Функция для удаления из коллекции
  const handleRemoveFromCollection = async (lacornId) => {
    if (!window.confirm(`Удалить из коллекции "${collectionName}"?`)) {
      return;
    }

    try {
      await collectionService.removeFromCollection(
        user.id,
        collectionName,
        lacornId,
        token
      );

      // Обновляем список
      setCollectionLacorns(prev => prev.filter(lacorn => lacorn.id !== lacornId));
      alert('Сериал удален из коллекции');
    } catch (error) {
      console.error('Error removing from collection:', error);
      alert('Ошибка при удалении из коллекции');
    }
  };

  // Функции меню (аналогичные Home.js)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleMainPage = () => {
    closeMenu();
    navigate('/');
  };

  const handleProfile = () => {
    closeMenu();
    if (user && user.id) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const handleLeavePage = () => {
    alert('Leave page functionality would go here!');
    closeMenu();
  };

  const handleCollectionClick = (type) => {
    closeMenu();
    navigate(`/collections/${type.toLowerCase().replace(' ', '-')}`);
  };

  return (
    <div className="collection-page">
      <header className="collection-header">
        <div className="cat-section">
          <img
            src="/images/Space cat.png"
            alt="Space Cat"
            className="header-cat"
          />
          <div className="cat-bubble">
            <p>You have good taste!</p>
          </div>
        </div>

        <div className="collection-title-section">
          <div className="title-with-icon">
            <div className="collection-icon" data-type={collectionType}>
              <img
                src={getIconPath()}
                alt={`${collectionName} icon`}
                className="png-icon"
              />
            </div>
            <h1 className="collection-title">{collectionName}</h1>
          </div>
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

      <main className="collection-main">
        <div className="collection-frame">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading collection...</p>
            </div>
          ) : (
            <div className="lacorns-grid">
              {collectionLacorns.map(lacorn => (
                <div key={lacorn.id} className="lacorn-item-wrapper">
                  <Link to={`/lacorns/${lacorn.id}`} className="lacorn-item">
                    <div className="lacorn-poster">
                      <img
                        src={lacorn.posterUrl || '/images/default-poster.jpg'}
                        alt={lacorn.title}
                        onError={(e) => {
                          e.target.src = '/images/default-poster.jpg';
                        }}
                      />
                      <div className="lacorn-overlay">
                        <div className="lacorn-rating">⭐ {lacorn.rating?.toFixed(1) || 'N/A'}</div>
                      </div>
                    </div>
                    <h3 className="lacorn-title">{lacorn.title}</h3>
                    <p className="lacorn-year">{lacorn.releaseYear}</p>
                  </Link>

                  {/* Кнопка удаления из коллекции */}
                  <button
                    className="remove-from-collection-btn"
                    onClick={() => handleRemoveFromCollection(lacorn.id)}
                    title={`Remove from ${collectionName}`}
                  >
                    ×
                  </button>
                </div>
              ))}

              {collectionLacorns.length === 0 && (
                <div className="empty-collection">
                  <p>No {collectionName.toLowerCase()} lacorns yet!</p>
                  <p>Start adding some from the main page.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Модальное окно меню с иконками */}
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
                <button
                  className="menu-modal-button"
                  onClick={() => handleCollectionClick('Favourites')}
                >
                  <img src="/images/icons/favourite.png" alt="Favourites" className="menu-modal-button-icon" />
                  Favourites
                </button>
                <button
                  className="menu-modal-button"
                  onClick={() => handleCollectionClick('Watch later')}
                >
                  <img src="/images/icons/watch-later.png" alt="Watch later" className="menu-modal-button-icon" />
                  Watch later
                </button>
              </div>

              <div className="menu-modal-column">
                <button
                  className="menu-modal-button"
                  onClick={() => handleCollectionClick('Started')}
                >
                  <img src="/images/icons/started.png" alt="Started" className="menu-modal-button-icon" />
                  Started
                </button>
                <button
                  className="menu-modal-button"
                  onClick={() => handleCollectionClick('Forsaken')}
                >
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

export default CollectionPage;