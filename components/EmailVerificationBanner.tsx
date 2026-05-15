"use client";

import { useState } from "react";

export default function EmailVerificationBanner() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleResend() {
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Could not send email. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid rgba(138,90,20,0.31)",
        borderLeft: "3px solid var(--rating)",
        padding: "0.7rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {/* Left — warning message */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
          ⚠
        </div>
        <div>
          <span style={{ color: "var(--rating)", fontSize: 13, fontWeight: 600 }}>
            Email verification required
          </span>
          <span style={{ color: "#78716c", fontSize: 13, marginLeft: 6 }}>
            — verify your email to unlock bookings.
          </span>
        </div>
      </div>

      {/* Right — action */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {error && (
          <span style={{ color: "var(--error)", fontSize: 13 }}>{error}</span>
        )}
        {sent ? (
          <span style={{ color: "var(--success)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 16 }}>✓</span> Email sent — check your inbox
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={sending}
            style={{
              background: "linear-gradient(135deg, var(--warning), var(--warning))",
              color: "var(--accent-fg)",
              border: "none",
              borderRadius: 8,
              padding: "0.4rem 1rem",
              fontSize: 13,
              fontWeight: 700,
              cursor: sending ? "not-allowed" : "pointer",
              opacity: sending ? 0.7 : 1,
              boxShadow: "0 2px 8px rgba(217,119,6,0.3)",
            }}
          >
            {sending ? "Sending..." : "Resend email"}
          </button>
        )}
      </div>
    </div>
  );
}