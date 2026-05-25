"use client";

import Link from "next/link";
import { useI18n } from "./i18n";

function Check({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FooterContent() {
  const { t } = useI18n();

  const TRUST_ITEMS = [
    t("footer.trust.verified"),
    t("footer.trust.free"),
    t("footer.trust.curricula"),
    t("footer.trust.booking"),
  ];

  const platformLinks = [
    { label: t("nav.browseClasses"), href: "/classes" },
    { label: t("nav.tutors"),        href: "/tutors" },
    { label: t("nav.centers"),       href: "/centers" },
  ];
  const forLinks = [
    { label: t("nav.forTutors"),   href: "/signup?role=tutor" },
    { label: t("roles.centers"),   href: "/signup?role=center" },
    { label: t("nav.dashboard"),   href: "/dashboard" },
  ];
  const accountLinks = [
    { label: t("footer.createAccount"), href: "/signup" },
    { label: t("nav.signIn"),           href: "/login" },
  ];

  return (
    <footer role="contentinfo" style={{ borderTop: "1px solid var(--border-light)", backgroundColor: "var(--bg-alt)" }}>

      {/* Trust bar */}
      <div style={{
        borderBottom: "1px solid var(--border-light)",
        padding: "1rem 1.5rem",
        backgroundColor: "var(--bg-card)",
      }}>
        <div style={{
          maxWidth: 1140, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "2rem", flexWrap: "wrap",
        }}>
          {TRUST_ITEMS.map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13 }}>
              <span style={{ color: "var(--accent)" }}><Check /></span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
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
        {/* Brand column */}
        <div>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              textDecoration: "none", marginBottom: 12,
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: 6,
              background: "var(--accent)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "var(--accent-fg)", fontSize: 12, fontWeight: 800,
            }}>C</span>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Coursaty
            </span>
          </Link>
          <p style={{ color: "var(--text-secondary)", fontSize: 13.5, lineHeight: 1.7, maxWidth: 260, margin: "0 0 1.25rem" }}>
            {t("footer.tagline")}
          </p>
          <Link href="/classes" className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
            {t("nav.browseClasses")}
          </Link>
        </div>

        {/* Platform */}
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

        {/* Partners */}
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

        {/* Account */}
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

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid var(--border-light)", padding: "1.25rem 1.5rem" }}>
        <div style={{
          maxWidth: 1140, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "0.5rem",
        }}>
          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
            © {new Date().getFullYear()} Coursaty. {t("footer.rights")}
          </div>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            <Link href="/privacy" style={{ color: "var(--text-muted)", fontSize: 12, textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}>
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" style={{ color: "var(--text-muted)", fontSize: 12, textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}>
              {t("footer.terms")}
            </Link>
            <a href="mailto:hello@coursaty.com" style={{ color: "var(--text-muted)", fontSize: 12, textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}>
              {t("footer.contact")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
