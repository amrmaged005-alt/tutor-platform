"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { evaluatePasswordStrength } from "../lib/passwordStrength";

type Phase = "checking" | "invalid" | "form" | "success";

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--bg-alt)",
  border: "1px solid var(--border-light)",
  borderRadius: 8,
  padding: "11px 40px 11px 14px",
  color: "var(--text)",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
};

const STRENGTH_COLOR: Record<string, string> = {
  weak: "var(--error)",
  fair: "#c98a00",
  strong: "var(--success)",
};

export default function ResetPasswordPage() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const strength = evaluatePasswordStrength(password);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token")?.trim() ?? "";
    if (!t) {
      setPhase("invalid");
      return;
    }
    setToken(t);
    let cancelled = false;
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(t)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        setPhase(res.ok && data.valid ? "form" : "invalid");
      })
      .catch(() => !cancelled && setPhase("invalid"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setPhase("success");
      } else {
        setError(data.error ?? "Could not reset your password. Try requesting a new link.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
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
          <Link href="/" style={{ fontSize: "1.5rem", fontWeight: 800, textDecoration: "none", color: "var(--text)", letterSpacing: "-0.02em" }}>
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
            textAlign: phase === "form" ? "start" : "center",
          }}
        >
          {phase === "checking" && (
            <>
              <Loader2 size={32} style={{ color: "var(--accent)", animation: "rpSpin 0.9s linear infinite" }} aria-hidden />
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: "1rem" }}>Checking your link…</p>
            </>
          )}

          {phase === "invalid" && (
            <>
              <AlertCircle size={36} style={{ color: "var(--error)" }} aria-hidden />
              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "1rem 0 0.5rem", color: "var(--text)" }}>Link expired</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
                This reset link is invalid or has expired. Request a fresh one.
              </p>
              <Link
                href="/forgot-password"
                style={{ display: "inline-block", marginTop: "1.5rem", backgroundColor: "var(--accent)", color: "var(--accent-fg)", padding: "11px 22px", fontSize: 14, fontWeight: 600, borderRadius: 8, textDecoration: "none" }}
              >
                Request new link
              </Link>
            </>
          )}

          {phase === "success" && (
            <>
              <CheckCircle size={36} style={{ color: "var(--accent)" }} aria-hidden />
              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "1rem 0 0.5rem", color: "var(--text)" }}>Password updated</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
                Your password has been changed. You can now log in with your new password.
              </p>
              <Link
                href="/login"
                style={{ display: "inline-block", marginTop: "1.5rem", backgroundColor: "var(--accent)", color: "var(--accent-fg)", padding: "11px 22px", fontSize: 14, fontWeight: 600, borderRadius: 8, textDecoration: "none" }}
              >
                Go to login
              </Link>
            </>
          )}

          {phase === "form" && (
            <>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 1.25rem", color: "var(--text)", textAlign: "center" }}>
                Set a new password
              </h1>
              <form onSubmit={handleSubmit}>
                <label htmlFor="password" style={{ display: "block", color: "var(--text)", fontSize: 13, fontWeight: 600, marginBottom: "0.5rem" }}>
                  New password
                </label>
                <div style={{ position: "relative", marginBottom: password ? "0.5rem" : "1rem" }}>
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    style={{ position: "absolute", insetInlineEnd: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}
                  >
                    {show ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
                  </button>
                </div>

                {password && (
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor:
                              (strength.level === "weak" && i === 0) ||
                              (strength.level === "fair" && i <= 1) ||
                              strength.level === "strong"
                                ? STRENGTH_COLOR[strength.level]
                                : "var(--border-light)",
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: STRENGTH_COLOR[strength.level], fontWeight: 600 }}>{strength.label} password</span>
                  </div>
                )}

                <label htmlFor="confirm" style={{ display: "block", color: "var(--text)", fontSize: 13, fontWeight: 600, marginBottom: "0.5rem" }}>
                  Confirm password
                </label>
                <div style={{ position: "relative", marginBottom: "1rem" }}>
                  <input
                    id="confirm"
                    type={show ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your new password"
                    style={inputStyle}
                  />
                </div>

                {error && (
                  <div style={{ backgroundColor: "var(--error-bg)", border: "1px solid var(--error-border)", color: "var(--error)", padding: "0.75rem 1rem", borderRadius: 8, fontSize: 13, marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={14} strokeWidth={2} aria-hidden />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    backgroundColor: submitting ? "var(--accent-border)" : "var(--accent)",
                    color: "var(--accent-fg)",
                    padding: "11px",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    borderRadius: 8,
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {submitting && <Loader2 size={15} style={{ animation: "rpSpin 0.9s linear infinite" }} aria-hidden />}
                  {submitting ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
        <style>{`@keyframes rpSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}
