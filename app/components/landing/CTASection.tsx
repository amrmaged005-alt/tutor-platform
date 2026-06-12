"use client";

import Link from "next/link";
import { useI18n } from "@/app/components/i18n";

export default function CTASection() {
  const { t } = useI18n();
  return (
    <section style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border-light)", padding: "3rem 1rem 4rem" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ color: "var(--text)", margin: 0, fontSize: "clamp(1.35rem, 2.5vw, 1.8rem)", fontWeight: 850 }}>{t("landing.cta.title")}</h2>
          <p style={{ color: "var(--text-muted)", margin: "0.35rem 0 0" }}>{t("landing.cta.body")}</p>
        </div>
        <Link href="/classes" className="btn-primary">{t("landing.cta.button")}</Link>
      </div>
    </section>
  );
}
