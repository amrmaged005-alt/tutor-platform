# 17 — Claude-Owned Contracts (T5-01, T4-02, T3-05, T3-06)

Per `overhaul/03-agent-responsibility-matrix.md`, these four tasks are Type C/E: **Claude defines the
contract, Codex implements against it.** The contracts are written now, during the Wave 1 wait,
because none of them depends on Wave 1 *merging* — only on Wave 1's files not being edited
concurrently, which is enforced by `overhaul/07`.

`overhaul/08` warns against pre-writing *Codex packets* for later waves because they go stale against
merged state. That warning applies to implementation packets. These are **interface contracts** —
function signatures, component APIs, and a risk-ordered test list — which are exactly the artifacts
`overhaul/03` says Claude must produce *before* Codex starts. They are stable against Wave 1's
outcome. Where a contract does touch a file Wave 1 is editing, that dependency is called out
explicitly below.

Each section is a Claude packet. Codex packets get generated from these at their wave's start.

---

## Contract A — `T4-02` · `lib/security.ts` and the CSRF check

**Type C · Wave 4 · Finding `CONN-012` · Open Decision #8 shapes the scope, not the contract**

### What already exists (verified, not assumed)

`isSameOrigin` is **already implemented three times, byte-identical**, as a local function in three
route files:

- [app/api/reviews/route.ts:6-14](../app/api/reviews/route.ts#L6-L14)
- [app/api/classes/route.ts:108-114](../app/api/classes/route.ts#L108-L114)
- [app/api/admin/verify-user/route.ts:8-14](../app/api/admin/verify-user/route.ts#L8-L14)

```ts
function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}
```

`lib/security.ts` does **not** exist yet. There are ~85 session-authenticated mutation routes; three
of them have this check.

### The contract

Extract **exactly this logic**, unchanged in behavior, to `lib/security.ts`:

```ts
import type { NextRequest } from "next/server";

/**
 * Same-origin check for session-authenticated mutations (CSRF defense).
 * Fail-closed: a missing Origin or Host header returns false.
 */
export function isSameOrigin(req: NextRequest): boolean;

/**
 * Guard wrapper. Returns a 403 NextResponse when the request is cross-origin,
 * or null when it passes — so call sites read:
 *   const blocked = requireSameOrigin(req); if (blocked) return blocked;
 */
export function requireSameOrigin(req: NextRequest): NextResponse | null;
```

**Non-negotiable properties:**

1. **Fail-closed.** Missing `origin` or `host` → `false`. Do not "improve" this into fail-open for
   convenience (e.g. treating a missing `Origin` as a same-origin navigation). `SEC-001` in this very
   audit is a fail-open auth check; do not introduce a second one.
2. **Behavior-identical to the three existing copies.** This is an extraction, not a redesign. If
   Codex believes the logic is wrong, that is a *separate finding to file*, not a change to make
   inside this task.
3. **All three existing local copies are deleted** and replaced with imports. Leaving even one behind
   recreates the dead-parallel-implementation pattern this audit names as its #1 defect.
4. **403 status and `{ error: "Forbidden" }` body preserved** — three routes already return exactly
   that; clients may depend on it.

### Open Decision #8 — what it does and does not change

Decision #8 decides **how many routes get the check**, not what the check is. So this contract is
final either way, and the extraction can proceed before the decision resolves:

- **If "extend everywhere":** apply `requireSameOrigin` to all ~85 session-authenticated mutation
  routes. Claude reviews the route-coverage checklist, not 85 individual diffs (`overhaul/03`,
  Security row).
- **If "SameSite is primary defense":** the extraction still happens (three duplicates is still
  three duplicates), the `SameSite` cookie config is verified and documented as the primary control,
  and the helper stays available for routes that want defense in depth.

**Prerequisite for the decision, assigned to Codex as a Type D discovery:** report the actual
`SameSite` attribute on the session cookie in production config. `overhaul/13` calls this a 5-minute
check. It must be a real observation of the configured value, not an assumption about NextAuth's
default.

### Sequencing

Per `overhaul/05`'s do-not-parallelize table, `T4-02` must not run alongside another Wave 4 task
touching the same route files. Its Codex packet must list the exact route set. Routes touched by
in-flight Wave 1 work (`app/api/bookings/route.ts` — `T1-01`) are **excluded** and picked up in a
follow-up once `overhaul/booking-seat-lock` merges.

---

## Contract B — `T5-01` · Risk-ordered test plan

**Type C · Wave 5 · Finding `TEST-001` (Critical) · Depends on `T0-05` ✅ done, `T1-01` pending**

Harness is live: Vitest, `npm test`, `tests/**/*.test.ts`, `@/` alias — see
[overhaul/adr/0001-test-framework.md](adr/0001-test-framework.md).

**Scope discipline:** four suites, in this order. This is explicitly *not* blanket coverage, and the
80% bar in the global rules is not in scope for this task. The ordering is by blast radius: money,
then data integrity, then access, then abuse.

### Suite 1 — Paymob webhook (`app/api/webhooks/paymob/route.ts`)

Highest blast radius: it moves money and it is reachable by anyone on the internet.

| # | Test | Must assert |
|---|---|---|
| 1 | Valid HMAC signature | Booking transitions to paid |
| 2 | **Invalid HMAC** | Rejected; **no** booking state change |
| 3 | **Missing signature entirely** | Rejected — the fail-open case |
| 4 | Replayed identical valid callback | Idempotent; does not double-confirm or double-credit |
| 5 | Valid signature, unknown booking id | Handled without a 500 |
| 6 | Malformed/absent JSON body | Handled without a 500 |

`lib/paymob.ts` is audited as correct and is **restricted from edits** — these tests characterize
existing behavior. If a test fails, that is a finding to report, not a licence to edit `lib/paymob.ts`
inside this task.

### Suite 2 — Seat-lock concurrency (validates `T1-01`)

**This suite is the acceptance evidence for `T1-01`'s Type E merge.** `overhaul/09` requires it to
pass twice independently.

| # | Test | Must assert |
|---|---|---|
| 1 | **Two concurrent bookings, one remaining seat** | Exactly one confirmed, exactly one rejected |
| 2 | The rejection | Clean 4xx with a real error — **not a 500**, not a silent failure |
| 3 | N concurrent bookings, M seats (N > M) | Exactly M succeed. Not just the 2-vs-1 case. |
| 4 | Abandoned lock past TTL | Reclaimed by `app/api/cron/cleanup-locks` |
| 5 | Seat released on cancel | Capacity returns to the pool |

**Binding on the test author:** the concurrency test must actually exercise the race — fire the
requests genuinely in parallel (`Promise.all` against the real transactional path). A sequential
loop that books, then books again, and observes a rejection **proves nothing about the race** and
will be rejected at review. `overhaul/03` names this explicitly as what Claude checks for. State in
the PR *how* parallelism is achieved and *what* would make the test fail against the pre-`T1-01` code
— if it would have passed before the fix, it is not testing the fix.

Blocked on `T1-01` landing, since it tests that write path.

### Suite 3 — Auth and role gating

Covers the same class of defect as `CONN-003` (dashboard revenue leak) and `T1-04`'s server-side gate.

| # | Test | Must assert |
|---|---|---|
| 1 | Unauthenticated → protected API route | 401/403, no payload leak |
| 2 | STUDENT → tutor-only route | Rejected |
| 3 | TUTOR (`LIMITED`/`VIEW_ONLY`) → dashboard payouts/analytics | **Response body contains zero revenue/PII fields** — assert on the JSON, not on what renders |
| 4 | `POST /api/me/role` with `CENTER_ADMIN` | 400 (validates `T1-04`'s load-bearing change) |
| 5 | Non-owner mutating another user's booking | Rejected |

Test 3 is the one that matters most: `CONN-003`'s defect was that data reached the client and was
hidden in the render layer. Asserting on rendered output would reproduce the bug, not catch it.

### Suite 4 — Rate limiters (`lib/ratelimit.ts`)

Four limiters exist: `generalLimiter` (20/10s), `authLimiter` (5/15m), `bookingLimiter` (10/1h),
`reviewLimiter` (5/1h).

| # | Test | Must assert |
|---|---|---|
| 1 | Under limit | Passes |
| 2 | Over limit | Blocked with the right status |
| 3 | `authLimiter` at 5 attempts | Matches the lockout copy in `lib/auth.ts` — the two must not disagree |
| 4 | Limiter identity | Each limiter uses its own `prefix:` — no shared bucket across concerns |
| 5 | **Redis unavailable** | Documented, deliberate behavior. Fail-open here is a real availability-vs-security tradeoff — whichever it is, it must be a decision, not an accident. |

Upstash Redis is a live external dependency. Mock at the `@upstash/ratelimit` boundary; do not require
a real Redis for `npm test` to pass, and do not have tests share limiter state.

### Acceptance for T5-01

All four suites pass via `npm test`; suite 2 passes twice independently; `npm test` needs no
credentials or network; the PR states how suite 2 achieves genuine parallelism.

---

## Contract C — `T3-05` · Shared `IconButton`

**Type C · Wave 3 · Findings `MOBILE-003`, `MOBILE-005`, `MOBILE-009`**

### Root cause

From `audit/05`: *"icon buttons built to visually match their icon size rather than a minimum hit-area
convention."* Per-instance inline padding is **why this keeps recurring**. The fix is a default that
cannot be forgotten — not another round of hand-tuned padding.

### API

```tsx
interface IconButtonProps {
  /** Required. Icon-only buttons have no text; without this they are invisible to a screen reader. */
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  /** Visual size of the icon. Does NOT change the hit area. */
  size?: "sm" | "md";      // default "md"
  variant?: "ghost" | "solid" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}
```

**Non-negotiable properties:**

1. **`min-width: 44px; min-height: 44px` is applied unconditionally and is not overridable by props.**
   No `style` or `className` escape hatch that can shrink it. WCAG 2.5.5/2.5.8.
2. **The visual icon and the hit area are decoupled.** `size` changes the glyph; a 20px icon still
   gets a 44px target. Where a 44px box would break a dense layout, expand the target with padding or
   a pseudo-element rather than shrinking the box.
3. **`label` is required and becomes `aria-label`.** Not optional, not defaulted.
4. **Logical properties only** — `insetInlineStart`/`insetInlineEnd`, never `left`/`right`.
   [components/ui/MobileBottomNav.tsx](../components/ui/MobileBottomNav.tsx) is the reference; the
   audit confirms it is already clean.
5. **Visible focus ring**, and `variant="danger"` for destructive actions.

### Migration set (component merges first, then call sites — `overhaul/05`)

Priority order from `audit/05`, highest-consequence first:

1. Messages back-link — high-frequency navigation
2. Dashboard delete button — **irreversible destructive action**
3. Nav hamburger + drawer close (`MOBILE-003`)
4. `ClassFilterBottomSheet.tsx:140` close — `padding: 4` on a 20px icon ≈ 28px target
5. Favorite heart, card grid (`MOBILE-005`) — 32px
6. [ClassDetailClient.tsx:450-452](../app/classes/[id]/ClassDetailClient.tsx#L450-L452) — 28px, and
   it is the class detail page's primary save action

**Do not migrate `BookingCheckout.tsx`** — frozen to `overhaul/booking-seat-lock` (`overhaul/07`).
Pick it up after that branch merges.

Claude spot-checks 3 migrated call sites for drift (`overhaul/03`, Design-system row).

---

## Contract D — `T3-06` · Shared `Modal`

**Type C · Wave 3 · Finding `MOBILE-007`**

### Extract, do not invent

[components/ui/SignInRequiredModal.tsx](../components/ui/SignInRequiredModal.tsx) **already does the
hard parts correctly**: focus trap via
[components/ui/useFocusTrap.ts](../components/ui/useFocusTrap.ts), Escape-to-close, `body` scroll
lock on open with cleanup on unmount, and i18n through `useI18n`.

`AGENTS.md`: *"Don't duplicate an existing utility/component — check `components/` and `lib/` first."*
So the shared `Modal` is **extracted from `SignInRequiredModal`'s proven behavior**, and
`SignInRequiredModal` is then **refactored to consume it** — becoming a thin wrapper. Building a new
Modal beside it would create a fourth implementation while claiming to remove three.

### The actual defect

All three current implementations cap **width** and never cap **height**:

- `.modal` — [app/globals.css:856-868](../app/globals.css#L856-L868): `max-width: 480px`, no
  `max-height`, no `overflow-y`
- `DashboardPrimitives.tsx:178` — `width: min(420px, calc(100vw - 32px))`, same omission
- `DashboardMaterials.tsx:155` — `width: min(460px, calc(100vw - 32px))`, same omission

Two of the three are **forms with text inputs**, so the on-screen keyboard shrinking the visual
viewport is a live scenario, not theoretical. With `top: 50%` centering and no scroll container,
content goes off-screen and unreachable.

The proven fix already exists in this codebase: `ClassFilterBottomSheet.tsx` uses
`maxHeight: 86vh` + `overflowY: auto`.

### API

```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Required — becomes the accessible name via aria-labelledby. */
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;   // action row, stays pinned and reachable
  size?: "sm" | "md";         // width cap only; height cap is fixed
  /** Escape hatch for destructive-confirm dialogs only. Default false. */
  disableBackdropClose?: boolean;
}
```

**Non-negotiable properties:**

1. **`max-height: 85vh` + `overflow-y: auto` on the content region, not overridable.** This is the
   entire point of the task.
2. **The footer stays reachable** when content scrolls — content scrolls, footer does not scroll away.
   A confirm button that scrolls out of reach on a short viewport is the same bug in a new place.
3. **Keyboard-safe.** Verify with an on-screen keyboard open on a real 390px viewport, not just a
   narrow desktop window. `MOBILE-007` could not be visually confirmed at audit time — this task is
   where it finally gets confirmed.
4. **Reuse `useFocusTrap`.** Do not write a second focus trap.
5. `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → `title`; focus returns to the trigger on
   close.
6. **Logical properties only** (`inset-inline-start`), preserving what `.modal` already does right.
7. All copy through `t()`.

### Migration set

1. `SignInRequiredModal` → refactor onto shared `Modal` (proves the API against the most complete
   existing case first)
2. `DashboardPrimitives.tsx:178`
3. `DashboardMaterials.tsx:155`
4. `.modal` in `globals.css` — remove once no consumers remain. **Grep for `className="modal"`
   before deleting**; the rule is global CSS and may have consumers outside the three known sites.

**Explicitly out of scope:** `ClassFilterBottomSheet` stays a bottom sheet. `audit/05` calls it the
strongest-audited UI in the product and `AGENTS.md` forbids regressing the mobile layer. It is the
*reference* for the height-cap pattern, not a migration target.

**Deliberately not changed:** these dialogs stay centered cards rather than going full-screen on
mobile. `audit/05` judged that a legitimate design choice for short forms and filed no finding.

---

## Cross-cutting note for Wave 2 — `T2-04` (promo field)

Flagging early because it matches this audit's #1 defect pattern.
[components/ui/PromoCodeInput.tsx](../components/ui/PromoCodeInput.tsx) **already exists**, and
`CONN-006`'s own title is *"money-handling logic is correct but unreachable; a dead parallel UI/API
path also exists."*

So `T2-04` is very likely **wiring an existing component**, not building a new input. Its Codex packet
must begin by auditing what `PromoCodeInput` already does and which of the parallel paths is live.
Shipping a second promo input beside this one would be exactly the defect the audit is trying to
close. Confirm before writing any new UI.
