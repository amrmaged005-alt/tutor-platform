"use client";

import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { type InputHTMLAttributes, type ReactNode, useId, useState } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  trailing?: ReactNode;
};

export function FloatingField({ label, error, trailing, id, ...props }: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={error ? "field-error" : undefined}>
      <div className="floating-field">
        <input
          {...props}
          id={fieldId}
          placeholder=" "
          className="input"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <label htmlFor={fieldId}>{label}</label>
        {trailing}
      </div>
      {error && (
        <span id={errorId} className="field-message">
          {error}
        </span>
      )}
    </div>
  );
}

export function PasswordField({ label, error, ...props }: Omit<FieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <FloatingField
      {...props}
      label={label}
      error={error}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            insetInlineEnd: 10,
            insetBlockStart: "50%",
            display: "inline-flex",
            padding: 6,
            color: "var(--text-muted)",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            opacity: visible ? 1 : 0.72,
            transform: "translateY(-50%)",
            transition: "opacity var(--transition-fast)",
          }}
        >
          {visible ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
        </button>
      }
    />
  );
}

export function FormAlert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "success" }) {
  const success = tone === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0.75rem 0.875rem",
        color: success ? "var(--success)" : "var(--error)",
        background: success ? "var(--success-bg)" : "var(--error-bg)",
        border: `1px solid ${success ? "var(--accent-border)" : "var(--error-border)"}`,
        borderRadius: "var(--radius-md)",
        fontSize: 13,
      }}
    >
      <AlertCircle size={15} strokeWidth={2} aria-hidden />
      {children}
    </div>
  );
}

