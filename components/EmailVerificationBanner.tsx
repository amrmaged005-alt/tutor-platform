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
        backgroundColor: "#451a03",
        borderBottom: "1px solid #92400e",
        padding: "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {/* Left — warning message */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span style={{ color: "#fcd34d", fontSize: 14, fontWeight: 500 }}>
          Please verify your email address to unlock bookings.
        </span>
      </div>

      {/* Right — action */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {error && (
          <span style={{ color: "#f87171", fontSize: 13 }}>{error}</span>
        )}
        {sent ? (
          <span style={{ color: "#4ade80", fontSize: 13, fontWeight: 600 }}>
            ✓ Verification email sent — check your inbox
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={sending}
            style={{
              backgroundColor: "#d97706",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "0.4rem 1rem",
              fontSize: 13,
              fontWeight: 700,
              cursor: sending ? "not-allowed" : "pointer",
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? "Sending..." : "Resend verification email"}
          </button>
        )}
      </div>
    </div>
  );
}