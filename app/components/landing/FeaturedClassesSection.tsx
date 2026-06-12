"use client";

import ClassCard from "@/app/classes/components/ClassCard";
import { useI18n } from "@/app/components/i18n";
import type { FeaturedClass } from "./LandingData";

export default function FeaturedClassesSection({ classes = [] }: { classes?: FeaturedClass[] }) {
  const { t } = useI18n();
  return (
    <section style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border-light)", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <h2 style={{ color: "var(--text)", fontSize: "clamp(1.35rem, 2.5vw, 1.8rem)", margin: "0 0 1rem", fontWeight: 850 }}>{t("landing.featuredClasses.title")}</h2>
        {classes.length === 0 ? (
          <p style={{ color: "var(--text-muted)", margin: 0 }}>{t("landing.featuredClasses.empty")}</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {classes.slice(0, 4).map((cls, index) => <ClassCard key={cls.id} cls={cls} index={index} />)}
          </div>
        )}
      </div>
    </section>
  );
}
