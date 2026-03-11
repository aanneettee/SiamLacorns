// src/components/onboarding/OnboardingTour.js
import React, { useState, useEffect, useRef } from 'react';
import './OnboardingTour.css';

const OnboardingTour = ({ isFirstVisit, onComplete }) => {
    const [step, setStep] = useState(0);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [showTooltip, setShowTooltip] = useState(true);
    const [targetElement, setTargetElement] = useState(null);
    const [highlightStyle, setHighlightStyle] = useState({});
    const tooltipRef = useRef(null);

    const steps = [
        {
            title: '🔍 Поиск лакорнов',
            content: 'Здесь вы можете искать сериалы по названию.',
            details: [
                '• Введите название и нажмите Enter',
                '• Появятся подсказки во время ввода',
                '• Кликните на подсказку для перехода'
            ],
            icon: '🔍',
            target: '.search-section',
            color: '#FF6B6B'
        },
        {
            title: '🎭 Фильтры',
            content: 'Уточните поиск с помощью фильтров:',
            details: [
                '• Жанр: романтика, комедия, драма',
                '• Год выпуска',
                '• Статус: выходит, завершён',
                '• Тип озвучки'
            ],
            icon: '🎭',
            target: '.filters-main-container',
            color: '#4ECDC4'
        },
        {
            title: '🔥 Популярные сериалы',
            content: 'Здесь отображаются популярные лакорны:',
            details: [
                '• Рейтинг показан на карточке',
                '• Кликните для просмотра',
                '• Анимированное появление'
            ],
            icon: '🔥',
            target: '.popular-section',
            color: '#FFE66D'
        },
        {
            title: '📋 Меню',
            content: 'Быстрый доступ к коллекциям:',
            details: [
                '• Мой профиль - личные данные',
                '• Избранное - любимое',
                '• Посмотреть позже',
                '• Начатое - в процессе',
                '• Брошенное'
            ],
            icon: '📋',
            target: '.menu-button',
            color: '#FF9F1C'
        },
        {
            title: '😺 Кот-помощник',
            content: 'Кот всегда рядом и готов помочь:',
            details: [
                '• Подсказывает по ходу работы',
                '• Реагирует на ваши действия',
                '• Показывает своё настроение'
            ],
            icon: '😺',
            target: '.cat-help-section',
            color: '#B980F0'
        }
    ];

    // Функция обновления подсветки
    const updateHighlight = () => {
        const currentStep = steps[step];
        const element = document.querySelector(currentStep.target);

        if (element) {
            setTargetElement(element);
            const rect = element.getBoundingClientRect();

            setHighlightStyle({
                top: rect.top + window.scrollY - 5,
                left: rect.left + window.scrollX - 5,
                width: rect.width + 10,
                height: rect.height + 10,
                borderColor: currentStep.color,
                boxShadow: `0 0 0 4px ${currentStep.color}40`
            });

            // Плавная прокрутка к элементу
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    // Обновление при изменении шага
    useEffect(() => {
        if (!isFirstVisit || !showTooltip) return;

        // Даем время на рендер DOM
        const timeoutId = setTimeout(updateHighlight, 300);

        // Обновляем при ресайзе
        window.addEventListener('resize', updateHighlight);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updateHighlight);
        };
    }, [step, isFirstVisit, showTooltip]);

    // Загрузка сохраненной позиции
    useEffect(() => {
        const savedPosition = localStorage.getItem('onboarding-tooltip-position');
        if (savedPosition) {
            setPosition(JSON.parse(savedPosition));
        } else {
            setPosition({
                x: window.innerWidth - 380,
                y: 100
            });
        }
    }, []);

    const handleMouseDown = (e) => {
        if (!tooltipRef.current) return;

        const rect = tooltipRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        const maxX = window.innerWidth - 340;
        const maxY = window.innerHeight - 300;

        setPosition({
            x: Math.max(10, Math.min(newX, maxX)),
            y: Math.max(10, Math.min(newY, maxY))
        });
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            localStorage.setItem('onboarding-tooltip-position', JSON.stringify(position));
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, position]);

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            setShowTooltip(false);
            onComplete();
        }
    };

    const handlePrev = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleSkip = () => {
        setShowTooltip(false);
        onComplete();
    };

    const handleDotClick = (index) => {
        setStep(index);
    };

    if (!isFirstVisit || !showTooltip) return null;

    const currentStep = steps[step];

    return (
        <div className="onboarding-overlay">
            {/* Подсветка элемента */}
            {highlightStyle.top && (
                <div
                    className="onboarding-highlight"
                    style={{
                        position: 'absolute',
                        top: highlightStyle.top,
                        left: highlightStyle.left,
                        width: highlightStyle.width,
                        height: highlightStyle.height,
                        border: `4px solid ${highlightStyle.borderColor}`,
                        borderRadius: '12px',
                        boxShadow: highlightStyle.boxShadow,
                        animation: 'pulseHighlight 1.5s infinite',
                        pointerEvents: 'none',
                        zIndex: 9999
                    }}
                />
            )}

            {/* Тултип */}
            <div
                ref={tooltipRef}
                className={`onboarding-tooltip ${isDragging ? 'dragging' : ''}`}
                style={{
                    position: 'fixed',
                    left: position.x,
                    top: position.y,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    width: '320px',
                    zIndex: 10000,
                    borderColor: currentStep.color
                }}
                onMouseDown={handleMouseDown}
            >
                <div className="tooltip-header" style={{ background: currentStep.color }}>
                    <span className="tooltip-icon">{currentStep.icon}</span>
                    <h3>{currentStep.title}</h3>
                </div>

                <p className="tooltip-content">{currentStep.content}</p>

                <div className="tooltip-details">
                    {currentStep.details.map((detail, index) => (
                        <div key={index} className="detail-item">
                            <span className="detail-bullet" style={{ background: currentStep.color }}></span>
                            {detail}
                        </div>
                    ))}
                </div>

                <div className="tooltip-controls">
                    <button
                        className="tooltip-btn prev-btn"
                        onClick={handlePrev}
                        disabled={step === 0}
                        style={{ borderColor: currentStep.color }}
                    >
                        ←
                    </button>

                    <div className="tooltip-progress">
                        {steps.map((_, index) => (
                            <button
                                key={index}
                                className={`progress-dot ${index === step ? 'active' : ''}`}
                                onClick={() => handleDotClick(index)}
                                style={{
                                    background: index === step ? currentStep.color : '#ddd',
                                    borderColor: currentStep.color
                                }}
                            />
                        ))}
                    </div>

                    <button
                        className="tooltip-btn next-btn"
                        onClick={handleNext}
                        style={{ borderColor: currentStep.color }}
                    >
                        {step === steps.length - 1 ? '✓' : '→'}
                    </button>
                </div>

                <div className="tooltip-footer">
                    <button className="skip-btn" onClick={handleSkip}>
                        Пропустить обучение
                    </button>
                    <span className="drag-hint">
                        {isDragging ? 'Отпустите' : '↗️ Перетащите'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;