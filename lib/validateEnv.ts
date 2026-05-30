// Fail-fast env validation. Called at import time of lib/auth.ts so the server
// crashes at startup with a clear message instead of silently failing later
// (emails not sending, payments breaking, OAuth misconfigured) at runtime.

const REQUIRED = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "RESEND_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXTAUTH_URL",
] as const;

export function validateEnv(): void {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
