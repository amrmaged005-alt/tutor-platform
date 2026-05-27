"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, CheckCircle, XCircle, Loader } from "lucide-react";

interface Session {
  id: string;
  bookingId: string;
  sessionDate: string;
  attended: boolean;
  notes: string | null;
}

interface StudentRow {
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  sessions: Session[];
  attendedCount: number;
  totalCount: number;
}

interface AttendanceGridProps {
  classId: string;
}

export default function AttendanceGrid({ classId }: AttendanceGridProps) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/classes/${classId}/attendance`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setStudents(d.students ?? []))
      .catch(() => setError("Failed to load attendance"))
      .finally(() => setLoading(false));
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  const toggleAttendance = useCallback(
    async (bookingId: string, studentId: string, sessionDate: string, currentAttended: boolean) => {
      const key = `${bookingId}-${sessionDate}`;
      setToggling(key);
      try {
        const res = await fetch(`/api/classes/${classId}/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId,
            studentId,
            sessionDate,
            attended: !currentAttended,
          }),
        });
        if (res.ok) {
          setStudents((prev) =>
            prev.map((s) =>
              s.studentId !== studentId
                ? s
                : {
                    ...s,
                    attendedCount: s.attendedCount + (!currentAttended ? 1 : -1),
                    sessions: s.sessions.map((sess) =>
                      sess.bookingId === bookingId && sess.sessionDate === sessionDate
                        ? { ...sess, attended: !currentAttended }
                        : sess
                    ),
                  }
            )
          );
        }
      } finally {
        setToggling(null);
      }
    },
    [classId]
  );

  const thStyle: React.CSSProperties = {
    color: "var(--text-muted)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: "10px 16px",
    textAlign: "left",
    borderBottom: "1px solid var(--border-light)",
    whiteSpace: "nowrap",
  };
  const tdStyle: React.CSSProperties = {
    padding: "10px 16px",
    borderBottom: "1px solid var(--border-light)",
    verticalAlign: "middle",
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        <Loader size={20} strokeWidth={1.5} style={{ opacity: 0.5, display: "block", margin: "0 auto 8px" }} aria-hidden />
        Loading attendance…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--error)", fontSize: 13 }}>
        {error}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        <Users size={28} strokeWidth={1.2} style={{ opacity: 0.3, display: "block", margin: "0 auto 8px" }} aria-hidden />
        No attendance records yet.
      </div>
    );
  }

  // Collect all unique session dates across all students
  const allDates = Array.from(
    new Set(
      students.flatMap((s) => s.sessions.map((sess) => sess.sessionDate))
    )
  ).sort();

  const overallAttended = students.reduce((sum, s) => sum + s.attendedCount, 0);
  const overallTotal = students.reduce((sum, s) => sum + s.totalCount, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 0;

  return (
    <div>
      {/* Summary */}
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: "0.75rem 1rem",
          backgroundColor: "var(--bg-alt)",
          borderBottom: "1px solid var(--border-light)",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text)" }}>{students.length}</strong> students
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Overall attendance:{" "}
          <strong style={{ color: overallPct >= 80 ? "var(--success)" : overallPct >= 60 ? "var(--warning)" : "var(--error)" }}>
            {overallPct}%
          </strong>
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {overallAttended}/{overallTotal} sessions attended
        </span>
      </div>

      {/* Grid */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
          <thead>
            <tr>
              <th style={thStyle}>Student</th>
              {allDates.map((d) => (
                <th
                  key={d}
                  style={{ ...thStyle, textAlign: "center", fontSize: 10 }}
                  title={new Date(d).toLocaleDateString()}
                >
                  {new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </th>
              ))}
              <th style={{ ...thStyle, textAlign: "center" }}>Rate</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const pct = s.totalCount > 0 ? Math.round((s.attendedCount / s.totalCount) * 100) : 0;
              const sessionByDate = new Map(
                s.sessions.map((sess) => [sess.sessionDate, sess])
              );
              return (
                <tr key={s.studentId}>
                  <td style={{ ...tdStyle }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>
                      {s.studentName}
                    </div>
                    {s.studentEmail && (
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {s.studentEmail}
                      </div>
                    )}
                  </td>
                  {allDates.map((d) => {
                    const sess = sessionByDate.get(d);
                    if (!sess) {
                      return (
                        <td key={d} style={{ ...tdStyle, textAlign: "center" }}>
                          <span style={{ color: "var(--border-light)", fontSize: 16 }}>—</span>
                        </td>
                      );
                    }
                    const key = `${sess.bookingId}-${d}`;
                    const isToggling = toggling === key;
                    return (
                      <td key={d} style={{ ...tdStyle, textAlign: "center" }}>
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() =>
                            toggleAttendance(sess.bookingId, s.studentId, d, sess.attended)
                          }
                          title={sess.attended ? "Mark absent" : "Mark attended"}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: isToggling ? "wait" : "pointer",
                            padding: 2,
                            display: "inline-flex",
                          }}
                        >
                          {sess.attended ? (
                            <CheckCircle
                              size={18}
                              strokeWidth={2}
                              style={{ color: "var(--success)" }}
                              aria-label="Attended"
                            />
                          ) : (
                            <XCircle
                              size={18}
                              strokeWidth={1.5}
                              style={{ color: "var(--error)", opacity: 0.6 }}
                              aria-label="Absent"
                            />
                          )}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color:
                          pct >= 80 ? "var(--success)" : pct >= 60 ? "var(--warning)" : "var(--error)",
                      }}
                    >
                      {pct}%
                    </span>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                      {s.attendedCount}/{s.totalCount}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
