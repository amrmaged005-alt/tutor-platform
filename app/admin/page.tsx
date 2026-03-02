import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!currentUser || currentUser.role !== "ADMIN") redirect("/dashboard");

  // Fetch all stats and full lists for client-side filtering/pagination
  const [
    totalUsers,
    totalTutors,
    totalStudents,
    totalCenterAdmins,
    totalClasses,
    totalBookings,
    confirmedBookings,
    users,
    classes,
    bookings,
    estimatedRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "TUTOR" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "CENTER_ADMIN" } }),
    prisma.class.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, name: true, email: true, role: true, createdAt: true, isVerified: true },
    }),
    prisma.class.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { fullName: true, name: true } },
        center: { select: { name: true } },
        _count: { select: { bookings: true } },
      },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { fullName: true, name: true, email: true } },
        class: { select: { title: true, priceEgp: true } },
      },
    }),
    prisma.booking.findMany({
      where: { status: "CONFIRMED" },
      include: { class: { select: { priceEgp: true } } },
    }),
  ]);

  const totalRevenue = estimatedRevenue.reduce((sum, b) => sum + b.class.priceEgp, 0);

  // Map to simple serializable objects to pass to Client Component
  const data = {
    stats: {
      totalUsers,
      totalStudents,
      totalTutors,
      totalCenterAdmins,
      totalClasses,
      totalBookings,
      confirmedBookings,
      totalRevenue,
    },
    users: users.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      isVerified: u.isVerified,
    })),
    classes: classes.map(c => ({
      id: c.id,
      title: c.title,
      subject: c.subject,
      priceEgp: c.priceEgp,
      bookingsCount: c._count.bookings,
      ownerName: c.owner?.fullName || c.owner?.name || null,
      centerName: c.center?.name || null,
      createdAt: c.createdAt.toISOString(),
    })),
    bookings: bookings.map(b => ({
      id: b.id,
      status: b.status,
      paymentStatus: b.paymentStatus,
      studentName: b.student?.fullName || b.student?.name || null,
      studentEmail: b.student?.email || null,
      classTitle: b.class.title,
      priceEgp: b.class.priceEgp,
      createdAt: b.createdAt.toISOString(),
    })),
  };

  return <AdminClient data={data} />;
}
