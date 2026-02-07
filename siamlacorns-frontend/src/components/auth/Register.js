import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    birthDate: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(formData.birthDate)) {
      setError('Birth date must be in format dd.mm.yyyy (e.g.: 12.09.2006)');
      setLoading(false);
      return;
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        birthDate: formData.birthDate,
        password: formData.password
      });
      navigate('/'); // Redirect to main page on success
    } catch (err) {
      setError(err.response?.data?.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h1 className="register-title">Registration</h1>

      <form onSubmit={handleSubmit} className="register-form">
        {error && <div className="register-error">{error}</div>}

        <div className="form-columns">
          <div className="form-column">
            <div className="form-group">
              <label className="input-label">Enter your name:</label>
              <div className="input-container">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Username"
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="input-label">Enter your date of birth:</label>
              <div className="input-container">
                <input
                  type="text"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                  placeholder="dd.mm.yyyy"
                  pattern="\d{2}\.\d{2}\.\d{4}"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label className="input-label">Enter your email:</label>
              <div className="input-container">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="form-input"
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
          <p>Maybe we know each other?</p>
          <p>Click <Link to="/login" className="dialog-link">here</Link> to log in ;)</p>
        </div>
      </div>
    </div>
  );
};

export default Register;