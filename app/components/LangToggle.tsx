"use client";

import { useState, useEffect } from "react";

export default function LangToggle() {
    const [lang, setLang] = useState<"en" | "ar">("en");

    useEffect(() => {
        const saved = localStorage.getItem("coursaty-lang") as "en" | "ar" | null;
        if (saved) apply(saved);
    }, []);

    function apply(l: "en" | "ar") {
        setLang(l);
        localStorage.setItem("coursaty-lang", l);
        const html = document.documentElement;
        html.lang = l;
        html.dir = l === "ar" ? "rtl" : "ltr";
        document.body.style.fontFamily =
            l === "ar"
                ? "'Cairo', system-ui, sans-serif"
                : "'Inter', system-ui, sans-serif";
    }

    return (
        <button
            onClick={() => apply(lang === "en" ? "ar" : "en")}
            aria-label="Toggle language"
            style={{
                position: "fixed",
                bottom: "1.5rem",
                left: "1.5rem",
                zIndex: 1000,
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                color: "#94a3b8",
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
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#3b82f6")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#334155")}
        >
            {lang === "en" ? "🇪🇬 عربي" : "🇬🇧 English"}
        </button>
    );
}