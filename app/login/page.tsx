"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import { useI18n } from "../components/i18n";
import { useIsMobile } from "../hooks/useIsMobile";

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--bg-alt)",
  border: "1px solid var(--border-light)",
  borderRadius: 8,
  padding: "11px 14px",
  color: "var(--text)",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  fontFamily: "inherit",
};

export default function LoginPage() {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("registered") === "true"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim().toLowerCase();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!email || !password) {
      setError(t("auth.required"));
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError(t("auth.invalid"));
      setLoading(false);
      return;
    }

    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    window.location.href = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
  }

  function focusInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--accent)";
    e.target.style.boxShadow = "0 0 0 3px rgba(13,89,70,0.10)";
    e.target.style.backgroundColor = "var(--bg-card)";
  }
  function blurInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = "var(--border-light)";
    e.target.style.boxShadow = "none";
    e.target.style.backgroundColor = "var(--bg-alt)";
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-alt)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        padding: isMobile ? "1rem 0.875rem" : "2rem 1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? "1rem" : "2rem" }}>
          <Link
            href="/"
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              textDecoration: "none",
              color: "var(--text)",
              letterSpacing: "-0.02em",
              display: "inline-block",
            }}
          >
            Coursaty
          </Link>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: 14 }}>
            {t("auth.welcome")}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: 16,
            padding: isMobile ? "1.125rem" : "2rem",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {registered && (
              <div
                style={{
                  backgroundColor: "var(--accent-bg)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <CheckCircle size={14} strokeWidth={2.2} aria-hidden />
                {t("auth.created")}
              </div>
            )}

            <div style={{ marginBottom: isMobile ? "0.75rem" : "1rem" }}>
              <label
                htmlFor="email"
                style={{ display: "block", color: "var(--text)", fontSize: 13, fontWeight: 600, marginBottom: "0.5rem" }}
              >
                {t("auth.email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>

            <div style={{ marginBottom: isMobile ? "1rem" : "1.5rem" }}>
              <label
                htmlFor="password"
                style={{ display: "block", color: "var(--text)", fontSize: 13, fontWeight: 600, marginBottom: "0.5rem" }}
              >
                {t("auth.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder={t("auth.passwordPlaceholder")}
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: "var(--error-bg)",
                  border: "1px solid var(--error-border)",
                  color: "var(--error)",
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertCircle size={14} strokeWidth={2} aria-hidden />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: loading ? "var(--accent-border)" : "var(--accent)",
                color: "var(--accent-fg)",
                padding: "11px",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {loading ? t("auth.signingIn") : t("auth.signIn")}
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--bg-subtle)", margin: isMobile ? "1rem 0" : "1.5rem 0" }} />

          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
            {t("auth.noAccount")}{" "}
            <Link href="/signup" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
              {t("auth.createOne")}
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? "0.75rem" : "1.5rem", marginTop: isMobile ? "1rem" : "1.5rem", flexWrap: "wrap" }}>
          {([
            t("auth.trust.verified"),
            t("auth.trust.free"),
            t("auth.trust.secure"),
          ] as string[]).map((badge) => (
            <span key={badge} style={{ color: "var(--text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <ShieldCheck size={12} strokeWidth={2.4} color="var(--accent)" aria-hidden />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
