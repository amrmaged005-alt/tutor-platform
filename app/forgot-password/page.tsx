"use client";

import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FloatingField, FormAlert } from "@/components/ui/AuthFields";
import AuthShell from "@/components/ui/AuthShell";
import AnimatedCheck from "@/components/ui/AnimatedCheck";
import { useI18n } from "../components/i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Could not send a reset link. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell heading={t("forgot.shell.heading")} description={t("forgot.shell.description")}>
      {sent ? (
        <div style={{ textAlign: "center" }}>
          <AnimatedCheck />
          <h1 style={{ margin: "14px 0 8px", color: "var(--text)", fontSize: "1.5rem" }}>{t("forgot.sentTitle")}</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>
            {t("forgot.sentBody", { email })}
          </p>
          <Link href="/login" className="btn-primary btn-primary-shimmer" style={{ width: "100%", marginTop: 20 }}>{t("forgot.back")}</Link>
        </div>
      ) : (
        <>
          <Mail size={26} strokeWidth={1.8} color="var(--accent)" aria-hidden />
          <h1 style={{ margin: "12px 0 6px", color: "var(--text)", fontSize: "1.5rem", letterSpacing: "-0.03em" }}>{t("forgot.title")}</h1>
          <p style={{ margin: "0 0 20px", color: "var(--text-secondary)", fontSize: 14 }}>{t("forgot.body")}</p>
          <form onSubmit={handleSubmit} aria-busy={loading} style={{ display: "grid", gap: 14 }}>
            <FloatingField id="email" name="email" type="email" required autoComplete="email" label={t("auth.email")} value={email} onChange={(event) => setEmail(event.target.value)} />
            {error && <FormAlert>{error}</FormAlert>}
            <button type="submit" disabled={loading} className="btn-primary btn-primary-shimmer" style={{ width: "100%", minHeight: 46 }}>
              {loading && <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} aria-hidden />}
              {loading ? t("forgot.sending") : t("forgot.send")}
            </button>
          </form>
          <p style={{ margin: "16px 0 0", textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
            {t("forgot.remembered")} <Link href="/login" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>{t("forgot.back")}</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
