import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const ALLOWED_BUCKETS = new Set(["avatars", "center-logos", "class-images"]);

function storageConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return { url: url.replace(/\/$/, ""), serviceKey };
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = storageConfig();
  if (!config) {
    return NextResponse.json(
      { error: "Image uploads are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const requestedBucket = String(form?.get("bucket") ?? "avatars");
  const bucket = ALLOWED_BUCKETS.has(requestedBucket) ? requestedBucket : "avatars";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 2 MB or smaller." }, { status: 400 });
  }

  // Scope the path by user so uploads can't collide or be guessed across accounts.
  const objectPath = `${session.user.id}/${Date.now()}.${ext}`;
  const uploadUrl = `${config.url}/storage/v1/object/${bucket}/${objectPath}`;

  const bytes = await file.arrayBuffer();
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.serviceKey}`,
      "Content-Type": file.type,
      "x-upsert": "true",
      "cache-control": "3600",
    },
    body: bytes,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[upload/avatar] storage error", res.status, detail);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  const publicUrl = `${config.url}/storage/v1/object/public/${bucket}/${objectPath}`;
  return NextResponse.json({ url: publicUrl });
}
