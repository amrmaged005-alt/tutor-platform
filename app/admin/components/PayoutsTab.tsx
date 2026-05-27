"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, Check, X, Clock } from "lucide-react";

interface PayoutRecord {
  id: string;
  tutorId: string;
  tutorName: string | null;
  tutorEmail: string | null;
  amountEgp: number;
  status: string;
  requestedAt: string;
  processedAt: string | null;
  notes: string | null;
}

function statusStyles(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case "PROCESSING":
      return { bg: "var(--warning-bg)", color: "var(--warning)", label: "Processing" };
    case "PAID":
      return { bg: "var(--success-bg)", color: "var(--success)", label: "Paid" };
    case "FAILED":
      return { bg: "var(--error-bg)", color: "var(--error)", label: "Failed" };
    default:
      return { bg: "var(--bg-alt)", color: "var(--text-muted)", label: status };
  }
}

export default function PayoutsTab() {
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const url = statusFilter !== "ALL"
      ? `/api/admin/payouts?status=${statusFilter}`
      : "/api/admin/payouts";
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setPayouts(d.payouts ?? []))
      .catch(() => setError("Failed to load payouts"))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = useCallback(
    async (id: string, newStatus: "PROCESSING" | "PAID" | "FAILED") => {
      setUpdating(id);
      try {
        const res = await fetch("/api/admin/payouts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payoutId: id, status: newStatus }),
        });
        if (res.ok) {
          setPayouts((prev) =>
            prev.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: newStatus,
                    processedAt: ["PAID", "FAILED"].includes(newStatus)
                      ? new Date().toISOString()
                      : p.processedAt,
                  }
                : p
            )
          );
        }
      } catch {
        // ignore
      } finally {
        setUpdating(null);
      }
    },
    []
  );

  const thStyle: React.CSSProperties = {
    color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: 0.5, padding: "12px 16px", textAlign: "left",
    borderBottom: "1px solid var(--border-light)",
  };
  const tdStyle: React.CSSProperties = {
    color: "var(--text-secondary)", fontSize: 13, padding: "12px 16px",
    borderBottom: "1px solid var(--border-light)", verticalAlign: "middle",
  };

  const pending = payouts.filter((p) => p.status === "PROCESSING").length;
  const totalPaid = payouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amountEgp, 0);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--border-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <DollarSign size={16} strokeWidth={1.8} style={{ color: "var(--accent)" }} aria-hidden />
          <h3 style={{ margin: 0, color: "var(--text)", fontSize: 15, fontWeight: 700 }}>
            Payouts
          </h3>
          {pending > 0 && (
            <span
              style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                backgroundColor: "var(--warning-bg)", color: "var(--warning)",
              }}
            >
              {pending} pending
            </span>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border-light)",
            backgroundColor: "var(--bg-card)", color: "var(--text)", fontSize: 13, cursor: "pointer",
          }}
        >
          <option value="ALL">All statuses</option>
          <option value="PROCESSING">Processing</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Summary row */}
      <div
        style={{
          padding: "0.75rem 1.5rem",
          borderBottom: "1px solid var(--border-light)",
          backgroundColor: "var(--bg-alt)",
          display: "flex",
          gap: 24,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text)" }}>{payouts.length}</strong> records
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Total paid: <strong style={{ color: "var(--success)" }}>{totalPaid} EGP</strong>
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          Loading payouts…
        </div>
      ) : error ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--error)" }}>{error}</div>
      ) : payouts.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          <DollarSign size={32} strokeWidth={1.2} style={{ opacity: 0.3, display: "block", margin: "0 auto 10px" }} aria-hidden />
          No payouts found.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Tutor</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Requested</th>
                <th style={thStyle}>Processed</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => {
                const s = statusStyles(p.status);
                const isUpdating = updating === p.id;
                return (
                  <tr key={p.id}>
                    <td style={{ ...tdStyle, color: "var(--text)" }}>
                      <div style={{ fontWeight: 600 }}>{p.tutorName ?? "—"}</div>
                      {p.tutorEmail && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.tutorEmail}</div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: "var(--text)" }}>
                      {p.amountEgp} EGP
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                          backgroundColor: s.bg, color: s.color,
                          display: "inline-flex", alignItems: "center", gap: 4,
                        }}
                      >
                        {p.status === "PROCESSING" && <Clock size={10} strokeWidth={2} aria-hidden />}
                        {p.status === "PAID" && <Check size={10} strokeWidth={2.5} aria-hidden />}
                        {p.status === "FAILED" && <X size={10} strokeWidth={2.5} aria-hidden />}
                        {s.label}
                      </span>
                    </td>
                    <td style={tdStyle}>{new Date(p.requestedAt).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      {p.processedAt ? new Date(p.processedAt).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {p.status === "PROCESSING" && (
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(p.id, "PAID")}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "5px 12px", borderRadius: 7, border: "none",
                              backgroundColor: "var(--success-bg)", color: "var(--success)",
                              fontSize: 12, fontWeight: 700, cursor: "pointer",
                            }}
                          >
                            <Check size={12} strokeWidth={2.5} aria-hidden />
                            Mark Paid
                          </button>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(p.id, "FAILED")}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "5px 12px", borderRadius: 7,
                              border: "1px solid var(--error-border, rgba(220,38,38,0.3))",
                              backgroundColor: "var(--error-bg)", color: "var(--error)",
                              fontSize: 12, fontWeight: 700, cursor: "pointer",
                            }}
                          >
                            <X size={12} strokeWidth={2.5} aria-hidden />
                            Failed
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
