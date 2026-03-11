// components/common/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
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
                        alt="Sad Space Cat"
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            marginBottom: '2rem'
                        }}
                    />
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                        Ой! Что-то пошло не так...
                    </h2>
                    <p style={{ marginBottom: '2rem', color: '#666' }}>
                        {this.state.error?.message || 'Неизвестная ошибка'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '1rem 2rem',
                            background: '#ff6b6b',
                            color: 'white',
                            border: '3px solid #000000',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        🔄 Попробовать снова
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;