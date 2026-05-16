"use client";

import { useI18n } from "./i18n";

export default function LangToggle() {
    const { lang, setLang } = useI18n();

    return (
        <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            aria-label="Toggle language"
            style={{
                position: "fixed",
                bottom: "1.5rem",
                left: "1.5rem",
                zIndex: 1000,
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                color: "var(--text-muted)",
                borderRadius: "9999px",
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 200ms ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-light)")}
        >
            {lang === "en" ? "عربي" : "English"}
        </button>
    );
}
