"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ShieldCheck } from "lucide-react";
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

function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = "var(--accent)";
  e.target.style.boxShadow = "0 0 0 3px rgba(13,89,70,0.10)";
  e.target.style.backgroundColor = "var(--bg-card)";
}
function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = "var(--border-light)";
  e.target.style.boxShadow = "none";
  e.target.style.backgroundColor = "var(--bg-alt)";
}

export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [defaultRole, setDefaultRole] = useState(() => {
    if (typeof window === "undefined") return "STUDENT";
    const role = new URLSearchParams(window.location.search).get("role");
    if (role === "tutor") return "TUTOR";
    if (role === "center") return "CENTER_ADMIN";
    return "STUDENT";
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const role = (form.elements.namedItem("role") as HTMLSelectElement).value;

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || t("signup.error.generic"));
      setLoading(false);
      return;
    }

    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    const next = new URLSearchParams({ registered: "true" });
    if (callbackUrl && callbackUrl.startsWith("/")) next.set("callbackUrl", callbackUrl);
    router.push(`/login?${next.toString()}`);
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
        gap: isMobile ? 0 : 48,
      }}
    >
      {/* Side panel — desktop only. Same atmospheric still-life as /login. */}
      {!isMobile && (
        <div
          style={{
            position: "relative",
            width: "min(440px, 38vw)",
            aspectRatio: "3 / 4",
            borderRadius: 22,
            overflow: "hidden",
            boxShadow: "0 32px 64px rgba(24,23,21,0.18), 0 0 0 1px var(--border-light)",
            opacity: 0,
            animation: "signupAsideFade 0.9s ease-out 0.1s forwards",
          }}
          aria-hidden="true"
        >
          <Image
            src="/higgsfield/auth-nook.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 1100px) 38vw, 440px"
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(155deg, transparent 50%, rgba(13,89,70,0.45) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              insetInlineStart: 22,
              insetBlockEnd: 22,
              insetInlineEnd: 22,
              color: "#fbfaf6",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textShadow: "0 1px 6px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85, marginBottom: 6 }}>
              Coursaty
            </div>
            <div>Start your learning journey.</div>
          </div>
          <style>{`@keyframes signupAsideFade { to { opacity: 1; } }`}</style>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 420 }}>

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
            {t("signup.tagline")}
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

            <div style={{ marginBottom: isMobile ? "0.75rem" : "1rem" }}>
              <label
                htmlFor="fullName"
                style={{ display: "block", color: "var(--text)", fontSize: 13, fontWeight: 600, marginBottom: "0.5rem" }}
              >
                {t("signup.fullName")}
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="Ahmed Hassan"
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>

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

            <div style={{ marginBottom: isMobile ? "0.75rem" : "1rem" }}>
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
                placeholder={t("signup.minPassword")}
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>

            <div style={{ marginBottom: isMobile ? "1rem" : "1.5rem" }}>
              <label
                htmlFor="role"
                style={{ display: "block", color: "var(--text)", fontSize: 13, fontWeight: 600, marginBottom: "0.5rem" }}
              >
                {t("signup.iAm")}
              </label>
              <select
                id="role"
                name="role"
                required
                value={defaultRole}
                onChange={(e) => setDefaultRole(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={focusInput}
                onBlur={blurInput}
              >
                <option value="STUDENT">{t("signup.student")}</option>
                <option value="TUTOR">{t("signup.tutor")}</option>
                <option value="CENTER_ADMIN">{t("signup.center")}</option>
              </select>
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
              {loading ? t("signup.creating") : t("signup.submit")}
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--bg-subtle)", margin: isMobile ? "1rem 0" : "1.5rem 0" }} />

          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
            {t("signup.hasAccount")}{" "}
            <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
              {t("signup.signIn")}
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? "0.75rem" : "1.5rem", marginTop: isMobile ? "1rem" : "1.5rem", flexWrap: "wrap" }}>
          {([
            t("signup.trust.free"),
            t("signup.trust.noCard"),
            t("signup.trust.instant"),
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
