// App.js
import { Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { isMobile } from 'react-device-detect';
import Login from './components/auth/Login.js';
import Home from './components/home/Home.js';
import Help from './components/help/Help.js';
import Register from './components/auth/Register.js';
import LacornList from './components/lacorns/LacornList.js';
import LacornDetail from './components/lacorns/LacornDetail.js';
import LacornPage from './components/actors/ActorPage.js';
import LacornWatchPage from './components/lacorns/LacornWatchPage.js';
import Profile from './components/user/Profile.js';
import { useAuth } from './context/AuthContext.js';
import LoadingSpinner from './components/common/LoadingSpinner.js';
import FavouritesPage from './components/collections/FavouritesPage';
import WatchLaterPage from './components/collections/WatchLaterPage';
import StartedPage from './components/collections/StartedPage';
import ForsakenPage from './components/collections/ForsakenPage';
import ActorsPage from './components/actors/ActorsPage';
import ActorPage from './components/actors/ActorPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageTransition from './components/common/PageTransition';
import ScrollToTop from './components/common/ScrollToTop';
import './App.css';

// Выбираем бэкенд для Drag-and-Drop в зависимости от устройства
const getDndBackend = () => {
  return isMobile ? TouchBackend : HTML5Backend;
};

function App() {
  const { user, loading } = useAuth();

  // Показываем загрузку при проверке авторизации
  if (loading) {
    return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #a8d8f0, #c1e3f7)'
        }}>
          <LoadingSpinner
              size="large"
              text="Загружаем космическое пространство..."
          />
        </div>
    );
  }

  return (
      <ErrorBoundary>
        <DndProvider backend={getDndBackend()} options={{
          enableMouseEvents: true,
          enableTouchEvents: true,
          enableKeyboardEvents: true
        }}>
          <ScrollToTop />
          <div className="App">
            <PageTransition>
              <Routes>
                {/* Публичные маршруты */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/help" element={<Help />} />

                {/* Маршруты лакорнов */}
                <Route path="/lacorns" element={<LacornList />} />
                <Route path="/lacorns/:id" element={<LacornDetail />} />
                <Route path="/watch/:id" element={<LacornWatchPage />} />

                {/* Маршруты актёров */}
                <Route path="/actors" element={<ActorsPage />} />
                <Route path="/actors/:id" element={<ActorPage />} />

                {/* Маршруты коллекций - доступны всем, но показывают разный контент для авторизованных */}
                <Route path="/collections/favourites" element={<FavouritesPage />} />
                <Route path="/collections/watch-later" element={<WatchLaterPage />} />
                <Route path="/collections/started" element={<StartedPage />} />
                <Route path="/collections/forsaken" element={<ForsakenPage />} />

                {/* Защищенные маршруты - только для авторизованных пользователей */}
                <Route
                    path="/profile"
                    element={
                      <ProtectedRoute user={user}>
                        <Profile />
                      </ProtectedRoute>
                    }
                />

                {/* Маршруты для администраторов */}
                {user?.role === 'ADMIN' && (
                    <>
                      <Route
                          path="/admin/lacorns"
                          element={
                            <ProtectedRoute user={user} adminOnly>
                              <AdminLacornsPage />
                            </ProtectedRoute>
                          }
                      />
                      <Route
                          path="/admin/actors"
                          element={
                            <ProtectedRoute user={user} adminOnly>
                              <AdminActorsPage />
                            </ProtectedRoute>
                          }
                      />
                    </>
                )}

                {/* 404 - страница не найдена */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </div>
        </DndProvider>
      </ErrorBoundary>
  );
}

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ user, children, adminOnly = false }) => {
  if (!user) {
    // Перенаправляем на login, но сохраняем страницу, куда хотел попасть пользователь
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    // Если пользователь не админ, но пытается зайти в админку
    return <Navigate to="/" replace />;
  }

  return children;
};

// Компонент для страницы 404
const NotFound = () => {
  return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #a8d8f0, #c1e3f7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: "'Comic Neue', cursive"
      }}>
        <img
            src="/images/Space cat.png"
            alt="Confused Space Cat"
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              marginBottom: '2rem',
              animation: 'float 3s ease-in-out infinite'
            }}
        />
        <h1 style={{
          fontSize: '4rem',
          color: '#000000',
          marginBottom: '1rem'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '2rem',
          color: '#000000',
          marginBottom: '1rem'
        }}>
          Ой! Кот потерялся в космосе!
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '2rem',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          Кажется, страница, которую ты ищешь, улетела на другой космический корабль.
          Давай вернемся на безопасную орбиту!
        </p>
        <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '1rem 2rem',
              background: '#ff6b6b',
              color: 'white',
              border: '3px solid #000000',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 0 #000000',
              transition: 'all 0.3s ease',
              fontFamily: "'Comic Neue', cursive"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(2px)';
              e.target.style.boxShadow = '0 2px 0 #000000';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 0 #000000';
            }}
        >
          🚀 Вернуться на главную
        </button>
      </div>
  );
};

// Админские страницы (можно создать позже)
const AdminLacornsPage = () => {
  return (
      <div style={{ padding: '2rem' }}>
        <h1>Управление лакорнами</h1>
        <p>Страница в разработке</p>
      </div>
  );
};

const AdminActorsPage = () => {
  return (
      <div style={{ padding: '2rem' }}>
        <h1>Управление актёрами</h1>
        <p>Страница в разработке</p>
      </div>
  );
};

export default App;