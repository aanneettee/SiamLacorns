// CollectionPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CollectionPage.css';

const CollectionPage = ({ collectionType, collectionName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
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

  // Временные данные - позже замените на данные из бэкенда
  const collectionLacorns = [];

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
          <div className="lacorns-grid">
            {collectionLacorns.map(lacorn => (
              <Link key={lacorn.id} to={`/lacorns/${lacorn.id}`} className="lacorn-item">
                <div className="lacorn-poster">
                  <img
                    src={lacorn.posterUrl}
                    alt={lacorn.title}
                    onError={(e) => {
                      e.target.src = '/default-poster.webp';
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

            {collectionLacorns.length === 0 && (
              <div className="empty-collection">
                <p>No {collectionName.toLowerCase()} lacorns yet!</p>
                <p>Start adding some from the main page.</p>
              </div>
            )}
          </div>
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