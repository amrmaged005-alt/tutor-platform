"use client";

import Link from "next/link";
import { useI18n } from "./i18n";

export default function FooterContent() {
  const { t } = useI18n();

  const platformLinks = [
    { label: t("nav.browseClasses"), href: "/classes" },
    { label: t("nav.tutors"),        href: "/tutors" },
    { label: t("nav.centers"),       href: "/centers" },
  ];
  const forLinks = [
    { label: t("nav.forTutors"),     href: "/signup?role=tutor" },
    { label: t("roles.centers"),     href: "/signup?role=center" },
    { label: t("nav.dashboard"),     href: "/dashboard" },
  ];
  const accountLinks = [
    { label: t("footer.createAccount"), href: "/signup" },
    { label: t("nav.signIn"),           href: "/login" },
  ];

  return (
    <footer
      role="contentinfo"
      style={{
        borderTop: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-alt)",
      }}
    >
      <div
        className="footer-grid"
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          padding: "3.5rem 1.5rem 2rem",
          display: "grid",
          gridTemplateColumns: "1.4fr repeat(3, 1fr)",
          gap: "2.5rem",
        }}
      >
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", marginBottom: 10, letterSpacing: "-0.02em" }}>
            Coursaty
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13.5, lineHeight: 1.7, maxWidth: 260, margin: "0 0 1.25rem" }}>
            {t("footer.tagline")}
          </p>
          <Link href="/classes" className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
            {t("nav.browseClasses")}
          </Link>
        </div>

        <div>
          <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>
            {t("footer.platform")}
          </div>
          <nav aria-label="Platform navigation" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {platformLinks.map((link) => (
              <Link key={link.href} href={link.href} className="footer-nav-link">{link.label}</Link>
            ))}
          </nav>
        </div>

        <div>
          <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>
            {t("footer.partners")}
          </div>
          <nav aria-label="Partner navigation" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {forLinks.map((link) => (
              <Link key={link.href} href={link.href} className="footer-nav-link">{link.label}</Link>
            ))}
          </nav>
        </div>

        <div>
          <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1rem" }}>
            {t("footer.account")}
          </div>
          <nav aria-label="Account navigation" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {accountLinks.map((link) => (
              <Link key={link.href} href={link.href} className="footer-nav-link">{link.label}</Link>
            ))}
          </nav>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border-light)", padding: "1.25rem 1.5rem" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
            © {new Date().getFullYear()} Coursaty. {t("footer.rights")}
          </div>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{t("footer.privacy")}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{t("footer.terms")}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{t("footer.contact")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
