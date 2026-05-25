import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { classSelect, serializeClass } from "../../_utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cls = await prisma.class.findUnique({
    where: { id },
    select: classSelect(),
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  return NextResponse.json({ class: serializeClass(cls) });
}
