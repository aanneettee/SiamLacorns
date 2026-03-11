// src/components/common/SmartCat.js
import React, { useState, useEffect, useRef } from 'react';
import './SmartCat.css';

const SmartCat = ({ mood = 'happy', message = '', position = 'bottom-right' }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [displayMessage, setDisplayMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [prevMessage, setPrevMessage] = useState('');

    const typingTimeoutRef = useRef(null);
    const hideTimeoutRef = useRef(null);
    const messageRef = useRef(message);

    const moods = {
        happy: {
            emoji: '😊',
            color: '#4CAF50',
            label: 'Счастлив',
            bgColor: '#E8F5E8',
            icon: '🌟'
        },
        thinking: {
            emoji: '🤔',
            color: '#FF9800',
            label: 'Думает',
            bgColor: '#FFF3E0',
            icon: '💭'
        },
        surprised: {
            emoji: '😲',
            color: '#9C27B0',
            label: 'Удивлён',
            bgColor: '#F3E5F5',
            icon: '✨'
        },
        sad: {
            emoji: '😢',
            color: '#607D8B',
            label: 'Грустный',
            bgColor: '#ECEFF1',
            icon: '💧'
        },
        excited: {
            emoji: '🎉',
            color: '#FF5722',
            label: 'Взволнован',
            bgColor: '#FBE9E7',
            icon: '⚡'
        },
        sleepy: {
            emoji: '😴',
            color: '#3F51B5',
            label: 'Сонный',
            bgColor: '#E8EAF6',
            icon: '💤'
        }
    };

    const currentMood = moods[mood] || moods.happy;

    // Эффект для мигания
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
        }, 4000);

        return () => clearInterval(blinkInterval);
    }, []);

    // Очистка всех таймеров
    const clearAllTimeouts = () => {
        if (typingTimeoutRef.current) {
            clearInterval(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    // Эффект для сообщения - исправленная версия
    useEffect(() => {
        // Если сообщение не изменилось, ничего не делаем
        if (message === prevMessage) {
            return;
        }

        // Обновляем ref и предыдущее сообщение
        messageRef.current = message;
        setPrevMessage(message);

        // Очищаем старые таймеры
        clearAllTimeouts();

        if (message && message.trim() !== '') {
            // Показываем сообщение
            setShowMessage(true);

            // Начинаем печатать сообщение
            setIsTyping(true);

            // Устанавливаем первую букву сразу
            const firstChar = message.charAt(0);
            setDisplayMessage(firstChar);

            let index = 1; // Начинаем со второй буквы
            const messageText = message;

            // Таймер для остальных букв
            typingTimeoutRef.current = setInterval(() => {
                if (index < messageText.length) {
                    // Добавляем следующий символ
                    setDisplayMessage(prev => {
                        // Проверяем, не сбросилось ли сообщение
                        if (prev.length < index) {
                            return messageText.substring(0, index + 1);
                        }
                        return prev + messageText.charAt(index);
                    });
                    index++;
                } else {
                    // Завершили печатание
                    clearInterval(typingTimeoutRef.current);
                    typingTimeoutRef.current = null;
                    setIsTyping(false);

                    // Планируем скрытие сообщения
                    hideTimeoutRef.current = setTimeout(() => {
                        setShowMessage(false);
                        setDisplayMessage('');
                    }, 5000);
                }
            }, 50);
        } else {
            // Если сообщение пустое, скрываем
            setShowMessage(false);
            setDisplayMessage('');
            setIsTyping(false);
        }

        return () => {
            clearAllTimeouts();
        };
    }, [message]); // Убрали prevMessage из зависимостей

    const handleCatClick = () => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 500);

        // Показываем приветственное сообщение при клике
        if (!showMessage) {
            // Очищаем старые таймеры
            clearAllTimeouts();

            setShowMessage(true);
            setDisplayMessage('Мяу! 👋');
            setIsTyping(false);

            // Скрываем через 3 секунды
            hideTimeoutRef.current = setTimeout(() => {
                setShowMessage(false);
                setDisplayMessage('');
            }, 3000);
        }
    };

    const getPositionClass = () => {
        switch(position) {
            case 'top-left': return 'top-left';
            case 'top-right': return 'top-right';
            case 'bottom-left': return 'bottom-left';
            case 'bottom-right': return 'bottom-right';
            default: return 'bottom-right';
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`smart-cat ${getPositionClass()}`}>
            <div className="cat-container" onClick={handleCatClick}>
                <div className="cat-avatar-wrapper">
                    <div
                        className="cat-avatar"
                        style={{
                            borderColor: currentMood.color,
                            boxShadow: `0 4px 15px ${currentMood.color}40`
                        }}
                    >
                        <img
                            src="/images/Space cat.png"
                            alt="Кот-помощник"
                            className={`cat-image ${isBlinking ? 'blink' : ''}`}
                        />
                        <div className="cat-glow" style={{ background: `radial-gradient(circle, ${currentMood.color}20, transparent)` }}></div>
                    </div>

                    {/* Индикатор настроения */}
                    <div className="mood-badge" style={{ background: currentMood.color }}>
                        <span className="mood-icon">{currentMood.icon}</span>
                        <span className="mood-tooltip">{currentMood.label}</span>
                    </div>

                    {/* Анимированные ушки */}
                    <div className="cat-ears">
                        <div className="ear left" style={{ borderBottomColor: currentMood.color }}></div>
                        <div className="ear right" style={{ borderBottomColor: currentMood.color }}></div>
                    </div>
                </div>

                {showMessage && displayMessage && (
                    <div
                        className="cat-message-bubble"
                        style={{
                            borderColor: currentMood.color,
                            background: currentMood.bgColor
                        }}
                    >
                        <div className="bubble-arrow" style={{ borderRightColor: currentMood.bgColor }}></div>
                        <div className="message-content">
                            <span className="message-emoji">{currentMood.emoji}</span>
                            <span className="message-text">
                                {displayMessage}
                                {isTyping && <span className="typing-cursor">|</span>}
                            </span>
                        </div>
                        <div className="message-footer">
                            <span className="message-time">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!isTyping && (
                                <span className="message-status">✓✓</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartCat;