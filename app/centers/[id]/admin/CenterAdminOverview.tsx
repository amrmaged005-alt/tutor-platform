"use client";

import { useEffect, useCallback, useState } from "react";
import { DollarSign, Users, GraduationCap, BookOpen, CheckCircle, Star } from "lucide-react";

interface CenterStats {
  totalRevenue: number;
  revenueThisMonth: number;
  activeTutors: number;
  activeClasses: number;
  totalStudents: number;
  totalBookings: number;
  avgRating: number | null;
  topTutor: { id: string; name: string; bookings: number } | null;
  revenueByTutor: Array<{ tutorId: string; name: string; amount: number }>;
}

function StatCard({ label, value, sub, icon }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
}) {
  return (
    <div style={{
      padding: "1rem 1.25rem", borderRadius: 12,
      border: "1px solid var(--border-light)", backgroundColor: "var(--bg-card)",
      display: "flex", alignItems: "flex-start", gap: 12,
    }}>
      <span style={{ padding: 8, borderRadius: 10, backgroundColor: "var(--accent-bg)", color: "var(--accent)", display: "flex", flexShrink: 0 }}>
        {icon}
      </span>
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
        <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>{value}</p>
        {sub && <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function CenterAdminOverview({ centerId }: { centerId: string }) {
  const [stats, setStats] = useState<CenterStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/centers/${centerId}/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setStats(d); })
      .finally(() => setLoading(false));
  }, [centerId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading…</div>;
  if (!stats) return <div style={{ padding: "3rem", textAlign: "center", color: "var(--error)" }}>Failed to load stats.</div>;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        <StatCard label="Total Revenue" value={`${stats.totalRevenue} EGP`} sub={`${stats.revenueThisMonth} EGP this month`} icon={<DollarSign size={16} strokeWidth={1.8} />} />
        <StatCard label="Active Tutors" value={stats.activeTutors} icon={<Users size={16} strokeWidth={1.8} />} />
        <StatCard label="Active Classes" value={stats.activeClasses} icon={<GraduationCap size={16} strokeWidth={1.8} />} />
        <StatCard label="Total Students" value={stats.totalStudents} icon={<BookOpen size={16} strokeWidth={1.8} />} />
        <StatCard label="Total Bookings" value={stats.totalBookings} icon={<CheckCircle size={16} strokeWidth={1.8} />} />
        {stats.avgRating !== null && (
          <StatCard label="Avg Rating" value={stats.avgRating} icon={<Star size={16} strokeWidth={1.8} />} />
        )}
      </div>

      {stats.topTutor && (
        <div style={{ padding: "1rem 1.25rem", borderRadius: 12, border: "1px solid var(--border-light)", backgroundColor: "var(--bg-card)", marginBottom: "1.25rem" }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Top Tutor</p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{stats.topTutor.name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{stats.topTutor.bookings} bookings</p>
        </div>
      )}

      {stats.revenueByTutor.length > 0 && (
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)" }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Revenue by Tutor</h3>
          </div>
          {stats.revenueByTutor.map((row, i) => {
            const max = stats.revenueByTutor[0].amount || 1;
            const pct = Math.round((row.amount / max) * 100);
            return (
              <div key={row.tutorId} style={{ padding: "10px 16px", borderBottom: i < stats.revenueByTutor.length - 1 ? "1px solid var(--border-light)" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)", minWidth: 100 }}>{row.name}</span>
                <div style={{ flex: 3, height: 6, borderRadius: 99, backgroundColor: "var(--border-light)", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, backgroundColor: "var(--accent)", transition: "width 0.4s ease" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", minWidth: 80, textAlign: "right" }}>{row.amount} EGP</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
