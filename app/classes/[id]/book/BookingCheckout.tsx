"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, MapPin, Clock, Users } from "lucide-react";
import PromoCodeInput, { type PromoResult } from "@/components/ui/PromoCodeInput";

interface ClassSummary {
  id: string;
  title: string;
  subject: string;
  priceEgp: number;
  format: string;
  city: string | null;
  schedule: string | null;
  spotsLeft: number | null;
  tutorName: string;
}

interface BookingCheckoutProps {
  cls: ClassSummary;
}

export default function BookingCheckout({ cls }: BookingCheckoutProps) {
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const finalPrice = promoResult ? promoResult.finalPrice : cls.priceEgp;

  const handlePromoApply = useCallback((code: string, result: PromoResult) => {
    setPromoCode(code);
    setPromoResult(result);
  }, []);

  const handlePromoClear = useCallback(() => {
    setPromoCode(null);
    setPromoResult(null);
  }, []);

  const handleBook = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: cls.id,
          paymentType: "IN_PERSON",
          ...(promoCode ? { promoCode } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Could not create booking. Please try again.");
        return;
      }

      if (data.iframeUrl) {
        window.location.href = data.iframeUrl;
        return;
      }

      setDone(true);
      setTimeout(() => {
        window.location.href = data.bookingId
          ? `/booking-confirmed?bookingId=${data.bookingId}`
          : "/dashboard";
      }, 800);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [cls.id, promoCode, submitting]);

  if (done) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          color: "var(--text)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--success-bg, rgba(22,163,74,0.1))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BookOpen size={26} style={{ color: "var(--success, #16a34a)" }} />
        </div>
        <p style={{ fontWeight: 700, fontSize: 18 }}>Booking confirmed!</p>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Redirecting…</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
        color: "var(--text)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Back link */}
      <Link
        href={`/classes/${cls.id}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--text-muted)",
          textDecoration: "none",
          fontSize: 14,
          marginBottom: "1.5rem",
        }}
      >
        <ArrowLeft size={15} strokeWidth={2} aria-hidden />
        Back to class
      </Link>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
        Complete your booking
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: "1.75rem" }}>
        Review the details below before confirming.
      </p>

      {/* Class summary card */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 14,
          padding: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: "var(--accent-bg)",
              border: "1px solid var(--accent-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BookOpen size={20} style={{ color: "var(--accent)" }} aria-hidden />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontWeight: 800,
                fontSize: 15,
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const,
              }}
            >
              {cls.title}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {cls.subject} · {cls.tutorName}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
            marginTop: "1rem",
          }}
        >
          {cls.format && (
            <InfoRow icon={<Clock size={13} strokeWidth={1.8} aria-hidden />} label={cls.format} />
          )}
          {cls.city && (
            <InfoRow icon={<MapPin size={13} strokeWidth={1.8} aria-hidden />} label={cls.city} />
          )}
          {cls.schedule && (
            <InfoRow icon={<Clock size={13} strokeWidth={1.8} aria-hidden />} label={cls.schedule} />
          )}
          {cls.spotsLeft !== null && cls.spotsLeft > 0 && (
            <InfoRow
              icon={<Users size={13} strokeWidth={1.8} aria-hidden />}
              label={`${cls.spotsLeft} spot${cls.spotsLeft !== 1 ? "s" : ""} left`}
            />
          )}
        </div>
      </div>

      {/* Promo code */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 14,
          padding: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "var(--text-muted)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            marginBottom: "0.75rem",
          }}
        >
          Promo code
        </p>
        <PromoCodeInput
          classId={cls.id}
          priceEgp={cls.priceEgp}
          onApply={handlePromoApply}
          onClear={handlePromoClear}
          disabled={submitting}
        />
      </div>

      {/* Price summary */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 14,
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "var(--text-muted)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            marginBottom: "0.875rem",
          }}
        >
          Order summary
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <PriceRow label="Class price" value={`${cls.priceEgp} EGP`} />
          {promoResult && (
            <PriceRow
              label={`Discount (${promoResult.discountPct}%)`}
              value={`−${promoResult.discountEgp} EGP`}
              highlight
            />
          )}
          <div
            style={{
              height: 1,
              backgroundColor: "var(--border-light)",
              margin: "4px 0",
            }}
          />
          <PriceRow
            label="Total"
            value={`${finalPrice} EGP`}
            bold
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p
          role="alert"
          style={{
            padding: "10px 14px",
            backgroundColor: "var(--error-bg, rgba(220,38,38,0.08))",
            border: "1px solid var(--error-border, rgba(220,38,38,0.3))",
            borderRadius: 10,
            color: "var(--error, #dc2626)",
            fontSize: 13,
            marginBottom: "1rem",
          }}
        >
          {error}
        </p>
      )}

      {/* Book button */}
      <button
        type="button"
        onClick={handleBook}
        disabled={submitting}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 12,
          border: "none",
          background: submitting
            ? "var(--bg-alt)"
            : "linear-gradient(135deg, var(--accent), var(--accent-hover))",
          color: submitting ? "var(--text-muted)" : "var(--accent-fg)",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: submitting ? "not-allowed" : "pointer",
          boxShadow: submitting ? "none" : "0 4px 20px rgba(13,89,70,0.25)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!submitting) {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(13,89,70,0.32)";
          }
        }}
        onMouseLeave={(e) => {
          if (!submitting) {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(13,89,70,0.25)";
          }
        }}
      >
        {submitting ? "Processing…" : finalPrice === 0 ? "Book for free" : `Book now — ${finalPrice} EGP`}
      </button>

      <p
        style={{
          textAlign: "center" as const,
          color: "var(--text-muted)",
          fontSize: 12,
          marginTop: "0.75rem",
        }}
      >
        By booking you agree to Coursaty&apos;s terms.
      </p>
    </div>
  );
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "var(--text-muted)",
        fontSize: 12,
      }}
    >
      <span style={{ display: "inline-flex", color: "var(--text-muted)" }}>{icon}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
        {label}
      </span>
    </div>
  );
}

function PriceRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span
        style={{
          fontSize: bold ? 15 : 14,
          fontWeight: bold ? 800 : 500,
          color: "var(--text)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: bold ? 15 : 14,
          fontWeight: bold ? 800 : 600,
          color: highlight ? "var(--success, #16a34a)" : bold ? "var(--text)" : "var(--text-muted)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
