import { NextRequest, NextResponse } from "next/server";
import { requireMobileUser } from "../_utils";

export async function GET(req: NextRequest) {
  const user = await requireMobileUser(req);
  if (user instanceof NextResponse) return user;
  return NextResponse.json({ user });
}
