# Claude review verdicts — Wave 1

**Session:** 2026-08-06 · verdict format per [overhaul/09](../09-review-validation-and-handoff.md)
Packets referenced, not restated: [overhaul/08](../08-agent-task-packets.md),
[overhaul/16](../16-defaulted-decision-packets.md), [overhaul/17](../17-claude-contracts.md).

> **Diff gotcha:** branches are based on `89db9af`; `main` has moved. Always diff against
> `git merge-base main <branch>`, or the diff falsely shows `overhaul/*` docs being deleted.
> Verified: no Codex commit touches documentation.

---

## Merged

### T1-03 — Merged `c95a002`, then **REOPENED** (my error)

The `proxy.ts` change is correct: `/centers` + `/centers/[id]` unblocked, `/centers/[id]/admin`
still gated by a regex covering subpaths, anonymous redirected to `/login` not `/unauthorized`.

**But I approved it against the packet's claim that page-level logic was "already public-permissive,"
and I did not verify that claim.** It is true of `/centers/[id]` and **false** of the listing:
[app/centers/page.tsx:19-22](../../app/centers/page.tsx#L19-L22) redirects anonymous users to
`/login` on its own, and the page sets `robots: { index: false }`. `UX-JOURNEY-002` is **not closed**.

Root cause is mine, not Codex's: `tasks.json` scoped T1-03 to `proxy.ts` only, so Codex correctly
refused the page edit. **Registry corrected** — T1-03 is now `reopened-partial` with
`app/centers/page.tsx` in `filesAffected`. Remaining work: drop the `ALLOWED_ROLES` redirect and the
`noindex` (the latter feeds `T5-02`'s sitemap/hreflang).

### T1-06 — Merged `ace0b1f`, approved

I independently confirmed `/api/classes/search` returns `{ items, total, hasMore }`, so
`data['classes']` → `data['items']` is right; Codex checked the endpoint the code actually calls.
Fallback now fires only on real network failure. Empty results render an honest empty state instead
of silent mock data — a user-visible change, correctly named.

---

## Changes requested

### T1-09 — `ca06514` · Changes requested (security)

`SEC-006` is **not** closed. `startsWith("/") && !startsWith("//")` passes `/\evil.example.com`,
which browsers normalize to `//` per the WHATWG URL spec. Proven, not reasoned:

```text
"/\\evil.example.com"   guard=PASS  -> resolves to https://evil.example.com   <<< BYPASS
```

Prefix matching cannot cover this input class. Parse and compare origins:

```ts
const u = new URL(raw, window.location.origin);
return u.origin === window.location.origin ? u.pathname + u.search + u.hash : "/dashboard";
```

Required evidence: a Vitest table over `/dashboard`, `//evil`, `/\evil`, `https://evil`,
`/%2f%2fevil`, `null`. Belongs in `T5-01`'s auth suite ([overhaul/17](../17-claude-contracts.md) Contract B).

### T1-05 — `a6b2923` · Changes requested (honesty, not authorization)

**The gate itself is right, and my earlier concern was wrong.** I suspected over-restriction; the
product's own copy settles it — `centerAdmin.access.limited.hint` reads *"Sees their class schedule
only; no revenue or other students."* So withholding roster/PII from `LIMITED` is **correct by
design**. Codex implemented the right policy.

**The real defect is what renders instead.** `bookingsCount` now derives from an empty list, and
[DashboardClient.tsx:45](../../app/dashboard/DashboardClient.tsx#L45) sums it into
`stats.totalBookings`. A `LIMITED` tutor with 12 students now sees **"Total Bookings: 0 — enrolled
students."** The revenue card is correctly *hidden*; the bookings card displays a **fabricated zero**.

That is the audit's #1 defect class — presenting invented data as fact — reintroduced by the fix for
a different instance of it. Hide the stat the way revenue is hidden, or render `—` /
"managed by your center". Never `0`.

Still owed for acceptance: all **7** `CONN-003` surfaces (not the 4 touched) with captured payloads
for `FULL` / `LIMITED` / `VIEW_ONLY`.

### T1-01 / T1-02 — `ac74607` · Changes requested (two passes done)

**Pass 1 — implementation.** Strong. `prisma.$transaction(..., { isolationLevel: "Serializable" })`
with the active-seat count *inside* the transaction is the correct shape; `P2034` retry; every
conflict maps to a clean **409**, never a 500 — including the retry-exhaustion path. Crucially,
`lockSeat()` is **deleted** from `app/actions/bookings.ts` rather than left beside the live path,
closing the dead-parallel pattern. T1-02: `BookingCheckout.tsx` 1945 → 410 lines, zero fabricated
data, real `cls.schedule` with an explicit missing-state, 44 `t()` calls.

**Pass 2 — risk model re-derived from scratch, not confirming pass 1. This found a blocker.**

Asking "what else can produce two confirmed bookings for one seat" surfaces the *payment* path, which
pass 1 never touched:

1. 1-seat class. Student A books → `PENDING`, `lockedUntil = now + 10min`. Seat held.
2. A is slow on Paymob — Egyptian bank OTP/3DS routinely exceeds 10 minutes.
3. `cleanup-locks` cron sets A's booking `status: "CANCELLED"` and frees the seat.
4. Student B takes the seat → `CONFIRMED`.
5. A's payment succeeds. [webhooks/paymob/route.ts:163-171](../../app/api/webhooks/paymob/route.ts#L163-L171)
   sets `status: "CONFIRMED"` **unconditionally** — no capacity check, no check that the booking was
   already cancelled.

**Result: two confirmed bookings on a one-seat class, and A has paid.** The exact defect T1-01 exists
to prevent, re-entering through the money path. This is *newly reachable*: `lockedUntil` was never
set before (`lockSeat` was dead), so the cron previously found nothing.

Codex independently flagged this in its own handoff — two agents reaching it separately raises
confidence.

**Required before merge.** The webhook must not blindly confirm: re-check capacity in a serializable
transaction and confirm only if a seat is free; otherwise flag for refund and alert. Silent
confirmation is not acceptable on the money path. Also reconsider `LOCK_DURATION_MINUTES = 10`
against real Egyptian bank-OTP latency, and note abandoned online payments currently consume promo
usage.

**Scope note (mine to grant):** the webhook is outside T1-01's `filesAffected`, so Codex was right
not to touch it. As architecture owner I authorize extending T1-01 to
`app/api/webhooks/paymob/route.ts` and `app/api/cron/cleanup-locks/route.ts` — **or** splitting it
into a follow-up that must merge *with* this branch, never after it.

### T1-11 — `f43e72c` · Changes requested (acceptance not met)

Codex reports the Suspense boundary and skeleton work, but the full 117-route table remains entirely
`ƒ` — **`PERF-001` is not closed.** Compare against
[baseline/build-routes-before-T1-11.txt](../baseline/build-routes-before-T1-11.txt).

I accept the diagnosis: static/ISR conversion needs Cache Components config and route-data work
beyond `app/layout.tsx` / `app/Navbar.tsx`, which is more than the packet scoped. Either amend the
scope or split render-mode conversion into a follow-up. **Do not close T1-11 on the boundary alone** —
and note Wave 2 entry depends on this task genuinely landing.

---

## Not reviewable yet

**T1-07 / T1-08** `67593db` — T1-07's checks are green and the advisory confirms beta.32 patches
`SEC-001`; I verified the bump takes `npm audit` from **18 vulns (2 critical, 12 high) → 0**, making
this the highest-urgency Wave 1 merge. T1-08 is Type E and still needs credentialed login / OAuth-link
/ 5-attempt-lockout / session-invalidation evidence. **Blocked on the owner** supplying safe seeded
credentials — Codex cannot self-certify and I cannot fabricate them.

---

## Blocked on the owner

**UPDATE 16:55 — two of the three are now RESOLVED.**

### Test fixtures — RESOLVED

`prisma/fixtures-acceptance.ts` exists, has been run, and was verified live against the dev DB.

```bash
npx tsx prisma/fixtures-acceptance.ts          # create / reset (idempotent)
npx tsx prisma/fixtures-acceptance.ts --clean  # remove
```

| Account | Role / access | Purpose |
|---|---|---|
| `student@fixtures.coursaty.test` | STUDENT | booking + auth flows |
| `tutor-full@fixtures.coursaty.test` | TUTOR / FULL | T1-05 control case |
| `tutor-limited@fixtures.coursaty.test` | TUTOR / LIMITED | T1-05 — must receive no revenue/PII |
| `tutor-viewonly@fixtures.coursaty.test` | TUTOR / VIEW_ONLY | T1-05 — must receive no revenue/PII |

Password for all four: `FixturePass!234` (bcrypt cost 12, matching
[signup route:62](../../app/api/signup/route.ts#L62) — a cheaper hash would exercise a different
lockout path than production).

Also seeded: each tutor owns a class with a **500 EGP PAID booking**, so a failing gate has real
revenue and real student PII to leak — and a **capacity-1 class with zero bookings**
(`Concurrency Test Class (1 seat)`) as the T1-01 last-seat race target. Re-running resets that class
to empty, so the race test stays valid across runs.

This unblocks the evidence Codex logged as missing for **T1-05**, **T1-08**, and **T1-01**.

Not folded into `prisma/seed.ts` by design, not oversight: that file is demo content using bare
`create()` with no passwords and default `FULL` access — the opposite properties acceptance evidence
needs. Header documents it.

### Playwright — PARTIALLY resolved

Chromium is installed (Chrome Headless Shell 151.0.7922.34), so that is no longer the blocker. What
remains is **one interactive approval** of the project-scoped MCP server in `.mcp.json` after a Claude
Code restart. No agent can self-grant it. Baseline capture — and therefore Wave 2 — waits on that
single click.

### PR creation — still open, lowest priority

GitHub integration returns `403 Resource not accessible by integration`; `gh` is not installed.
Branches are being merged locally instead. Defensible with no second human reviewer, but it does cost
Codex's automatic PR review as an independent check on Claude's reviews — which already proved its
worth by catching the T1-03 miss.
