// components/search/SmartSearch.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SmartSearch.css';

const SmartSearch = ({ onSearch, placeholder }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (searchTerm) => {
        if (searchTerm.length < 2) {
            setSuggestions([]);
            return;
        }

        // Имитация запроса к API
        const mockSuggestions = [
            { id: 1, title: 'Любовь во времени', year: 2023, type: 'series' },
            { id: 2, title: 'Лунный свет', year: 2024, type: 'movie' },
            { id: 3, title: 'Последний день', year: 2022, type: 'series' }
        ].filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setSuggestions(mockSuggestions);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        fetchSuggestions(value);
        setShowSuggestions(true);
    };

    const handleSuggestionClick = (suggestion) => {
        setShowSuggestions(false);
        navigate(`/lacorns/${suggestion.id}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch(query);
            setShowSuggestions(false);
        }
    };

    return (
        <div className="smart-search" ref={searchRef}>
            <div className="search-input-wrapper">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="smart-search-input"
                />
                <div className="search-icon">🔍</div>
                {query && (
                    <button
                        className="clear-search"
                        onClick={() => {
                            setQuery('');
                            setSuggestions([]);
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                    {suggestions.map(suggestion => (
                        <div
                            key={suggestion.id}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            <div className="suggestion-icon">🎬</div>
                            <div className="suggestion-info">
                                <span className="suggestion-title">{suggestion.title}</span>
                                <span className="suggestion-year">{suggestion.year}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SmartSearch;