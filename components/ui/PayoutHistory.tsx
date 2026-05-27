"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, Clock, Check, X, Calendar } from "lucide-react";

interface PayoutRecord {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  classTitle: string | null;
}

interface PayoutSummary {
  pendingAmount: number;
  processingAmount: number;
  paidTotal: number;
  nextPayoutDate: string;
  payouts: PayoutRecord[];
}

function statusStyle(status: string): { bg: string; color: string } {
  switch (status) {
    case "PAID":
      return { bg: "var(--success-bg)", color: "var(--success)" };
    case "PROCESSING":
      return { bg: "var(--warning-bg)", color: "var(--warning)" };
    case "FAILED":
      return { bg: "var(--error-bg)", color: "var(--error)" };
    default:
      return { bg: "var(--bg-alt)", color: "var(--text-muted)" };
  }
}

function StatusIcon({ status }: { status: string }) {
  if (status === "PAID") return <Check size={10} strokeWidth={2.5} aria-hidden />;
  if (status === "PROCESSING") return <Clock size={10} strokeWidth={2} aria-hidden />;
  if (status === "FAILED") return <X size={10} strokeWidth={2.5} aria-hidden />;
  return <Clock size={10} strokeWidth={2} aria-hidden />;
}

export default function PayoutHistory() {
  const [data, setData] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/dashboard/payouts")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setData(d))
      .catch(() => setError("Failed to load payout history"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Loading payouts…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "var(--error)", fontSize: 13 }}>
        {error}
      </div>
    );
  }

  if (!data) return null;

  const visiblePayouts = showAll ? data.payouts : data.payouts.slice(0, 5);

  return (
    <div>
      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 10,
          marginBottom: "1rem",
        }}
      >
        <SummaryCard
          label="Total paid"
          value={`${data.paidTotal} EGP`}
          color="var(--success)"
          icon={<Check size={14} strokeWidth={2.5} aria-hidden />}
        />
        <SummaryCard
          label="Processing"
          value={`${data.processingAmount} EGP`}
          color="var(--warning)"
          icon={<Clock size={14} strokeWidth={2} aria-hidden />}
        />
        <SummaryCard
          label="Pending"
          value={`${data.pendingAmount} EGP`}
          color="var(--text-muted)"
          icon={<DollarSign size={14} strokeWidth={1.8} aria-hidden />}
        />
        <SummaryCard
          label="Next payout"
          value={new Date(data.nextPayoutDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          color="var(--accent)"
          icon={<Calendar size={14} strokeWidth={1.8} aria-hidden />}
        />
      </div>

      {/* History table */}
      {data.payouts.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
          <DollarSign size={28} strokeWidth={1.2} style={{ opacity: 0.3, display: "block", margin: "0 auto 8px" }} aria-hidden />
          No payouts yet.
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Class", "Amount", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      style={{
                        color: "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        padding: "8px 12px",
                        textAlign: "left",
                        borderBottom: "1px solid var(--border-light)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiblePayouts.map((p) => {
                  const s = statusStyle(p.status);
                  return (
                    <tr key={p.id}>
                      <td
                        style={{
                          padding: "10px 12px",
                          borderBottom: "1px solid var(--border-light)",
                          fontSize: 13,
                          color: "var(--text)",
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.classTitle ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          borderBottom: "1px solid var(--border-light)",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.amount} EGP
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          borderBottom: "1px solid var(--border-light)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 99,
                            backgroundColor: s.bg,
                            color: s.color,
                          }}
                        >
                          <StatusIcon status={p.status} />
                          {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          borderBottom: "1px solid var(--border-light)",
                          fontSize: 12,
                          color: "var(--text-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString()
                          : new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.payouts.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                border: "none",
                background: "transparent",
                color: "var(--accent)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "center",
                borderTop: "1px solid var(--border-light)",
              }}
            >
              {showAll ? "Show less" : `Show all ${data.payouts.length} payouts`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginBottom: 4,
          color: "var(--text-muted)",
        }}
      >
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4 }}>
          {label}
        </span>
      </div>
      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color }}>
        {value}
      </p>
    </div>
  );
}
