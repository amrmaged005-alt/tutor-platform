import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";

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
    ? { label: "PAYMENT FAILED", bg: "#1c0a0a", color: "#f87171" }
    : isPaid
    ? { label: "CONFIRMED", bg: "#052e16", color: "#4ade80" }
    : { label: "PENDING", bg: "#1c1917", color: "#fbbf24" };

  const heading = isFailed
    ? "Payment Failed ❌"
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
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>

        <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: isFailed ? "#1c0a0a" : "#052e16", border: `2px solid ${isFailed ? "#f87171" : "#4ade80"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 1.5rem" }}>
          {isFailed ? "✗" : "✓"}
        </div>

        <h1 style={{ color: "#f1f5f9", fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          {heading}
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: "2rem", lineHeight: 1.6 }}>
          {subheading}
        </p>

        <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", textAlign: "left" }}>
          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Booking Details
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Class</span>
              <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>{cls.title}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Subject</span>
              <span style={{ color: "#3b82f6", fontSize: 13, fontWeight: 600 }}>{cls.subject}</span>
            </div>
            {cls.schedule && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Schedule</span>
                <span style={{ color: "#f1f5f9", fontSize: 13 }}>{cls.schedule}</span>
              </div>
            )}
            {cls.location && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Location</span>
                <span style={{ color: "#f1f5f9", fontSize: 13 }}>{cls.location}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Price</span>
              <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>
                {booking.amountEgp === 0 ? "Free" : booking.amountEgp + " EGP"}
              </span>
            </div>
            {isOnline && isPaid && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Platform fee</span>
                <span style={{ color: "#64748b", fontSize: 13 }}>{booking.platformFeeEgp} EGP</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Payment method</span>
              <span style={{ color: "#f1f5f9", fontSize: 13 }}>
                {isOnline ? "Online (Paymob)" : "Cash (in person)"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Status</span>
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
                style={{ backgroundColor: "#16a34a", color: "white", padding: "0.85rem", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "block" }}
              >
                Message {contactName} on WhatsApp
              </a>
            )}
            <Link href="/dashboard" style={{ backgroundColor: "#1e293b", color: "#f1f5f9", border: "1px solid #334155", padding: "0.85rem", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none", display: "block" }}>
              View My Bookings
            </Link>
            <Link href="/" style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>
              Browse more classes
            </Link>
          </div>
        )}

        {isFailed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={`/classes/${cls.id}`} style={{ backgroundColor: "#3b82f6", color: "white", padding: "0.85rem", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", display: "block" }}>
              Try Booking Again
            </Link>
            <Link href="/" style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>
              Browse other classes
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}