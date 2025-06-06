import { useState, useMemo } from 'react';

export const useKeywordFilter = <T>(
  data: T[],
  searchFields: (keyof T | string)[]
) => {
  const [filterKeyword, setFilterKeyword] = useState('');

  const filteredData = useMemo(() => {
    if (!filterKeyword.trim()) return data;
    
    const keyword = filterKeyword.toLowerCase();
    
    return data.filter(item => {
      return searchFields.some(field => {
        // ネストされたプロパティアクセス用（例: 'client.name'）
        const getNestedValue = (obj: any, path: string) => {
          return path.split('.').reduce((current, key) => current?.[key], obj);
        };

        const value = getNestedValue(item, String(field));
        return value && String(value).toLowerCase().includes(keyword);
      });
    });
  }, [data, filterKeyword, searchFields]);

  return {
    filterKeyword,
    setFilterKeyword,
    filteredData
  };
}; 