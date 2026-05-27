"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Gift, Users, Wallet, Share2 } from "lucide-react";

interface ReferralData {
  referralCode: string;
  walletBalanceEgp: number;
  referralCount: number;
  completedCount: number;
  totalEarnedEgp: number;
}

interface ReferralClientProps {
  data: ReferralData;
}

export default function ReferralClient({ data }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [referralCode, setReferralCode] = useState(data.referralCode);

  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${referralCode}`
      : `https://coursaty.com/signup?ref=${referralCode}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for non-HTTPS or browser restrictions
      const ta = document.createElement("textarea");
      ta.value = referralUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [referralUrl]);

  const handleGenerate = useCallback(async () => {
    if (generating || referralCode) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/me/referral");
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.referralCode) {
        setReferralCode(data.referralCode);
      }
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  }, [generating, referralCode]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join Coursaty!",
        text: "Find verified tutors and great classes. Use my referral link to sign up:",
        url: referralUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  }, [referralUrl, handleCopy]);

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
        color: "var(--text)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center" as const, marginBottom: "2rem" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent-bg), var(--bg-alt))",
            border: "2px solid var(--accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
          }}
        >
          <Gift size={28} style={{ color: "var(--accent)" }} aria-hidden />
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
          Refer &amp; earn
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, margin: 0, maxWidth: 380, marginInline: "auto" }}>
          Invite friends to Coursaty. When they book their first class, you both earn wallet credit.
        </p>
      </div>

      {/* Wallet balance */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 16,
          padding: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Wallet size={22} style={{ color: "var(--accent)" }} aria-hidden />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.06em", margin: 0 }}>
            Wallet balance
          </p>
          <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text)", margin: 0 }}>
            {data.walletBalanceEgp} <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)" }}>EGP</span>
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
          marginBottom: "1.5rem",
        }}
      >
        <StatCard icon={<Users size={18} style={{ color: "var(--accent)" }} />} value={data.referralCount} label="Invited" />
        <StatCard icon={<Check size={18} style={{ color: "var(--success, #16a34a)" }} />} value={data.completedCount} label="Completed" />
        <StatCard icon={<Wallet size={18} style={{ color: "var(--accent)" }} />} value={`${data.totalEarnedEgp} EGP`} label="Earned" />
      </div>

      {/* Referral link */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 16,
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
          Your referral link
        </p>

        {!referralCode ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "1.5px dashed var(--border-light)",
              background: "var(--bg-alt)",
              color: "var(--accent)",
              fontWeight: 700,
              fontSize: 14,
              cursor: generating ? "wait" : "pointer",
            }}
          >
            {generating ? "Generating…" : "Generate my referral link"}
          </button>
        ) : (
          <>
            {/* Code display */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-light)",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--accent)",
                  letterSpacing: "0.08em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {referralCode}
              </span>
            </div>

            {/* URL display */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-light)",
                borderRadius: 10,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {referralUrl}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border-light)",
                  background: copied ? "var(--success-bg, rgba(22,163,74,0.08))" : "var(--bg-alt)",
                  color: copied ? "var(--success, #16a34a)" : "var(--text)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                aria-label={copied ? "Copied!" : "Copy link"}
              >
                {copied ? (
                  <>
                    <Check size={15} strokeWidth={2.5} aria-hidden />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={15} strokeWidth={1.8} aria-hidden />
                    Copy
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleShare}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                  color: "var(--accent-fg)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
                aria-label="Share referral link"
              >
                <Share2 size={15} strokeWidth={1.8} aria-hidden />
                Share
              </button>
            </div>
          </>
        )}
      </div>

      {/* How it works */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 16,
          padding: "1.25rem",
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "var(--text-muted)",
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            marginBottom: "1rem",
          }}
        >
          How it works
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Step n="1" text="Share your unique referral link with friends" />
          <Step n="2" text="They sign up and book their first class" />
          <Step n="3" text="You both receive wallet credit automatically" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 14,
        padding: "1rem 0.875rem",
        textAlign: "center" as const,
      }}
    >
      <span style={{ display: "inline-flex", marginBottom: 6 }}>{icon}</span>
      <p style={{ fontSize: "1.3rem", fontWeight: 900, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
          color: "var(--accent-fg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <p style={{ fontSize: 14, color: "var(--text)", margin: 0, paddingTop: 4 }}>{text}</p>
    </div>
  );
}
