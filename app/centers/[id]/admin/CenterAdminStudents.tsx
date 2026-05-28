"use client";

import { useState, useEffect } from "react";
import { Users, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface EnrolledClass { id: string; title: string; subject: string; }

interface StudentEntry {
  id: string;
  fullName: string | null;
  name: string | null;
  email: string | null;
  photoUrl: string | null;
  totalBookings: number;
  totalSpend: number;
  lastBookingDate: string;
  enrolledClasses: EnrolledClass[];
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

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      backgroundColor: "var(--accent-bg)", color: "var(--accent)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
    }}>
      {(name[0] ?? "?").toUpperCase()}
    </div>
  );
}

export default function CenterAdminStudents({ centerId }: { centerId: string }) {
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/centers/${centerId}/students${q}`)
      .then((r) => (r.ok ? r.json() : { students: [] }))
      .then((d) => setStudents(d.students ?? []))
      .finally(() => setLoading(false));
  }, [centerId, search]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", maxWidth: 340, padding: "8px 12px",
            borderRadius: 8, border: "1px solid var(--border-light)",
            backgroundColor: "var(--bg-alt)", color: "var(--text)", fontSize: 13,
          }}
        />
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading students…</div>
      ) : students.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          <Users size={32} strokeWidth={1.2} style={{ opacity: 0.3, display: "block", margin: "0 auto 10px" }} />
          No students found.
        </div>
      ) : (
        <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thS}>Student</th>
                  <th style={{ ...thS, textAlign: "center" }}>Sessions</th>
                  <th style={{ ...thS, textAlign: "center" }}>Total Spend</th>
                  <th style={{ ...thS, textAlign: "center" }}>Classes</th>
                  <th style={{ ...thS, textAlign: "center" }}>Last Active</th>
                  <th style={{ ...thS, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const displayName = s.fullName ?? s.name ?? s.email ?? "Student";
                  const isOpen = expanded.has(s.id);
                  return (
                    <>
                      <tr key={s.id}>
                        <td style={tdS}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Avatar name={displayName} />
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text)" }}>{displayName}</div>
                              {s.email && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...tdS, textAlign: "center", fontWeight: 700 }}>{s.totalBookings}</td>
                        <td style={{ ...tdS, textAlign: "center", fontWeight: 700 }}>
                          {s.totalSpend > 0 ? `${s.totalSpend} EGP` : "—"}
                        </td>
                        <td style={{ ...tdS, textAlign: "center" }}>
                          <button
                            onClick={() => toggleExpand(s.id)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 700, fontSize: 13 }}
                          >
                            {s.enrolledClasses.length}
                            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>
                        <td style={{ ...tdS, textAlign: "center", fontSize: 12 }}>
                          {new Date(s.lastBookingDate).toLocaleDateString()}
                        </td>
                        <td style={{ ...tdS, textAlign: "right" }}>
                          <Link href="/messages" style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "4px 10px", borderRadius: 6,
                            border: "1px solid var(--border-light)", background: "var(--bg-alt)",
                            color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textDecoration: "none",
                          }}>
                            <MessageCircle size={11} strokeWidth={1.8} /> Message
                          </Link>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={`${s.id}-detail`}>
                          <td colSpan={6} style={{ padding: "0 14px 12px 14px", borderBottom: "1px solid var(--border-light)", backgroundColor: "var(--bg-alt)" }}>
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, marginTop: 8, fontWeight: 700 }}>ENROLLED CLASSES</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {s.enrolledClasses.map((c) => (
                                <Link key={c.id} href={`/classes/${c.id}`} style={{
                                  padding: "3px 10px", borderRadius: 99,
                                  backgroundColor: "var(--accent-bg)", color: "var(--accent)",
                                  fontSize: 12, fontWeight: 600, textDecoration: "none",
                                  border: "1px solid var(--accent-border, rgba(13,89,70,0.2))",
                                }}>
                                  {c.title}
                                </Link>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
