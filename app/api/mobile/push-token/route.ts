import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileUser } from "../_utils";

const allowedPlatforms = new Set(["android", "ios", "web"]);

export async function POST(req: NextRequest) {
  const user = await requireMobileUser(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const platform = typeof body?.platform === "string" ? body.platform.trim().toLowerCase() : "";
  const appVersion = typeof body?.appVersion === "string" ? body.appVersion.trim().slice(0, 64) : null;
  const deviceId = typeof body?.deviceId === "string" ? body.deviceId.trim().slice(0, 128) : null;

  if (!token || token.length < 20 || token.length > 4096) {
    return NextResponse.json({ error: "A valid push token is required." }, { status: 400 });
  }

  if (!allowedPlatforms.has(platform)) {
    return NextResponse.json({ error: "A valid platform is required." }, { status: 400 });
  }

  await prisma.pushToken.upsert({
    where: { token },
    update: {
      userId: user.id,
      platform,
      appVersion,
      deviceId,
      disabledAt: null,
    },
    create: {
      userId: user.id,
      token,
      platform,
      appVersion,
      deviceId,
    },
  });

  return NextResponse.json({ success: true });
}
