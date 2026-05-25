"use client";

import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  MapPin,
  CreditCard,
  MessageCircle,
  LayoutDashboard,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useI18n } from "../components/i18n";

export interface BookingConfirmedData {
  bookingId: string;
  amountEgp: number;
  platformFeeEgp: number | null;
  paymentStatus: string;
  classId: string;
  classTitle: string;
  classSubject: string;
  classSchedule: string | null;
  classLocation: string | null;
  paymentType: string;
  whatsappNumber: string;
  contactName: string;
}

export default function BookingConfirmedClient({ data }: { data: BookingConfirmedData }) {
  const { t } = useI18n();

  const isOnline = data.paymentType === "ONLINE";
  const isPaid = data.paymentStatus === "PAID";
  const isFailed = data.paymentStatus === "FAILED";
  const isPending = !isPaid && !isFailed;

  const heading = isFailed
    ? t("booking.paymentFailed")
    : isPaid
    ? t("booking.confirmed")
    : t("booking.received");

  const subheading = isFailed
    ? t("booking.paymentFailedDesc")
    : isOnline && isPaid
    ? t("booking.paidDesc", { amount: data.amountEgp.toLocaleString(), class: data.classTitle })
    : isOnline && isPending
    ? t("booking.pendingDesc", { class: data.classTitle })
    : t("booking.cashDesc", { class: data.classTitle });

  const statusLabel = isFailed
    ? t("booking.statusFailed")
    : isPaid
    ? t("booking.statusConfirmed")
    : t("booking.statusPending");
  const statusColor = isFailed ? "var(--error)" : isPaid ? "var(--success)" : "var(--rating)";
  const statusBg = isFailed ? "var(--error-bg)" : isPaid ? "var(--success-bg)" : "var(--warning-bg)";
  const statusBorder = isFailed ? "var(--error-border)" : isPaid ? "var(--accent-border)" : "rgba(184,134,27,0.3)";

  const whatsappMsg = encodeURIComponent(
    t("booking.whatsappMsg", { name: data.contactName, title: data.classTitle })
  );
  const whatsappHref = `https://wa.me/${data.whatsappNumber}?text=${whatsappMsg}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        fontFamily: "var(--font-sans)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
      }}
    >
      <div style={{ maxWidth: 520, width: "100%" }}>

        {/* Status icon */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          {isFailed ? (
            <XCircle size={64} strokeWidth={1.5} color="var(--error)" style={{ margin: "0 auto" }} />
          ) : isPending ? (
            <Clock size={64} strokeWidth={1.5} color="var(--rating)" style={{ margin: "0 auto" }} />
          ) : (
            <CheckCircle size={64} strokeWidth={1.5} color="var(--success)" style={{ margin: "0 auto" }} />
          )}
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              color: "var(--text)",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              margin: "0 0 0.625rem",
            }}
          >
            {heading}
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 15,
              lineHeight: 1.7,
              maxWidth: 400,
              margin: "0 auto",
            }}
          >
            {subheading}
          </p>
        </div>

        {/* Booking details card */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: 16,
            padding: "1.5rem",
            marginBottom: "1.25rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {t("booking.details")}
            </span>
            <span
              style={{
                backgroundColor: statusBg,
                color: statusColor,
                border: `1px solid ${statusBorder}`,
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 999,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {statusLabel}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Class title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <BookOpen size={13} strokeWidth={1.8} /> {t("booking.class")}
              </span>
              <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 600, textAlign: "right" }}>
                {data.classTitle}
              </span>
            </div>

            {/* Subject */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("booking.subject")}</span>
              <span
                style={{
                  backgroundColor: "var(--accent-bg)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-border)",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "2px 9px",
                  borderRadius: 999,
                }}
              >
                {data.classSubject}
              </span>
            </div>

            {/* Schedule */}
            {data.classSchedule && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={13} strokeWidth={1.8} /> {t("booking.schedule")}
                </span>
                <span style={{ color: "var(--text)", fontSize: 13 }}>{data.classSchedule}</span>
              </div>
            )}

            {/* Location */}
            {data.classLocation && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={13} strokeWidth={1.8} /> {t("booking.location")}
                </span>
                <span style={{ color: "var(--text)", fontSize: 13 }}>{data.classLocation}</span>
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--border-light)", margin: "4px 0" }} />

            {/* Amount */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("booking.amount")}</span>
              <span style={{ color: "var(--text)", fontSize: 14, fontWeight: 700 }}>
                {data.amountEgp === 0 ? t("booking.paymentCash").includes("Cash") ? t("common.free") : t("dash.free") : `${data.amountEgp.toLocaleString()} EGP`}
              </span>
            </div>

            {/* Platform fee */}
            {isOnline && isPaid && (data.platformFeeEgp ?? 0) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("booking.platformFee")}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {data.platformFeeEgp} EGP
                </span>
              </div>
            )}

            {/* Payment method */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <CreditCard size={13} strokeWidth={1.8} /> {t("booking.payment")}
              </span>
              <span style={{ color: "var(--text)", fontSize: 13 }}>
                {isOnline ? t("booking.paymentOnline") : t("booking.paymentCash")}
              </span>
            </div>
          </div>
        </div>

        {/* Next steps */}
        {!isFailed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.whatsappNumber && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: "#22c55e",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "0.875rem 1.25rem",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  transition: "background 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#16a34a";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#22c55e";
                  (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                }}
              >
                <MessageCircle size={17} strokeWidth={2} />
                {t("booking.whatsapp", { name: data.contactName })}
              </a>
            )}

            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "var(--bg-card)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.875rem 1.25rem",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--bg-alt)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--bg-card)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
              }}
            >
              <LayoutDashboard size={16} strokeWidth={1.8} />
              {t("booking.viewBookings")}
            </Link>

            <Link
              href="/classes"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                color: "var(--text-secondary)",
                fontSize: 13,
                textDecoration: "none",
                padding: "0.5rem",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
            >
              {t("booking.browseMore")} <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </div>
        )}

        {isFailed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link
              href={`/classes/${data.classId}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "var(--accent)",
                color: "var(--accent-fg)",
                borderRadius: 10,
                padding: "0.875rem 1.25rem",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                transition: "background 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--accent-hover)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--accent)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              {t("booking.tryAgain")} <ArrowRight size={15} strokeWidth={2} />
            </Link>

            <Link
              href="/classes"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                color: "var(--text-secondary)",
                fontSize: 13,
                textDecoration: "none",
                padding: "0.5rem",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; }}
            >
              {t("booking.browseMore")} <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
