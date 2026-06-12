import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import CenterAdminClient from "./CenterAdminClient";

export const metadata: Metadata = {
  title: "Center Admin | Coursaty",
};

export default async function CenterAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/centers");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, centerId: true },
  });

  // Only CENTER_ADMIN for this center or platform ADMIN can access
  const isCenterAdmin = user?.role === "CENTER_ADMIN" && user.centerId === id;
  const isPlatformAdmin = user?.role === "ADMIN";

  if (!isCenterAdmin && !isPlatformAdmin) {
    redirect("/unauthorized");
  }

  const center = await prisma.learningCenter.findUnique({
    where: { id },
    select: { id: true, name: true, city: true },
  });

  if (!center) {
    notFound();
  }

  return (
    <PageShell>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "1.5rem 1rem",
        }}
      >
        {/* Page header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
            Center Administration
          </p>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
            {center.name}
          </h1>
          {center.city && (
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
              {center.city}
            </p>
          )}
        </div>

        <div
          style={{
            borderRadius: 16,
            border: "1px solid var(--border-light)",
            backgroundColor: "var(--bg-card)",
            overflow: "hidden",
          }}
        >
          <CenterAdminClient centerId={id} />
        </div>
      </div>
    </PageShell>
  );
}
