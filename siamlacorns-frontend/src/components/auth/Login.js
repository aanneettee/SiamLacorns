// Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Проверяем, есть ли сообщение об успешной регистрации
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Username:', formData.username);
    console.log('Password length:', formData.password.length);

    try {
      console.log('Calling login function...');
      await login(formData.username, formData.password);
      console.log('Login successful!');

      // Сохраняем настройку "Запомнить меня"
      if (formData.remember) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Перенаправляем на предыдущую страницу или на главную
      const from = location.state?.from?.pathname || '/';
      console.log('Navigating to:', from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('LOGIN ERROR DETAILS:');
      console.error('Error:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Log In</h1>

      <form onSubmit={handleSubmit} className="login-form">
        {success && <div className="login-success">{success}</div>}
        {error && <div className="login-error">{error}</div>}

        <div className="form-columns">
          <div className="form-column">
            <div className="form-group">
              <label className="input-label">Enter your username:</label>
              <div className="input-container">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Your username"
                  className="form-input"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="input-label">Enter your password:</label>
              <div className="input-container">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Min 6 characters"
                  className="form-input"
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="check-button"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>

      <div className="cat-dialog">
        <img
          src="/images/Space cat.png"
          alt="Space Cat"
          className="cat-image"
        />
        <div className="dialog-bubble">
          <p>If this is our first meeting</p>
          <p>Click <Link to="/register" className="dialog-link">here</Link> to register ;)</p>
        </div>
      </div>
    </div>
  );
};

export default Login;