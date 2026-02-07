// src/components/help/Help.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Help.css';

const Help = () => {
  return (
    <div className="help-page">
      <div className="help-container">
        <h1>Help Center</h1>

        <div className="help-sections">
          <section className="help-section">
            <h2>📺 How to Watch</h2>
            <p>Browse our collection and click on any lacorn to start watching episodes.</p>
          </section>

          <section className="help-section">
            <h2>🔍 Search Tips</h2>
            <p>Use the search bar to find specific lacorns by title, genre, or year.</p>
          </section>

          <section className="help-section">
            <h2>📱 Account Help</h2>
            <p>Manage your account settings and watch history in your profile.</p>
          </section>

          <section className="help-section">
            <h2>❓ Technical Support</h2>
            <p>Having issues? Contact our support team for assistance.</p>
          </section>
        </div>

        <Link to="/" className="back-home-button">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Help;