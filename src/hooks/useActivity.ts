import { useState, useEffect } from 'react';
import { useNotes } from './useNotes';

export const useActivity = () => {
  const { notes } = useNotes();
  const favorites = []; // Fallback empty array since useFavorites is missing
  const [refreshes, setRefreshes] = useState<string[]>([]);

  useEffect(() => {
    const savedRefreshes = localStorage.getItem('weiguang_refreshes');
    if (savedRefreshes) {
      try {
        setRefreshes(JSON.parse(savedRefreshes));
      } catch (e) {
        console.error('Failed to parse refreshes', e);
      }
    }
  }, []);

  const addRefresh = () => {
    const today = new Date();
    const dateStr = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');
    setRefreshes(prev => {
      const newRefreshes = [...prev, dateStr];
      localStorage.setItem('weiguang_refreshes', JSON.stringify(newRefreshes));
      return newRefreshes;
    });
  };

  const activityMap = () => {
    const map: Record<string, number> = {};

    const increment = (dateStrOrDate: Date | string) => {
      let date: Date;
      if (typeof dateStrOrDate === 'string') {
        const parts = dateStrOrDate.split('-');
        if (parts.length === 3) {
          map[dateStrOrDate] = (map[dateStrOrDate] || 0) + 1;
          return;
        }
        date = new Date(dateStrOrDate);
      } else {
        date = dateStrOrDate;
      }
      
      if (isNaN(date.getTime())) return;

      const dateStr = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('-');
      
      map[dateStr] = (map[dateStr] || 0) + 1;
    };

    notes.forEach(note => {
      if (note.createdAt) increment(new Date(note.createdAt));
      if (note.updatedAt && note.updatedAt !== note.createdAt) increment(new Date(note.updatedAt));
    });

    favorites.forEach(fav => {
      if (fav.addedAt) increment(new Date(fav.addedAt));
    });

    refreshes.forEach(dateStr => {
      increment(new Date(dateStr));
    });

    return map;
  };

  return {
    activityMap: activityMap(),
    addRefresh
  };
};
