"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type FavoriteType = "class" | "tutor";
type Favorites = { classIds: string[]; tutorIds: string[] };

const EMPTY: Favorites = { classIds: [], tutorIds: [] };

export function useFavorites(): {
  isFavorited: (type: FavoriteType, id: string) => boolean;
  toggle: (type: FavoriteType, id: string) => Promise<void>;
  favorites: Favorites;
} {
  const [favorites, setFavorites] = useState<Favorites>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/favorites", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : EMPTY))
      .then((data) => {
        if (!cancelled) {
          setFavorites({
            classIds: Array.isArray(data.classIds) ? data.classIds : [],
            tutorIds: Array.isArray(data.tutorIds) ? data.tutorIds : [],
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const isFavorited = useCallback(
    (type: FavoriteType, id: string) =>
      type === "class" ? favorites.classIds.includes(id) : favorites.tutorIds.includes(id),
    [favorites],
  );

  const toggle = useCallback(async (type: FavoriteType, id: string) => {
    const key = type === "class" ? "classIds" : "tutorIds";
    const wasSaved = favorites[key].includes(id);
    const next = wasSaved
      ? { ...favorites, [key]: favorites[key].filter((item) => item !== id) }
      : { ...favorites, [key]: [...favorites[key], id] };

    setFavorites(next);
    const res = await fetch("/api/favorites", {
      method: wasSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    });

    if (!res.ok) {
      setFavorites(favorites);
      throw new Error("Favorite request failed");
    }
  }, [favorites]);

  return useMemo(() => ({ isFavorited, toggle, favorites }), [favorites, isFavorited, toggle]);
}
