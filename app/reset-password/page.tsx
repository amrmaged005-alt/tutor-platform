"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AnimatedCheck from "@/components/ui/AnimatedCheck";
import { FormAlert, PasswordField } from "@/components/ui/AuthFields";
import AuthShell from "@/components/ui/AuthShell";
import { evaluatePasswordStrength } from "../lib/passwordStrength";
import { useI18n } from "../components/i18n";

type Phase = "checking" | "invalid" | "form" | "success";

const STRENGTH_COLOR = {
  weak: "var(--error)",
  fair: "var(--warning)",
  strong: "var(--success)",
} as const;

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>("checking");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const strength = evaluatePasswordStrength(password);

  useEffect(() => {
    const nextToken = new URLSearchParams(window.location.search).get("token")?.trim() ?? "";
    if (!nextToken) {
      setPhase("invalid");
      return;
    }
    setToken(nextToken);
    let cancelled = false;
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(nextToken)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!cancelled) setPhase(response.ok && data.valid ? "form" : "invalid");
      })
      .catch(() => !cancelled && setPhase("invalid"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError(t("reset.mismatch"));
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) setPhase("success");
      else setError(data.error ?? "Could not reset your password. Request a fresh link.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell heading={t("reset.shell.heading")} description={t("reset.shell.description")}>
      {phase === "checking" && (
        <div style={{ textAlign: "center" }} aria-busy="true">
          <Loader2 size={52} color="var(--accent)" style={{ animation: "spin 0.8s linear infinite" }} aria-hidden />
          <h1 style={{ margin: "14px 0 6px", color: "var(--text)", fontSize: "1.5rem" }}>{t("reset.checking")}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("reset.moment")}</p>
        </div>
      )}
      {phase === "invalid" && (
        <div style={{ textAlign: "center" }}>
          <AnimatedCheck error />
          <h1 style={{ margin: "14px 0 6px", color: "var(--text)", fontSize: "1.5rem" }}>{t("reset.expired")}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("reset.expiredBody")}</p>
          <Link href="/forgot-password" className="btn-primary btn-primary-shimmer" style={{ width: "100%", marginTop: 20 }}>{t("reset.request")}</Link>
        </div>
      )}
      {phase === "success" && (
        <div style={{ textAlign: "center" }}>
          <AnimatedCheck />
          <h1 style={{ margin: "14px 0 6px", color: "var(--text)", fontSize: "1.5rem" }}>{t("reset.success")}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{t("reset.successBody")}</p>
          <Link href="/login" className="btn-primary btn-primary-shimmer" style={{ width: "100%", marginTop: 20 }}>{t("signup.goSignIn")}</Link>
        </div>
      )}
      {phase === "form" && (
        <>
          <h1 style={{ margin: "0 0 6px", color: "var(--text)", fontSize: "1.5rem" }}>{t("reset.title")}</h1>
          <p style={{ margin: "0 0 20px", color: "var(--text-secondary)", fontSize: 14 }}>{t("reset.body")}</p>
          <form onSubmit={handleSubmit} aria-busy={submitting} style={{ display: "grid", gap: 14 }}>
            <PasswordField id="password" name="password" required autoComplete="new-password" label={t("reset.newPassword")} value={password} onChange={(event) => setPassword(event.target.value)} />
            {password && (
              <div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map((index) => <span key={index} style={{ flex: 1, height: 4, borderRadius: 4, background: index < Math.max(1, Math.min(3, strength.score)) ? STRENGTH_COLOR[strength.level] : "var(--border-light)" }} />)}
                </div>
                <span style={{ display: "block", marginTop: 4, color: STRENGTH_COLOR[strength.level], fontSize: 12, fontWeight: 700 }}>{strength.label} password</span>
              </div>
            )}
            <PasswordField id="confirm" name="confirm" required autoComplete="new-password" label={t("reset.confirm")} value={confirm} onChange={(event) => setConfirm(event.target.value)} />
            {error && <FormAlert>{error}</FormAlert>}
            <button type="submit" disabled={submitting} className="btn-primary btn-primary-shimmer" style={{ width: "100%", minHeight: 46 }}>
              {submitting && <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} aria-hidden />}
              {submitting ? t("reset.updating") : t("reset.update")}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
