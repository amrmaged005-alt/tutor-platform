"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Minus } from "lucide-react";

interface RevenueData {
  grossRevenue: number;
  platformFee: number;
  netRevenue: number;
  revenueByClass: Array<{ classId: string; classTitle: string; revenue: number; bookingCount: number }>;
  revenueByTutor: Array<{ tutorId: string; tutorName: string; revenue: number; classCount: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
}

type Period = "month" | "quarter" | "year";

function StatCard({ label, value, icon, accent = false }: { label: string; value: string; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{
      padding: "1rem 1.25rem", borderRadius: 12, border: "1px solid var(--border-light)",
      backgroundColor: accent ? "var(--accent-bg)" : "var(--bg-card)",
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <span style={{ padding: 8, borderRadius: 10, backgroundColor: accent ? "var(--accent)" : "var(--bg-alt)", color: accent ? "var(--accent-fg)" : "var(--accent)", display: "flex", flexShrink: 0 }}>
        {icon}
      </span>
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
        <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{value}</p>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: Array<{ month: string; revenue: number }> }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 100 }}>
      {data.map((d) => {
        const pct = (d.revenue / max) * 100;
        return (
          <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: "100%", backgroundColor: "var(--accent)", borderRadius: "4px 4px 0 0", height: `${pct}%`, minHeight: 3, transition: "height 0.4s ease" }} />
            <span style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{d.month.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

const thS: React.CSSProperties = {
  color: "var(--text-muted)", fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: 0.5,
  padding: "10px 14px", textAlign: "left",
  borderBottom: "1px solid var(--border-light)",
};
const tdS: React.CSSProperties = {
  padding: "10px 14px", borderBottom: "1px solid var(--border-light)",
  fontSize: 13, color: "var(--text-secondary)", verticalAlign: "middle",
};

export default function CenterAdminRevenue({ centerId }: { centerId: string }) {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/centers/${centerId}/revenue?period=${period}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setData(d); })
      .finally(() => setLoading(false));
  }, [centerId, period]);

  const periods: Array<{ key: Period; label: string }> = [
    { key: "month", label: "This Month" },
    { key: "quarter", label: "This Quarter" },
    { key: "year", label: "This Year" },
  ];

  return (
    <div>
      {/* Period selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {periods.map((p) => (
          <button key={p.key} onClick={() => setPeriod(p.key)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: "1px solid var(--border-light)",
            background: period === p.key ? "var(--accent)" : "var(--bg-alt)",
            color: period === p.key ? "var(--accent-fg)" : "var(--text-muted)",
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading revenue…</div>
      ) : !data ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--error)" }}>Failed to load.</div>
      ) : (
        <>
          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
            <StatCard label="Gross Revenue" value={`${data.grossRevenue.toLocaleString()} EGP`} icon={<DollarSign size={16} strokeWidth={1.8} />} accent />
            <StatCard label="Platform Fee" value={`${data.platformFee.toLocaleString()} EGP`} icon={<Minus size={16} strokeWidth={1.8} />} />
            <StatCard label="Net Revenue" value={`${data.netRevenue.toLocaleString()} EGP`} icon={<TrendingUp size={16} strokeWidth={1.8} />} />
          </div>

          {/* Monthly chart */}
          {data.revenueByMonth.length > 0 && (
            <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", padding: "16px", marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Revenue by Month</h3>
              <BarChart data={data.revenueByMonth} />
            </div>
          )}

          {/* Top classes */}
          {data.revenueByClass.length > 0 && (
            <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)" }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Top Classes</h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thS}>Class</th>
                    <th style={{ ...thS, textAlign: "center" }}>Bookings</th>
                    <th style={{ ...thS, textAlign: "right" }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenueByClass.slice(0, 10).map((c) => (
                    <tr key={c.classId}>
                      <td style={tdS}>{c.classTitle}</td>
                      <td style={{ ...tdS, textAlign: "center" }}>{c.bookingCount}</td>
                      <td style={{ ...tdS, textAlign: "right", fontWeight: 700, color: "var(--text)" }}>
                        {c.revenue.toLocaleString()} EGP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Top tutors */}
          {data.revenueByTutor.length > 0 && (
            <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)" }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Top Tutors</h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thS}>Tutor</th>
                    <th style={{ ...thS, textAlign: "center" }}>Classes</th>
                    <th style={{ ...thS, textAlign: "right" }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenueByTutor.slice(0, 10).map((t) => (
                    <tr key={t.tutorId}>
                      <td style={tdS}>{t.tutorName}</td>
                      <td style={{ ...tdS, textAlign: "center" }}>{t.classCount}</td>
                      <td style={{ ...tdS, textAlign: "right", fontWeight: 700, color: "var(--text)" }}>
                        {t.revenue.toLocaleString()} EGP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.revenueByClass.length === 0 && (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
              No revenue data for this period.
            </div>
          )}
        </>
      )}
    </div>
  );
}
