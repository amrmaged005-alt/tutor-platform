"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useFilterParams(defaults: Record<string, string>): {
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const next = { ...defaults };
    searchParams.forEach((value, key) => {
      next[key] = value;
    });
    return next;
  }, [defaults, searchParams]);

  const replace = useCallback((params: URLSearchParams) => {
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router]);

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    replace(params);
  }, [replace, searchParams]);

  const resetFilters = useCallback(() => replace(new URLSearchParams()), [replace]);

  return { filters, setFilter, resetFilters };
}
