// App.js
import { Routes, Route, Navigate } from 'react-router-dom';
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
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <LoadingSpinner size="large" text="Loading application..." />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/help" element={<Help />} />
        <Route path="/lacorns" element={<LacornList />} />
        <Route path="/watch/:id" element={<LacornWatchPage />} />
        <Route path="/lacorns/:id" element={<LacornDetail />} />
        <Route path="/actors/:id" element={<LacornPage />} />
        <Route path="/collections/favourites" element={<FavouritesPage />} />
        <Route path="/collections/watch-later" element={<WatchLaterPage />} />
        <Route path="/collections/started" element={<StartedPage />} />
        <Route path="/collections/forsaken" element={<ForsakenPage />} />

        {/* Protected routes */}
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />

        {/* Fallback route */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
