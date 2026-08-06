# Restart prompt for Codex

**Paste everything below the line into a fresh Codex session.**

> Why this file exists: the prompt Codex stopped on is now badly stale. It says `gh` isn't installed,
> PRs return 403, `main` is at `5b7349f`, and T0-01's baseline is uncaptured. All four are resolved.
> Working from that prompt would redo finished work and re-report closed blockers.

---

You are resuming implementation on the TutorPlatform overhaul. A Claude session reviewed your entire
Wave 1 output and has already written verdicts — **do not re-derive them.**

**Read, in order:** `overhaul/handoffs/2026-08-06-to-codex-round-2.md` (your instruction set — exact
file lists and acceptance criteria per task), `overhaul/progress-log.md` (last ~25 lines are the
verdicts), `overhaul/tasks.json` (canonical scope), `overhaul/07-shared-foundations-and-file-ownership.md`.
Everything else in `overhaul/` is lookup-by-ID.

## State has moved since you stopped — read this before touching anything

`main` is **`2ea4a1c`**, not `5b7349f`. `origin/main` matches it.

| Was blocking you | Now |
|---|---|
| PRs return 403 | **Fixed.** The 403 was the MCP integration's credential, not the account. `gh` is installed and authenticated (`repo`, `read:org`). PRs #1–#4 are open. |
| `origin/main` 33 behind | **Synced**, fast-forwarded. Nothing was rewritten. |
| T0-01 baseline uncaptured | **Done**, 28/28 in `overhaul/baseline/`. |
| `npm audit` 18 vulns | **0.** T1-07/T1-08 merged — `next` 16.3.0, `next-auth` beta.32. |

**Rebase every branch onto `2ea4a1c` before doing anything.** Next moved a minor version and
`package.json` is no longer frozen — the dependency task that held it has merged.

Merged since you stopped: **T1-07/T1-08**, **T1-10**, **T0-01**. Already merged before: T1-03, T1-06,
T1-09.

## Environment notes that cost real time

1. **Your worktrees have no `.env`.** Your "build fails" report on `dep-upgrade-next` was accurate but
   the cause was environmental — `main` fails identically without `.env` (same route, same
   `Failed to collect page data for /api/admin/promo`). With env supplied it builds `exit 0`. **Copy
   `.env` into a worktree before trusting a build result, and delete it afterwards.**
2. `next lint` no longer exists in Next 16. The repo's `lint` script already calls `eslint` directly.
3. `npm ci` fails while a dev server holds `next-swc...node`. Stop it first.

## Your work queue

Ordered. Items 1–3 are the ones with open PRs carrying review verdicts.

### 1. T1-01/T1-02 — PR #1 — one blocker, then it merges

Everything else is **verified good**: the race is closed, `REFUNDED`/`PARTIALLY_REFUNDED` can't be
downgraded, promo release is exactly-once, and late captured payments genuinely do reach the admin
refund queue (the query was read, not assumed).

**The blocker.** In `app/api/webhooks/paymob/route.ts`, `hasValidSeatLock` requires
`lockedUntil > now`. When that's false you jump straight to `conflictReason` and **cancel a booking the
student has already paid for, without ever checking whether a seat is free.** A student clearing bank
OTP at minute 16 of a 15-minute lock, on a class with 49 empty seats, is cancelled and pushed to manual
refund. You raised the TTL to 15 minutes *because* Egyptian bank OTP is slow — so this fires in
production.

**Fix:** run the occupied-seat count in **both** branches; raise a conflict only when capacity is
genuinely exceeded. If you also need to avoid re-confirming a booking the student cancelled
deliberately, add that distinction explicitly — the handler currently can't tell a cron-expired
cancellation from a user-initiated one, and inferring it from `status` isn't safe.

**Your cron question is answered: the 6 rows are safe to cancel.** All created 2026-03-01 to
2026-05-27, all with `paymobOrderId = null` (never reached Paymob), none holding a promo reservation.
Run the live cron verification.

*Separate, don't fix here:* 7 other `PENDING/UNPAID` rows have `lockedUntil = NULL` and the cron filters
`lockedUntil: { not: null }` — it can never reach them. Needs a one-off data decision, not code.

### 2. T1-05 — PR #2 — scope extended

Your live finding is confirmed. `app/dashboard/dashboard-actions.ts:31` gates only `VIEW_ONLY`, so a
`LIMITED` tutor can delete classes. **`dashboard-actions.ts` is now in `filesAffected`** — block
`LIMITED` too.

**The general lesson, which is the actual ask:** a data-layer *read* gate does not protect server
actions — they're separately addressable POST endpoints. **Audit every exported action in that file,
not just `deleteClass`.** Re-test by POSTing to the action directly, not by clicking the UI, for both
restricted roles. Also still owed: the 7 CONN-003 payloads across FULL/LIMITED/VIEW_ONLY, and the
`window.location.href` warning at `DashboardClient.tsx:38`.

### 3. T1-11 — PR #4 — architecture decided: **Option A**

Option B (Cache Components / PPR) is **rejected for Wave 1** — public-route data migration across ~117
routes is too large for the P0 gating Wave 2.

1. `app/layout.tsx` stops calling `auth()` in the server render path — that call is the sole reason
   every route is dynamic.
2. `app/Navbar.tsx` discovers the session **after first paint** via the **existing** `/api/users/me`.
   Do not add a second session endpoint.
3. Add `centerId` to `app/api/users/me/route.ts` so CENTER_ADMIN's "My Center" is preserved.
4. Keep the skeleton you already built as the pre-fetch state.

This **amends** the packet's "do not remove the server `auth()` call" — that constraint protected
correct nav for signed-in users, which the client fetch satisfies.

**Hard limit: display only.** No server-side authorization gate moves or weakens; `proxy.ts` and every
route/action guard stay as-is.

Acceptance: routes that independently call `auth()` (dashboard, admin) are **expected** to stay dynamic
and are not failures. **PERF-001 closes only when the build table genuinely contains static/ISR routes.**
This is the last thing blocking Wave 2.

### 4. T1-12 (NEW, P0) — the mobile path is still racy

**`CONN-001` is only half closed.** `app/api/mobile/book-class/route.ts` reads `_count.bookings`
(line 34), compares to `capacity` (line 54), then creates — no transaction. Two concurrent mobile
bookings for the last seat both pass and both write.

The two paths also disagree on what occupies a seat — mobile counts `status != CANCELLED`, web counts
`CONFIRMED` or `PENDING with lockedUntil > now` — so the same class can read **full on mobile and
bookable on web**. That's the audit's #1 dead-parallel pattern as *semantics*.

**Extract one shared helper** for the serializable transaction + occupied-seat predicate and use it from
both routes. Do not write a second copy. Prove it with a real concurrency test against the capacity-1
fixture class. **Do not mark `CONN-001` resolved until both T1-01 and T1-12 merge.**

### 5. T1-14 (NEW, P1, security) — separate branch, do not fold in

`auth.config.ts:31-34` validates post-login redirects by prefix. Proven, 4 escapes of 8 inputs at
`baseUrl = https://coursaty.com`:

```text
https://coursaty.com.evil.net/steal  -> https://coursaty.com.evil.net   BYPASS
https://coursaty.community/steal     -> https://coursaty.community      BYPASS
https://coursaty.com@evil.net/       -> https://evil.net                BYPASS (userinfo trick)
https://coursaty.com.evil.net        -> https://coursaty.com.evil.net   BYPASS
```

**The leading-slash inputs are NOT exploitable here** — unlike T1-09's client-side case — because the
value is concatenated *after* `baseUrl`. Re-derive the fix for this call site; don't copy T1-09's.
Compare origins, never prefixes. Commit the 8-input table as a test.

### 6. T1-13 (NEW, P1) — **owner answered YES: centres must be onboardable before launch**

This was an open question. It is now a required build and a launch blocker.

T1-04 still ships as-is — self-serve signup stays hidden — and this task supplies the **admin-operated**
path instead: an admin-only endpoint that sets `User.role` to `CENTER_ADMIN` and links or creates the
Center, plus the control in the existing admin users table.

**This is a privilege-escalation surface. Every rule is blocking:**

- Authorization re-checked **server-side inside the route** from the session, never trusted from the
  client, **reusing the existing `requireAdmin` pattern** in `app/api/admin/refund-requests/route.ts` —
  don't write a second admin check.
- The role transition is **allowlisted explicitly** (`STUDENT`/`TUTOR` → `CENTER_ADMIN`, and back).
  Never accept an arbitrary role string from the body — that would turn this into a way to mint platform
  ADMINs.
- This endpoint must **not** be able to grant `ADMIN` under any input.
- Every call writes an audit row via the existing `lib/audit.ts` `log()` with actor, target, previous
  role, new role. A silent privilege change is unacceptable.
- Rate-limit it like the other sensitive routes.

`app/admin/**` is restricted per `overhaul/07`; **T1-13 is the explicit grant for exactly the three
files in `tasks.json` and nothing else under `app/admin/`.**

Acceptance — all tested by calling the route directly, not clicking the UI: an ADMIN can promote a
STUDENT/TUTOR and that user then reaches `/centers/[id]/admin`; an authenticated TUTOR, an authenticated
CENTER_ADMIN, and an anonymous caller each get **403 with no state change**; a body carrying
`role=ADMIN` is rejected; an audit row exists after each success.

### 7. T1-15 (NEW, P1) — payment-attempt linkage

`lib/paymob.ts:157-163` overwrites `booking.paymobOrderId` on every `initiatePayment`, so a payment
retry orphans the previous Paymob order. The webhook resolves by `paymobOrderId` and matches only the
newest attempt. If the **superseded** attempt then succeeds, the handler hits `!booking`, logs, and
returns 200 — Paymob stops retrying, money is captured, and there is **no booking and no `refundReason`
row**. Unlike the T1-01 race, nothing lands in the refund queue to catch it.

Needs real payment-attempt history. **Touches `prisma/schema.prisma` (protected) — sequence it.**

### 8. T1-04 — PR #3 — do not claim provisioning

You were right; `overhaul/16` was wrong. Ship the HIDE gate as-is. **Do not claim provisioning
acceptance in the PR** — the admin path is T1-13's job, not this one's.

## Rules that haven't changed

- Scope lives in **`tasks.json`**, not prose. If a grant isn't there, refuse — you've been correct to do
  this twice and both times the registry was the thing at fault.
- Don't add a dependency without a one-line justification.
- Check `components/` and `lib/` before building anything "new" — dead-parallel implementations are the
  audit's #1 defect.
- Don't replace real functionality with mock data.
- Don't merge anything that breaks `npm run build`.
- Append a line to `overhaul/progress-log.md` after every state change.
- Type E tasks (T1-01/02, T1-05, T1-11, T1-12, T1-13, T1-14, T1-15) — **only Claude merges these**, after
  two review passes. Push and report; don't self-merge.
