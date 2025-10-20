// Profile.js - исправленная версия с полным функционалом
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUser, token } = useAuth();
  const navigate = useNavigate();

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

  // Обновление данных пользователя - ОБЪЯВЛЯЕМ ПЕРВЫМ!
  const updateUserData = useCallback(async (userData) => {
    if (!user?.id) throw new Error('User ID отсутствует');

    const payload = {
      username: userData.name,
      email: userData.email,
      birthDate: formatBirthDateForServer(userData.birthDate),
      avatar: userData.avatar || null // строка URL
    };

    console.log('Sending user data to server:', payload); // ✅ ДЛЯ ОТЛАДКИ

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
        return data.avatarUrl || null; // <- строка URL
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

      console.log('Avatar URL received:', avatarUrl); // ✅ ДЛЯ ОТЛАДКИ

      // ✅ ОБНОВЛЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ С НОВЫМ АВАТАРОМ
      const updatedUserData = {
        ...userInfo,
        avatar: avatarUrl
      };

      // Сохраняем локально для немедленного отображения
      setAvatarPreview(avatarUrl);
      setUserInfo(updatedUserData);

      // ✅ ОБНОВЛЯЕМ ПОЛЬЗОВАТЕЛЯ НА СЕРВЕРЕ
      const updatedUser = await updateUserData(updatedUserData);

      // ✅ ОБНОВЛЯЕМ КОНТЕКСТ АУТЕНТИФИКАЦИИ
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
       const updatedUser = await updateUserData(userInfo); // avatar уже URL
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

      <main className="profile-main">
        <div className="profile-left">
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              <div className={`avatar-wrapper ${isEditing ? 'editing' : ''}`}>
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="profile-avatar"
                  onError={(e) => {
                    console.error('Error loading avatar:', avatarPreview); // ✅ ДЛЯ ОТЛАДКИ
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
      </main>

      {isMenuOpen && (
        <div className="menu-modal-overlay" onClick={closeMenu}>
          <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="menu-modal-title">Menu</h2>
            <div className="menu-modal-content">
              <div className="menu-modal-column">
                <button className="menu-modal-button">My profile</button>
                <button className="menu-modal-button">Favourites</button>
                <button className="menu-modal-button">Watch later</button>
              </div>
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

export default Profile;