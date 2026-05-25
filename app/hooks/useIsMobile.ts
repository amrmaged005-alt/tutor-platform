"use client";

import { useSyncExternalStore } from "react";

export function useIsMobile(breakpoint = 640) {
  const query = `(max-width: ${breakpoint}px)`;

  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
