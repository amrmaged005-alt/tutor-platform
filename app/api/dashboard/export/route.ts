import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const head = headers.join(",");
  const body = rows.map((r) => r.map(escapeCsv).join(",")).join("\n");
  return head + "\n" + body;
}

function csvResponse(filename: string, csv: string) {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, centerId: true, centerAccessLevel: true },
  });
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Revenue exports are gated for center tutors without full access.
  if (me.role === "TUTOR" && me.centerId && me.centerAccessLevel !== "FULL") {
    return NextResponse.json({ error: "Your center manages revenue exports." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "bookings").toLowerCase();

  if (me.role === "STUDENT") {
    if (type !== "bookings") {
      return NextResponse.json({ error: "Students can only export bookings" }, { status: 400 });
    }
    const bookings = await prisma.booking.findMany({
      where: { studentId: me.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        amountEgp: true,
        paidAt: true,
        createdAt: true,
        class: {
          select: {
            title: true,
            owner: { select: { fullName: true, name: true } },
          },
        },
      },
    });
    const rows = bookings.map((b) => [
      b.id,
      b.class.title,
      b.class.owner?.fullName ?? b.class.owner?.name ?? "",
      b.createdAt.toISOString(),
      b.status,
      b.amountEgp ?? 0,
      b.paymentStatus,
    ]);
    return csvResponse(
      "coursaty-bookings.csv",
      toCsv(["Booking ID", "Class Title", "Tutor Name", "Date", "Status", "Amount (EGP)", "Payment Status"], rows)
    );
  }

  // TUTOR / CENTER_ADMIN / ADMIN
  if (type === "bookings") {
    const bookings = await prisma.booking.findMany({
      where: { class: { OR: [{ ownerId: me.id }, { tutors: { some: { tutorId: me.id } } }] } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        amountEgp: true,
        platformFeeEgp: true,
        tutorPayoutEgp: true,
        createdAt: true,
        student: { select: { fullName: true, name: true } },
        class: { select: { title: true } },
      },
    });
    const rows = bookings.map((b) => [
      b.id,
      b.student.fullName ?? b.student.name ?? "Student",
      b.class.title,
      b.createdAt.toISOString(),
      b.status,
      b.amountEgp ?? 0,
      b.platformFeeEgp ?? 0,
      b.tutorPayoutEgp ?? 0,
    ]);
    return csvResponse(
      "coursaty-tutor-bookings.csv",
      toCsv(
        ["Booking ID", "Student Name", "Class Title", "Session Date", "Status", "Amount (EGP)", "Platform Fee", "Net Payout"],
        rows
      )
    );
  }

  if (type === "revenue") {
    const bookings = await prisma.booking.findMany({
      where: {
        class: { OR: [{ ownerId: me.id }, { tutors: { some: { tutorId: me.id } } }] },
        paymentStatus: "PAID",
        paidAt: { not: null },
      },
      select: { paidAt: true, amountEgp: true, platformFeeEgp: true, tutorPayoutEgp: true },
    });
    const byMonth = new Map<string, { gross: number; fee: number; net: number; count: number }>();
    for (const b of bookings) {
      if (!b.paidAt) continue;
      const key = `${b.paidAt.getFullYear()}-${String(b.paidAt.getMonth() + 1).padStart(2, "0")}`;
      const bucket = byMonth.get(key) ?? { gross: 0, fee: 0, net: 0, count: 0 };
      bucket.gross += b.amountEgp ?? 0;
      bucket.fee += b.platformFeeEgp ?? 0;
      bucket.net += b.tutorPayoutEgp ?? 0;
      bucket.count++;
      byMonth.set(key, bucket);
    }
    const rows = Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, v]) => [month, v.gross, v.fee, v.net, v.count]);
    return csvResponse(
      "coursaty-revenue.csv",
      toCsv(["Month", "Gross Revenue (EGP)", "Platform Fee (EGP)", "Net Revenue (EGP)", "Bookings Count"], rows)
    );
  }

  if (type === "students") {
    const bookings = await prisma.booking.findMany({
      where: { class: { OR: [{ ownerId: me.id }, { tutors: { some: { tutorId: me.id } } }] } },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        paymentStatus: true,
        student: { select: { fullName: true, name: true, email: true } },
        class: { select: { title: true } },
        attendance: { select: { attended: true } },
      },
    });
    const rows = bookings.map((b) => {
      const sessionsAttended = b.attendance.filter((a) => a.attended).length;
      return [
        b.student.fullName ?? b.student.name ?? "Student",
        b.student.email ?? "",
        b.class.title,
        b.createdAt.toISOString(),
        sessionsAttended,
        b.paymentStatus,
      ];
    });
    return csvResponse(
      "coursaty-students.csv",
      toCsv(
        ["Student Name", "Email", "Class Enrolled", "Enrollment Date", "Sessions Attended", "Payment Status"],
        rows
      )
    );
  }

  return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
}
