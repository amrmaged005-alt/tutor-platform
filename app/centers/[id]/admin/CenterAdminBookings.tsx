"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingEntry {
  id: string;
  status: string;
  paymentStatus: string;
  amountEgp: number | null;
  createdAt: string;
  paidAt: string | null;
  classId: string;
  classTitle: string;
  classSubject: string;
  tutorName: string | null;
  studentName: string;
  studentEmail: string | null;
}

interface ClassOption { id: string; title: string; }

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "var(--warning-bg, rgba(245,158,11,0.1))",  color: "var(--warning, #f59e0b)" },
  CONFIRMED: { bg: "var(--success-bg, rgba(22,163,74,0.1))",   color: "var(--success)" },
  CANCELLED: { bg: "var(--error-bg)",   color: "var(--error)" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: "var(--bg-alt)", color: "var(--text-muted)" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
      backgroundColor: s.bg, color: s.color,
    }}>{status}</span>
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

export default function CenterAdminBookings({ centerId }: { centerId: string }) {
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    fetch(`/api/centers/${centerId}/classes`)
      .then((r) => (r.ok ? r.json() : { classes: [] }))
      .then((d) => setClasses((d.classes ?? []).map((c: { id: string; title: string }) => ({ id: c.id, title: c.title }))));
  }, [centerId]);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (classFilter !== "all") params.set("classId", classFilter);
    fetch(`/api/centers/${centerId}/bookings?${params}`)
      .then((r) => (r.ok ? r.json() : { bookings: [], total: 0 }))
      .then((d) => { setBookings(d.bookings ?? []); setTotal(d.total ?? 0); })
      .finally(() => setLoading(false));
  }, [centerId, page, statusFilter, classFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdating(bookingId);
    try {
      await fetch(`/api/centers/${centerId}/bookings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });
      load();
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border-light)", backgroundColor: "var(--bg-alt)", color: "var(--text)", fontSize: 13 }}
          >
            <option value="all">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>Class</label>
          <select
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border-light)", backgroundColor: "var(--bg-alt)", color: "var(--text)", fontSize: 13, maxWidth: 200 }}
          >
            <option value="all">All Classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No bookings found.</div>
      ) : (
        <>
          <div style={{ borderRadius: 12, border: "1px solid var(--border-light)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thS}>Student</th>
                    <th style={thS}>Class</th>
                    <th style={thS}>Tutor</th>
                    <th style={{ ...thS, textAlign: "center" }}>Amount</th>
                    <th style={{ ...thS, textAlign: "center" }}>Status</th>
                    <th style={{ ...thS, textAlign: "center" }}>Date</th>
                    <th style={{ ...thS, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td style={tdS}>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>{b.studentName}</div>
                        {b.studentEmail && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.studentEmail}</div>}
                      </td>
                      <td style={tdS}>
                        <div style={{ fontWeight: 500, color: "var(--text)" }}>{b.classTitle}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.classSubject}</div>
                      </td>
                      <td style={tdS}>{b.tutorName ?? <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                      <td style={{ ...tdS, textAlign: "center", fontWeight: 700 }}>
                        {b.amountEgp != null ? `${b.amountEgp} EGP` : "—"}
                      </td>
                      <td style={{ ...tdS, textAlign: "center" }}><StatusBadge status={b.status} /></td>
                      <td style={{ ...tdS, textAlign: "center", fontSize: 12 }}>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ ...tdS, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          {b.status === "PENDING" && (
                            <button
                              onClick={() => updateStatus(b.id, "CONFIRMED")}
                              disabled={updating === b.id}
                              style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "var(--success)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                            >
                              Confirm
                            </button>
                          )}
                          {b.status !== "CANCELLED" && (
                            <button
                              onClick={() => { if (confirm("Cancel this booking?")) updateStatus(b.id, "CANCELLED"); }}
                              disabled={updating === b.id}
                              style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--error-border, rgba(220,38,38,0.3))", background: "var(--error-bg)", color: "var(--error)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-muted)", cursor: page === 1 ? "not-allowed" : "pointer", display: "inline-flex" }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Page {page} of {totalPages} · {total} total
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-muted)", cursor: page === totalPages ? "not-allowed" : "pointer", display: "inline-flex" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
