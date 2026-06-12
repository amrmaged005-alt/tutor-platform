"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Globe2, Moon, Sun } from "lucide-react";
import { type ReactNode } from "react";
import { useI18n } from "@/app/components/i18n";
import { useTheme } from "@/app/components/Theme";
import CairoSkyline from "./CairoSkyline";
import CoursatyLogo from "./CoursatyLogo";

const PROOF = [
  {
    quote: "auth.shell.proof1",
    author: "auth.shell.author1",
    rating: "4.8",
  },
  {
    quote: "auth.shell.proof2",
    author: "auth.shell.author2",
    rating: "5.0",
  },
  {
    quote: "auth.shell.proof3",
    author: "auth.shell.author3",
    rating: "4.6",
  },
] as const;

export default function AuthShell({
  children,
  heading,
  description,
}: {
  children: ReactNode;
  heading?: string;
  description?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { lang, setLang, t } = useI18n();
  const { theme, toggle } = useTheme();

  return (
    <main className="auth-shell">
      <aside className="auth-editorial" aria-label={t("auth.shell.about")}>
        {/* Photographic warmth behind the emerald — generated study-nook asset */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: "url('/higgsfield/auth-nook.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.16,
            mixBlendMode: "luminosity",
            pointerEvents: "none",
          }}
        />
        <span style={{ position: "relative", zIndex: 2 }}>
          <CoursatyLogo inverse showTagline />
        </span>
        <div className="auth-editorial-copy" style={{ position: "relative", zIndex: 2 }}>
          <h2>{heading ?? t("auth.shell.heading")}</h2>
          <p>{description ?? t("auth.shell.description")}</p>
        </div>
        <div className="auth-proof-stack">
          {PROOF.map((proof, index) => (
            <motion.div
              key={proof.quote}
              className="auth-proof"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: index * 0.07 }}
            >
              <span className="auth-proof-avatar">
                {t(proof.author).trim()[0]?.toUpperCase() ?? "C"}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    lineHeight: 1.55,
                    color: "var(--text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  {t(proof.quote)}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <strong style={{ fontSize: 11 }}>{t(proof.author)}</strong>
                  <span className="auth-proof-stars">★★★★★</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "var(--rating)",
                    }}
                  >
                    {proof.rating}
                  </span>
                </span>
              </span>
            </motion.div>
          ))}
        </div>
        <div className="auth-skyline-stage">
          <CairoSkyline />
        </div>
      </aside>
      <section className="auth-content">
        <div className="auth-mobile-brand">
          <CoursatyLogo showTagline />
        </div>
        <motion.div
          className="auth-card"
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
        <div className="auth-preferences">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="btn-secondary"
            style={{ minHeight: 34, padding: "6px 10px", fontSize: 11 }}
          >
            <Globe2 size={14} aria-hidden />
            {lang === "en" ? "AR | EN" : "عربي | EN"}
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="btn-secondary"
            style={{ width: 34, height: 34, padding: 0 }}
          >
            {theme === "dark" ? <Sun size={14} aria-hidden /> : <Moon size={14} aria-hidden />}
          </button>
        </div>
      </section>
    </main>
  );
}
