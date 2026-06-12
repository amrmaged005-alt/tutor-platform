"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Trash2, ShieldCheck, Star } from "lucide-react";

type AccessLevel = "FULL" | "LIMITED" | "VIEW_ONLY";

interface TutorEntry {
  id: string;
  fullName: string | null;
  name: string | null;
  email: string | null;
  subjects: string[];
  isVerified: boolean;
  accessLevel: AccessLevel;
  classCount: number;
  avgRating: number | null;
}

const ACCESS_OPTIONS: Array<{ value: AccessLevel; label: string; hint: string }> = [
  { value: "FULL", label: "Full Access", hint: "Sees all bookings for their classes, manages students, accepts/declines bookings" },
  { value: "LIMITED", label: "Limited", hint: "Sees their class schedule only; no revenue or other students" },
  { value: "VIEW_ONLY", label: "View Only", hint: "Sees their class info; cannot make changes" },
];

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

export default function CenterAdminTutors({ centerId }: { centerId: string }) {
  const [tutors, setTutors] = useState<TutorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/centers/${centerId}/tutors`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setTutors(d.tutors ?? []); })
      .finally(() => setLoading(false));
  }, [centerId]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async () => {
    setInviting(true); setInviteError(null); setInviteSuccess(null);
    try {
      const res = await fetch(`/api/centers/${centerId}/tutors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setInviteError(data.error ?? "Failed to add tutor"); }
      else {
        setInviteEmail("");
        setInviteSuccess(`${data.tutor?.fullName ?? data.tutor?.name ?? "Tutor"} added to center.`);
        load();
      }
    } catch { setInviteError("Network error"); }
    finally { setInviting(false); }
  };

  const [savingAccess, setSavingAccess] = useState<string | null>(null);

  const handleAccessChange = async (tutorId: string, accessLevel: AccessLevel) => {
    const previous = tutors;
    setSavingAccess(tutorId);
    setTutors((prev) => prev.map((t) => (t.id === tutorId ? { ...t, accessLevel } : t)));
    try {
      const res = await fetch(`/api/centers/${centerId}/tutors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, accessLevel }),
      });
      if (!res.ok) setTutors(previous);
    } catch {
      setTutors(previous);
    } finally {
      setSavingAccess(null);
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
    } finally { setRemoving(null); }
  };

  return (
    <div>
      {/* Invite form */}
      <div style={{ padding: "1rem 1.25rem", borderRadius: 12, border: "1px solid var(--border-light)", backgroundColor: "var(--bg-card)", marginBottom: "1.25rem" }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Add Tutor by Email</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="email" value={inviteEmail} placeholder="tutor@example.com"
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); }}
            style={{ flex: 1, minWidth: 220, padding: "8px 12px", borderRadius: 8, border: `1px solid ${inviteError ? "var(--error)" : "var(--border-light)"}`, backgroundColor: "var(--bg-alt)", color: "var(--text)", fontSize: 13 }}
          />
          <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--accent)", color: "var(--accent-fg)", fontSize: 13, fontWeight: 700, cursor: inviting ? "wait" : "pointer" }}>
            <UserPlus size={14} strokeWidth={2} aria-hidden />
            {inviting ? "Adding…" : "Add"}
          </button>
        </div>
        {inviteError && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--error)" }}>{inviteError}</p>}
        {inviteSuccess && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--success)" }}>{inviteSuccess}</p>}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading tutors…</div>
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
                  <th style={thS}>Tutor</th>
                  <th style={thS}>Subjects</th>
                  <th style={{ ...thS, textAlign: "center" }}>Classes</th>
                  <th style={{ ...thS, textAlign: "center" }}>Rating</th>
                  <th style={thS}>Access Level</th>
                  <th style={{ ...thS, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tutors.map((t) => (
                  <tr key={t.id}>
                    <td style={tdS}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>
                          {(t.fullName ?? t.name ?? "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                            {t.fullName ?? t.name ?? "—"}
                            {t.isVerified && <ShieldCheck size={12} strokeWidth={2} style={{ color: "var(--accent)" }} aria-label="Verified" />}
                          </div>
                          {t.email && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={tdS}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {t.subjects.slice(0, 3).map((s) => (
                          <span key={s} style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}>{s}</span>
                        ))}
                        {t.subjects.length > 3 && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+{t.subjects.length - 3}</span>}
                      </div>
                    </td>
                    <td style={{ ...tdS, textAlign: "center", fontWeight: 700, color: "var(--text)" }}>{t.classCount}</td>
                    <td style={{ ...tdS, textAlign: "center" }}>
                      {t.avgRating !== null ? (
                        <span style={{ fontWeight: 700, color: "var(--rating, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                          <Star size={12} strokeWidth={2} fill="currentColor" aria-hidden />{t.avgRating}
                        </span>
                      ) : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={tdS}>
                      <select
                        value={t.accessLevel}
                        disabled={savingAccess === t.id}
                        onChange={(e) => handleAccessChange(t.id, e.target.value as AccessLevel)}
                        aria-label={`Access level for ${t.fullName ?? t.name ?? "tutor"}`}
                        title={ACCESS_OPTIONS.find((o) => o.value === t.accessLevel)?.hint}
                        style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid var(--border-light)", backgroundColor: "var(--bg-alt)", color: "var(--text)", fontSize: 12, fontWeight: 600, cursor: savingAccess === t.id ? "wait" : "pointer" }}
                      >
                        {ACCESS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ ...tdS, textAlign: "right" }}>
                      <button onClick={() => handleRemove(t.id)} disabled={removing === t.id} title="Remove from center"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: "1px solid var(--error-border, rgba(220,38,38,0.3))", background: "var(--error-bg)", color: "var(--error)", fontSize: 12, cursor: removing === t.id ? "wait" : "pointer" }}>
                        <Trash2 size={12} strokeWidth={1.8} aria-hidden /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
