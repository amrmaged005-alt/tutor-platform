import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const { classId } = await searchParams;
  if (!classId) redirect("/");

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: { owner: true, center: true },
  });

  if (!cls) redirect("/");

  const rawPhone = cls.owner?.phone ?? cls.center?.phone ?? "";
  const whatsappNumber = rawPhone.replace(/\D/g, "");
  const contactName = cls.center?.name ?? cls.owner?.fullName ?? "the tutor";
  const whatsappMsg = encodeURIComponent(
    "Hi " + contactName + ', I just booked your class "' + cls.title + '" on Coursaty. Looking forward to it!'
  );
  const whatsappHref = "https://wa.me/" + whatsappNumber + "?text=" + whatsappMsg;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>

        {/* Success icon */}
        <div style={{ width: 80, height: 80, borderRadius: "50%", backgroundColor: "#052e16", border: "2px solid #4ade80", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 1.5rem" }}>
          ✓
        </div>

        <h1 style={{ color: "#f1f5f9", fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          You are booked! 🎉
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: "2rem", lineHeight: 1.6 }}>
          Your booking for{" "}
          <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{cls.title}</span>{" "}
          is confirmed. The tutor will reach out to confirm your spot.
        </p>

        {/* Class info card */}
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
                {cls.priceEgp === 0 ? "Free" : cls.priceEgp + " EGP"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>Status</span>
              <span style={{ backgroundColor: "#1c1917", color: "#fbbf24", fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
                PENDING
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
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
          <Link
            href="/dashboard"
            style={{ backgroundColor: "#1e293b", color: "#f1f5f9", border: "1px solid #334155", padding: "0.85rem", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none", display: "block" }}
          >
            View My Bookings
          </Link>
          <Link href="/" style={{ color: "#64748b", fontSize: 14, textDecoration: "none" }}>
            Browse more classes
          </Link>
        </div>

      </div>
    </div>
  );
}