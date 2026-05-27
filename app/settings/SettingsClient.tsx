"use client";

import { useState, useCallback, useTransition } from "react";
import { Bell, Mail, MessageSquare, BookOpen, Clock, Star, DollarSign, Megaphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NotifPrefs {
  notifyBookingConfirmed: boolean;
  notifyBookingCancelled: boolean;
  notifyNewMessage: boolean;
  notifyWaitlistOpened: boolean;
  notifyReviewReceived: boolean;
  notifyPayoutProcessed: boolean;
  notifyMarketingEmails: boolean;
}

interface SettingsClientProps {
  initialPrefs: NotifPrefs;
}

const PREFS: Array<{
  key: keyof NotifPrefs;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    key: "notifyBookingConfirmed",
    label: "Booking confirmed",
    description: "When your booking is confirmed or a student books your class",
    icon: BookOpen,
  },
  {
    key: "notifyBookingCancelled",
    label: "Booking cancelled",
    description: "When a booking is cancelled by you or the instructor",
    icon: BookOpen,
  },
  {
    key: "notifyNewMessage",
    label: "New messages",
    description: "When you receive a new message in your inbox",
    icon: MessageSquare,
  },
  {
    key: "notifyWaitlistOpened",
    label: "Waitlist spot available",
    description: "When a seat opens up in a class you're waiting for",
    icon: Clock,
  },
  {
    key: "notifyReviewReceived",
    label: "New review",
    description: "When a student leaves a review on your class",
    icon: Star,
  },
  {
    key: "notifyPayoutProcessed",
    label: "Payout processed",
    description: "When a payout has been sent to your account",
    icon: DollarSign,
  },
  {
    key: "notifyMarketingEmails",
    label: "Marketing & promotions",
    description: "News, promotions, and tips from Coursaty",
    icon: Megaphone,
  },
];

function Toggle({
  checked,
  onChange,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      style={{
        position: "relative",
        width: 44,
        height: 24,
        borderRadius: 999,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: checked
          ? "linear-gradient(135deg, var(--accent), var(--accent-hover))"
          : "var(--border-light)",
        transition: "background 0.2s",
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 3,
          insetInlineStart: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          backgroundColor: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
          transition: "inset-inline-start 0.2s",
        }}
      />
    </button>
  );
}

export default function SettingsClient({ initialPrefs }: SettingsClientProps) {
  const [prefs, setPrefs] = useState<NotifPrefs>(initialPrefs);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = useCallback(
    (key: keyof NotifPrefs, value: boolean) => {
      const updated = { ...prefs, [key]: value };
      setPrefs(updated);
      setSaved(false);
      setSaveError(null);

      startTransition(async () => {
        try {
          const res = await fetch("/api/me/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [key]: value }),
          });
          if (res.ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
          } else {
            const data = await res.json().catch(() => ({}));
            setSaveError(data.error ?? "Could not save. Please try again.");
            setPrefs(prefs); // revert
          }
        } catch {
          setSaveError("Network error. Please try again.");
          setPrefs(prefs); // revert
        }
      });
    },
    [prefs]
  );

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
        color: "var(--text)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bell size={22} style={{ color: "var(--accent)" }} aria-hidden />
        </div>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>
            Notification settings
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
            Choose which email notifications you receive
          </p>
        </div>
      </div>

      {/* Save feedback */}
      {saved && (
        <div
          role="status"
          style={{
            padding: "10px 14px",
            backgroundColor: "var(--success-bg, rgba(22,163,74,0.08))",
            border: "1px solid var(--success, #16a34a)",
            borderRadius: 10,
            color: "var(--success, #16a34a)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          ✓ Preferences saved
        </div>
      )}
      {saveError && (
        <div
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
          {saveError}
        </div>
      )}

      {/* Email section */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <Mail size={15} strokeWidth={1.8} style={{ color: "var(--text-muted)" }} aria-hidden />
          <span
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: "var(--text-muted)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.06em",
            }}
          >
            Email notifications
          </span>
        </div>

        {/* Toggle rows */}
        {PREFS.map(({ key, label, description, icon: Icon }, i) => (
          <label
            key={key}
            htmlFor={`pref-${key}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "1rem 1.25rem",
              borderBottom:
                i < PREFS.length - 1 ? "1px solid var(--border-light)" : "none",
              cursor: isPending ? "wait" : "pointer",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-light)",
                flexShrink: 0,
              }}
            >
              <Icon size={15} strokeWidth={1.8} color="var(--accent)" aria-hidden />
            </span>

            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{label}</p>
              <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>
                {description}
              </p>
            </div>

            <Toggle
              id={`pref-${key}`}
              checked={prefs[key]}
              onChange={(v) => handleToggle(key, v)}
              disabled={isPending}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
