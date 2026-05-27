"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { StatusBadge } from "./DashboardPrimitives";

type Payout = {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  bookingId: string | null;
};

export default function DashboardPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/payouts", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { payouts: [] }))
      .then((data) => {
        if (!cancelled) setPayouts(Array.isArray(data.payouts) ? data.payouts : []);
      })
      .catch(() => {
        if (!cancelled) setPayouts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalEarned = useMemo(() => payouts.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0), [payouts]);

  return (
    <section style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1.25rem", marginTop: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
        <h2 style={{ color: "var(--text)", margin: 0, fontSize: "1.05rem", fontWeight: 850, display: "inline-flex", gap: 8, alignItems: "center" }}>
          <Wallet size={18} strokeWidth={1.8} aria-hidden /> Payouts
        </h2>
        <strong style={{ color: "var(--text)", fontSize: 14 }}>Total earned: {totalEarned} EGP</strong>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 160 }} />
      ) : payouts.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>No payouts yet. Complete sessions to earn.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--text)", fontSize: 13 }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", textAlign: "start" }}>
                {["Date", "Amount", "Status", "Reference"].map((heading) => (
                  <th key={heading} style={{ textAlign: "start", padding: "0.65rem", borderBottom: "1px solid var(--border-light)" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td style={{ padding: "0.75rem 0.65rem", borderBottom: "1px solid var(--border-light)" }}>{new Date(payout.paidAt ?? payout.createdAt).toLocaleDateString("en-EG")}</td>
                  <td style={{ padding: "0.75rem 0.65rem", borderBottom: "1px solid var(--border-light)", fontWeight: 800 }}>{payout.amount} EGP</td>
                  <td style={{ padding: "0.75rem 0.65rem", borderBottom: "1px solid var(--border-light)" }}><StatusBadge status={payout.status} /></td>
                  <td style={{ padding: "0.75rem 0.65rem", borderBottom: "1px solid var(--border-light)", color: "var(--text-muted)" }}>{payout.bookingId ?? payout.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } .skeleton { background: var(--color-border, var(--border-light)); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }`}</style>
    </section>
  );
}
