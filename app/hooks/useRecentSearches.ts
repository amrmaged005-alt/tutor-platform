"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "coursaty_recent_searches";

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      setRecent(raw ? JSON.parse(raw) : []);
    } catch {
      setRecent([]);
    }
  }, []);

  const persist = useCallback((items: string[]) => {
    setRecent(items);
    window.localStorage.setItem(KEY, JSON.stringify(items));
  }, []);

  const add = useCallback((query: string) => {
    const value = query.trim();
    if (!value) return;
    persist([value, ...recent.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 5));
  }, [persist, recent]);

  const remove = useCallback((query: string) => {
    persist(recent.filter((item) => item !== query));
  }, [persist, recent]);

  return { recent, add, remove };
}
