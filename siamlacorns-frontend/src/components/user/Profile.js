// Profile.js - исправленная версия
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';
import tmdbService from '../../services/tmdbService';

const Profile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [lacorns, setLacorns] = useState([]);
  const [newLacorn, setNewLacorn] = useState({
    title: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    totalEpisodes: 1,
    episodeDuration: 45,
    posterUrl: '',
    trailerUrl: '',
    genres: [],
    ageRating: 'PG-13',
    rating: 0.0,
    status: 'ONGOING',
    availableVoiceovers: []
  });
  const [editingLacorn, setEditingLacorn] = useState(null);
  const { user, updateUser, token } = useAuth();
  const navigate = useNavigate();
  const [userCollections, setUserCollections] = useState({
    favourites: [],
    watchLater: [],
    started: [],
    forsaken: []
  });
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    birthDate: '',
    avatar: null
  });

  const [avatarPreview, setAvatarPreview] = useState('/images/default-avatar.png');

  // Форматирование даты для отображения (из "2006-09-12" в "12.09.2006")
  const formatBirthDateForDisplay = (birthDate) => {
    if (!birthDate) return '';
    const [year, month, day] = birthDate.split('-');
    return `${day}.${month}.${year}`;
  };

  const formatBirthDateForServer = (birthDateString) => {
    if (!birthDateString) return null;
    const [day, month, year] = birthDateString.split('.');
    return `${year}-${month}-${day}`;
  };

  const loadUserCollections = useCallback(async () => {
    if (!user?.id || !token) return;

    try {
      const collections = await collectionService.getUserCollections(user.id, token);

      // Загружаем детали для каждого сериала в коллекциях
      const collectionData = {
        favourites: [],
        watchLater: [],
        started: [],
        forsaken: []
      };

      for (const collection of collections) {
        if (collection.seriesIds && collection.seriesIds.length > 0) {
          // Загружаем данные сериалов для этой коллекции (первые 4)
          const seriesPromises = collection.seriesIds.slice(0, 4).map(seriesId =>
            lacornService.getLacornById(seriesId, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(err => {
              console.error(`Error loading lacorn ${seriesId}:`, err);
              return null;
            })
          );

          const seriesData = await Promise.all(seriesPromises);
          const validSeries = seriesData.filter(series => series !== null);

          switch(collection.name.toLowerCase()) {
            case 'favourites':
              collectionData.favourites = validSeries;
              break;
            case 'watch later':
              collectionData.watchLater = validSeries;
              break;
            case 'started':
              collectionData.started = validSeries;
              break;
            case 'forsaken':
              collectionData.forsaken = validSeries;
              break;
          }
        }
      }

      setUserCollections(collectionData);
    } catch (error) {
      console.error('Error loading user collections:', error);
    }
  }, [user, token]);

  // Функция для открытия модального окна коллекции
  const handleOpenCollection = (collectionType) => {
    setSelectedCollection(collectionType);
    setShowCollectionModal(true);
  };

  // Функция для перехода на страницу коллекции
  const handleNavigateToCollection = (collectionType) => {
    const routeMap = {
      favourites: '/collections/favourites',
      watchLater: '/collections/watch-later',
      started: '/collections/started',
      forsaken: '/collections/forsaken'
    };

    navigate(routeMap[collectionType]);
  };

  // Добавляем вызов в useEffect
  useEffect(() => {
    if (user && activeTab === 'profile') {
      loadUserCollections();
    }
  }, [user, activeTab, loadUserCollections]);

  useEffect(() => {
    if (user) {
      const formattedBirthDate = user.birthDate ? formatBirthDateForDisplay(user.birthDate) : '';
      setUserInfo({
        name: user.username || 'User',
        email: user.email || '',
        birthDate: formattedBirthDate,
        avatar: user.avatar || null
      });
      if (user.avatar) setAvatarPreview(user.avatar);
    }
  }, [user]);

  const [tmdbSearch, setTmdbSearch] = useState({
    query: '',
    year: new Date().getFullYear(),
    results: [],
    selectedResult: null,
    isLoading: false
  });

  // Функция для поиска в TMDB
  const searchTMDB = async () => {
    if (!tmdbSearch.query.trim()) return;

    try {
      setTmdbSearch(prev => ({ ...prev, isLoading: true, results: [] }));

      const results = await tmdbService.searchContent(
        tmdbSearch.query,
        tmdbSearch.year,
        'multi'
      );

      setTmdbSearch(prev => ({
        ...prev,
        results: results || [],
        isLoading: false
      }));
    } catch (error) {
      console.error('TMDB search error:', error);
      setTmdbSearch(prev => ({ ...prev, isLoading: false }));
      alert('Error searching TMDB');
    }
  };

  // Функция для автоматического заполнения формы
 const autoFillFromTMDB = async (result) => {
   try {
     setIsLoading(true);

     const lacornData = await tmdbService.autoFillLacornData(
       result.title || result.name,
       tmdbSearch.year
     );

     if (lacornData) {
       setNewLacorn({
         ...lacornData,
         // Автоматически заполняем страны производства
         productionCountries: lacornData.productionCountries || [],
         // Автоматически создаем актёров
         actors: lacornData.actors || []
       });

       setTmdbSearch(prev => ({
         ...prev,
         selectedResult: result,
         results: []
       }));

       alert('Data automatically filled from TMDB including actors and production countries!');
     } else {
       alert('Could not fetch detailed information from TMDB');
     }
   } catch (error) {
     console.error('Error auto-filling from TMDB:', error);
     alert('Error fetching data from TMDB');
   } finally {
     setIsLoading(false);
   }
 };

  // Загрузка всех лакорнов для админ-панели - ИСПРАВЛЕННАЯ ВЕРСИЯ
 const fetchLacorns = useCallback(async () => {
   try {
     console.log('Fetching lacorns for admin panel...');

     const response = await fetch(
       'http://localhost:8081/api/lacorns?page=0&size=50&sort=id,desc',
       {
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         }
       }
     );

     if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }

     const data = await response.json();
     console.log('Admin Panel API Response:', data);

     // Универсальный парсинг ответа
     const lacornsArray = data.content || data || [];

     if (lacornsArray.length === 0) {
       console.warn('No lacorns found in response');
     }

     setLacorns(lacornsArray);

   } catch (error) {
     console.error('Error fetching lacorns:', error);
     setError('Failed to load lacorns');
     setLacorns([]);
   }
 }, [token]);

  // Переключение на админ-панель
  useEffect(() => {
    if (activeTab === 'admin' && user?.role === 'ADMIN') {
      fetchLacorns();
    }
  }, [activeTab, user, fetchLacorns]);

  // Функции для управления лакорнами
  const handleAddLacorn = async (e) => {
    e.preventDefault();

    try {
      const lacornData = {
        ...newLacorn,
        actors: newLacorn.actors || [] // Убедитесь, что актёры включены
      };

      console.log('Sending lacorn data with actors:', lacornData);

      const response = await fetch('http://localhost:8081/api/lacorns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLacorn)
      });

      if (response.ok) {
        const createdLacorn = await response.json();
        setLacorns(prevLacorns => [...prevLacorns, createdLacorn]);
        setNewLacorn({
          title: '',
          description: '',
          releaseYear: new Date().getFullYear(),
          totalEpisodes: 1,
          episodeDuration: 45,
          posterUrl: '',
          trailerUrl: '',
          genres: [],
          ageRating: 'PG-13',
          rating: 0.0,
          status: 'ONGOING',
          availableVoiceovers: []
        });
        alert('Lacorn added successfully!');
      } else {
        throw new Error('Failed to add lacorn');
      }
    } catch (error) {
      console.error('Error adding lacorn:', error);
      alert('Error adding lacorn');
    }
  };

  const handleEditLacorn = (lacorn) => {
    setEditingLacorn(lacorn);
    setNewLacorn({
      title: lacorn.title,
      description: lacorn.description,
      releaseYear: lacorn.releaseYear,
      totalEpisodes: lacorn.totalEpisodes,
      episodeDuration: lacorn.episodeDuration,
      posterUrl: lacorn.posterUrl,
      trailerUrl: lacorn.trailerUrl,
      genres: lacorn.genres || [],
      ageRating: lacorn.ageRating,
      rating: lacorn.rating,
      status: lacorn.status || 'ONGOING',
      availableVoiceovers: lacorn.availableVoiceovers || []
    });
  };

  const handleUpdateLacorn = async (e) => {
    e.preventDefault();

    try {
      const lacornData = {
        ...newLacorn,
        actors: newLacorn.actors || [] // Убедитесь, что актёры включены
      };

      console.log('Updating lacorn with data:', lacornData);

      const response = await fetch(`http://localhost:8081/api/lacorns/${editingLacorn.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLacorn)
      });

      if (response.ok) {
        const updatedLacorn = await response.json();
        setLacorns(prevLacorns => prevLacorns.map(l => l.id === editingLacorn.id ? updatedLacorn : l));
        setEditingLacorn(null);
        setNewLacorn({
          title: '',
          description: '',
          releaseYear: new Date().getFullYear(),
          totalEpisodes: 1,
          episodeDuration: 45,
          posterUrl: '',
          trailerUrl: '',
          genres: [],
          ageRating: 'PG-13',
          rating: 0.0,
          status: 'ONGOING',
          availableVoiceovers: []
        });
        alert('Lacorn updated successfully!');
      } else {
        throw new Error('Failed to update lacorn');
      }
    } catch (error) {
      console.error('Error updating lacorn:', error);
      alert('Error updating lacorn');
    }
  };

  const handleDeleteLacorn = async (id) => {
    if (window.confirm('Are you sure you want to delete this lacorn?')) {
      try {
        await fetch(`http://localhost:8081/api/lacorns/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setLacorns(prevLacorns => prevLacorns.filter(lacorn => lacorn.id !== id));
        alert('Lacorn deleted successfully!');
      } catch (error) {
        console.error('Error deleting lacorn:', error);
        alert('Error deleting lacorn');
      }
    }
  };

  const cancelEdit = () => {
    setEditingLacorn(null);
    setNewLacorn({
      title: '',
      description: '',
      releaseYear: new Date().getFullYear(),
      totalEpisodes: 1,
      episodeDuration: 45,
      posterUrl: '',
      trailerUrl: '',
      genres: [],
      ageRating: 'PG-13',
      rating: 0.0,
      status: 'ONGOING',
      availableVoiceovers: []
    });
  };

  // Обновление данных пользователя
  const updateUserData = useCallback(async (userData) => {
    if (!user?.id) throw new Error('User ID отсутствует');

    const payload = {
      username: userData.name,
      email: userData.email,
      birthDate: formatBirthDateForServer(userData.birthDate),
      avatar: userData.avatar || null
    };

    console.log('Sending user data to server:', payload);

    const res = await fetch(`http://localhost:8081/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ошибка обновления профиля: ${text}`);
    }

    const updatedUser = await res.json();
    if (updateUser) updateUser(updatedUser);
    return updatedUser;
  }, [user?.id, token, updateUser]);

  const uploadAvatarToServer = useCallback(async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:8081/api/users/avatar', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ошибка загрузки аватара: ${text}`);
    }

    const data = await res.json();
    return data.avatarUrl || null;
  }, [token]);

  const handleAvatarUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    try {
      setIsLoading(true);
      const avatarUrl = await uploadAvatarToServer(file);

      console.log('Avatar URL received:', avatarUrl);

      const updatedUserData = {
        ...userInfo,
        avatar: avatarUrl
      };

      setAvatarPreview(avatarUrl);
      setUserInfo(updatedUserData);

      const updatedUser = await updateUserData(updatedUserData);

      if (updateUser) {
        updateUser(updatedUser);
      }

      alert('Аватар успешно обновлен!');
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке аватара: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [uploadAvatarToServer, userInfo, updateUserData, updateUser]);

  const handleSaveInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedUser = await updateUserData(userInfo);
      setUserInfo({
        name: updatedUser.username || 'User',
        email: updatedUser.email || '',
        birthDate: updatedUser.birthDate ? formatBirthDateForDisplay(updatedUser.birthDate) : '',
        avatar: updatedUser.avatar || '/images/default-avatar.png'
      });
      setAvatarPreview(updatedUser.avatar || '/images/default-avatar.png');
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userInfo, updateUserData]);

  // Отмена редактирования
  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
    if (user) {
      setUserInfo({
        name: user.username || 'User',
        email: user.email || '',
        birthDate: user.birthDate ? formatBirthDateForDisplay(user.birthDate) : '',
        avatar: user.avatar || null
      });
      setAvatarPreview(user.avatar || '/images/default-avatar.png');
    }
  }, [user]);

  // Начало редактирования
  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Обработка изменения полей ввода
  const handleInputChange = useCallback((field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  // Функции меню
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const handleMainPage = useCallback(() => {
    closeMenu();
    navigate('/');
  }, [closeMenu, navigate]);

  const handleProfile = useCallback(() => {
    closeMenu();
  }, [closeMenu]);

  const handleLeavePage = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div></div>
        <button className="menu-button" onClick={toggleMenu}>
          <div className="menu-icon">
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </div>
          Menu
        </button>
      </header>

      {/* Табы для переключения между профилем и админ-панелью */}
      {user.role === 'ADMIN' && (
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Panel
          </button>
        </div>
      )}

      <main className="profile-main">
        {activeTab === 'profile' ? (
          <>
            <div className="profile-left">
              <div className="profile-avatar-section">
                <div className="profile-avatar-container">
                  <div className={`avatar-wrapper ${isEditing ? 'editing' : ''}`}>
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="profile-avatar"
                      onError={(e) => {
                        console.error('Error loading avatar:', avatarPreview);
                        e.target.src = '/images/default-avatar.png';
                        setAvatarPreview('/images/default-avatar.png');
                      }}
                    />
                    {isEditing && (
                      <>
                        <div className="avatar-overlay"></div>
                        <label htmlFor="avatar-upload" className="avatar-change-button">
                          <span className="change-icon">+</span>
                          Change Photo
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="avatar-upload-input"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-info-fields">
                <div className="profile-info-field left-aligned">
                  {isEditing ? (
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="profile-info-input"
                      placeholder="Name"
                    />
                  ) : (
                    <p className="profile-info-text">{userInfo.name}</p>
                  )}
                </div>

                <div className="profile-info-field left-aligned">
                  {isEditing ? (
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="profile-info-input"
                      placeholder="Email"
                    />
                  ) : (
                    <p className="profile-info-text">{userInfo.email}</p>
                  )}
                </div>

                <div className="profile-info-field left-aligned">
                  {isEditing ? (
                    <input
                      type="text"
                      value={userInfo.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="profile-info-input"
                      placeholder="Birth Date (dd.mm.yyyy)"
                      pattern="\d{2}\.\d{2}\.\d{4}"
                      title="Please use format: dd.mm.yyyy"
                    />
                  ) : (
                    <p className="profile-info-text">
                      {userInfo.birthDate || 'No birth date provided'}
                    </p>
                  )}
                </div>
              </div>

              <div className="profile-action-buttons">
                {!isEditing ? (
                  <button
                    className="change-info-button"
                    onClick={handleStartEditing}
                    disabled={isLoading}
                  >
                    Change Info
                  </button>
                ) : (
                  <div className="editing-buttons">
                    <button
                      className="save-button"
                      onClick={handleSaveInfo}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="cancel-button"
                      onClick={handleCancelEditing}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-right">
              <div className="cat-section">
                <img
                  src="/images/Space cat.png"
                  alt="Space Cat"
                  className="profile-cat"
                />
                <div className="cat-bubble">
                  <p>You look amazing!</p>
                  <p>What drama we will watch today?</p>
                </div>
              </div>

              <div className="comments-answers-section">
                <button className="comments-answers-button">
                  Comments and answers
                </button>
              </div>

              <div className="profile-actions">
                <button className="profile-action-button">Started</button>
                <button className="profile-action-button">Forsaken</button>
                <button className="profile-action-button">Favourite</button>
                <button className="profile-action-button">Watch later</button>
              </div>

              <section className="last-watched-section">
                <h2 className="last-watched-title">Last watched lacorns:</h2>
                <div className="last-watched-frame">
                  <div className="last-watched-grid">
                    {/* Здесь будут последние просмотренные сериалы */}
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : (
          // Админ-панель
          <div className="admin-panel-content">
            <div className="admin-header">
              <h2>Admin Panel - Manage Lacorns</h2>
              <p>Total lacorns: {Array.isArray(lacorns) ? lacorns.length : 0}</p>
            </div>

            <div className="tmdb-search-section">
              <h3>Auto-fill from TMDB</h3>
              <div className="tmdb-search-form">
                <div className="form-row">
                  <div className="form-field-group">
                    <input
                      type="text"
                      placeholder="Search movie or TV show..."
                      value={tmdbSearch.query}
                      onChange={(e) => setTmdbSearch(prev => ({ ...prev, query: e.target.value }))}
                      className="tmdb-search-input"
                    />
                  </div>
                  <div className="form-field-group">
                    <input
                      type="number"
                      placeholder="Year"
                      value={tmdbSearch.year}
                      onChange={(e) => setTmdbSearch(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                      className="tmdb-year-input"
                    />
                  </div>
                  <div className="form-field-group">
                    <button
                      type="button"
                      onClick={searchTMDB}
                      disabled={tmdbSearch.isLoading || !tmdbSearch.query.trim()}
                      className="tmdb-search-button"
                    >
                      {tmdbSearch.isLoading ? 'Searching...' : 'Search TMDB'}
                    </button>
                  </div>
                </div>

                {/* Результаты поиска */}
                {tmdbSearch.results.length > 0 && (
                  <div className="tmdb-results">
                    <h4>Search Results:</h4>
                    <div className="tmdb-results-grid">
                      {tmdbSearch.results.slice(0, 5).map((result) => (
                        <div key={result.id} className="tmdb-result-card">
                          <img
                            src={tmdbService.getImageUrl(result.poster_path, 'w200')}
                            alt={result.title || result.name}
                            className="tmdb-poster"
                            onError={(e) => {
                              e.target.src = '/images/default-poster.jpg';
                            }}
                          />
                          <div className="tmdb-result-info">
                            <h5>{result.title || result.name}</h5>
                            <p className="tmdb-year">
                              {new Date(result.release_date || result.first_air_date).getFullYear()}
                            </p>
                            <p className="tmdb-type">
                              {result.media_type === 'movie' ? 'Movie' : 'TV Series'}
                            </p>
                            <button
                              onClick={() => autoFillFromTMDB(result)}
                              className="use-result-button"
                            >
                              Use This
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Форма добавления/редактирования лакорна */}
            <div className="lacorn-form-section">
              <h3>{editingLacorn ? 'Edit Lacorn' : 'Add New Lacorn'}</h3>
              <form onSubmit={editingLacorn ? handleUpdateLacorn : handleAddLacorn} className="lacorn-form">
                {/* Title and Release Year */}
                <div className="form-row">
                  <div className="form-field-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      placeholder="Enter lacorn title"
                      value={newLacorn.title}
                      onChange={(e) => setNewLacorn({...newLacorn, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-field-group">
                    <label className="form-label">Release Year *</label>
                    <input
                      type="number"
                      placeholder="2024"
                      value={newLacorn.releaseYear}
                      onChange={(e) => setNewLacorn({...newLacorn, releaseYear: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-field-group">
                  <label className="form-label">Description</label>
                  <textarea
                    placeholder="Enter lacorn description"
                    value={newLacorn.description}
                    onChange={(e) => setNewLacorn({...newLacorn, description: e.target.value})}
                    rows="3"
                  />
                </div>

                {/* Episodes, Duration, and Rating */}
                <div className="form-row">
                  <div className="form-field-group">
                    <label className="form-label">Status</label>
                    <select
                      value={newLacorn.status}
                      onChange={(e) => setNewLacorn({...newLacorn, status: e.target.value})}
                    >
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="UPCOMING">Upcoming</option>
                    </select>
                  </div>
                </div>

               <div className="form-field-group">
                 <label className="form-label">Available Voiceovers</label>
                 <div className="voiceovers-checkboxes">
                   <label className="checkbox-label">
                     <input
                       type="checkbox"
                       checked={(newLacorn.availableVoiceovers || []).includes('RUSSIAN_DUB')}
                       onChange={(e) => {
                         const currentVoiceovers = newLacorn.availableVoiceovers || [];
                         const voiceovers = e.target.checked
                           ? [...currentVoiceovers, 'RUSSIAN_DUB']
                           : currentVoiceovers.filter(v => v !== 'RUSSIAN_DUB');
                         setNewLacorn({...newLacorn, availableVoiceovers: voiceovers});
                       }}
                     />
                     Russian Dubbed
                   </label>
                   <label className="checkbox-label">
                     <input
                       type="checkbox"
                       checked={(newLacorn.availableVoiceovers || []).includes('ORIGINAL_SUBBED')}
                       onChange={(e) => {
                         const currentVoiceovers = newLacorn.availableVoiceovers || [];
                         const voiceovers = e.target.checked
                           ? [...currentVoiceovers, 'ORIGINAL_SUBBED']
                           : currentVoiceovers.filter(v => v !== 'ORIGINAL_SUBBED');
                         setNewLacorn({...newLacorn, availableVoiceovers: voiceovers});
                       }}
                     />
                     Original with Subs
                   </label>
                   <label className="checkbox-label">
                     <input
                       type="checkbox"
                       checked={(newLacorn.availableVoiceovers || []).includes('ENGLISH_DUB')}
                       onChange={(e) => {
                         const currentVoiceovers = newLacorn.availableVoiceovers || [];
                         const voiceovers = e.target.checked
                           ? [...currentVoiceovers, 'ENGLISH_DUB']
                           : currentVoiceovers.filter(v => v !== 'ENGLISH_DUB');
                         setNewLacorn({...newLacorn, availableVoiceovers: voiceovers});
                       }}
                     />
                     English Dubbed
                   </label>
                 </div>
               </div>

                <div className="form-row">
                  <div className="form-field-group">
                    <label className="form-label">Total Episodes</label>
                    <input
                      type="number"
                      placeholder="12"
                      value={newLacorn.totalEpisodes}
                      onChange={(e) => setNewLacorn({...newLacorn, totalEpisodes: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-field-group">
                    <label className="form-label">Episode Duration (minutes)</label>
                    <input
                      type="number"
                      placeholder="45"
                      value={newLacorn.episodeDuration}
                      onChange={(e) => setNewLacorn({...newLacorn, episodeDuration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="form-field-group">
                    <label className="form-label">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="8.5"
                      value={newLacorn.rating}
                      onChange={(e) => setNewLacorn({...newLacorn, rating: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Poster and Trailer URLs */}
                <div className="form-row">
                  <div className="form-field-group">
                    <label className="form-label">Poster URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/poster.jpg"
                      value={newLacorn.posterUrl}
                      onChange={(e) => setNewLacorn({...newLacorn, posterUrl: e.target.value})}
                    />
                  </div>
                  <div className="form-field-group">
                    <label className="form-label">Trailer URL</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/watch?v=..."
                      value={newLacorn.trailerUrl}
                      onChange={(e) => setNewLacorn({...newLacorn, trailerUrl: e.target.value})}
                    />
                  </div>
                </div>

                {/* Genres and Age Rating */}
                <div className="form-row">
                  <div className="form-field-group">
                    <label className="form-label">Genres (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Drama, Romance, Comedy"
                      value={newLacorn.genres.join(', ')}
                      onChange={(e) => setNewLacorn({...newLacorn, genres: e.target.value.split(',').map(g => g.trim())})}
                    />
                  </div>
                  <div className="form-field-group">
                    <label className="form-label">Production Countries</label>
                    <input
                      type="text"
                      placeholder="USA, Japan, South Korea"
                      value={newLacorn.productionCountries?.join(', ') || ''}
                      onChange={(e) => setNewLacorn({
                        ...newLacorn,
                        productionCountries: e.target.value.split(',').map(c => c.trim())
                      })}
                    />
                  </div>

                  {/* Actors Info */}
                  {newLacorn.actors && newLacorn.actors.length > 0 && (
                    <div className="form-field-group">
                      <label className="form-label">Actors from TMDB</label>
                      <div className="actors-list">
                        {newLacorn.actors.slice(0, 5).map((actor, index) => (
                          <div key={index} className="actor-item">
                            <strong>{actor.name}</strong> as {actor.character}
                          </div>
                        ))}
                        {newLacorn.actors.length > 5 && (
                          <div>... and {newLacorn.actors.length - 5} more</div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="form-field-group">
                    <label className="form-label">Age Rating</label>
                    <select
                      value={newLacorn.ageRating}
                      onChange={(e) => setNewLacorn({...newLacorn, ageRating: e.target.value})}
                    >
                      <option value="G">G</option>
                      <option value="PG">PG</option>
                      <option value="PG-13">PG-13</option>
                      <option value="R">R</option>
                      <option value="NC-17">NC-17</option>
                    </select>
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="submit-button">
                    {editingLacorn ? 'Update Lacorn' : 'Add Lacorn'}
                  </button>
                  {editingLacorn && (
                    <button type="button" onClick={cancelEdit} className="cancel-button">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Список существующих лакорнов */}
            <div className="lacorns-list-section">
              <h3>Existing Lacorns</h3>
              <div className="lacorns-grid-admin">
                {Array.isArray(lacorns) && lacorns.map(lacorn => (
                  <div key={lacorn.id} className="lacorn-card-admin">
                    <div className="lacorn-poster-admin">
                      <img
                        src={lacorn.posterUrl || '/images/default-poster.jpg'}
                        alt={lacorn.title}
                        onError={(e) => {
                          e.target.src = '/images/default-poster.jpg';
                        }}
                      />
                    </div>
                    <div className="lacorn-info-admin">
                      <h4>{lacorn.title}</h4>
                      <p className="lacorn-year">{lacorn.releaseYear}</p>
                      <p className="lacorn-status">
                        <span className={`status-badge status-${lacorn.status?.toLowerCase()}`}>
                          {lacorn.status || 'ONGOING'}
                        </span>
                      </p>
                      <p className="lacorn-genres">{lacorn.genres?.join(', ')}</p>
                      <p className="lacorn-voiceovers">
                        Voiceovers: {lacorn.availableVoiceovers?.join(', ') || 'None'}
                      </p>
                      <p className="lacorn-rating">⭐ {lacorn.rating || 'N/A'}</p>
                      <div className="lacorn-actions">
                        <button
                          onClick={() => handleEditLacorn(lacorn)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLacorn(lacorn.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(!Array.isArray(lacorns) || lacorns.length === 0) && (
                <div className="empty-state">
                  <p>No lacorns found. Add your first lacorn!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

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
                <button className="menu-modal-button" onClick={() => navigate('/collections/favourites')}>
                  <img src="/images/icons/favourite.png" alt="Favourites" className="menu-modal-button-icon" />
                  Favourites
                </button>
                <button className="menu-modal-button" onClick={() => navigate('/collections/watch-later')}>
                  <img src="/images/icons/watch-later.png" alt="Watch later" className="menu-modal-button-icon" />
                  Watch later
                </button>
              </div>
              <div className="menu-modal-column">
                <button className="menu-modal-button" onClick={() => navigate('/collections/started')}>
                  <img src="/images/icons/started.png" alt="Started" className="menu-modal-button-icon" />
                  Started
                </button>
                <button className="menu-modal-button" onClick={() => navigate('/collections/forsaken')}>
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
                <img src="/images/icons/leave-page.png" alt="Main page" className="menu-modal-button-icon" />
                Leave page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;