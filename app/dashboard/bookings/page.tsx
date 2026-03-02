"use client";

import { useEffect, useState, useTransition } from "react";
import { updateBookingStatus, addBookingNote } from "@/app/actions/bookings";

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
type PaymentStatus = "UNPAID" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
type PaymentType = "IN_PERSON" | "ONLINE";

interface Booking {
  id: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentType: PaymentType;
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

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookingStatus }) {
  const config = {
    PENDING:   { label: "Pending",   bg: "#1c1917", color: "#fbbf24" },
    CONFIRMED: { label: "Confirmed", bg: "#052e16", color: "#4ade80" },
    CANCELLED: { label: "Cancelled", bg: "#1c0a0a", color: "#f87171" },
  }[status];

  return (
    <span style={{ backgroundColor: config.bg, color: config.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
      {config.label}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = {
    UNPAID:              { label: "Unpaid",     bg: "#1c1917", color: "#fbbf24" },
    PAID:                { label: "Paid",       bg: "#052e16", color: "#4ade80" },
    FAILED:              { label: "Failed",     bg: "#1c0a0a", color: "#f87171" },
    REFUNDED:            { label: "Refunded",   bg: "#0f172a", color: "#94a3b8" },
    PARTIALLY_REFUNDED:  { label: "Part. Refunded", bg: "#0f172a", color: "#94a3b8" },
  }[status];

  return (
    <span style={{ backgroundColor: config.bg, color: config.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
      {config.label}
    </span>
  );
}

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onUpdate,
}: {
  booking: Booking;
  onUpdate: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState(booking.notes ?? "");
  const [error, setError] = useState("");

  const isInPerson = booking.class.paymentType === "IN_PERSON";
  const isPending_ = booking.status === "PENDING";
  const isConfirmed = booking.status === "CONFIRMED";

  async function handleAction(action: "MARK_PAID" | "CANCEL" | "NO_SHOW") {
    setError("");
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, action, note || undefined);
      if (!result.success) {
        setError(result.error);
      } else {
        onUpdate();
      }
    });
  }

  async function handleSaveNote() {
    setError("");
    startTransition(async () => {
      const result = await addBookingNote(booking.id, note);
      if (!result.success) {
        setError(result.error);
      } else {
        setShowNoteInput(false);
        onUpdate();
      }
    });
  }

  return (
    <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Top row — class title + badges */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>
            {booking.class.title}
          </div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
            {booking.class.subject} · {isInPerson ? "Cash / In person" : "Online · Paymob"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <StatusBadge status={booking.status} />
          <PaymentBadge status={booking.paymentStatus} />
        </div>
      </div>

      {/* Student info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, backgroundColor: "#0f172a", borderRadius: 10, padding: "0.75rem 1rem" }}>
        <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
          {booking.student.fullName ?? booking.student.email ?? "Unknown student"}
        </div>
        {booking.student.phone && (
          
            href={`https://wa.me/${booking.student.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#4ade80", fontSize: 12, textDecoration: "none" }}
          >
            📱 WhatsApp {booking.student.phone}
          </a>
        )}
        {booking.student.email && (
          <div style={{ color: "#64748b", fontSize: 12 }}>
            ✉️ {booking.student.email}
          </div>
        )}
      </div>

      {/* Payment info */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span style={{ color: "#64748b" }}>Amount</span>
        <span style={{ color: "#f1f5f9", fontWeight: 600 }}>
          {booking.amountEgp ? `${booking.amountEgp} EGP` : "Free"}
        </span>
      </div>

      {booking.paidAt && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#64748b" }}>Paid at</span>
          <span style={{ color: "#4ade80", fontSize: 12 }}>
            {new Date(booking.paidAt).toLocaleString("en-EG")}
          </span>
        </div>
      )}

      {/* Note */}
      {booking.notes && !showNoteInput && (
        <div style={{ backgroundColor: "#0f172a", borderRadius: 8, padding: "0.5rem 0.75rem", color: "#94a3b8", fontSize: 12 }}>
          📝 {booking.notes}
        </div>
      )}

      {/* Note input */}
      {showNoteInput && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            rows={3}
            style={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "0.5rem 0.75rem", color: "#f1f5f9", fontSize: 13, resize: "vertical", outline: "none" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSaveNote}
              disabled={isPending}
              style={{ backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: 8, padding: "0.4rem 1rem", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Save Note
            </button>
            <button
              onClick={() => setShowNoteInput(false)}
              style={{ backgroundColor: "transparent", color: "#64748b", border: "1px solid #334155", borderRadius: 8, padding: "0.4rem 1rem", fontSize: 13, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>

        {/* Mark as paid — only for in-person pending bookings */}
        {isInPerson && isPending_ && (
          <button
            onClick={() => handleAction("MARK_PAID")}
            disabled={isPending}
            style={{ backgroundColor: "#16a34a", color: "white", border: "none", borderRadius: 8, padding: "0.5rem 1rem", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: isPending ? 0.6 : 1 }}
          >
            ✓ Mark as Paid
          </button>
        )}

        {/* Mark as no-show — only for confirmed bookings */}
        {isConfirmed && (
          <button
            onClick={() => handleAction("NO_SHOW")}
            disabled={isPending}
            style={{ backgroundColor: "#92400e", color: "white", border: "none", borderRadius: 8, padding: "0.5rem 1rem", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: isPending ? 0.6 : 1 }}
          >
            ✗ No Show
          </button>
        )}

        {/* Cancel — for pending bookings */}
        {isPending_ && (
          <button
            onClick={() => handleAction("CANCEL")}
            disabled={isPending}
            style={{ backgroundColor: "transparent", color: "#f87171", border: "1px solid #f87171", borderRadius: 8, padding: "0.5rem 1rem", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: isPending ? 0.6 : 1 }}
          >
            Cancel Booking
          </button>
        )}

        {/* Add note — always available */}
        {!showNoteInput && (
          <button
            onClick={() => setShowNoteInput(true)}
            style={{ backgroundColor: "transparent", color: "#64748b", border: "1px solid #334155", borderRadius: 8, padding: "0.5rem 1rem", fontSize: 13, cursor: "pointer" }}
          >
            📝 {booking.notes ? "Edit Note" : "Add Note"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = filter === "ALL"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === "PENDING").length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ color: "#f1f5f9", fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>
            Bookings
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Manage student bookings for your classes
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {(["ALL", "PENDING", "CONFIRMED", "CANCELLED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                backgroundColor: filter === tab ? "#3b82f6" : "#1e293b",
                color: filter === tab ? "white" : "#94a3b8",
                border: "1px solid",
                borderColor: filter === tab ? "#3b82f6" : "#334155",
                borderRadius: 8,
                padding: "0.4rem 1rem",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div style={{ color: "#64748b", textAlign: "center", padding: "3rem" }}>
            Loading bookings...
          </div>
        )}

        {error && (
          <div style={{ color: "#f87171", textAlign: "center", padding: "3rem" }}>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ color: "#64748b", textAlign: "center", padding: "3rem" }}>
            No bookings found.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onUpdate={fetchBookings}
            />
          ))}
        </div>

      </div>
    </div>
  );
}