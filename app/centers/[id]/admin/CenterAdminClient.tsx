"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, BarChart3, Star, BookOpen, DollarSign,
  UserPlus, Trash2, CheckCircle, ShieldCheck, GraduationCap
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface TutorEntry {
  id: string;
  fullName: string | null;
  name: string | null;
  email: string | null;
  subjects: string[];
  isVerified: boolean;
  classCount: number;
  avgRating: number | null;
}

type TabId = "overview" | "tutors";

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        borderRadius: 12,
        border: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-card)",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      <span
        style={{
          padding: 8,
          borderRadius: 10,
          backgroundColor: "var(--accent-bg)",
          color: "var(--accent)",
          display: "flex",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </p>
        <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 800, color: "var(--text)" }}>
          {value}
        </p>
        {sub && (
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted)" }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CenterAdminClient({ centerId }: { centerId: string }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [stats, setStats] = useState<CenterStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tutors, setTutors] = useState<TutorEntry[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    fetch(`/api/centers/${centerId}/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setStats(d); })
      .finally(() => setStatsLoading(false));
  }, [centerId]);

  const loadTutors = useCallback(() => {
    setTutorsLoading(true);
    fetch(`/api/centers/${centerId}/tutors`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setTutors(d.tutors ?? []); })
      .finally(() => setTutorsLoading(false));
  }, [centerId]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadTutors(); }, [loadTutors]);

  const handleInvite = async () => {
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const res = await fetch(`/api/centers/${centerId}/tutors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInviteError(data.error ?? "Failed to add tutor");
      } else {
        setInviteEmail("");
        setInviteSuccess(`${data.tutor?.fullName ?? data.tutor?.name ?? "Tutor"} added to center.`);
        loadTutors();
      }
    } catch {
      setInviteError("Network error");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (tutorId: string) => {
    if (!confirm("Remove this tutor from the center?")) return;
    setRemoving(tutorId);
    try {
      await fetch(`/api/centers/${centerId}/tutors`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId }),
      });
      setTutors((prev) => prev.filter((t) => t.id !== tutorId));
    } finally {
      setRemoving(null);
    }
  };

  const tabs: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={14} strokeWidth={1.8} aria-hidden /> },
    { id: "tutors", label: `Tutors (${tutors.length})`, icon: <Users size={14} strokeWidth={1.8} aria-hidden /> },
  ];

  const thStyle: React.CSSProperties = {
    color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: 0.5, padding: "10px 14px", textAlign: "left",
    borderBottom: "1px solid var(--border-light)",
  };
  const tdStyle: React.CSSProperties = {
    padding: "10px 14px", borderBottom: "1px solid var(--border-light)",
    fontSize: 13, color: "var(--text-secondary)", verticalAlign: "middle",
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "0 1.25rem",
          borderBottom: "1px solid var(--border-light)",
          backgroundColor: "var(--bg-card)",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--accent)" : "var(--text-muted)",
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "1.25rem" }}>
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {statsLoading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading stats…
                </div>
              ) : !stats ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--error)" }}>
                  Failed to load stats.
                </div>
              ) : (
                <>
                  {/* KPI grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: 12,
                      marginBottom: "1.5rem",
                    }}
                  >
                    <StatCard
                      label="Total revenue"
                      value={`${stats.totalRevenue} EGP`}
                      sub={`${stats.revenueThisMonth} EGP this month`}
                      icon={<DollarSign size={16} strokeWidth={1.8} />}
                    />
                    <StatCard
                      label="Active tutors"
                      value={stats.activeTutors}
                      icon={<Users size={16} strokeWidth={1.8} />}
                    />
                    <StatCard
                      label="Active classes"
                      value={stats.activeClasses}
                      icon={<GraduationCap size={16} strokeWidth={1.8} />}
                    />
                    <StatCard
                      label="Total students"
                      value={stats.totalStudents}
                      icon={<BookOpen size={16} strokeWidth={1.8} />}
                    />
                    <StatCard
                      label="Total bookings"
                      value={stats.totalBookings}
                      icon={<CheckCircle size={16} strokeWidth={1.8} />}
                    />
                    {stats.avgRating !== null && (
                      <StatCard
                        label="Avg rating"
                        value={stats.avgRating}
                        icon={<Star size={16} strokeWidth={1.8} />}
                      />
                    )}
                  </div>

                  {/* Top tutor */}
                  {stats.topTutor && (
                    <div
                      style={{
                        padding: "1rem 1.25rem",
                        borderRadius: 12,
                        border: "1px solid var(--border-light)",
                        backgroundColor: "var(--bg-card)",
                        marginBottom: "1.25rem",
                      }}
                    >
                      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Top tutor
                      </p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                        {stats.topTutor.name}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                        {stats.topTutor.bookings} bookings
                      </p>
                    </div>
                  )}

                  {/* Revenue by tutor */}
                  {stats.revenueByTutor.length > 0 && (
                    <div
                      style={{
                        borderRadius: 12,
                        border: "1px solid var(--border-light)",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light)" }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                          Revenue by Tutor
                        </h3>
                      </div>
                      {stats.revenueByTutor.map((row, i) => {
                        const max = stats.revenueByTutor[0].amount || 1;
                        const pct = Math.round((row.amount / max) * 100);
                        return (
                          <div
                            key={row.tutorId}
                            style={{
                              padding: "10px 16px",
                              borderBottom: i < stats.revenueByTutor.length - 1 ? "1px solid var(--border-light)" : "none",
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)", minWidth: 100 }}>
                              {row.name}
                            </span>
                            <div style={{ flex: 3, height: 6, borderRadius: 99, backgroundColor: "var(--border-light)", overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, backgroundColor: "var(--accent)", transition: "width 0.4s ease" }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", minWidth: 80, textAlign: "right" }}>
                              {row.amount} EGP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* TUTORS TAB */}
          {activeTab === "tutors" && (
            <motion.div key="tutors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Add tutor form */}
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderRadius: 12,
                  border: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-card)",
                  marginBottom: "1.25rem",
                }}
              >
                <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                  Add Tutor by Email
                </h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="tutor@example.com"
                    onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
                    style={{
                      flex: 1,
                      minWidth: 220,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${inviteError ? "var(--error)" : "var(--border-light)"}`,
                      backgroundColor: "var(--bg-alt)",
                      color: "var(--text)",
                      fontSize: 13,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleInvite}
                    disabled={inviting || !inviteEmail.trim()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: "var(--accent)",
                      color: "var(--accent-fg)",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: inviting ? "wait" : "pointer",
                    }}
                  >
                    <UserPlus size={14} strokeWidth={2} aria-hidden />
                    {inviting ? "Adding…" : "Add"}
                  </button>
                </div>
                {inviteError && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--error)" }}>{inviteError}</p>
                )}
                {inviteSuccess && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--success)" }}>{inviteSuccess}</p>
                )}
              </div>

              {/* Tutors table */}
              {tutorsLoading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading tutors…
                </div>
              ) : tutors.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <Users size={32} strokeWidth={1.2} style={{ opacity: 0.3, display: "block", margin: "0 auto 10px" }} aria-hidden />
                  No tutors yet. Add one above.
                </div>
              ) : (
                <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Tutor</th>
                          <th style={thStyle}>Subjects</th>
                          <th style={{ ...thStyle, textAlign: "center" }}>Classes</th>
                          <th style={{ ...thStyle, textAlign: "center" }}>Rating</th>
                          <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tutors.map((t) => (
                          <tr key={t.id}>
                            <td style={{ ...tdStyle }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    backgroundColor: "var(--accent-bg)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "var(--accent)",
                                    flexShrink: 0,
                                  }}
                                >
                                  {(t.fullName ?? t.name ?? "?")[0].toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                                    {t.fullName ?? t.name ?? "—"}
                                    {t.isVerified && (
                                      <ShieldCheck size={12} strokeWidth={2} style={{ color: "var(--accent)" }} aria-label="Verified" />
                                    )}
                                  </div>
                                  {t.email && (
                                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.email}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {t.subjects.slice(0, 3).map((s) => (
                                  <span
                                    key={s}
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      padding: "2px 7px",
                                      borderRadius: 99,
                                      backgroundColor: "var(--accent-bg)",
                                      color: "var(--accent)",
                                    }}
                                  >
                                    {s}
                                  </span>
                                ))}
                                {t.subjects.length > 3 && (
                                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                                    +{t.subjects.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: "var(--text)" }}>
                              {t.classCount}
                            </td>
                            <td style={{ ...tdStyle, textAlign: "center" }}>
                              {t.avgRating !== null ? (
                                <span style={{ fontWeight: 700, color: "var(--rating, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                                  <Star size={12} strokeWidth={2} fill="currentColor" aria-hidden />
                                  {t.avgRating}
                                </span>
                              ) : (
                                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                              )}
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>
                              <button
                                type="button"
                                onClick={() => handleRemove(t.id)}
                                disabled={removing === t.id}
                                title="Remove from center"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: "5px 10px",
                                  borderRadius: 7,
                                  border: "1px solid var(--error-border, rgba(220,38,38,0.3))",
                                  background: "var(--error-bg)",
                                  color: "var(--error)",
                                  fontSize: 12,
                                  cursor: removing === t.id ? "wait" : "pointer",
                                }}
                              >
                                <Trash2 size={12} strokeWidth={1.8} aria-hidden />
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
