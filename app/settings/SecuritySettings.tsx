"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  ShieldCheck, AlertTriangle, Eye, EyeOff, Loader2, CheckCircle,
  LogOut, KeyRound, Clock, MonitorSmartphone,
} from "lucide-react";
import { evaluatePasswordStrength } from "../lib/passwordStrength";

interface SecurityData {
  isEmailVerified: boolean;
  hasPassword: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  failedLoginCount: number;
  lockedUntil: string | null;
  providers: string[];
}

const card: React.CSSProperties = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-light)",
  borderRadius: 16,
  overflow: "hidden",
  marginBottom: "1.25rem",
};

const sectionHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "1rem 1.25rem",
  borderBottom: "1px solid var(--border-light)",
  fontWeight: 700,
  fontSize: 13,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--bg-alt)",
  border: "1px solid var(--border-light)",
  borderRadius: 8,
  padding: "10px 40px 10px 12px",
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

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function SecuritySettings({ security }: { security: SecurityData }) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 1.25rem 4rem", color: "var(--text)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "1rem 0 1.5rem" }}>
        <ShieldCheck size={20} style={{ color: "var(--accent)" }} aria-hidden />
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>Security</h2>
      </div>

      <EmailVerificationCard verified={security.isEmailVerified} />
      <AccountActivityCard security={security} />
      {security.hasPassword && <ChangePasswordCard />}
      <ConnectedAccountsCard providers={security.providers} hasPassword={security.hasPassword} />
      <SessionsCard />
    </div>
  );
}

function EmailVerificationCard({ verified }: { verified: boolean }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function resend() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-verification", { method: "POST" });
      if (res.ok) setSent(true);
      else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Could not send. Try again later.");
      }
    } catch {
      setError("Network error. Try again.");
    }
    setSending(false);
  }

  return (
    <div style={card}>
      <div style={sectionHeader}>Email verification</div>
      <div style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
        {verified ? (
          <>
            <CheckCircle size={22} style={{ color: "var(--success)", flexShrink: 0 }} aria-hidden />
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Your email is verified</p>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Your account is fully active.</p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle size={22} style={{ color: "var(--error)", flexShrink: 0 }} aria-hidden />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Email not verified</p>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
                {sent ? "Verification email sent — check your inbox." : error || "Verify your email to secure your account."}
              </p>
            </div>
            {!sent && (
              <button
                type="button"
                onClick={resend}
                disabled={sending}
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: sending ? "wait" : "pointer", flexShrink: 0 }}
              >
                {sending ? "Sending…" : "Resend"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AccountActivityCard({ security }: { security: SecurityData }) {
  const locked = security.lockedUntil && new Date(security.lockedUntil) > new Date();
  const row = (icon: React.ReactNode, label: string, value: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.9rem 1.25rem", borderTop: "1px solid var(--border-light)" }}>
      <span style={{ color: "var(--text-muted)", display: "flex", flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, textAlign: "end" }}>{value}</span>
    </div>
  );

  return (
    <div style={card}>
      <div style={sectionHeader}>Account activity</div>
      {row(<Clock size={16} aria-hidden />, "Last login", formatDate(security.lastLoginAt))}
      {row(<MonitorSmartphone size={16} aria-hidden />, "Last login IP", security.lastLoginIp ?? "—")}
      {row(
        <AlertTriangle size={16} aria-hidden />,
        "Failed login attempts",
        locked
          ? `${security.failedLoginCount} (locked until ${formatDate(security.lockedUntil)})`
          : String(security.failedLoginCount)
      )}
    </div>
  );
}

function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const strength = evaluatePasswordStrength(next);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setDone(false);
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setDone(true);
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        setError(data.error ?? "Could not change password.");
      }
    } catch {
      setError("Network error. Try again.");
    }
    setBusy(false);
  }

  return (
    <div style={card}>
      <div style={sectionHeader}>
        <KeyRound size={15} strokeWidth={1.8} aria-hidden /> Change password
      </div>
      <form onSubmit={submit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <input
          type={show ? "text" : "password"}
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Current password"
          autoComplete="current-password"
          style={{ ...inputStyle, padding: "10px 12px" }}
        />
        <div style={{ position: "relative" }}>
          <input
            type={show ? "text" : "password"}
            required
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="New password"
            autoComplete="new-password"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide passwords" : "Show passwords"}
            style={{ position: "absolute", insetInlineEnd: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}
          >
            {show ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
        </div>
        {next && (
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: 4, borderRadius: 2,
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
        <input
          type={show ? "text" : "password"}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          style={{ ...inputStyle, padding: "10px 12px" }}
        />

        {error && (
          <div style={{ backgroundColor: "var(--error-bg)", border: "1px solid var(--error-border)", color: "var(--error)", padding: "0.6rem 0.85rem", borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}
        {done && (
          <div style={{ backgroundColor: "var(--success-bg)", border: "1px solid var(--success)", color: "var(--success)", padding: "0.6rem 0.85rem", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            ✓ Password changed. A confirmation email has been sent.
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{ alignSelf: "flex-start", backgroundColor: busy ? "var(--accent-border)" : "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}
        >
          {busy && <Loader2 size={15} style={{ animation: "ssSpin 0.9s linear infinite" }} aria-hidden />}
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
      <style>{`@keyframes ssSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ConnectedAccountsCard({ providers, hasPassword }: { providers: string[]; hasPassword: boolean }) {
  const googleLinked = providers.includes("google");
  return (
    <div style={card}>
      <div style={sectionHeader}>Connected accounts</div>
      <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Google</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: googleLinked ? "var(--success)" : "var(--text-muted)" }}>
          {googleLinked ? "Connected" : "Not connected"}
        </span>
      </div>
      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Password login</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: hasPassword ? "var(--success)" : "var(--text-muted)" }}>
          {hasPassword ? "Enabled" : "Not set"}
        </span>
      </div>
    </div>
  );
}

function SessionsCard() {
  const [busy, setBusy] = useState(false);

  async function signOutAll() {
    setBusy(true);
    try {
      await fetch("/api/me/sessions", { method: "POST" });
    } catch {
      // ignore — we sign out locally regardless.
    }
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div style={card}>
      <div style={sectionHeader}>Active sessions</div>
      <div style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>Sign out everywhere</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
            Ends every session on all devices, including this one.
          </p>
        </div>
        <button
          type="button"
          onClick={signOutAll}
          disabled={busy}
          style={{ display: "flex", alignItems: "center", gap: 7, backgroundColor: "transparent", color: "var(--error)", border: "1px solid var(--error-border)", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: busy ? "wait" : "pointer", flexShrink: 0 }}
        >
          <LogOut size={15} aria-hidden />
          {busy ? "Signing out…" : "Sign out of all devices"}
        </button>
      </div>
    </div>
  );
}
