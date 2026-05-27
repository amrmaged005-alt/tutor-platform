"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Lock, X } from "lucide-react";
import { useI18n } from "@/app/components/i18n";
import { useFocusTrap } from "@/components/ui/useFocusTrap";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Where to send the user after sign-in (defaults to current page). */
  callbackUrl?: string;
  /** Optional title override; defaults to translated key. */
  title?: string;
  /** Optional body override. */
  body?: string;
}

export default function SignInRequiredModal({ open, onClose, callbackUrl, title, body }: Props) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(dialogRef, open, onClose);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const cb = callbackUrl
    ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "";

  return (
    <>
      <button type="button" className="modal-backdrop" aria-label="Close sign in dialog" onClick={onClose} />
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-modal-title"
        style={{ padding: "1.75rem 1.75rem 1.5rem" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14,
            background: "transparent", border: "none",
            color: "var(--text-muted)",
            cursor: "pointer", padding: 6, borderRadius: 8,
            display: "inline-flex",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-alt)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <X size={18} strokeWidth={1.8} />
        </button>

        <div style={{
          width: 48, height: 48, borderRadius: 12,
          backgroundColor: "var(--accent-bg)",
          border: "1px solid var(--accent-border)",
          color: "var(--accent)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          marginBottom: "1rem",
        }}>
          <Lock size={20} strokeWidth={1.8} />
        </div>

        <h2 id="signin-modal-title" style={{
          color: "var(--text)", fontSize: "1.15rem", fontWeight: 800,
          letterSpacing: "-0.015em", margin: 0,
        }}>
          {title ?? t("modal.signInRequired.title")}
        </h2>

        <p style={{
          color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65,
          margin: "0.5rem 0 1.5rem",
        }}>
          {body ?? t("modal.signInRequired.body")}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href={`/login${cb}`} className="btn-primary" style={{ width: "100%", padding: "11px", fontSize: 14, justifyContent: "center" }}>
            {t("modal.signInRequired.signIn")}
          </Link>
          <Link href={`/signup${cb}`} className="btn-secondary" style={{ width: "100%", padding: "10px", fontSize: 14, justifyContent: "center" }}>
            {t("modal.signInRequired.signUp")}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            style={{ width: "100%", padding: "10px", fontSize: 13, justifyContent: "center" }}
          >
            {t("modal.signInRequired.cancel")}
          </button>
        </div>
      </div>
    </>
  );
}
