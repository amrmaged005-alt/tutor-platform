"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import ClassCard, { type ClassCardData } from "./ClassCard";

export default function TrendingClassesRow({ isMobile }: { isMobile: boolean }) {
  const [items, setItems] = useState<ClassCardData[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/classes/trending", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data.slice(0, 6) : []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section style={{ marginBottom: isMobile ? "1.25rem" : "1.75rem" }}>
      <SectionHeader title="Trending This Week" subtitle="Popular with students right now" badge="Trending" badgeColor="var(--rating)" />
      <div style={{ display: "flex", overflowX: "auto", gap: 12, paddingBottom: 4 }}>
        {items.map((cls, index) => (
          <div key={cls.id} style={{ minWidth: isMobile ? 156 : 240, maxWidth: isMobile ? 180 : 260, position: "relative" }}>
            <span style={{ position: "absolute", top: 8, insetInlineStart: 8, zIndex: 3, backgroundColor: "var(--warning-bg)", color: "var(--rating)", border: "1px solid var(--warning)", borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 800 }}>Trending</span>
            <ClassCard cls={cls} index={index} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
