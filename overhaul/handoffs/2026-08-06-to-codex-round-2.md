# Handoff to Codex — round 2 (2026-08-06)

`main` is at **`4b7cb15`** and **`origin/main` now matches it** (fast-forwarded, nothing rewritten).

> **The merge-base gotcha is retired for new branches.** Anything you branch from `4b7cb15` onward can
> be diffed against `main` normally. Branches created *before* this still need
> `git merge-base main <branch>`.

`tasks.json` is canonical for every scope decision below — the acceptance text there is fuller than
this summary. A grant that exists only in prose is inert; you were right to refuse those.

---

## Merged this session

| Task | Commit | Note |
|---|---|---|
| **T1-07 / T1-08** | `4b7cb15` | `npm audit` 18 (2 critical, 12 high) → **0**. Verified independently. |
| **T1-10** | `4784db1` | Refund relabel. Clean. |
| **T0-01** | `bdf5ae6` | 28/28 baseline captured. Wave 2's baseline gate is satisfied. |

**Your build failure report on `dep-upgrade-next` was accurate but environmental** — your worktree has
no `.env`, and `main` fails identically without one (same route, same error). With env supplied the
branch builds `exit 0`. Worth copying `.env` into your worktrees before trusting a build result.

**Rebase everything onto `4b7cb15`.** Next is now 16.3.0 and `next lint` no longer exists (the repo's
`lint` script already calls `eslint` directly).

---

## 1. T1-01 / T1-02 — one blocker left, then it merges

Everything else checks out. I verified, rather than took on faith: the race is closed, REFUNDED /
PARTIALLY_REFUNDED can't be downgraded, promo release is exactly-once, and **late captured payments
really do land in the admin refund queue** (`refund-requests/route.ts` selects
`refundReason != null AND paymentStatus = PAID`, which is exactly what your conflict path writes).

**The blocker.** In `app/api/webhooks/paymob/route.ts`, `hasValidSeatLock` requires
`lockedUntil > now`. When that's false you go straight to `conflictReason` and cancel a booking the
student has *already paid for* — **without ever checking whether a seat is free**.

A student who clears bank OTP at minute 16 of a 15-minute lock, on a class with 49 empty seats, gets
cancelled and pushed to manual refund. You raised the TTL to 15 minutes *because* Egyptian bank OTP is
slow, so this path will fire in production.

**Fix:** run the occupied-seat count in **both** branches. Raise a conflict only when capacity is
genuinely exceeded. If you also need to avoid re-confirming a booking the student cancelled
deliberately, add that distinction explicitly — the handler currently cannot tell a cron-expired
cancellation from a user-initiated one, and inferring it from `status` is not safe.

**Cron verification is unblocked.** The 6 expired rows are safe to cancel: all created between
2026-03-01 and 2026-05-27, all with `paymobOrderId = null` (never reached Paymob), none holding a promo
reservation. That is exactly what `cleanup-locks` is for.

**Separate issue, don't fix here:** 7 other `PENDING/UNPAID` rows have `lockedUntil = NULL`, and the
cron filters `lockedUntil: { not: null }` — it can never reach them. Permanently stuck. Needs a one-off
data decision, not a code change.

---

## 2. T1-12 (NEW, P0) — the mobile path is still racy

**`CONN-001` is only half closed.** `app/api/mobile/book-class/route.ts` reads `_count.bookings`
(line 34), compares to `capacity` (line 54), then creates — with no transaction. Two concurrent mobile
bookings for the last seat both pass and both write. The defect T1-01 exists to kill is fully reachable
through the app.

Worse, the two paths disagree on what occupies a seat:

| Path | Counts as occupied |
|---|---|
| Web (`app/api/bookings/route.ts`) | `CONFIRMED`, or `PENDING` with `lockedUntil > now` |
| Mobile (`book-class/route.ts`) | anything with `status != CANCELLED` |

So the same class can read **full on mobile and bookable on web**. That's the audit's #1 dead-parallel
pattern as *semantics* rather than duplicated code.

- **Files:** `app/api/mobile/book-class/route.ts`
- **Required:** extract **one** shared helper for the serializable transaction + occupied-seat
  predicate and use it from both routes. Do not write a second copy.
- **Acceptance:** two concurrent mobile POSTs for the last seat → exactly one 2xx, one rejection, one
  booking in the DB. Same class reports identical fullness on both paths. Run it against the
  capacity-1 fixture class — review alone will not close this.

**Do not mark `CONN-001` resolved until both T1-01 and T1-12 merge.**

---

## 3. T1-05 — scope extended to `dashboard-actions.ts`

Your live finding is confirmed. `app/dashboard/dashboard-actions.ts:31` gates only
`centerAccessLevel === "VIEW_ONLY"`, so a `LIMITED` tutor can delete classes. Product copy
(*"Sees their class schedule only; no revenue or other students"*) makes `LIMITED` schedule-only.

- **Files added:** `app/dashboard/dashboard-actions.ts`
- **The general point:** a data-layer **read** gate does not protect server actions — they're separately
  addressable POST endpoints. So audit **every exported action in that file**, not just `deleteClass`.
- **Acceptance:** re-run a real server-action bypass test — POST directly to the action, don't click the
  UI — for **both** `LIMITED` and `VIEW_ONLY`, capturing response and post-state for each. Plus the
  still-outstanding 7 `CONN-003` surfaces across FULL/LIMITED/VIEW_ONLY.
- Also clear the `window.location.href` warning at `DashboardClient.tsx:38` while you're in here.

---

## 4. T1-04 — contract corrected, do not claim provisioning

You were right and `overhaul/16` was wrong. `AdminClient.tsx:565` is a table filter; no admin API writes
`User.role`.

**Decision: accept that under the HIDE default there is no provisioning path for a new `CENTER_ADMIN`
by any actor.** Scope is *not* expanded — an admin role-assignment endpoint is a privilege-escalation
surface and needs its own reviewed contract, not a P1 rider. Existing `CENTER_ADMIN` accounts are
unaffected.

What ships is what you already verified: signup exposes only STUDENT/TUTOR, `?role=center` falls back to
STUDENT, onboarding exposes only STUDENT/TUTOR, `PATCH /api/me/role` with CENTER_ADMIN returns 400.
**Do not claim provisioning acceptance in the PR.** T1-13 carries the owner decision.

---

## 5. T1-11 — architecture decided: **Option A**

Option B (Cache Components / PPR) is **rejected for Wave 1** — public-route data migration across ~117
routes is a bigger, riskier refactor than the P0 gating Wave 2 can carry.

**Option A — bounded client-session Navbar:**

1. `app/layout.tsx` stops calling `auth()` in the server render path. That call is the sole reason every
   route is dynamic.
2. `app/Navbar.tsx` discovers the session **after first paint** by fetching the **existing**
   `/api/users/me`. Do not add a second session endpoint.
3. Add `centerId` to `app/api/users/me/route.ts` so CENTER_ADMIN's "My Center" entry is preserved
   exactly as today.
4. Keep the skeleton you already built as the pre-fetch state.

This **amends** the packet's "do not remove the server `auth()` call." That constraint existed to
protect correct nav for signed-in users, which the client fetch satisfies.

**Hard limit: this moves session *display* to the client only.** No server-side authorization gate may
move or weaken — `proxy.ts` and every route/action guard stay exactly as they are.

- **Files:** `app/layout.tsx`, `app/Navbar.tsx`, `app/api/users/me/route.ts`
- `app/layout.tsx` and `app/Navbar.tsx` are protected — T1-11 owns them; sequence against anything else.
- **Acceptance:** the full `npm run build` route table shows landing + auth-independent public routes as
  static/ISR vs `overhaul/baseline/build-routes-before-T1-11.txt`. Routes that independently call
  `auth()` (dashboard, admin) are **expected** to stay dynamic — not failures. Verify signed-out,
  signed-in TUTOR, and CENTER_ADMIN navbars in en + ar at 1280 and 390. **PERF-001 does not close until
  the table genuinely contains static/ISR routes.**

---

## 6. T1-14 (NEW, P1, security) — separate branch, do not fold in

`auth.config.ts:31-34` validates post-login redirects by prefix. Proven, 4 escapes of 8 inputs at
`baseUrl = https://coursaty.com`:

```text
https://coursaty.com.evil.net/steal  -> https://coursaty.com.evil.net   BYPASS
https://coursaty.community/steal     -> https://coursaty.community      BYPASS
https://coursaty.com@evil.net/       -> https://evil.net                BYPASS (userinfo trick)
https://coursaty.com.evil.net        -> https://coursaty.com.evil.net   BYPASS
```

**The leading-slash inputs (`//evil`, `/\evil`) are NOT exploitable here** — unlike T1-09's client-side
case — because the value is concatenated *after* `baseUrl` and stays on-origin. Re-derive the fix for
this call site; don't copy T1-09's.

- **Files:** `auth.config.ts`
- **Required:** compare origins (`new URL(url, baseUrl).origin === new URL(baseUrl).origin`), never prefixes.
- **Acceptance:** the 8-input table committed as a test, 0 off-origin results.

---

## 7. T1-15 (NEW, P1) — payment-attempt linkage

`lib/paymob.ts:157-163` overwrites `booking.paymobOrderId` on every `initiatePayment`, so a payment
retry orphans the previous Paymob order. The webhook resolves by `paymobOrderId` and matches only the
newest attempt. If the **superseded** attempt then succeeds, the handler hits `!booking`, logs, and
returns 200 — Paymob stops retrying, the money is captured, and there is **no booking and no
`refundReason` row**. Unlike the T1-01 race, nothing lands in the refund queue to catch it.

Not introduced by T1-01, deliberately not folded into it. Needs real payment-attempt history. **Touches
`prisma/schema.prisma` (protected) — sequence it.**

---

## Still owner-blocked

PR creation returns **403** and `gh` isn't installed, so merges stay local. That costs your automatic PR
review as an independent check on my reviews — which already caught one of my misses (T1-03). Flagged,
not blocking.
