"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AnimatedCheck from "@/components/ui/AnimatedCheck";
import AuthShell from "@/components/ui/AuthShell";
import { useI18n } from "../components/i18n";

type Status = "loading" | "success" | "error";
type MessageKey = "verify.invalid" | "verify.already" | "verify.done" | "verify.error" | "verify.network";

export default function VerifyEmailPage() {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<MessageKey>("verify.invalid");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      queueMicrotask(() => {
        setStatus("error");
        setMessage("verify.invalid");
      });
      return;
    }
    let cancelled = false;
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        setStatus(response.ok && data.success ? "success" : "error");
        setMessage(response.ok && data.success
          ? data.alreadyVerified ? "verify.already" : "verify.done"
          : "verify.error");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
          setMessage("verify.network");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthShell heading={t("verify.shell.heading")} description={t("verify.shell.description")}>
      <div style={{ textAlign: "center" }} aria-busy={status === "loading"}>
        {status === "loading" ? <Loader2 size={52} color="var(--accent)" style={{ animation: "spin 0.8s linear infinite" }} aria-hidden /> : <AnimatedCheck error={status === "error"} />}
        <h1 style={{ margin: "14px 0 8px", color: "var(--text)", fontSize: "1.5rem" }}>
          {status === "loading" ? t("verify.loading") : status === "success" ? t("verify.success") : t("verify.failed")}
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>
          {status === "loading" ? t("reset.moment") : t(message)}
        </p>
        {status !== "loading" && (
          <Link href={status === "success" ? "/login?verified=true" : "/login"} className="btn-primary btn-primary-shimmer" style={{ width: "100%", marginTop: 20 }}>
            {status === "success" ? t("signup.goSignIn") : t("forgot.back")}
          </Link>
        )}
      </div>
    </AuthShell>
  );
}
