"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";

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
  fontFamily: "inherit",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Too many requests. Please wait and try again.");
        setLoading(false);
        return;
      }
      // Always treat as success — the API never reveals whether the email exists.
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-alt)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        padding: "2rem 1.25rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link
            href="/"
            style={{ fontSize: "1.5rem", fontWeight: 800, textDecoration: "none", color: "var(--text)", letterSpacing: "-0.02em" }}
          >
            Coursaty
          </Link>
        </div>

        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: 16,
            padding: "2rem",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <CheckCircle size={36} style={{ color: "var(--accent)" }} aria-hidden />
              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "1rem 0 0.5rem", color: "var(--text)" }}>
                Check your email
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
                If an account with that email exists, you&apos;ll receive a reset link shortly. The link expires in 1 hour.
              </p>
              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  marginTop: "1.5rem",
                  backgroundColor: "var(--accent)",
                  color: "var(--accent-fg)",
                  padding: "11px 22px",
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <Mail size={28} style={{ color: "var(--accent)" }} aria-hidden />
                <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0.75rem 0 0.25rem", color: "var(--text)" }}>
                  Forgot your password?
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <label htmlFor="email" style={{ display: "block", color: "var(--text)", fontSize: 13, fontWeight: 600, marginBottom: "0.5rem" }}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                />

                {error && (
                  <div
                    style={{
                      backgroundColor: "var(--error-bg)",
                      border: "1px solid var(--error-border)",
                      color: "var(--error)",
                      padding: "0.75rem 1rem",
                      borderRadius: 8,
                      fontSize: 13,
                      marginTop: "1rem",
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
                    marginTop: "1.5rem",
                    backgroundColor: loading ? "var(--accent-border)" : "var(--accent)",
                    color: "var(--accent-fg)",
                    padding: "11px",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 8,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {loading && <Loader2 size={15} style={{ animation: "fpSpin 0.9s linear infinite" }} aria-hidden />}
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, marginTop: "1.5rem", marginBottom: 0 }}>
                Remembered it?{" "}
                <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
        <style>{`@keyframes fpSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}
