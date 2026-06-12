"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { useI18n } from "@/app/components/i18n";

type Completeness = { score: number; missing: string[] };

const ITEMS = [
  { labelKey: "dash.checklist.verifyEmail", match: "email", href: "/settings", icon: "✉" },
  { labelKey: "dash.checklist.addPhoto", match: "profile photo", href: "/settings", icon: "📷" },
  { labelKey: "dash.checklist.writeBio", match: "bio", href: "/settings", icon: "✍" },
  { labelKey: "dash.checklist.addSubjects", match: "subject", href: "/settings", icon: "📚" },
  { labelKey: "dash.checklist.uploadCredential", match: "credential", href: "/settings", icon: "🎓" },
  { labelKey: "dash.checklist.firstBooking", match: "booking", href: "/dashboard/bookings", icon: "📅" },
] as const;

export default function DashboardChecklist({ tutorId }: { tutorId: string }) {
  const { t } = useI18n();
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
        {t("dash.checklist.complete")}
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
            {t("dash.checklist.title")}
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
              key={item.labelKey}
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
              <span style={{ flex: 1 }}>{t(item.labelKey)}</span>
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
                  {t("dash.checklist.todo")}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
