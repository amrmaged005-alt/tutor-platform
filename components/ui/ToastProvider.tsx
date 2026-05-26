"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useI18n } from "@/app/components/i18n";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = Omit<Toast, "id">;

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined,
});

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toneStyles(tone: ToastTone) {
  if (tone === "success") {
    return { icon: CheckCircle2, color: "var(--success)", bg: "var(--success-bg)", border: "var(--accent-border)" };
  }
  if (tone === "error") {
    return { icon: XCircle, color: "var(--error)", bg: "var(--error-bg)", border: "var(--error-border)" };
  }
  return { icon: Info, color: "var(--accent)", bg: "var(--accent-bg)", border: "var(--accent-border)" };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { t } = useI18n();

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    const id = makeId();
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
    window.setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: "fixed",
          insetInlineEnd: "var(--space-md)",
          insetBlockEnd: "var(--space-md)",
          zIndex: 10001,
          display: "grid",
          gap: "var(--space-sm)",
          width: "min(360px, calc(100vw - 2rem))",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          const tone = toneStyles(toast.tone);
          const Icon = tone.icon;

          return (
            <div
              key={toast.id}
              role="status"
              style={{
                pointerEvents: "auto",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "var(--space-sm)",
                alignItems: "start",
                background: "var(--bg-elevated)",
                color: "var(--text)",
                border: `1px solid ${tone.border}`,
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                padding: "12px",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: tone.bg,
                  color: tone.color,
                }}
              >
                <Icon size={18} strokeWidth={2.1} aria-hidden />
              </span>
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: "block", fontSize: 14, lineHeight: 1.35, color: "var(--text)" }}>
                  {toast.title}
                </strong>
                {toast.description && (
                  <span style={{ display: "block", marginTop: 2, fontSize: 13, lineHeight: 1.45, color: "var(--text-secondary)" }}>
                    {toast.description}
                  </span>
                )}
              </span>
              <button
                type="button"
                aria-label={t("toast.dismiss")}
                onClick={() => dismiss(toast.id)}
                style={{
                  width: 44,
                  height: 44,
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-card)",
                  color: "var(--text-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={15} strokeWidth={2} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
