"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
import { useI18n } from "../components/i18n";
import { useIsMobile } from "../hooks/useIsMobile";
import { loginSchema } from "../lib/validations";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateField(name: string, value: string) {
    const partial = loginSchema.partial().safeParse({ [name]: value });
    if (!partial.success) {
      const msg = partial.error.issues.find((i) => i.path[0] === name)?.message ?? "";
      setFieldErrors((prev) => ({ ...prev, [name]: msg }));
    } else {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  }
  const [registered] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("registered") === "true"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email    = (form.elements.namedItem("email")    as HTMLInputElement).value.trim().toLowerCase();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setFieldErrors(errs);
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
        gap: isMobile ? 0 : 48,
      }}
    >
      {/* Side panel — desktop only. Warmth + tone before any form interaction. */}
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
            animation: "loginAsideFade 0.9s ease-out 0.1s forwards",
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
            <div>{t("auth.welcome")}</div>
          </div>
          <style>{`@keyframes loginAsideFade { to { opacity: 1; } }`}</style>
        </div>
      )}

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
          {/* Google OAuth */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundColor: "#4285F4",
              color: "#fff",
              padding: "11px",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              marginBottom: "1rem",
              transition: "opacity 0.15s",
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--border-light)" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "var(--border-light)" }} />
          </div>

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
                style={{ ...inputStyle, borderColor: fieldErrors.email ? "var(--error)" : undefined }}
                onFocus={focusInput}
                onBlur={(e) => { blurInput(e); validateField("email", e.target.value); }}
              />
              {fieldErrors.email && <div style={{ color: "var(--error)", fontSize: 12, marginTop: 4 }}>{fieldErrors.email}</div>}
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
                style={{ ...inputStyle, borderColor: fieldErrors.password ? "var(--error)" : undefined }}
                onFocus={focusInput}
                onBlur={(e) => { blurInput(e); validateField("password", e.target.value); }}
              />
              {fieldErrors.password && <div style={{ color: "var(--error)", fontSize: 12, marginTop: 4 }}>{fieldErrors.password}</div>}
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
