"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

type Completeness = { score: number; missing: string[] };

const ITEMS = [
  { label: "Add profile photo", match: "profile photo", href: "/settings" },
  { label: "Write bio (min 50 chars)", match: "bio", href: "/settings" },
  { label: "Set hourly rate", match: "rate", href: "/settings" },
  { label: "Add at least one subject", match: "subject", href: "/settings" },
  { label: "Upload a credential", match: "credential", href: "/settings" },
  { label: "Complete your first booking", match: "booking", href: "/dashboard/bookings" },
];

export default function DashboardChecklist({ tutorId }: { tutorId: string }) {
  const [data, setData] = useState<Completeness | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tutors/${tutorId}/completeness`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [tutorId]);

  if (!data) return null;
  if (data.score >= 100) {
    return (
      <div style={{ backgroundColor: "var(--success-bg)", border: "1px solid var(--success)", color: "var(--success)", borderRadius: 16, padding: "1rem 1.25rem", marginBottom: "1.25rem", fontWeight: 800 }}>
        Profile Complete 🎉
      </div>
    );
  }

  const missingText = data.missing.join(" ").toLowerCase();

  return (
    <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1.25rem", marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ color: "var(--text)", margin: 0, fontSize: "1rem", fontWeight: 850 }}>Profile checklist</h2>
        <span style={{ color: "var(--accent)", fontSize: 13, fontWeight: 850 }}>{data.score}% complete</span>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {ITEMS.map((item) => {
          const incomplete = missingText.includes(item.match);
          const Icon = incomplete ? Circle : CheckCircle2;
          return (
            <Link key={item.label} href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, color: incomplete ? "var(--text)" : "var(--text-muted)", textDecoration: "none", backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "0.75rem 0.875rem", fontSize: 14, fontWeight: 700 }}>
              <Icon size={17} strokeWidth={2} color={incomplete ? "var(--accent)" : "var(--success)"} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
