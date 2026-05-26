import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface PackageOption {
  sessions:    number;
  discountPct: number;
}

function isValidPackageOption(o: unknown): o is PackageOption {
  if (!o || typeof o !== "object") return false;
  const opt = o as Record<string, unknown>;
  return (
    typeof opt.sessions    === "number" && opt.sessions    >= 2  && opt.sessions    <= 20 &&
    typeof opt.discountPct === "number" && opt.discountPct >= 0  && opt.discountPct <= 50
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cls = await prisma.class.findUnique({
    where:  { id },
    select: { packagesEnabled: true, packageOptions: true },
  });
  if (!cls) {
    return NextResponse.json({ error: "Class not found", code: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({
    packagesEnabled: cls.packagesEnabled,
    packageOptions:  (cls.packageOptions ?? []) as unknown as PackageOption[],
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const cls = await prisma.class.findUnique({
    where:  { id },
    select: { ownerId: true, tutors: { select: { tutorId: true } } },
  });
  if (!cls) {
    return NextResponse.json({ error: "Class not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const userId = session.user.id!;
  const isOwner =
    cls.ownerId === userId ||
    cls.tutors.some((t) => t.tutorId === userId);
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const packagesEnabled = typeof body?.packagesEnabled === "boolean" ? body.packagesEnabled : false;
  const rawOptions: unknown[] = Array.isArray(body?.packageOptions) ? body.packageOptions : [];

  const packageOptions = rawOptions.filter(isValidPackageOption);
  if (rawOptions.length !== packageOptions.length) {
    return NextResponse.json(
      { error: "Invalid package options. Sessions must be 2–20, discount 0–50%", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const updated = await prisma.class.update({
    where: { id },
    data:  { packagesEnabled, packageOptions: packageOptions as object[] },
    select: { packagesEnabled: true, packageOptions: true },
  });

  return NextResponse.json({
    packagesEnabled: updated.packagesEnabled,
    packageOptions:  (updated.packageOptions ?? []) as unknown as PackageOption[],
  });
}
