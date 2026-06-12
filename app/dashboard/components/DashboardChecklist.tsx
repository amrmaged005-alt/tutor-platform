"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

type Completeness = { score: number; missing: string[] };

const ITEMS = [
  { label: "Verify your email", match: "email", href: "/settings", icon: "✉" },
  { label: "Add profile photo", match: "profile photo", href: "/settings", icon: "📷" },
  { label: "Write your bio", match: "bio", href: "/settings", icon: "✍" },
  { label: "Add your subjects", match: "subject", href: "/settings", icon: "📚" },
  { label: "Upload a credential", match: "credential", href: "/settings", icon: "🎓" },
  { label: "Get your first booking", match: "booking", href: "/dashboard/bookings", icon: "📅" },
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
      <div
        style={{
          backgroundColor: "var(--success-bg)",
          border: "1px solid var(--accent-border)",
          color: "var(--success)",
          borderRadius: 14,
          padding: "1rem 1.25rem",
          fontWeight: 800,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <CheckCircle2 size={18} aria-hidden />
        Profile complete
      </div>
    );
  }

  const missingText = data.missing.join(" ").toLowerCase();

  return (
    <section
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h2 style={{ color: "var(--text)", margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>
            Tutor Onboarding
          </h2>
          <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 800 }}>{data.score}%</span>
        </div>
        <div
          style={{
            height: 6,
            overflow: "hidden",
            background: "var(--border-light)",
            borderRadius: 99,
          }}
        >
          <div
            style={{
              width: `${data.score}%`,
              height: "100%",
              background: "var(--accent)",
              borderRadius: 99,
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {ITEMS.map((item, index) => {
          const incomplete = missingText.includes(item.match);
          const Icon = incomplete ? Circle : CheckCircle2;
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0.65rem 1.25rem",
                color: incomplete ? "var(--text)" : "var(--text-muted)",
                textDecoration: "none",
                borderTop: index > 0 ? "1px solid var(--border-light)" : "none",
                fontSize: 13,
                fontWeight: incomplete ? 700 : 600,
                transition: "background var(--transition-fast)",
              }}
            >
              <Icon
                size={16}
                strokeWidth={2}
                color={incomplete ? "var(--text-muted)" : "var(--success)"}
                aria-hidden
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {incomplete && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 99,
                    background: "var(--warning-bg)",
                    color: "var(--warning)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  To do
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
