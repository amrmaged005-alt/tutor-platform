"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/ui/AuthShell";
import { FloatingField, FormAlert, PasswordField } from "@/components/ui/AuthFields";
import { useI18n } from "../components/i18n";
import { loginSchema } from "../lib/validations";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [registered] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("registered") === "true");
  const [verified] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("verified") === "true");

  function validateField(name: string, value: string) {
    const parsed = loginSchema.partial().safeParse({ [name]: value });
    setFieldErrors((previous) => {
      const next = { ...previous };
      const message = parsed.success ? "" : parsed.error.issues.find((issue) => issue.path[0] === name)?.message ?? "";
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim().toLowerCase();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) next[String(issue.path[0])] = issue.message;
      });
      setFieldErrors(next);
      setLoading(false);
      return;
    }
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError(result.code || t("auth.invalid"));
      setLoading(false);
      return;
    }
    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    window.location.href =
      callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : "/dashboard";
  }

  return (
    <AuthShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: "0 0 6px", color: "var(--text)", fontSize: "clamp(1.6rem, 3vw, 1.95rem)", fontWeight: 850, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
          {t("auth.login.title")}
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>{t("auth.welcome")}</p>
      </div>

      <form onSubmit={handleSubmit} aria-busy={loading} style={{ display: "grid", gap: 14 }}>
        {(registered || verified) && <FormAlert tone="success">{verified ? t("auth.login.verified") : t("auth.created")}</FormAlert>}
        <FloatingField
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label={t("auth.email")}
          error={fieldErrors.email}
          onBlur={(event) => validateField("email", event.target.value)}
        />
        <div>
          <PasswordField
            id="password"
            name="password"
            autoComplete="current-password"
            required
            label={t("auth.password")}
            error={fieldErrors.password}
            onBlur={(event) => validateField("password", event.target.value)}
          />
          <Link href="/forgot-password" style={{ display: "inline-flex", marginTop: 7, color: "var(--accent)", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            {t("auth.forgot")}
          </Link>
        </div>
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FormAlert>{error}</FormAlert>
            </motion.div>
          )}
        </AnimatePresence>
        <button type="submit" disabled={loading} className="btn-primary btn-primary-shimmer" style={{ width: "100%", minHeight: 46 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={loading ? "loading" : "idle"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              {loading && <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} aria-hidden />}
              {loading ? t("auth.signingIn") : t("auth.signIn")}
            </motion.span>
          </AnimatePresence>
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 0" }}>
        <span style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>or</span>
        <span style={{ flex: 1, height: 1, background: "var(--border-light)" }} />
      </div>

      <p style={{ margin: "12px 0 0", textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
        {t("auth.noAccount")}{" "}
        <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>{t("auth.createOne")}</Link>
      </p>
      <details style={{ marginTop: 14 }}>
        <summary style={{ color: "var(--text-muted)", cursor: "pointer", fontSize: 12, textAlign: "center" }}>Other sign-in options</summary>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="btn-secondary"
          style={{ width: "100%", minHeight: 42, marginTop: 10 }}
        >
          <GoogleIcon />
          {t("auth.login.google")}
        </button>
      </details>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
        {[t("auth.trust.verified"), t("auth.trust.free"), t("auth.trust.secure")].map((label) => (
          <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: 11 }}>
            <ShieldCheck size={12} color="var(--accent)" aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </AuthShell>
  );
}
