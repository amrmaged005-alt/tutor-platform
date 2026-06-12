"use client";

import Link from "next/link";
import { useI18n } from "@/app/components/i18n";
import type { FeaturedTutor } from "./LandingData";

export default function FeaturedTutorsSection({ tutors = [] }: { tutors?: FeaturedTutor[] }) {
  const { t } = useI18n();
  return (
    <section style={{ backgroundColor: "var(--bg-alt)", borderTop: "1px solid var(--border-light)", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <h2 style={{ color: "var(--text)", fontSize: "clamp(1.35rem, 2.5vw, 1.8rem)", margin: "0 0 1rem", fontWeight: 850 }}>{t("landing.featuredTutors.title")}</h2>
        {tutors.length === 0 ? (
          <p style={{ color: "var(--text-muted)", margin: 0 }}>{t("landing.featuredTutors.empty")}</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {tutors.slice(0, 4).map((tutor) => (
              <Link key={tutor.id} href={`/tutors/${tutor.id}`} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "1rem", color: "var(--text)", textDecoration: "none" }}>
                <strong>{tutor.fullName ?? tutor.name ?? t("landing.featuredTutors.fallbackName")}</strong>
                <p style={{ color: "var(--text-muted)", margin: "0.35rem 0 0", fontSize: 13 }}>{tutor.subjects?.slice(0, 3).join(", ") || t("landing.featuredTutors.fallbackMeta")}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
