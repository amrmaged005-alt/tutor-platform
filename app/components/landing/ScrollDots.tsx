"use client";

import { useEffect, useRef, useState } from "react";

const DOTS: Array<{ id: string; label: string }> = [
  { id: "hero", label: "Home" },
  { id: "trending", label: "Trending" },
  { id: "recommendations", label: "For You" },
];

export default function ScrollDots({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const [active, setActive] = useState("hero");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.section;
            if (id) setActive(id);
          }
        }
      },
      { root, threshold: 0.55 }
    );

    const sections = root.querySelectorAll("[data-section]");
    sections.forEach((s) => observerRef.current!.observe(s));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [scrollRef]);

  const scrollTo = (id: string) => {
    const root = scrollRef.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>(`[data-section="${id}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Page sections"
      style={{
        position: "fixed",
        insetInlineEnd: "1.25rem",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 500,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {DOTS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          aria-current={active === id ? "true" : undefined}
          onClick={() => scrollTo(id)}
          style={{
            width: active === id ? 10 : 8,
            height: active === id ? 10 : 8,
            borderRadius: "50%",
            border: "2px solid var(--accent)",
            backgroundColor: active === id ? "var(--accent)" : "transparent",
            cursor: "pointer",
            padding: 0,
            transition: "background 0.2s, width 0.2s, height 0.2s",
            flexShrink: 0,
          }}
        />
      ))}
      <style>{`
        @media (max-width: 768px) {
          nav[aria-label="Page sections"] { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
