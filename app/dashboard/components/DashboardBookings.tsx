"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import CancelBookingButton from "@/app/CancelBookingButton";
import { DashboardIcon, EmptyState, ReceiptButton, RefundRequestButton, SectionHeader, StatusBadge } from "./DashboardPrimitives";
import type { StudentBooking } from "./DashboardTypes";

type Filter = "ALL" | "CONFIRMED" | "PENDING" | "PAID";

export default function DashboardBookings({
  bookings,
  cancelBooking,
  isMobile,
}: {
  bookings: StudentBooking[];
  cancelBooking: (formData: FormData) => Promise<void>;
  isMobile: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const filtered = useMemo(() => {
    if (filter === "ALL") return bookings;
    if (filter === "PAID") return bookings.filter((booking) => booking.paymentStatus === "PAID");
    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);
  const counts = {
    ALL: bookings.length,
    CONFIRMED: bookings.filter((booking) => booking.status === "CONFIRMED").length,
    PENDING: bookings.filter((booking) => booking.status === "PENDING").length,
    PAID: bookings.filter((booking) => booking.paymentStatus === "PAID").length,
  };
  const cardBase = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-light)",
    borderRadius: isMobile ? 12 : 18,
    padding: isMobile ? "0.875rem" : "1.25rem 1.5rem",
  };

  return (
    <section>
      <SectionHeader title="Bookings" count={bookings.length} />
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", overflowX: "auto" }}>
        {(["ALL", "CONFIRMED", "PENDING", "PAID"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            style={{
              backgroundColor: filter === tab ? "var(--accent)" : "var(--bg-card)",
              color: filter === tab ? "var(--accent-fg)" : "var(--text-muted)",
              border: "1px solid var(--border-light)",
              borderRadius: 999,
              padding: "8px 12px",
              minHeight: 38,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="inbox" message="No bookings match this filter." actionHref="/classes" actionLabel="Browse Classes" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((booking, index) => (
            <motion.article key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} style={cardBase}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 220 }}>
                  <span style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--accent-bg)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <DashboardIcon name="classes" size={20} />
                  </span>
                  <span>
                    <h3 style={{ color: "var(--text)", fontWeight: 800, margin: "0 0 5px", fontSize: isMobile ? 13 : 15 }}>{booking.class.title}</h3>
                    <span style={{ display: "flex", gap: 12, flexWrap: "wrap", color: "var(--text-muted)", fontSize: 13 }}>
                      <strong style={{ color: "var(--accent)" }}>{booking.class.subject}</strong>
                      <span>{booking.class.priceEgp === 0 ? "Free" : `${booking.class.priceEgp} EGP`}</span>
                      {booking.class.schedule && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><DashboardIcon name="clock" size={13} />{booking.class.schedule}</span>}
                      {booking.class.location && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><DashboardIcon name="location" size={13} />{booking.class.location}</span>}
                    </span>
                  </span>
                </div>
                <span style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <StatusBadge status={booking.status} />
                  <StatusBadge status={booking.paymentStatus} />
                </span>
              </div>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-light)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <Link href={`/classes/${booking.classId}`} className="btn-secondary" style={{ textDecoration: "none", padding: "7px 12px", fontSize: 12 }}>View Class</Link>
                {booking.paymentStatus === "PAID" && <ReceiptButton bookingId={booking.id} />}
                {booking.paymentStatus === "PAID" && booking.status !== "CANCELLED" && (
                  <RefundRequestButton booking={{ id: booking.id, title: booking.class.title, amountEgp: booking.class.priceEgp }} />
                )}
                {booking.status !== "CANCELLED" && <CancelBookingButton bookingId={booking.id} cancelAction={cancelBooking} />}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
