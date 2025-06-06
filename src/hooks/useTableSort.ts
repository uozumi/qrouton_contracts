import { useState, useMemo } from 'react';
import { SortOrder } from '../types';

export const useTableSort = <T, K extends keyof T | string>(
  data: T[],
  initialSortField: K,
  initialSortOrder: SortOrder = 'asc'
) => {
  const [sortField, setSortField] = useState<K>(initialSortField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  const handleSort = (field: K) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!data.length) return data;

    return [...data].sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      // ネストされたプロパティアクセス用（例: 'client.name'）
      const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
      };

      const aValue = getNestedValue(a, String(sortField));
      const bValue = getNestedValue(b, String(sortField));

      // null/undefined の処理
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return multiplier;
      if (bValue == null) return -multiplier;

      // 数値の比較
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return multiplier * (aValue - bValue);
      }

      // 日付の比較
      if (aValue instanceof Date && bValue instanceof Date) {
        return multiplier * (aValue.getTime() - bValue.getTime());
      }

      // 日付文字列の比較
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return multiplier * (dateA.getTime() - dateB.getTime());
        }
        // 文字列の比較
        return multiplier * aValue.localeCompare(bValue, 'ja');
      }

      // その他の比較
      return multiplier * String(aValue).localeCompare(String(bValue), 'ja');
    });
  }, [data, sortField, sortOrder]);

  return {
    sortField,
    sortOrder,
    sortedData,
    handleSort
  };
}; 