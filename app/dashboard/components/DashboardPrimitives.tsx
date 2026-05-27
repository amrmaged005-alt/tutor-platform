"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  Inbox,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Receipt,
  Search,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { addBookingNote, updateBookingStatus } from "@/app/actions/bookings";
import { useI18n } from "@/app/components/i18n";
import { useToast } from "@/components/ui/ToastProvider";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import type { ManagedBooking } from "./DashboardTypes";

export function DashboardIcon({ name, size = 22 }: { name: string; size?: number }) {
  const icons = {
    analytics: BarChart3,
    bookings: BookOpen,
    building: Building2,
    check: CheckCircle2,
    classes: GraduationCap,
    clipboard: ClipboardList,
    clock: Clock3,
    inbox: Inbox,
    location: MapPin,
    mail: Mail,
    phone: Phone,
    revenue: Wallet,
    search: Search,
    students: Users,
    trend: TrendingUp,
    tutor: User,
  } as const;
  const Icon = icons[name as keyof typeof icons] ?? BookOpen;
  return <Icon size={size} strokeWidth={1.8} aria-hidden />;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    CONFIRMED: { bg: "var(--success-bg)", color: "var(--success)" },
    CANCELLED: { bg: "var(--error-bg)", color: "var(--error)" },
    PENDING: { bg: "var(--warning-bg)", color: "var(--warning)" },
    PAID: { bg: "var(--success-bg)", color: "var(--success)" },
    UNPAID: { bg: "var(--error-bg)", color: "var(--error)" },
    REFUNDED: { bg: "var(--accent-bg)", color: "var(--accent)" },
    ATTENDED: { bg: "var(--success-bg)", color: "var(--success)" },
    "NO-SHOW": { bg: "var(--warning-bg)", color: "var(--warning)" },
  };
  const style = map[status] ?? { bg: "var(--bg-alt)", color: "var(--text-muted)" };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, backgroundColor: style.bg, color: style.color }}>
      {status.replace("-", " ")}
    </span>
  );
}

export function SectionHeader({ title, count, action }: { title: string; count?: number; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 4, height: 18, background: "linear-gradient(180deg, var(--accent), transparent)", borderRadius: 2 }} />
        <h2 style={{ color: "var(--text)", fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>{title}</h2>
        {count !== undefined && (
          <span style={{ backgroundColor: "var(--bg-alt)", color: "var(--text-muted)", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, message, actionHref, actionLabel }: { icon: string; message: string; actionHref: string; actionLabel: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "3rem 2rem", textAlign: "center" }}>
      <span style={{ color: "var(--accent)", marginBottom: "1rem", display: "inline-flex" }}><DashboardIcon name={icon} size={42} /></span>
      <p style={{ color: "var(--text-muted)", fontSize: 15, margin: "0 0 1.5rem" }}>{message}</p>
      <Link href={actionHref} className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>{actionLabel}</Link>
    </motion.div>
  );
}

export function MiniSpotsBar({ capacity, booked }: { capacity: number; booked: number }) {
  const pct = Math.min((booked / capacity) * 100, 100);
  const isFull = booked >= capacity;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 4, backgroundColor: "var(--border-light)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ height: "100%", borderRadius: 99, background: isFull ? "var(--error)" : "var(--accent)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--text-muted)" }}>
        <span>{booked} enrolled</span>
        <span style={{ color: isFull ? "var(--error)" : "var(--text-muted)", fontWeight: isFull ? 700 : 400 }}>
          {isFull ? "Full" : `${capacity - booked} left`}
        </span>
      </div>
    </div>
  );
}

export function ReceiptButton({ bookingId }: { bookingId: string }) {
  return (
    <button
      type="button"
      aria-label="Download receipt"
      title="Download receipt"
      onClick={() => window.open(`/api/bookings/${bookingId}/receipt`, "_blank")}
      style={{ border: "1px solid var(--border-light)", backgroundColor: "var(--bg-card)", color: "var(--text-muted)", borderRadius: 8, width: 36, height: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
    >
      <Receipt size={15} strokeWidth={1.8} />
    </button>
  );
}

export function RefundRequestButton({ booking }: { booking: { id: string; title: string; amountEgp: number | null } }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Changed my mind");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(dialogRef, open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function submit() {
    const res = await fetch(`/api/bookings/${booking.id}/refund-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, notes }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      showToast({ tone: "error", title: "Refund request failed", description: data?.error ?? "Please try again in a moment." });
      return;
    }
    setSubmitted(true);
    setOpen(false);
    showToast({ tone: "success", title: "Refund request submitted", description: "We will review it within 2 business days." });
  }

  if (submitted) return null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
        <RotateCcw size={13} strokeWidth={1.8} aria-hidden /> Request Refund
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close refund dialog" onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(24,23,21,0.45)", zIndex: 998, border: 0, cursor: "pointer" }} />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`refund-title-${booking.id}`} style={{ position: "fixed", insetInlineStart: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 999, width: "min(420px, calc(100vw - 32px))", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 18, padding: "1.25rem", boxShadow: "var(--shadow-lg)" }}>
            <h2 id={`refund-title-${booking.id}`} style={{ color: "var(--text)", margin: "0 0 0.5rem", fontSize: 18 }}>Request Refund</h2>
            <p style={{ margin: "0 0 1rem", color: "var(--text-muted)", fontSize: 13 }}>{booking.title} - {booking.amountEgp ? `${booking.amountEgp} EGP` : "Free"}</p>
            <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 8 }}>Reason</label>
            <select value={reason} onChange={(event) => setReason(event.target.value)} style={{ width: "100%", backgroundColor: "var(--bg-alt)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
              {["Changed my mind", "Tutor cancelled session", "Class quality issue", "Technical issue", "Other"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <label style={{ color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 8 }}>Notes</label>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value.slice(0, 300))} maxLength={300} style={{ width: "100%", minHeight: 96, backgroundColor: "var(--bg-alt)", color: "var(--text)", border: "1px solid var(--border-light)", borderRadius: 10, padding: "10px 12px", resize: "vertical" }} />
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6, display: "flex", justifyContent: "space-between", gap: 12 }}><span>Refund requests are reviewed within 2 business days</span><span>{notes.length}/300</span></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "1rem" }}>
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={submit} className="btn-primary">Submit Request</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function StudentBookingRow({ booking, paymentType }: { booking: ManagedBooking; paymentType: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState(booking.notes ?? "");
  const [editingNote, setEditingNote] = useState(false);
  const [error, setError] = useState("");
  const attended = booking.notes?.includes("[ATTENDED]") ?? false;
  const noShow = booking.notes?.includes("[NO-SHOW]") ?? false;
  const canMarkPaid = paymentType === "IN_PERSON" && booking.paymentStatus !== "PAID" && booking.status !== "CANCELLED";
  const canMarkAttendance = booking.status === "CONFIRMED" && !attended && !noShow;

  function run(action: "MARK_PAID" | "NO_SHOW" | "MARK_ATTENDED") {
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, action, note || undefined);
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function saveNote() {
    startTransition(async () => {
      const result = await addBookingNote(booking.id, note);
      if (!result.success) setError(result.error);
      else {
        setEditingNote(false);
        router.refresh();
      }
    });
  }

  const ghostButton = { backgroundColor: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, cursor: isPending ? "wait" : "pointer", opacity: isPending ? 0.65 : 1 };

  return (
    <div style={{ backgroundColor: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 220, flex: 1 }}>
          <span style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-hover))", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "var(--accent-fg)", flexShrink: 0 }}>{(booking.studentName[0] || "S").toUpperCase()}</span>
          <span>
            <strong style={{ display: "block", color: "var(--text)", fontSize: 14 }}>{booking.studentName}</strong>
            <span style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
              {booking.studentEmail && <a href={`mailto:${booking.studentEmail}`} style={{ color: "var(--text-secondary)", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}><DashboardIcon name="mail" size={12} /> Email</a>}
              {booking.studentPhone && <a href={`https://wa.me/${booking.studentPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--success)", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}><DashboardIcon name="phone" size={12} /> WhatsApp</a>}
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{booking.amountEgp ? `${booking.amountEgp} EGP` : "Free"}</span>
            </span>
          </span>
        </div>
        <span style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <StatusBadge status={booking.status} /><StatusBadge status={booking.paymentStatus} />
          {attended && <StatusBadge status="ATTENDED" />}{noShow && <StatusBadge status="NO-SHOW" />}
        </span>
      </div>
      {booking.paidAt && <div style={{ color: "var(--success)", fontSize: 12, marginTop: 8 }}>{new Date(booking.paidAt).toLocaleString("en-EG")}</div>}
      {editingNote ? (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} placeholder={t("dash.noteHint")} style={{ width: "100%", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 10px", color: "var(--text)", backgroundColor: "var(--bg-card)", fontFamily: "inherit", fontSize: 13 }} />
          <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button type="button" onClick={saveNote} disabled={isPending} className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>Save Note</button><button type="button" onClick={() => setEditingNote(false)} disabled={isPending} style={ghostButton}>Cancel</button></span>
        </div>
      ) : booking.notes ? <div style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: 12, backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 10px" }}>{booking.notes}</div> : null}
      {error && <div style={{ color: "var(--error)", fontSize: 12, marginTop: 8 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {booking.paymentStatus === "PAID" && <ReceiptButton bookingId={booking.id} />}
        {booking.paymentStatus === "PAID" && booking.status !== "CANCELLED" && <RefundRequestButton booking={{ id: booking.id, title: booking.studentName, amountEgp: booking.amountEgp }} />}
        {canMarkPaid && <button type="button" onClick={() => run("MARK_PAID")} disabled={isPending} className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>Mark Paid</button>}
        {canMarkAttendance && <button type="button" onClick={() => run("MARK_ATTENDED")} disabled={isPending} style={{ ...ghostButton, color: "var(--success)", borderColor: "var(--accent-border)" }}>Mark Attended</button>}
        {booking.status !== "CANCELLED" && !noShow && <button type="button" onClick={() => run("NO_SHOW")} disabled={isPending} style={{ ...ghostButton, color: "var(--warning)", borderColor: "var(--warning)" }}>No Show</button>}
        <button type="button" onClick={() => setEditingNote(true)} disabled={isPending} style={ghostButton}>{booking.notes ? "Edit Note" : "Add Note"}</button>
      </div>
    </div>
  );
}
