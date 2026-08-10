"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/ui/AuthShell";
import { FloatingField, FormAlert, PasswordField } from "@/components/ui/AuthFields";
import { evaluatePasswordStrength } from "../lib/passwordStrength";
import { signupSchema } from "../lib/validations";
import { useI18n } from "../components/i18n";

const STRENGTH_COLOR = {
  weak: "var(--error)",
  fair: "var(--warning)",
  strong: "var(--success)",
} as const;

export default function SignupPage() {
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [password, setPassword] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [role, setRole] = useState(() => {
    if (typeof window === "undefined") return "STUDENT";
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    if (requestedRole === "tutor") return "TUTOR";
    // Centers self-serve hidden per Open Decision #1 default (overhaul/16, T1-04). Admin-assigned CENTER_ADMIN still supported.
    return "STUDENT";
  });
  const strength = evaluatePasswordStrength(password);

  function validateField(name: string, value: string) {
    const parsed = signupSchema.partial().safeParse({ [name]: value });
    setFieldErrors((previous) => {
      const next = { ...previous };
      const message = parsed.success ? "" : parsed.error.issues.find((issue) => issue.path[0] === name)?.message ?? "";
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }

  async function resendVerification() {
    if (!submittedEmail) return;
    setResending(true);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: submittedEmail }),
    }).catch(() => undefined);
    setResent(true);
    setResending(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = event.currentTarget;
    const values = {
      fullName: (form.elements.namedItem("fullName") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim().toLowerCase(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
      role: (form.elements.namedItem("role") as HTMLSelectElement).value,
    };
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) next[String(issue.path[0])] = issue.message;
      });
      setFieldErrors(next);
      setLoading(false);
      return;
    }
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Could not create your account. Please try again.");
      setLoading(false);
      return;
    }
    setSubmittedEmail(values.email);
    setLoading(false);
  }

  return (
    <AuthShell heading={t("signup.shell.heading")} description={t("signup.shell.description")}>
      {submittedEmail ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center" }}>
          <CheckCircle2 size={54} strokeWidth={1.7} color="var(--accent)" aria-hidden />
          <h1 style={{ margin: "16px 0 8px", color: "var(--text)", fontSize: "1.55rem", letterSpacing: "-0.03em" }}>{t("signup.checkEmail")}</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>
            {t("signup.verificationBody", { email: submittedEmail })}
          </p>
          <button type="button" onClick={resendVerification} disabled={resending || resent} className="btn-secondary" style={{ width: "100%", marginTop: 20 }}>
            <Mail size={16} aria-hidden />
            {resent ? t("signup.verificationSent") : resending ? t("signup.sending") : t("signup.resend")}
          </button>
          <Link href="/login" className="btn-primary btn-primary-shimmer" style={{ width: "100%", marginTop: 10 }}>{t("signup.goSignIn")}</Link>
        </motion.div>
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            <span style={{ color: "var(--bronze)", fontSize: 12, fontWeight: 800 }}>{t("signup.kicker")}</span>
            <h1 style={{ margin: "6px 0 4px", color: "var(--text)", fontSize: "1.65rem", letterSpacing: "-0.035em" }}>{t("signup.title")}</h1>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>{t("signup.body")}</p>
          </div>
          <form onSubmit={handleSubmit} aria-busy={loading} style={{ display: "grid", gap: 12 }}>
            <FloatingField id="fullName" name="fullName" required autoComplete="name" label={t("signup.fullName")} error={fieldErrors.fullName} onBlur={(event) => validateField("fullName", event.target.value)} />
            <FloatingField id="email" name="email" required type="email" autoComplete="email" label={t("auth.email")} error={fieldErrors.email} onBlur={(event) => validateField("email", event.target.value)} />
            <FloatingField id="phone" name="phone" type="tel" autoComplete="tel" label={t("signup.phone")} error={fieldErrors.phone} onBlur={(event) => validateField("phone", event.target.value)} />
            <PasswordField id="password" name="password" required autoComplete="new-password" label={t("auth.password")} error={fieldErrors.password} value={password} onChange={(event) => setPassword(event.target.value)} onBlur={(event) => validateField("password", event.target.value)} />
            {password && (
              <div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map((index) => (
                    <span key={index} style={{ flex: 1, height: 4, borderRadius: 4, background: index < Math.max(1, Math.min(3, strength.score)) ? STRENGTH_COLOR[strength.level] : "var(--border-light)" }} />
                  ))}
                </div>
                <span style={{ display: "block", marginTop: 4, color: STRENGTH_COLOR[strength.level], fontSize: 12, fontWeight: 700 }}>{strength.label} password</span>
              </div>
            )}
            <label htmlFor="role" style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 700 }}>{t("signup.role")}</label>
            <select id="role" name="role" className="input" value={role} onChange={(event) => setRole(event.target.value)} aria-label="Account role">
              <option value="STUDENT">{t("signup.student")}</option>
              <option value="TUTOR">{t("signup.tutor")}</option>
              {/* Centers self-serve hidden per Open Decision #1 default (overhaul/16, T1-04). Admin-assigned CENTER_ADMIN still supported. */}
            </select>
            <AnimatePresence>
              {error && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><FormAlert>{error}</FormAlert></motion.div>}
            </AnimatePresence>
            <button type="submit" disabled={loading} className="btn-primary btn-primary-shimmer" style={{ width: "100%", minHeight: 46 }}>
              {loading && <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} aria-hidden />}
              {loading ? t("signup.creating") : t("signup.submit")}
            </button>
          </form>
          <p style={{ margin: "16px 0 0", textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
            {t("signup.hasAccount")} <Link href="/login" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>{t("signup.signIn")}</Link>
          </p>
          <p style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 5, margin: "14px 0 0", color: "var(--text-muted)", fontSize: 11 }}>
            <ShieldCheck size={13} color="var(--accent)" aria-hidden />
            {t("signup.private")}
          </p>
        </>
      )}
    </AuthShell>
  );
}
