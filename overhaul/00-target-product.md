# 00 — Target Product Definition

This is the product `audit/12-simplified-product-proposal.md` already specifies in detail — this document restates it as a decision record (what's in/out, in measurable terms) so every downstream task packet can be checked against one page instead of re-deriving intent. Where this doc and `audit/12` differ in emphasis, `audit/12` has the file:line evidence; treat it as the source of truth for *why*, this doc as the source of truth for *what ships in this overhaul*.

## Who this is for

Coursaty is a **tutoring marketplace for the Egyptian K-12/university-prep market**: students (and, informally today, the parents paying for them) search for tutors and classes, book real seats in real sessions, pay through Paymob, and message their tutor. Tutors run their own class rosters and, optionally, operate inside a learning center. Platform admins moderate the marketplace.

## Core promise

**Find a real tutor, book a real seat, pay safely, show up.** Every word in that sentence is currently violated somewhere in the product (fake calendar dates, a race condition that can double-book a seat, a center-admin role that can never onboard) — closing that gap *is* this overhaul. Nothing about the promise itself is changing.

## Minimum coherent product (ships in this overhaul)

- Student and Tutor accounts, full signup → browse → book → pay → message loop, honest at every step (no fabricated data anywhere in the booking path).
- Platform-admin moderation tools, fully wired (no dead buttons).
- Centers, in one of two states by the end of Phase 1 — either a working public-browse + real center-creation flow, or hidden from nav/signup entirely. Never the current third state (visible, broken).
- Bilingual EN/AR with correct RTL on every core surface (browse, class detail, booking, dashboards).
- One shared icon-button component, one shared Modal component — the two consolidations audit `12`§1/§3 identifies as highest-leverage.

## Explicitly not included in this overhaul

- **Parent/guardian accounts** — deferred per Open Decision #2; students/parents share the Student account as they do today.
- **Real-time notification system build-out** — deferred per Open Decision #4 unless the product owner decides otherwise; Settings toggles get honest copy either way.
- **New differentiator features** (Phase 6) — none are scoped until Phases 1–5 are stable, per the audit brief's own instruction to avoid recommending speculative work.
- **A rewritten checkout UX or new booking model** — the fix is re-porting the honest `e500435` version forward plus wiring `lockSeat()`, not redesigning the flow.
- **Any new design language.** No new component library, no new token system — the existing design-token system (`audit/00` scores it 75/100, the strongest non-mobile dimension) is reused and consolidated, not replaced.

## Primary student journey (target state)

Land on a compact hero → search or browse (filters + `ClassCard`, now bilingual) → open a class or tutor profile (real rating from real reviews once CONN-007 ships) → book (real schedule, real seat lock, real identity defaults, bilingual) → pay via Paymob (already solid, untouched) → confirmation → message the tutor if needed → leave a review after the session. Every step already exists in code; the target state is that every step is *honest and wired*, not that any step is new.

## Primary tutor journey (target state)

Signup → create a class → appear in Browse → receive bookings → see accurate dashboard stats gated correctly by access level (no revenue leak) → message students → get paid out. If operating inside a center, access level (Full/Limited/View-Only) genuinely restricts what's visible on every surface, not just 3 of 7.

## Parent experience

Not a separate account type in this overhaul (see above). A parent uses the Student account directly. No UI changes proposed to accommodate this beyond what already works.

## Admin experience must support

Every button in the platform-admin dashboard does what it says (Export CSV, Broadcast, Edit/Delete user, Delete class — currently 5 dead controls, `LINK-001`–`005`). Refund approval either moves real money or is honestly labeled as a manual step. No admin surface implies automation that doesn't exist.

## What the homepage must communicate

One clear job on first paint: **"search for a tutor, right now."** Compact hero, real search bar, one CTA. The book-metaphor showcase remains — it's a genuine, distinctive brand asset — but it is capped to 2–3 chapters and/or moved below an immediately-actionable fold (Open Decision #5 leaves the exact shape to the product owner; both options satisfy this constraint). It is never again the *first* 600vh a visitor must scroll through before they can act.

## What the browse experience must prioritize

Content over chrome: tutor/class cards visually dominant, filters present but secondary (already true structurally — the mobile filter bottom-sheet is the strongest-audited UI in the product per `audit/00`). No changes to filter logic; the fix is exclusively i18n (`ClassCard.tsx` first, highest leverage) and touch-target consolidation.

## What the tutor profile must contain

Name/photo, subjects, a real verified rating + review count (blocked today only by the unwired review button), real schedule, a working message CTA. No new fields, no redesign.

## What the booking experience must accomplish

Show real dates from the class's real schedule, never fabricate ratings/seats-left/duration, default identity fields to the logged-in user's real profile, guarantee exactly one booking per seat under concurrent load, and carry the user through Paymob and back without the currently-regressed placeholder state. This is Phase 1's single highest-value cluster (T1-01/T1-02).

## What the dashboards must prioritize

Tutor dashboard: revenue and payout data must never render for a tutor whose access level doesn't permit it — server-side, not just hidden in the client. Student dashboard: unchanged, not flagged as broken. Center-admin dashboard: real audience or hidden, never both-at-once.

## How Arabic and English must behave

Both first-class, not translate-later. The dictionary/hook pattern and RTL CSS centralization already exist and score well (`audit/00`: i18n architecture is a top-5 strength) — the work is *wiring existing unused DICT keys* to four specific unwired surfaces (`ClassCard`, `ClassDetailClient`, `BookingCheckout`, public `CenterProfileClient`), not building new i18n infrastructure. `lang`/`dir` must be correct on the **first server-rendered response** (cookie-based, not `localStorage`-only) by the end of Phase 3.

## Preserving the Egyptian and educational identity

The book-metaphor landing sequence, Arabic-first terminology choices, and the existing visual identity (warm ivory-stone + deep emerald, per project memory) are **kept**, not diluted. "Simpler" in this overhaul means *removing forced friction and dead ends*, not removing cultural or brand distinctiveness. The one terminology inconsistency found (حصة vs. جلسة for "session," two different translations of "Center Admin," `TERM-001`/`002`) gets standardized — that's a consistency fix, not a simplification of voice.

## Distinctive interactions that remain

The book-metaphor scroll sequence (capped, not removed). The mobile filter bottom-sheet with drag-to-dismiss. The existing dashboard data visualizations (`recharts`).

## Complicated interactions that are simplified or removed

- The desktop landing page's forced ~600vh scroll-gate before any actionable content (capped/relocated, not deleted).
- The `BookingCheckout.tsx` fake calendar, fabricated ratings, and non-functional step indicator (deleted outright, replaced by the honest `e500435`-derived version).
- Three divergent booking-cancel code paths (`CONN-010`) collapse into one shared helper.
- Three duplicated modal implementations collapse into one shared `Modal` component.

## What "simple while keeping the DNA" means, measured

| Metric | Today | Target |
|---|---|---|
| Forced scroll before landing page is actionable | ~600vh (6 chapters) | ≤200vh or below-the-fold (2–3 chapters), per Open Decision #5 |
| Nav destinations with dead ends | Centers (403 for most users), Reviews (no handler), Referral/Promo (no UI) | 0 |
| Financial data leak surfaces (tutor access-level) | 4 of 7 | 0 of 7 |
| Core student-facing components with zero i18n | 4 (`ClassCard`, `ClassDetailClient`, `BookingCheckout`, public `CenterProfileClient`) | 0 |
| Modal component implementations | 3, duplicated | 1, shared |
| Icon-button touch-target compliance (44px) | Systemic sub-44px pattern | 1 shared component, enforced |
| Statically/ISR-rendered routes | 0 of 31+84 | Landing + all auth-independent routes |
| `npm audit` critical/high findings | 0 (working tree) / 14 (as audited) | 0, committed and regression-tested |
