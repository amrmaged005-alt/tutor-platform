"use client";

import { useEffect, useMemo, useState } from "react";
import ClassCard, { type ClassCardData } from "@/app/classes/components/ClassCard";
import { useRecommendations } from "@/app/hooks/useRecommendations";

function SkeletonRow() {
  return (
    <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(220px, 260px)", gap: 14, overflowX: "auto" }}>
      {[0, 1, 2, 3].map((item) => (
        <div key={item} style={{ height: 190, borderRadius: 16, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)" }} />
      ))}
    </div>
  );
}

export default function RecommendationsSection() {
  const { recommendations, isLoading } = useRecommendations();
  const [topClasses, setTopClasses] = useState<ClassCardData[]>([]);
  const [topLoading, setTopLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/classes?sort=rating&limit=6", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (!cancelled) setTopClasses(Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setTopLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => (recommendations.length > 0 ? recommendations : topClasses).slice(0, 6), [recommendations, topClasses]);
  const loading = isLoading && topLoading;
  if (!loading && items.length === 0) return null;

  return (
    <section style={{ backgroundColor: "var(--bg)", padding: "2rem 1rem 3rem", borderTop: "1px solid var(--border-light)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <h2 style={{ color: "var(--text)", fontSize: "clamp(1.35rem, 2.5vw, 1.8rem)", margin: "0 0 1rem", fontWeight: 850 }}>
          {recommendations.length > 0 ? "Recommended for you" : "Top Classes"}
        </h2>
        {loading ? (
          <SkeletonRow />
        ) : (
          <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(220px, 260px)", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
            {items.map((cls, index) => <ClassCard key={cls.id} cls={cls} index={index} compact />)}
          </div>
        )}
      </div>
    </section>
  );
}
