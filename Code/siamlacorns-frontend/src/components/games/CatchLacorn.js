// components/games/CatchLacorn.js
import React, { useState, useEffect, useCallback } from 'react';
import './CatchLacorn.css';

const CatchLacorn = ({ onScore, isActive }) => {
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (!isActive) return;

        const moveInterval = setInterval(() => {
            setPosition({
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10
            });
        }, 1000);

        const timerInterval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(moveInterval);
                    clearInterval(timerInterval);
                    onScore?.(score);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(moveInterval);
            clearInterval(timerInterval);
        };
    }, [isActive, score, onScore]);

    const catchLacorn = useCallback(() => {
        if (timeLeft > 0) {
            setScore(prev => prev + 1);
            // Вибрация на мобильных
            if (navigator.vibrate) navigator.vibrate(50);
        }
    }, [timeLeft]);

    if (!isActive) return null;

    return (
        <div className="catch-lacorn-game">
            <div className="game-header">
                <span>⏰ {timeLeft}s</span>
                <span>🏆 {score}</span>
            </div>
            <div className="game-area">
                <button
                    className="lacorn-target"
                    style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`
                    }}
                    onClick={catchLacorn}
                >
                    🎬
                </button>
            </div>
            {timeLeft === 0 && (
                <div className="game-over">
                    <h3>Игра окончена!</h3>
                    <p>Ты поймал {score} лакорнов!</p>
                    <button onClick={() => window.location.reload()}>
                        Играть снова
                    </button>
                </div>
            )}
        </div>
    );
};

export default CatchLacorn;