import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const { bookingId } = await searchParams;
  if (!bookingId) redirect("/");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      class: {
        include: {
          owner: true,
          center: true,
        },
      },
    },
  });

  if (!booking || booking.studentId !== session.user.id) redirect("/");

  const cls = booking.class;
  const rawPhone = cls.owner?.phone ?? cls.center?.phone ?? "";
  const whatsappNumber = rawPhone.replace(/\D/g, "");
  const contactName = cls.center?.name ?? cls.owner?.fullName ?? "the tutor";
  const whatsappMsg = encodeURIComponent(
    "Hi " + contactName + ', I just booked your class "' + cls.title + '" on Coursaty. Looking forward to it!'
  );
  const whatsappHref = "https://wa.me/" + whatsappNumber + "?text=" + whatsappMsg;

  const isOnline = cls.paymentType === "ONLINE";
  const isPaid = booking.paymentStatus === "PAID";
  const isFailed = booking.paymentStatus === "FAILED";

  const statusConfig = isFailed
    ? { label: "PAYMENT FAILED", bg: "var(--text)", color: "var(--error)" }
    : isPaid
    ? { label: "CONFIRMED", bg: "var(--text)", color: "var(--success)" }
    : { label: "PENDING", bg: "var(--text)", color: "var(--rating)" };

  const heading = isFailed
    ? "Payment Failed"
    : isPaid
    ? "Payment Confirmed! 🎉"
    : "Booking Received! 🎉";

  const subheading = isFailed
    ? "Your payment did not go through. Your seat has been released. Please try booking again."
    : isOnline && isPaid
    ? `Your payment of ${booking.amountEgp} EGP was successful. Your spot in ${cls.title} is confirmed.`
    : isOnline && !isPaid
    ? `We are waiting to confirm your payment for ${cls.title}. This usually takes a few seconds.`
    : `Your booking for ${cls.title} is received. Please pay the tutor directly at the class.`;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-card)", fontFamily: "var(--font-sans, system-ui)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      {/* Background orbs */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: isFailed ? "radial-gradient(circle, rgba(248,113,113,0.06) 0%, transparent 70%)" : "radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 520, width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>

        <div style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          backgroundColor: isFailed ? "var(--text)" : "var(--text)",
          border: `2px solid ${isFailed ? "var(--error)" : "var(--success)"}`,
          boxShadow: `0 0 40px ${isFailed ? "rgba(248,113,113,0.2)" : "rgba(74,222,128,0.2)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          margin: "0 auto 1.5rem",
        }}>
          {isFailed ? "✗" : "✓"}
        </div>

        <h1 style={{ color: "var(--text)", fontSize: "clamp(1.4rem, 4vw, 1.9rem)", fontWeight: 800, marginBottom: "0.75rem", letterSpacing: -0.5 }}>
          {heading}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: "2rem", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 2rem" }}>
          {subheading}
        </p>

        <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 20, padding: "1.5rem", marginBottom: "1.5rem", textAlign: "left", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Booking Details
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Class</span>
              <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>{cls.title}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Subject</span>
              <span style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600 }}>{cls.subject}</span>
            </div>
            {cls.schedule && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Schedule</span>
                <span style={{ color: "var(--text)", fontSize: 13 }}>{cls.schedule}</span>
              </div>
            )}
            {cls.location && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Location</span>
                <span style={{ color: "var(--text)", fontSize: 13 }}>{cls.location}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Price</span>
              <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 600 }}>
                {booking.amountEgp === 0 ? "Free" : booking.amountEgp + " EGP"}
              </span>
            </div>
            {isOnline && isPaid && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Platform fee</span>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{booking.platformFeeEgp} EGP</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Payment method</span>
              <span style={{ color: "var(--text)", fontSize: 13 }}>
                {isOnline ? "Online (Paymob)" : "Cash (in person)"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Status</span>
              <span style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {!isFailed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {whatsappNumber && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "linear-gradient(135deg, var(--success), var(--success))",
                  color: "var(--accent-fg)",
                  padding: "0.9rem",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 20px rgba(22,163,74,0.4)",
                }}
              >
                💬 Message {contactName} on WhatsApp
              </a>
            )}
            <Link
              href="/dashboard"
              style={{
                backgroundColor: "var(--bg-card)",
                color: "var(--text)",
                border: "1px solid var(--border-light)",
                padding: "0.9rem",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <BookOpen size={17} strokeWidth={1.8} /> View My Bookings
            </Link>
            <Link href="/classes" style={{ color: "var(--text-secondary)", fontSize: 13, textDecoration: "none" }}>
              Browse more classes →
            </Link>
          </div>
        )}

        {isFailed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link
              href={`/classes/${cls.id}`}
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
                color: "var(--accent-fg)",
                padding: "0.9rem",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                display: "block",
                boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
              }}
            >
              Try Booking Again
            </Link>
            <Link href="/classes" style={{ color: "var(--text-secondary)", fontSize: 13, textDecoration: "none" }}>
              Browse other classes →
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
