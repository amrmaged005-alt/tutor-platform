import { prisma } from "./prisma";

// ─── Action types ─────────────────────────────────────────────────────────────
// These are all the important actions we track across the platform.
// Add more here as your app grows.

export type AuditAction =
  // Bookings
  | "booking.created"
  | "booking.confirmed"
  | "booking.cancelled"
  | "booking.no_show"
  | "booking.attended"
  | "booking.note_added"
  | "booking.expired"
  // Payments
  | "payment.received"
  | "payment.failed"
  | "payment.refunded"
  // Reviews
  | "review.created"
  | "review.edited"
  | "review.deleted"
  // Users
  | "user.signup"
  | "user.email_verified"
  | "user.password_reset"
  | "user.password_changed"
  | "user.sessions_revoked"
  | "user.suspended"
  | "user.unsuspended"
  // Classes
  | "class.created"
  | "class.deactivated"
  | "class.activated"
  // Payouts
  | "payout.processing"
  | "payout.paid"
  | "payout.failed"
  // Admin / config
  | "admin.config_updated"
  | "admin.promo_created"
  | "admin.promo_toggled"
  | "admin.promo_deleted";

// ─── Log an action ────────────────────────────────────────────────────────────

interface LogParams {
  action: AuditAction;
  actorId?: string;       // The user who performed the action
  actorRole?: string;     // Their role at the time
  targetType?: string;    // What was affected e.g. "Booking", "User", "Class"
  targetId?: string;      // The ID of what was affected
  metadata?: object;      // Any extra context — never put passwords here
  ipAddress?: string;
  userAgent?: string;
}

export async function log(params: LogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        actorId: params.actorId ?? null,
        actorRole: params.actorRole ?? null,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        metadata: params.metadata ?? {},
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (error) {
    // Audit logging should never crash your app
    // If it fails, we log to console but continue normally
    console.error("Audit log failed:", error);
  }
}
