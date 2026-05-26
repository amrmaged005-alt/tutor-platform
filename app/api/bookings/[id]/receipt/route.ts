import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      class:   { select: { title: true, subject: true } },
      student: { select: { fullName: true, name: true, email: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (booking.studentId !== session.user.id && user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const studentName  = booking.student.fullName ?? booking.student.name ?? "Student";
  const studentEmail = booking.student.email ?? "";
  const classTitle   = booking.class.title;
  const amount       = booking.amountEgp ?? 0;
  const bookedOn     = booking.createdAt.toLocaleDateString("en-EG", { year: "numeric", month: "long", day: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Coursaty Receipt — ${booking.id}</title>
<style>
  @media print { body { margin: 0; } .no-print { display: none; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f7f6f2; color: #1a1a18; padding: 2rem; }
  .card { max-width: 540px; margin: 0 auto; background: #fff; border: 1px solid #e5e3dc; border-radius: 16px; overflow: hidden; }
  .header { background: #0d5946; color: #fbfaf6; padding: 2rem; text-align: center; }
  .header h1 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 4px; }
  .header p { font-size: 13px; opacity: 0.75; }
  .body { padding: 2rem; }
  .section { margin-bottom: 1.5rem; }
  .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #888; margin-bottom: 4px; }
  .value { font-size: 15px; color: #1a1a18; font-weight: 500; }
  .divider { height: 1px; background: #e5e3dc; margin: 1.5rem 0; }
  .amount { font-size: 2rem; font-weight: 800; color: #0d5946; }
  .status { display: inline-block; background: #e8f5f0; color: #0d5946; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 99px; margin-top: 6px; }
  .id { font-size: 11px; color: #aaa; font-family: monospace; margin-top: 1.5rem; text-align: center; }
  .print-btn { display: block; margin: 1.5rem auto 0; padding: 10px 24px; background: #0d5946; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>Coursaty</h1>
    <p>Payment Receipt</p>
  </div>
  <div class="body">
    <div class="section">
      <div class="label">Student</div>
      <div class="value">${studentName}</div>
      <div style="font-size:13px;color:#888;margin-top:2px;">${studentEmail}</div>
    </div>
    <div class="divider"></div>
    <div class="section">
      <div class="label">Class</div>
      <div class="value">${classTitle}</div>
    </div>
    <div class="section">
      <div class="label">Booking Date</div>
      <div class="value">${bookedOn}</div>
    </div>
    <div class="divider"></div>
    <div class="section">
      <div class="label">Amount Paid</div>
      <div class="amount">${amount === 0 ? "Free" : amount + " EGP"}</div>
      <div class="status">${booking.paymentStatus}</div>
    </div>
    <div class="id">Booking ID: ${booking.id}</div>
  </div>
</div>
<button class="print-btn no-print" onclick="window.print()">Print Receipt</button>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
