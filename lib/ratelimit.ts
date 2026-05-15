import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Connect to your Upstash Redis database
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Rate limiters ────────────────────────────────────────────────────────────
// Each one has a different strictness depending on how sensitive the action is

// General API calls — 20 requests per 10 seconds per IP
export const generalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  prefix: "rl:general",
});

// Login attempts — 5 attempts per 15 minutes per IP
// Prevents brute force password attacks
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "rl:auth",
});

// Booking attempts — 10 per hour per user
// Prevents seat-locking abuse (locking seats without paying)
export const bookingLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  prefix: "rl:booking",
});

// Review submissions — 5 per hour per user
// Prevents review spam
export const reviewLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl:review",
});

// ─── Helper function ──────────────────────────────────────────────────────────
// Call this in your API routes and server actions.
// Pass the limiter you want and an identifier (IP address or user ID).
// Returns true if the request should be blocked.

export async function isRateLimited(
  limiter: Ratelimit,
  identifier: string
): Promise<boolean> {
  try {
    const { success } = await limiter.limit(identifier);
    return !success;
  } catch (error) {
    console.error("Rate limiter unavailable; allowing request:", error);
    return false;
  }
}
