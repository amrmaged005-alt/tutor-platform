# Functional Connections Audit — Coursaty Tutor Platform

**Scope:** End-to-end trace of every major user-facing feature — UI component → client handler → API route/Server Action → validation → Prisma model(s) → response handling → UI update → error handling — across the web app (Next.js 16 App Router), the mobile API surface (`app/api/mobile/*`, consumed by the Flutter app), and the admin/center-admin surfaces.

**Ground truth used:** `SECURITY_AUDIT.md` (2026-05-27, 44 routes) is treated as authoritative for auth-check presence on the routes it covers and is not re-derived here. `REMAINING_LIMITATIONS.md` (2026-06-12) is treated as a starting hypothesis, not fact — several of its claims (notably tutor-access-level enforcement) were superseded by commit `786df84` and are corrected below based on direct code reading.

**Method:** Six parallel research passes (auth/account lifecycle, booking/payment/waitlist, social features, centers/dashboard/admin, mobile API + Flutter parity, cross-cutting dead-code/silent-failure sweep), each independently verifying file:line evidence, cross-checked against direct reads of the highest-risk files (`app/api/bookings/route.ts`, `app/actions/bookings.ts`, `app/api/webhooks/paymob/route.ts`, `app/api/cron/cleanup-locks/route.ts`, `lib/auth.ts`, `lib/ratelimit.ts`) by the orchestrating pass.

See `audit/connection-matrix.csv` for the full feature-by-feature matrix (columns: feature, ui_component, api_route, db_models, auth_enforced, validation, error_handling, status, notes).

---

## Executive summary

The platform's payment-critical path (HMAC verification, idempotency, amount-matching on the Paymob webhook) is solid. Auth, rate limiting, and password-reset flows are comprehensively built and correctly wired. The weaknesses are concentrated in three patterns that repeat across features:

1. **Dead-parallel-implementation pattern.** Several features have two competing implementations — one correct and unused, one live and flawed (or vice versa). This happened at least three times independently: booking seat-locking (`lockSeat()` vs the live `/api/bookings` route), review creation (`ReviewSection.tsx`/`/api/reviews` vs the rendered-but-unwired button on the class detail page), and promo codes (`PromoCodeInput.tsx`/`/api/promo/validate` vs the real discount logic buried in `/api/bookings` with no UI field for it).
2. **UI-only render-gating mistaken for enforcement.** The tutor-access-level restriction (`REMAINING_LIMITATIONS.md` item 4) was reported "shipped" by commit `786df84`, but direct verification shows it is real for 3 of 7 surfaces and cosmetic-only for the other 4 — including the dashboard's headline gross-revenue stat card, which still displays real revenue to LIMITED/VIEW_ONLY tutors.
3. **Client-server contract drift, invisible because failures are silent.** The Flutter app's primary class-browsing screen reads `data['classes']` from a response that actually returns `{ items, total, hasMore }` — a field-name typo that has been silently returning empty results and falling back to hardcoded mock data on every request, with no thrown exception to surface it.

None of these are exotic bugs — they're the kind that TypeScript/Dart's type systems don't catch across an HTTP boundary, and that manual QA wouldn't catch either (the mock-data fallback looks identical to real data at a glance).

---

## Findings

### CONN-001 — Live booking flow has a TOCTOU overbooking race; the safe implementation exists but is dead code

**Severity:** CRITICAL | **Priority:** P0 | **Complexity:** Medium

**Evidence:**
- `app/api/bookings/route.ts:110-147` — capacity check (`cls._count.bookings >= cls.capacity`) is a plain `findUnique` read, followed later by a separate `booking.create`/`update` (lines 207-211), with no transaction, no `SELECT ... FOR UPDATE`, and no serializable isolation between the two.
- `app/actions/bookings.ts:12-239` (`lockSeat()`) implements the correct pattern: `prisma.$transaction(async (tx) => {...}, { isolationLevel: "Serializable" })` (lines 124-156) that re-counts active bookings *inside* the transaction, with retry-safe handling of Postgres serialization conflicts (lines 162-170).
- `grep -r lockSeat app/` returns only the function's own definition and its internal error-log string — **zero callers**. The actual checkout UI, `app/classes/[id]/book/BookingCheckout.tsx:125`, calls `fetch("/api/bookings", { method: "POST", ... })` — the unsafe path — not the safe server action.
- `prisma/schema.prisma:352-354` documents `lockedAt`/`lockedUntil` as "Seat lock (prevents double-booking during checkout)" — a mechanism only `lockSeat()` populates.

**Current behavior:** Two concurrent booking requests for the last open seat in a class can both read `count < capacity` before either write commits, both successfully create/confirm a `Booking` row, and the class oversells its capacity. The correctly-built transactional fix for exactly this problem already exists in the codebase and is simply never invoked.

**Expected behavior:** `POST /api/bookings` should perform its capacity check and booking write inside a serializable (or equivalent locking) transaction, exactly as `lockSeat()` already does — or `BookingCheckout.tsx` should be switched to call `lockSeat()` instead of the route.

**Recommendation:** Either (a) port `lockSeat()`'s transaction logic into `app/api/bookings/route.ts` (preserving that route's promo-code and package-option support, which `lockSeat()` currently lacks), or (b) retire `/api/bookings` POST for web traffic and route `BookingCheckout.tsx` through a server action built on `lockSeat()`, extended with promo/package handling. Delete whichever implementation loses.

---

### CONN-002 — `cron/cleanup-locks` is a no-op against real traffic; abandoned online bookings permanently consume capacity

**Severity:** HIGH | **Priority:** P1 | **Complexity:** Low (once CONN-001 is fixed, this resolves itself)

**Evidence:**
- `app/api/cron/cleanup-locks/route.ts:17-24` queries `Booking` where `lockedUntil: { lt: now, not: null }`.
- The live booking-creation path, `app/api/bookings/route.ts`, never sets `lockedAt`/`lockedUntil` on any booking it creates (confirmed by reading the full `bookingData` object at lines 195-205 — no lock fields present).
- The capacity check at line 145 counts any booking with `status: { not: "CANCELLED" }` — i.e., a `PENDING`/`UNPAID` booking from an abandoned Paymob checkout (user closes the tab without completing or failing payment) counts against capacity forever, since no webhook ever arrives to flip it to `CANCELLED`, and the cron that exists specifically to expire such bookings can never see it (its `lockedUntil` is `null`, not "past due").

**Current behavior:** A class can appear "fully booked" due to accumulated abandoned checkout attempts, with no automatic recovery.

**Expected behavior:** Every `PENDING`/`UNPAID` booking created for an online payment should have a `lockedUntil` TTL (e.g., 10-15 minutes, matching `lockSeat()`'s existing `LOCK_DURATION_MINUTES = 10`), and the cron should reliably reclaim it if the user never completes payment.

**Recommendation:** Fixed automatically by resolving CONN-001 in the direction of reusing `lockSeat()`'s lock-field logic. If CONN-001 is instead fixed by adding a transaction to the existing route without adopting `lockSeat()`, `lockedAt`/`lockedUntil` must be added to that route explicitly as a second change.

---

### CONN-003 — Tutor-access-level enforcement is partial, not complete; revenue is still visible to restricted tutors

**Severity:** HIGH | **Priority:** P1 | **Complexity:** Low-Medium

**Evidence (PASS/FAIL by surface, verified by direct code reading):**

| Surface | File:line | Server-side check? | Verdict |
|---|---|---|---|
| `deleteClass` server action | `app/dashboard/dashboard-actions.ts:30` | Yes | PASS |
| `GET /api/dashboard/export` | `app/api/dashboard/export/route.ts:44-46` | Yes (403 for non-FULL) | PASS |
| `POST /api/classes` (create) | `app/api/classes/route.ts:147-149` | Yes, but blocks LIMITED too | PASS (server) / FAIL (UI/server mismatch — `DashboardClasses.tsx:32` only hides the create button for VIEW_ONLY, so LIMITED tutors see a "New Class" CTA that 403s) |
| Dashboard data payload | `app/dashboard/page.tsx:117-141` | No | **FAIL** — full revenue + student PII for every owned class's bookings is fetched and serialized into RSC props for every tutor regardless of access level; hidden components still receive the data client-side |
| `DashboardStats` gross-revenue card | `app/dashboard/components/DashboardStats.tsx:176-188` | No | **FAIL** — renders unconditionally; a LIMITED/VIEW_ONLY tutor sees real lifetime gross revenue as a headline stat card |
| `GET /api/dashboard/payouts` | `app/api/dashboard/payouts/route.ts:11-19` | No (role check only, no `centerAccessLevel`) | **FAIL** — restricted tutor can fetch their payout ledger directly, bypassing the UI hide |
| `GET /api/dashboard/analytics` | `app/api/dashboard/analytics/route.ts:24` | No | FAIL, but currently unconsumed by any UI (latent risk, not exploitable through the app today) |
| Center admin console (`/centers/[id]/admin`) | `app/centers/[id]/admin/page.tsx:24-35` | N/A | PASS — page is gated to `CENTER_ADMIN`/`ADMIN` only; plain `TUTOR` role can never reach it, so `centerAccessLevel` correctly doesn't need to apply there |

**Current behavior:** Commit `786df84` ("enforce tutor access levels in dashboard and server actions") delivered real enforcement for 3 of 7 checked surfaces (delete action, CSV export, create-class API) plus UI-hiding for revenue/payouts/reviews panels. It did not close the data-leak in the underlying dashboard query, did not gate the headline revenue stat card, and did not gate the payouts or analytics APIs server-side. `REMAINING_LIMITATIONS.md` item 4 ("stored but not yet enforced") and the commit message ("LIMITED and VIEW_ONLY center tutors no longer see revenue... payouts") are both now inaccurate — the true state is partial enforcement with a visible revenue leak.

**Expected behavior:** All four FAIL rows should gate identically to `export/route.ts`'s pattern (`centerId && centerAccessLevel !== "FULL"` → 403 or filtered response), and `app/dashboard/page.tsx` should not fetch/serialize the raw booking/revenue dataset for non-FULL tutors in the first place (data-gate, not just render-gate).

**Recommendation:** (1) Add the `export/route.ts` 403 pattern to `payouts/route.ts` and `analytics/route.ts`. (2) In `dashboard/page.tsx`, branch the Prisma query itself on `centerAccessLevel` so restricted tutors never receive booking/amount fields in the payload. (3) Gate the gross-revenue stat item in `DashboardStats.tsx` behind `accessLevel === "FULL"`. (4) Reconcile the LIMITED-tutor create-class inconsistency — decide whether LIMITED tutors should be able to create classes, then align `DashboardClasses.tsx:32` and `classes/route.ts:147-149` to match.

---

### CONN-004 — Flutter class-browse screen silently serves mock data in production (API contract mismatch)

**Severity:** CRITICAL | **Priority:** P0 | **Complexity:** Low

**Evidence:**
- `app/api/classes/search/route.ts:124-127` returns `NextResponse.json({ items, total, hasMore }, ...)`.
- Flutter `MarketplaceRepository.classes()` (`services.dart:156-193`) reads `data['classes']`, which is always `undefined`/`null` given the actual response shape.
- The call is wrapped in `try { ... } catch (_) {}` with no rethrow; since the HTTP call succeeds (200 OK, just the wrong key), no exception fires. The empty-list branch falls through to `MockData.filteredClasses(...)` after an artificial 380ms delay (lines 180-188), which reads as a legitimate loading state.

**Current behavior:** The shipped Flutter app's home/browse/filter screens — the primary class-discovery surface on mobile — always display hardcoded `MockData`, never live database content, regardless of backend health. This is indistinguishable from working correctly during casual testing because the mock data is plausible-looking and the fallback has no error UI.

**Expected behavior:** Mobile class browsing should reflect live `Class` data from the same endpoint the web app uses.

**Recommendation:** One-line fix: change `data['classes']` to `data['items']` in `services.dart`'s `classes()` method (or standardize the API to return `classes` if that's the more broadly-used key — check `/api/mobile/classes` for the convention used elsewhere first). This should ship as an emergency patch — it's the most severe finding in this audit because it silently defeats an entire platform's primary content surface with no observable symptom to trigger a bug report.

---

### CONN-005 — Referral program is fully stubbed in practice: signup never captures the referral code

**Severity:** MEDIUM | **Priority:** P2 | **Complexity:** Low

**Evidence:**
- `app/api/signup/route.ts:97-109` creates a `Referral` row only if `req.nextUrl.searchParams.get("ref")` is present on the `POST /api/signup` request.
- `app/signup/page.tsx`'s submit handler (`fetch("/api/signup", {...})`, line ~82) posts to a bare path with no query string — it never reads `?ref=` from the browser's own URL (`window.location.search` / `useSearchParams()`) and never forwards it.
- `POST /api/me/referral/complete/route.ts` (which credits `walletBalanceEgp += 100 EGP` in a real `$transaction`, lines 41-50) has zero callers anywhere in the codebase — confirmed via repo-wide grep.

**Current behavior:** A user who clicks a shared referral link (`/signup?ref=CODE`) and signs up will never generate a `Referral` row, because the referral code visible in the page URL is dropped before the API call is made. Even if it weren't dropped, nothing ever calls the completion endpoint to award the credit.

**Expected behavior:** The referral code from the URL should be read client-side and included in the signup POST body/query string; some event (first booking, or an admin/cron action) should call `/api/me/referral/complete` to award the credit once a referred user takes the qualifying action.

**Recommendation:** (1) In `app/signup/page.tsx`, read the `ref` search param and forward it on the signup request. (2) Decide the completion trigger (first confirmed booking is the most natural) and wire a call to `/api/me/referral/complete` from that path (likely the Paymob webhook success branch or `updateBookingStatus`).

---

### CONN-006 — Promo codes: money-handling logic is correct but unreachable; a dead parallel UI/API path also exists

**Severity:** MEDIUM | **Priority:** P2 | **Complexity:** Low

**Evidence:**
- `app/api/bookings/route.ts:166-219` — real server-side promo validation (active/expired/max-uses) with the discount correctly subtracted from `amountEgp` (line 189) *before* that amount is sent to `createPaymobPayment()` — the discount genuinely reaches the payment provider, not just a UI label.
- `app/classes/[id]/book/BookingCheckout.tsx:128` — the POST body sent to that route is `{ classId, paymentType, note }` only. No promo code field exists anywhere in the checkout UI.
- Separately, `app/api/promo/validate/route.ts` (preview-only, applies nothing) has its only consumer, `components/ui/PromoCodeInput.tsx`, imported nowhere in the app — a second, fully dead code path.

**Current behavior:** Promo codes cannot be redeemed by any real user today, despite the payment-integration work for them being done correctly.

**Expected behavior:** A promo code input field on `BookingCheckout.tsx` that populates the `promoCode` field already accepted by `/api/bookings`.

**Recommendation:** Add a promo code input to `BookingCheckout.tsx` wired to the existing `promoCode` request field (cheapest fix — the backend needs no changes). Delete `app/api/promo/validate/route.ts` and `PromoCodeInput.tsx` if the intent is a single validate-and-apply-at-booking flow, or wire the input to call `/validate` for instant feedback before submission if a preview UX is wanted.

---

### CONN-007 — Review creation has two competing implementations; neither is reachable from the live web UI

**Severity:** MEDIUM | **Priority:** P2 | **Complexity:** Low-Medium

**Evidence:**
- `app/components/ReviewSection.tsx` — fully built (star picker, textarea, submit to `POST /api/reviews`), never imported anywhere (`grep ReviewSection` finds only its own file).
- `app/classes/[id]/ClassDetailClient.tsx:239` — the "Write review" button that actually renders on the class detail page has **no `onClick` handler**.
- The review-creation POST on that same page's data route, `app/api/classes/[id]/reviews/route.ts:27-63`, is fully implemented (confirmed-booking check, upsert, `isApproved:false` default) but guarded by `requireMobileUser` (Bearer JWT) rather than the web session helper `auth()` — so even a wired-up button would 401 for a normal cookie-authenticated web user.

**Current behavior:** There is no way to leave a review from the web app today.

**Expected behavior:** Clicking "Write review" on a class detail page (for a student with a confirmed booking) should open a review form and submit successfully.

**Recommendation:** Pick one stack. Given `/api/classes/[id]/reviews` already has the confirmed-booking + upsert logic students need, the cheapest fix is: wire `ClassDetailClient.tsx`'s button to a form, and either add a web-session auth branch to that route (mirroring `app/api/bookings/route.ts`'s `requireBookingUser` dual-auth pattern) or point the form at `/api/reviews` instead (which already uses `auth()`). Delete the unused stack once one path is confirmed working.

---

### CONN-008 — Refund approval never triggers an actual Paymob refund

**Severity:** MEDIUM | **Priority:** P2 | **Complexity:** Medium (depends on Paymob refund API availability/contract)

**Evidence:** `app/api/admin/refund-requests/[id]/approve/route.ts:35-49` — the entire handler is a `$transaction` that sets `paymentStatus: "REFUNDED"` and writes an `AuditLog` row. `lib/paymob.ts` exports only `createPaymobPayment` and `getHmacSecret` — no refund function exists.

**Current behavior:** An admin clicking "Approve" on a refund request marks it refunded in the database with no corresponding money movement. Someone must separately process the actual refund through the Paymob merchant dashboard (or another out-of-band channel) or the student is never actually paid back despite the system showing `REFUNDED`.

**Expected behavior:** Approval should call Paymob's refund API (if the account/integration supports it) before flipping the status, or the UI should make unambiguous that "Approve" only records an operational decision and does not move money, with a follow-up manual step tracked.

**Recommendation:** If Paymob refund API access exists for this merchant account, add a `refundPaymobPayment()` function to `lib/paymob.ts` and call it before the status flip, handling failure by leaving `paymentStatus` unchanged. If manual refunding is the accepted process for now, relabel the admin action (e.g., "Mark refund processed") to avoid implying automation that doesn't exist — this is a UX/trust issue as much as a functional one.

---

### CONN-009 — No real notification system exists; "notifications" endpoints serve two unrelated, non-feed purposes

**Severity:** MEDIUM | **Priority:** P3 | **Complexity:** Medium (net-new feature, not a bug fix)

**Evidence:**
- `prisma/schema.prisma` has no `Notification` model. Repo-wide grep for `notification.create`/`Notification.create` returns zero hits — nothing in the codebase ever writes a durable notification.
- `app/api/me/notifications/route.ts` (web) is a **preference-toggle** endpoint (`notifyBookingConfirmed`, `notifyNewMessage`, etc. — booleans on `User`), not a feed.
- `app/api/mobile/notifications/route.ts:19-93` **synthesizes** a feed on every request from `AuditLog` + recent `Booking` rows, with `read: false` hardcoded on every item (lines 68, 77, 91) — there is no persistence, so nothing can ever actually be marked read.
- The Flutter `NotificationsScreen` renders three hardcoded static strings and never calls the mobile endpoint at all (confirmed no fetch call in that screen file).
- `PushToken` rows are correctly stored (`POST /api/mobile/push-token`) but never read by any push-sending integration (no FCM/APNs/OneSignal code found anywhere in the repo) — tokens are collected and permanently unused.

**Current behavior:** No user, on web or mobile, receives an in-app notification for any event (booking confirmed, message received, review received, waitlist opened) despite `User` having preference columns that imply such notifications exist and get sent, and despite a partially-built mobile feed and push-token infrastructure.

**Recommendation:** This is a build-out, not a quick fix. If notifications are a near-term priority: add a `Notification` model (userId, type, title, body, readAt, createdAt), write to it from the natural trigger points already identified per-feature in this audit (Paymob webhook success/failure, `messages` POST, review-approval, waitlist-notify), wire the mobile screen to the real feed with a working read-state PATCH, and connect `PushToken` to an actual push provider. Until then, consider it out of scope and don't let the preference toggles in Settings imply a feed that doesn't exist.

---

### CONN-010 — Three divergent booking-cancel code paths; waitlist notification only fires from one

**Severity:** LOW-MEDIUM | **Priority:** P3 | **Complexity:** Low

**Evidence:**
- `app/api/bookings/[id]/cancel/route.ts:49-78` — cancels and emails the first waitlisted student + marks `notifiedAt`.
- `app/dashboard/dashboard-actions.ts` `cancelBooking()` — student-facing dashboard cancel, scoped by `updateMany({ studentId })`, no waitlist logic at all.
- `app/actions/bookings.ts` `updateBookingStatus(id, "CANCEL")` — tutor/admin cancel path, also no waitlist logic.

**Current behavior:** Whether a waitlisted student gets notified when a seat opens depends entirely on which of three cancel entry points was used, not on the fact that a cancellation occurred.

**Recommendation:** Extract the waitlist-notify step into a shared helper (e.g. `notifyWaitlistOnCancel(classId)`) and call it from all three cancellation paths.

---

### CONN-011 — Email verification pipeline is fully built but enforces nothing

**Severity:** HIGH (security-relevant, explicitly called out by task scope) | **Priority:** P1 | **Complexity:** Trivial (single block to uncomment) but requires confirming email deliverability first

**Evidence:** `lib/auth.ts:119-126` — the block that would reject login for `!user.isEmailVerified` is commented out with `// TEMP: email verification disabled — re-enable this block before going to production.` Everything around it is live and correct: `verify-email`, `send-verification`, and `resend-verification` routes are fully functional (confirmed via direct code read, correcting `SECURITY_AUDIT.md`'s now-stale claim that these are "stubbed/503" — that was true as of 2026-05-27 but a later commit built them out without re-enabling the login gate).

**Current behavior:** Any user — including one who never verifies their email — has full, unrestricted access to every feature of the platform, identical to a verified user. The "Verify your email" nag shown in Settings has no functional consequence.

**Recommendation:** This is explicitly flagged in the code as a pre-production TODO. Before any production launch: confirm outbound email deliverability (Resend), then uncomment `lib/auth.ts:121-126`. Separately, `app/actions/bookings.ts:36-47` already has a working `REQUIRE_EMAIL_VERIFICATION` env-var gate on booking creation that is unused today since nothing calls `lockSeat()` (see CONN-001) — if CONN-001 is fixed by routing through `lockSeat()`, this gate becomes live "for free."

---

### CONN-012 — CSRF same-origin check is applied to only 3 of ~85 API routes

**Severity:** MEDIUM | **Priority:** P2 | **Complexity:** Low

**Evidence:** The `isSameOrigin()` check (independently duplicated inline in each file, e.g. `app/api/classes/route.ts:105-113`) appears only in `app/api/classes/route.ts`, `app/api/reviews/route.ts`, and `app/api/admin/verify-user/route.ts` (confirmed via repo-wide grep for the origin-header pattern). `SECURITY_AUDIT.md`'s claim "CSRF protection: same-origin checks on sensitive web POST routes" describes these 3 routes accurately but doesn't make clear that dozens of other mutation routes — `bookings`, `favorites`, `messages/*`, `waitlist`, `refund-request`, `promo/*`, `centers/[id]/*`, `dashboard/*`, `me/*` — have no equivalent check.

**Current behavior:** Inconsistent CSRF posture across the mutation surface. Session-cookie-based auth without `SameSite` hardening or a CSRF token is vulnerable to cross-site request forgery on any route lacking this check; the actual exploitability depends on cookie `SameSite` configuration (not verified in this pass — worth a follow-up check of the NextAuth cookie config in `auth.config.ts`).

**Recommendation:** Extract `isSameOrigin()` into a shared `lib/security.ts` helper (removing the current 3x duplication) and apply it consistently to every session-cookie-authenticated mutation route, or confirm `SameSite=Lax/Strict` is set on the session cookie and document that as the primary CSRF defense instead (in which case the per-route checks are defense-in-depth, not the only layer, and the gap is lower severity).

---

## Additional notes (lower severity, not filed as individual findings)

- **Messaging send is not optimistic and can silently lose input**: `ThreadClient.tsx` clears the message textbox before `await send(next)` resolves, with no surrounding try/catch — a failed send loses the typed text with no error shown (`app/messages` thread view).
- **Unread-message nav badge doesn't poll**: fetches once on mount (`NavbarClient.tsx`, `MobileBottomNav.tsx`); the thread list itself polls every 5s, so the badge and the list can disagree while the user stays on a page.
- **Admin optimistic-list-update pattern lacks `.ok` checks** in at least three places (`AdminClient.tsx` refund approve/deny, review approve/reject, promo toggle/delete) — a failed mutation still removes the row from the visible list, hiding the failure from the admin.
- **Password change doesn't invalidate other sessions** (`app/api/me/password/route.ts`), unlike the public password-reset flow which does bump `sessionVersion` — minor inconsistency, not currently exploitable beyond "a stolen session survives a password change."
- **Duplicate/drifted profile validation schemas**: `schemas/user.ts` exports an unused `UserUpdateSchema` while `app/api/users/me/route.ts` defines its own inline, differently-shaped `ProfileSchema`.
- **BookingCheckout.tsx's date/time/student-name fields are decorative** — hardcoded May-2025 calendar days and a default fake student name, matching the already-documented "Option B honest MVP" decision in `REMAINING_LIMITATIONS.md` item 2; not a new finding, just confirmed still accurate.
- **Mobile-only booking/favorites/bookings-list/search routes are unused shadow duplicates** of routes the Flutter app actually calls (or, for favorites, an entire backend the client doesn't use at all) — `app/api/mobile/book-class`, `/bookings`, `/favorites`, `/search`. Candidates for deletion to reduce surface area, or for the Flutter app to be migrated onto them for a cleaner mobile-specific contract.
- **`lib/paymob.ts`, if a refund function is ever added, should be checked for HMAC-equivalent integrity on any refund confirmation webhook**, mirroring the payment webhook's protections.

---

## What's confirmed solid (worth stating, not everything is a gap)

- Paymob webhook (`app/api/webhooks/paymob/route.ts`): HMAC-SHA512 with `timingSafeEqual`, integration-ID pinning, currency pinning, amount-matching against the booking, and double idempotency guards. No issues found.
- Login/signup/password-reset: rate-limited consistently, timing-safe anti-enumeration, full audit logging, transactional session invalidation on reset. No issues found beyond the verification-gate and session-invalidation-on-password-change notes above.
- Favorites: genuinely optimistic UI with correct rollback-on-failure and user-facing error toast — a good reference pattern the messaging and admin-list features should be brought up to.
- Center admin console auth: consistently gated (if repetitively implemented) across all 7 `/api/centers/[id]/*` routes.
- Waitlist join/leave: real position tracking, transactional renumbering on leave, correctly scoped uniqueness constraint.

---

*This audit is a point-in-time trace as of the current `main` branch (commit `51b48a1`). Re-verify findings after any changes to the booking, dashboard, or mobile-sync code paths referenced above.*
