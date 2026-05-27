"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import ClassCard, { type ClassCardData } from "@/app/classes/components/ClassCard";

export default function TrendingSection() {
  const [items, setItems] = useState<ClassCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/classes/trending", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data.slice(0, 8) : []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section style={{ backgroundColor: "var(--bg)", padding: "2rem 1rem 3rem", borderTop: "1px solid var(--border-light)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <h2 style={{ color: "var(--text)", fontSize: "clamp(1.35rem, 2.5vw, 1.8rem)", margin: "0 0 1rem", fontWeight: 850, display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={22} strokeWidth={2} color="var(--rating)" aria-hidden />
          Trending This Week
        </h2>
        <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(220px, 260px)", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
          {loading
            ? [0, 1, 2, 3].map((item) => <div key={item} role="status" aria-label="Loading trending classes" style={{ height: 190, borderRadius: 16, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)" }} />)
            : items.map((cls, index) => (
              <div key={cls.id} style={{ position: "relative" }}>
                <span style={{ position: "absolute", top: 8, insetInlineStart: 8, zIndex: 3, backgroundColor: "var(--warning-bg)", color: "var(--rating)", border: "1px solid var(--warning)", borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 800 }}>
                  Trending
                </span>
                <ClassCard cls={cls} index={index} compact />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
