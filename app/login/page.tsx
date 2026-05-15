"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const router = useRouter();
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
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    router.push(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard");
    router.refresh();
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
        padding: "2rem 1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
            Welcome back — sign in to continue
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: 16,
            padding: "2rem",
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Account created. Sign in to continue.
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="email"
                style={{ display: "block", color: "var(--text)", fontSize: 13, fontWeight: 600, marginBottom: "0.5rem" }}
              >
                Email address
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

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="password"
                style={{ display: "block", color: "var(--text)", fontSize: 13, fontWeight: 600, marginBottom: "0.5rem" }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Your password"
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
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
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--bg-subtle)", margin: "1.5rem 0" }} />

          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, margin: 0 }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          {["Verified Tutors", "Free to Browse", "Secure Login"].map((badge) => (
            <span key={badge} style={{ color: "var(--text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
