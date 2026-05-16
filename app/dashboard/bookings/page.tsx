"use client";

import { useEffect, useState, useTransition } from "react";
import { updateBookingStatus, addBookingNote } from "@/app/actions/bookings";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
type PaymentType = "IN_PERSON" | "ONLINE";

interface Booking {
  id: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amountEgp: number | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  student: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
  };
  class: {
    id: string;
    title: string;
    subject: string;
    paymentType: PaymentType;
  };
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const config = {
    PENDING:   { label: "Pending",   bg: "var(--warning-bg)", color: "var(--rating)" },
    CONFIRMED: { label: "Confirmed", bg: "var(--success-bg)", color: "var(--success)" },
    CANCELLED: { label: "Cancelled", bg: "var(--error-bg)",   color: "var(--error)" },
  }[status];

  return (
    <span style={{ backgroundColor: config.bg, color: config.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
      {config.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = {
    UNPAID:             { label: "Unpaid",          bg: "var(--warning-bg)",          color: "var(--rating)" },
    PAID:               { label: "Paid",            bg: "var(--success-bg)",          color: "var(--success)" },
    FAILED:             { label: "Failed",          bg: "var(--error-bg)",            color: "var(--error)" },
    REFUNDED:           { label: "Refunded",        bg: "rgba(100,100,100,0.10)",     color: "var(--text-muted)" },
    PARTIALLY_REFUNDED: { label: "Part. Refunded",  bg: "rgba(100,100,100,0.10)",     color: "var(--text-muted)" },
  }[status];

  return (
    <span style={{ backgroundColor: config.bg, color: config.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
      {config.label}
    </span>
  );
}

function BookingCard({ booking, onUpdate }: { booking: Booking; onUpdate: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState(booking.notes ?? "");
  const [error, setError] = useState("");

  const isInPerson = booking.class.paymentType === "IN_PERSON";
  const isPending_ = booking.status === "PENDING";
  const isConfirmed = booking.status === "CONFIRMED";

  async function handleAction(action: "MARK_PAID" | "CANCEL" | "NO_SHOW" | "MARK_ATTENDED") {
    setError("");
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, action, note || undefined);
      if (!result.success) setError(result.error);
      else onUpdate();
    });
  }

  async function handleSaveNote() {
    setError("");
    startTransition(async () => {
      const result = await addBookingNote(booking.id, note);
      if (!result.success) setError(result.error);
      else { setShowNoteInput(false); onUpdate(); }
    });
  }

  return (
    <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 15 }}>{booking.class.title}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
            {booking.class.subject} · {isInPerson ? "Cash / In person" : "Online · Paymob"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <StatusBadge status={booking.status} />
          <PaymentBadge status={booking.paymentStatus} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, backgroundColor: "var(--bg-card)", borderRadius: 10, padding: "0.75rem 1rem" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>
          {booking.student.fullName ?? booking.student.email ?? "Unknown student"}
        </div>
        {booking.student.phone && (
          <a  
            href={"https://wa.me/" + booking.student.phone.replace(/\D/g, "")}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--success)", fontSize: 12, textDecoration: "none" }}
          >
            📱 WhatsApp {booking.student.phone}
          </a>
        )}
        {booking.student.email && (
          <div style={{ color: "var(--text-muted)", fontSize: 12 }}>✉️ {booking.student.email}</div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span style={{ color: "var(--text-muted)" }}>Amount</span>
        <span style={{ color: "var(--text)", fontWeight: 600 }}>
          {booking.amountEgp ? booking.amountEgp + " EGP" : "Free"}
        </span>
      </div>

      {booking.paidAt && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "var(--text-muted)" }}>Paid at</span>
          <span style={{ color: "var(--success)", fontSize: 12 }}>
            {new Date(booking.paidAt).toLocaleString("en-EG")}
          </span>
        </div>
      )}

      {booking.notes && !showNoteInput && (
        <div style={{ backgroundColor: "var(--bg-card)", borderRadius: 8, padding: "0.5rem 0.75rem", color: "var(--text-muted)", fontSize: 12 }}>
          📝 {booking.notes}
        </div>
      )}

      {showNoteInput && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            rows={3}
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "0.5rem 0.75rem", color: "var(--text)", fontSize: 13, resize: "vertical", outline: "none" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSaveNote} disabled={isPending} style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: 8, padding: "0.4rem 1rem", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Save Note
            </button>
            <button onClick={() => setShowNoteInput(false)} style={{ backgroundColor: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "0.4rem 1rem", fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <div style={{ color: "var(--error)", fontSize: 13 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        {isInPerson && isPending_ && (
          <button onClick={() => handleAction("MARK_PAID")} disabled={isPending} style={{ backgroundColor: "var(--success)", color: "var(--accent-fg)", border: "none", borderRadius: 8, padding: "0.5rem 1rem", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: isPending ? 0.6 : 1 }}>
            ✓ Mark as Paid
          </button>
        )}
        {isConfirmed && !booking.notes?.includes("[ATTENDED]") && !booking.notes?.includes("[NO-SHOW]") && (
          <button onClick={() => handleAction("MARK_ATTENDED")} disabled={isPending} style={{ backgroundColor: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--accent-border)", borderRadius: 8, padding: "0.5rem 1rem", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: isPending ? 0.6 : 1 }}>
            Mark Attended
          </button>
        )}
        {isConfirmed && (
          <button onClick={() => handleAction("NO_SHOW")} disabled={isPending} style={{ backgroundColor: "var(--warning)", color: "var(--accent-fg)", border: "none", borderRadius: 8, padding: "0.5rem 1rem", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: isPending ? 0.6 : 1 }}>
            ✗ No Show
          </button>
        )}
        {isPending_ && (
          <button onClick={() => handleAction("CANCEL")} disabled={isPending} style={{ backgroundColor: "transparent", color: "var(--error)", border: "1px solid var(--error)", borderRadius: 8, padding: "0.5rem 1rem", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: isPending ? 0.6 : 1 }}>
            Cancel Booking
          </button>
        )}
        {!showNoteInput && (
          <button onClick={() => setShowNoteInput(true)} style={{ backgroundColor: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "0.5rem 1rem", fontSize: 13, cursor: "pointer" }}>
            📝 {booking.notes ? "Edit Note" : "Add Note"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | BookingStatus>("ALL");
  const [error, setError] = useState("");

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/bookings");
      if (!res.ok) throw new Error("Failed to load bookings");
      const data = await res.json();
      setBookings(data);
    } catch (e) {
      setError("Could not load bookings. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBookings(); }, []);

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === "PENDING").length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-card)", fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ color: "var(--text)", fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>Bookings</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Manage student bookings for your classes</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {(["ALL", "PENDING", "CONFIRMED", "CANCELLED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{ backgroundColor: filter === tab ? "var(--accent)" : "var(--bg-alt)", color: filter === tab ? "white" : "var(--text-muted)", border: "1px solid", borderColor: filter === tab ? "var(--accent)" : "var(--border-light)", borderRadius: 8, padding: "0.4rem 1rem", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {loading && <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "3rem" }}>Loading bookings...</div>}
        {error && <div style={{ color: "var(--error)", textAlign: "center", padding: "3rem" }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "3rem" }}>No bookings found.</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onUpdate={fetchBookings} />
          ))}
        </div>

      </div>
    </div>
  );
}
