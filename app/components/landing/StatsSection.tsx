"use client";

import type { LandingStats } from "./LandingData";

export default function StatsSection({ stats = { tutors: 0, classes: 0, bookings: 0 } }: { stats?: LandingStats }) {
  const items = [
    ["Tutors", stats.tutors],
    ["Classes", stats.classes],
    ["Bookings", stats.bookings],
  ];
  return (
    <section style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border-light)", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {items.map(([label, value]) => (
          <div key={label} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "1.25rem", textAlign: "center" }}>
            <strong style={{ color: "var(--accent)", fontSize: "1.8rem" }}>{Number(value).toLocaleString()}</strong>
            <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0", fontWeight: 700 }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
