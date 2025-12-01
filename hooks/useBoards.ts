import { useState, useEffect, useCallback } from 'react';
import { Board, FilterType } from '../services/types';
import { boardsApi } from '../services/api';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await boardsApi.getBoards();
      setBoards(data);
    } catch (err) {
      setError('Failed to load boards');
      console.error('Error fetching boards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const filteredBoards = boards.filter((board) => {
    if (filter === FilterType.ALL) return true;
    if (filter === FilterType.RECENT) {
      // Show boards from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(board.created_at) > weekAgo;
    }
    if (filter === FilterType.FAVORITES) {
      // This would require a favorites feature in the backend
      // For now, return empty array
      return false;
    }
    return true;
  });

  return {
    boards: filteredBoards,
    loading,
    error,
    filter,
    setFilter,
    refetch: fetchBoards,
  };
}
