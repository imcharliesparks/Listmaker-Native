import { useState, useEffect, useCallback } from 'react';
import { Item, ItemFilterType } from '../services/types';
import { itemsApi } from '../services/api';

export function useItems(listId: number) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ItemFilterType>(ItemFilterType.ALL);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemsApi.getItems(listId);
      setItems(data);
    } catch (err) {
      setError('Failed to load items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    if (filter === ItemFilterType.ALL) return true;
    if (filter === ItemFilterType.VIDEOS) {
      return item.source_type === 'youtube';
    }
    if (filter === ItemFilterType.IMAGES) {
      return item.source_type === 'image';
    }
    if (filter === ItemFilterType.LINKS) {
      return item.source_type === 'website';
    }
    return true;
  });

  return {
    items: filteredItems,
    loading,
    error,
    filter,
    setFilter,
    refetch: fetchItems,
  };
}
