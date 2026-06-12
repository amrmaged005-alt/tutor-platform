"use client";

import { ErrorStateCard } from "@/components/ui/GlobalStateCards";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", background: "var(--bg)" }}>
      <div style={{ width: "min(100%, 390px)" }}><ErrorStateCard reset={reset} /></div>
    </main>
  );
}
