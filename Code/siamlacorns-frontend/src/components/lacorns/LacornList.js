import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import LacornCard from './LacornCard';
import SearchBar from '../common/SearchBar';
import { lacornService } from '../../services/lacorns';
import { useAuth } from '../../context/AuthContext';
import './LacornList.css';

const LacornList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery(
    ['lacorns', page, searchQuery, user?.id],
    () => searchQuery
      ? lacornService.searchLacorns(searchQuery, page, 20, user?.id)
      : lacornService.getAllLacorns(page, 20, user?.id)
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(0);
  };

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка загрузки</div>;

  return (
    <div className="lacorn-list">
      <div className="list-header">
        <h1>Сериалы</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="lacorns-grid">
        {data?.content?.map(lacorn => (
          <LacornCard key={lacorn.id} lacorn={lacorn} />
        ))}
      </div>

      <div className="pagination">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Назад
        </button>
        <span>Страница {page + 1}</span>
        <button
          disabled={data?.last}
          onClick={() => setPage(page + 1)}
        >
          Вперед
        </button>
      </div>
    </div>
  );
};

export default LacornList;