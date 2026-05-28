"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Status = "loading" | "success" | "error";

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-light)",
  borderRadius: 16,
  padding: "2rem",
  boxShadow: "var(--shadow-md)",
  textAlign: "center",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: "1.5rem",
  backgroundColor: "var(--accent)",
  color: "var(--accent-fg)",
  padding: "11px 22px",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 8,
  textDecoration: "none",
};

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid or expired link.");
      return;
    }

    let cancelled = false;
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.success) {
          setStatus("success");
          setMessage(
            data.alreadyVerified
              ? "Your email is already verified. You can log in."
              : "Email verified! You can now log in."
          );
        } else {
          setStatus("error");
          setMessage(data.error ?? "We couldn't verify your email.");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setMessage("Something went wrong. Please try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
      <div style={cardStyle}>
        {status === "loading" && (
          <>
            <Loader2
              size={36}
              style={{ color: "var(--accent)", animation: "veSpin 0.9s linear infinite" }}
              aria-hidden
            />
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "1rem 0 0.25rem", color: "var(--text)" }}>
              Verifying your email…
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>
              This will only take a moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={36} style={{ color: "var(--accent)" }} aria-hidden />
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "1rem 0 0.25rem", color: "var(--text)" }}>
              You're all set
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>{message}</p>
            <Link href="/login?verified=true" style={buttonStyle}>
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle size={36} style={{ color: "var(--error)" }} aria-hidden />
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "1rem 0 0.25rem", color: "var(--text)" }}>
              Verification failed
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0 }}>{message}</p>
            <Link href="/login" style={buttonStyle}>
              Back to login
            </Link>
          </>
        )}

        <style>{`@keyframes veSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}
