import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = "Поиск сериалов..." }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {query && (
          <button
            type="button"
            className="clear-button"
            onClick={handleClear}
          >
            ✕
          </button>
        )}
      </div>
      <button type="submit" className="search-button">
        🔍
      </button>
    </form>
  );
};

export default SearchBar;