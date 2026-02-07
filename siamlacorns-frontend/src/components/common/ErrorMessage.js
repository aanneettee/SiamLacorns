import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry, retryText = 'Попробовать снова' }) => {
  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h3>Произошла ошибка</h3>
        <p>{message}</p>
        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;