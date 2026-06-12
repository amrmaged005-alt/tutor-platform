"use client";

import { useState, useCallback } from "react";
import { Tag, X, Check, Loader2 } from "lucide-react";

interface PromoResult {
  discountPct: number;
  discountEgp: number;
  finalPrice: number;
}

interface PromoCodeInputProps {
  classId: string;
  priceEgp: number;
  onApply: (code: string, result: PromoResult) => void;
  onClear: () => void;
  disabled?: boolean;
}

export default function PromoCodeInput({
  classId,
  onApply,
  onClear,
  disabled = false,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<PromoResult | null>(null);
  const [appliedCode, setAppliedCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApply = useCallback(async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || disabled) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, classId }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.valid) {
        setError(data.error ?? "Invalid promo code");
        setApplied(null);
      } else {
        const result: PromoResult = {
          discountPct: data.discountPct,
          discountEgp: data.discountEgp,
          finalPrice: data.finalPrice,
        };
        setApplied(result);
        setAppliedCode(trimmed);
        setError(null);
        onApply(trimmed, result);
      }
    } catch {
      setError("Could not validate code. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [code, classId, disabled, onApply]);

  const handleClear = useCallback(() => {
    setCode("");
    setApplied(null);
    setAppliedCode("");
    setError(null);
    onClear();
  }, [onClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!applied) handleApply();
      }
    },
    [applied, handleApply]
  );

  if (applied) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          backgroundColor: "var(--success-bg, rgba(22,163,74,0.08))",
          border: "1px solid var(--success, #16a34a)",
          borderRadius: 10,
        }}
      >
        <Check
          size={16}
          strokeWidth={2.5}
          style={{ color: "var(--success, #16a34a)", flexShrink: 0 }}
          aria-hidden
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontWeight: 700,
              color: "var(--success, #16a34a)",
              fontSize: 13,
            }}
          >
            {appliedCode}
          </span>
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: 12,
              marginInlineStart: 8,
            }}
          >
            −{applied.discountEgp} EGP ({applied.discountPct}% off)
          </span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          aria-label="Remove promo code"
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            borderRadius: 6,
            color: "var(--text-muted)",
          }}
        >
          <X size={14} strokeWidth={2} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            backgroundColor: "var(--bg-alt)",
            border: `1px solid ${error ? "var(--error, #dc2626)" : "var(--border-light)"}`,
            borderRadius: 10,
            transition: "border-color 0.15s",
          }}
        >
          <Tag
            size={15}
            strokeWidth={1.8}
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
            aria-hidden
          />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Promo code"
            disabled={disabled || loading}
            aria-label="Promo code"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "promo-error" : undefined}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text)",
              letterSpacing: "0.06em",
              padding: "10px 0",
              minWidth: 0,
            }}
          />
          {loading && (
            <Loader2
              size={15}
              strokeWidth={2}
              style={{
                color: "var(--text-muted)",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }}
              aria-hidden
            />
          )}
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={!code.trim() || disabled || loading}
          style={{
            padding: "0 18px",
            borderRadius: 10,
            background:
              !code.trim() || disabled || loading
                ? "var(--bg-alt)"
                : "linear-gradient(135deg, var(--accent), var(--accent-hover))",
            color:
              !code.trim() || disabled || loading
                ? "var(--text-muted)"
                : "var(--accent-fg)",
            border: "1px solid var(--border-light)",
            fontWeight: 700,
            fontSize: 13,
            cursor: !code.trim() || disabled || loading ? "not-allowed" : "pointer",
            transition: "background 0.15s",
            whiteSpace: "nowrap" as const,
          }}
        >
          Apply
        </button>
      </div>

      {error && (
        <p
          id="promo-error"
          role="alert"
          style={{
            margin: "6px 0 0",
            fontSize: 12,
            color: "var(--error, #dc2626)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {error}
        </p>
      )}

      {/* CSS for the spinner — injected inline so no globals.css edit needed */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export type { PromoResult, PromoCodeInputProps };
