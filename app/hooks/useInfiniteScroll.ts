"use client";

import { useEffect, useRef, useState } from "react";

export function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean): {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
} {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || isLoading) return;
      setIsLoading(true);
      Promise.resolve(onLoadMore()).finally(() => setIsLoading(false));
    }, { rootMargin: "240px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return { sentinelRef, isLoading };
}
