"use client";

import { useEffect, useState } from "react";

export type ClassSummary = {
  id: string;
  title: string;
  subject: string;
  description?: string | null;
  city?: string | null;
  location?: string | null;
  priceEgp?: number;
  capacity?: number | null;
  schedule?: string | null;
  format?: string;
  curriculum?: string;
  gradeLevel?: string | null;
  language?: string | null;
  bookingsCount?: number;
  spotsLeft?: number | null;
  avgRating?: number | null;
  reviewCount?: number;
  center?: { id: string; name: string; city?: string | null } | null;
  owner?: { id: string; fullName?: string | null; name?: string | null; photoUrl?: string | null; isVerified?: boolean } | null;
};

export function useRecommendations(): { recommendations: ClassSummary[]; isLoading: boolean } {
  const [recommendations, setRecommendations] = useState<ClassSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/recommendations", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setRecommendations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setRecommendations([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { recommendations, isLoading };
}
