# 12. Simplified Product Proposal

> Synthesis document per master audit spec §30. This is not a new audit pass — every recommendation below cites a finding ID from docs `01`–`11` (already written) or a specific commit/file already verified during those passes. Where a finding ID is not available, the source is named inline (e.g. a specific component or commit).

## How to read this document

TutorPlatform's problem is not "too few features" — it's that roughly a third of the shipped surface is disconnected from the rest: dead-end signup flows, unwired buttons, silently-served mock data, and a landing page that spends 600vh of scroll before getting to the point. The audits (`03`, `04`, `08` especially) found real, working infrastructure sitting right next to it — the Paymob webhook, the refund-approval loop, favorites, messaging, the mobile filter bottom-sheet. The proposal below is a **subtraction and rewiring exercise**, not a rebuild. Every section states explicitly what to delete, hide, defer, or just finish connecting.

---

## 1. Proposed primary navigation

**Keep top-level nav to four destinations:** Home, Browse (classes/tutors), Dashboard (role-aware), Messages.

- **Centers**: currently `/centers` and `/centers/[id]` are gated to `CENTER_ADMIN`/`ADMIN` in `proxy.ts` even though they are meant to be public-browsable pages (ROUTE finding, `02`) — and center-admin signup is a complete dead end with no `POST /api/centers` and no create-center UI anywhere (UX-JOURNEY-008, Critical). Today "Centers" is not a real product surface for any external user; it only exists because `prisma/seed.ts` manually inserted rows.
  - **Recommendation: hide the "Centers" nav entry entirely behind a feature flag until one of two things happens** — (a) the route gate is fixed to allow public read access, and a real center-admin onboarding flow (signup → create center → verification) ships, or (b) the team explicitly decides centers are a phase-2 B2B feature and defers it. Do not leave it half-visible; a nav link to a page that 403s for the only role that would click it is worse than no link.
  - If kept as a phase-2 bet: scope it as its own vertical slice (signup, create-center, tutor-invite, admin dashboard) rather than patching the current gate.
- **Profile**: `/profile` is fully built and correctly gated but orphaned — not linked from anywhere in the app (finding in `02`/`08`). Add it to the account/avatar dropdown menu. This is a one-line nav fix, not new work.
- **Reviews, Referrals, Promo codes** do not need their own nav entries — they are sub-features of Browse/Dashboard/Checkout respectively (see §8).

---

## 2. Proposed homepage structure

The UX audit (`04`) found the landing page has two competing jobs: it's simultaneously trying to be a conversion funnel (search CTA, trust signals, tutor previews) and a "book" showcase (6 chapters of scroll-jacked animation, `.book-scroll` height = `var(--page-count) * 100svh`, ~600vh of forced scroll before real content). Nobody browsing for a tutor wants to scroll six screen-heights of animation first; nobody enjoying the book metaphor wants it interrupted by a hard sales pitch. Trying to be both means the page currently does neither job well, and it makes the zero-static-generation problem (root-caused to `app/Navbar.tsx` calling `auth()` without a Suspense boundary, poisoning every route) actively painful, since every one of those chapters has to render before First Contentful Paint on a page that can't be statically generated.

**Proposed order:**

1. **Compact hero** (above the fold, first screen only) — headline, primary search bar, one clear CTA ("Find a tutor"). No scroll-gate here.
2. **Book-metaphor showcase, capped to 2–3 chapters**, placed *below* the fold as a scroll-triggered brand moment, not a mandatory gate. This directly follows the UX audit's own recommendation: cap to 2–3 chapters or drop the scroll-jack below the fold. Keep the animation — it's genuinely distinctive — but stop making users pay 600vh of scroll tax to reach content they came for.
3. **Featured classes / tutors grid** (reuse `ClassCard.tsx` — see §8, it's the single highest-leverage i18n fix in the app since it's reused on ~10 pages).
4. **Trust/social proof band** (review counts, number of tutors, subjects covered) — only once reviews are actually leaveable from the web app (see §6/§8, CONN-007).
5. **Footer with real links.**

**Reduced-motion fix, not a rebuild:** the audit found `prefers-reduced-motion` currently only shrinks animation magnitude on the desktop scroll-jacked version rather than removing the scroll-gate, while the existing `MobileBookScroller` component already correctly respects reduced-motion via native scroll-snap. Recommendation: **reuse `MobileBookScroller` as the actual reduced-motion fallback** for desktop too, instead of maintaining a second "shrink the numbers" code path. This also incidentally fixes the RTL bug found in the same pass (page-flip transforms are hardcoded LTR pixel values with no RTL branching) since the mobile scroller uses native scroll-snap rather than hand-rolled transforms.

**What happens to the removed chapters (4–6):** delete the animation code for them, keep the copy/content as static sections lower on the page (folded into the featured-classes/trust sections above) so no content investment is lost — only the forced-scroll mechanism goes away.

---

## 3. Proposed browse experience

Keep the existing filter architecture — it's one of the few systems the audits found working well end-to-end.

- **Mobile filter bottom-sheet**: audit `05` found this is well-built and accessible. **Keep as-is and treat it as the reference pattern** for any future mobile modal/sheet work — notably it should become the template used to fix the "no shared Modal component" problem (3 duplicated modal implementations, none cap height, risky with on-screen keyboard — `05`).
- **Search/filters**: no changes recommended to the filter logic itself; the audit did not find functional gaps here, only presentation gaps (i18n, touch targets).
- **Result cards**: `ClassCard.tsx` has zero i18n despite being reused on ~10 pages (`06`). This is the single highest-leverage content fix in the whole app — one component fix propagates everywhere. Prioritize it above any other localization work.
- **Tutor vs. class distinction**: no dedicated audit finding calls out confusion here structurally, but given `ClassCard.tsx`'s reach, ensure the same fixed/i18n'd card component cleanly branches on tutor-led vs. class-based booking so the distinction is visually consistent across all ~10 reuse sites rather than drifting per page.
- **Sorting**: not flagged as broken; no changes proposed beyond what a general i18n pass already covers (labels going through DICT keys, per §8).
- **Touch targets**: systemic sub-44px targets trace to "no shared icon-button component" (`05`). Fix once, at the component level — this also fixes the two mismatched mobile-nav breakpoints (768px CSS vs 640px JS) as part of the same consolidation, since both bugs share the same root cause of ad hoc, non-shared UI primitives.

---

## 4. Proposed tutor profile

The audits didn't flag the tutor profile page itself as broken, but two upstream gaps directly limit what a profile can honestly show:

- **Reviews**: "Write review" button has no `onClick` handler (CONN-007) — real backend review logic exists, but nothing calls it from the web app. A tutor profile's trust signal (rating + review count) is currently unfillable by real users. **Fix priority: high** — this is pure UI wiring against an existing, working backend, not new engineering.
- **Access-level leakage**: tutor access-level restrictions (shipped per commit `786df84`) are only enforced on 3 of 7 surfaces; the dashboard headline revenue stat and payouts/analytics APIs still leak data to LIMITED/VIEW_ONLY tutors (CONN-003, UX-JOURNEY-006). This isn't a public-profile leak, but it means the access-level model isn't trustworthy yet, so anything the tutor profile surfaces about a tutor's standing/verification level should not be built on top of that access-control system until the remaining 4 surfaces are closed.

**Minimum info for trust/booking** (no new engineering beyond wiring existing pieces): name/photo, subjects taught, verified rating + review count (once §CONN-007 is fixed), real class schedule (see §5 — the profile's "book" CTA is only as honest as the checkout flow it leads into), response/message CTA (messaging already works per the audit's "what's working" list).

---

## 5. Proposed booking flow

This is the most urgent fix in the proposal. Per the connections audit (`08`), the current flow has two independent Critical defects:

1. `BookingCheckout.tsx` (1,437 lines) **regressed** in the latest commit to a fake hardcoded "May 2025" calendar, mostly-hardcoded English text despite i18n being imported, and placeholder student-name/school defaults that ship on real bookings (I18N-001, UX-JOURNEY-005).
2. A real overbooking race condition exists in live booking; the correct fix (`lockSeat()`, serializable transaction) already exists as dead code with **zero callers** (CONN-001, Critical) — and the abandoned-booking cleanup cron is a no-op for the same reason (CONN-002).

Critically, this was already fixed once and then regressed. Commit `e500435` ("fix(booking): read paymentUrl for Paymob redirect, friendly already-booked state, honest scheduling") specifically removed the fake May-2025 calendar, made the schedule step show the class's real schedule, fixed the Paymob redirect (client was reading `iframeUrl` when the API returns `paymentUrl`), added a proper `AlreadyBookedState` for HTTP 409 responses, and guarded the confirm CTA against double-submission. That diff touched exactly the files implicated in the current regression (`app/classes/[id]/book/BookingCheckout.tsx`, `app/api/bookings/route.ts`, `app/actions/bookings.ts`, `app/booking-confirmed/BookingConfirmedClient.tsx`).

**Recommendation: do not re-design the booking flow from scratch. Diff the current `BookingCheckout.tsx` against `e500435` and re-port forward whatever was lost**, then layer the still-outstanding `lockSeat()` wiring on top (CONN-001/CONN-002 were not fixed by that commit — they're a separate, still-open defect). Concretely:

- **Step 1 — restore honesty**: real schedule data, real i18n (the DICT keys likely already exist per the pattern found elsewhere — see §8), no hardcoded placeholder student/school values, brand font restored.
- **Step 2 — close the race condition**: wire the existing `lockSeat()` + serializable transaction into the actual booking write path; this also un-breaks the abandoned-booking cleanup cron for free since it depends on the same locking primitive.
- **Step 3 — keep what already works**: the Paymob webhook itself is solid (HMAC + idempotency, per `08`/`10`'s "what's working" findings) — this proposal only touches the checkout UI and the booking-write race, not the payment confirmation path.

**What happens to the current fake calendar/placeholder code**: delete outright, not deprecate — it actively misinforms users about real class times and ships fake names into production bookings. There is no scenario where it should be flag-gated back on.

---

## 6. Proposed dashboards

**Student dashboard**: not flagged as broken by the audits; no structural changes proposed beyond the app-wide i18n/touch-target fixes in §3/§8.

**Tutor dashboard**: fix the revenue leak first. The headline revenue stat and the payouts/analytics APIs still leak full data to LIMITED/VIEW_ONLY tutors even though the access-level restriction work (commit `786df84`) is otherwise "shipped" (CONN-003, UX-JOURNEY-006). This is a data-exposure bug in a financial surface — treat it as the single highest-severity dashboard fix, ahead of any cosmetic work, since it directly contradicts a feature the team believes is already done. Audit the remaining 4-of-7 unenforced surfaces named in CONN-003 and close all of them in one pass rather than one at a time, since they share the same root cause (access-level check not applied at the API layer, only at some UI layers).

**Center-admin dashboard**: exists in code but is unreachable by any real center-admin, because no such account can currently be created (UX-JOURNEY-008). Two honest options:
- **(a) Build the missing signup/creation flow** (`POST /api/centers` + a create-center UI) so the dashboard has a real audience, matching the effort already sunk into the dashboard itself, or
- **(b) explicitly park the center-admin dashboard behind a flag and stop investing in it** until centers are prioritized as a phase-2 vertical.
Do not continue polishing a dashboard that only seed data can ever populate — that's effort spent on a surface with zero real users by construction.

**Platform-admin dashboard**: 5 buttons (Export CSV, Broadcast, Edit/Delete user, Delete class) have no click handler. These are small, bounded wiring fixes (each one likely has a working API route already, per the pattern seen elsewhere in this audit) — batch them into a single pass rather than treating each as its own project.

---

## 7. Proposed account structure

**Keep**: Student, Tutor, Platform-admin — these are the only account types with a complete, working signup-to-dashboard path today.

**Center-admin**: functionally non-existent for real users (UX-JOURNEY-008, §1/§6 above). Either finish it as a real vertical or formally demote it to "not launched" in product messaging — the current state (dashboard exists, signup doesn't) is the worst of both worlds because it implies a commitment the team hasn't actually made.

**Parent/guardian accounts — recommend explicit deferral, not building now.** UX-JOURNEY-007 confirms this is a genuine absence (no role enum value, no onboarding, no signup path) rather than a bug — so this is a clean product decision, not a fix. Weighing the factors:
- *For building now*: the Egyptian tutoring market is heavily parent-initiated and parent-paying, especially for K-12; a student-only model may undercount the actual buyer.
- *Against building now*: the platform doesn't yet have a functioning student-only booking flow (§5 is Critical/broken), a functioning center-admin flow (§1/§6), or complete review/referral/promo wiring (§8) — layering a second account type with its own permission model, dashboard, and booking-on-behalf-of-a-minor legal/consent surface onto a foundation that's still leaking revenue data (CONN-003) and racing on seat allocation (CONN-001) multiplies the surface area needing fixes before any of it is trustworthy.
- **Recommendation**: defer Parent accounts to the phase after the Critical-severity items in this list (booking race condition, checkout honesty, revenue leak, centers decision) are closed. When it is built, the cheapest correct entry point is likely "student account with a parent-managed payment method / linked guardian view" rather than a fully separate role — but that design work should happen once, deliberately, not retrofitted under time pressure now.

---

## 8. Proposed content hierarchy

The localization audit (`06`) found a consistent pattern: DICT keys frequently already exist and are unused near the exact components that need them. This reframes most of the remaining i18n work as **wiring, not authoring** — the terminology has often already been decided and translated, it just isn't connected.

- **Priority order for wiring** (highest leverage first): `ClassCard.tsx` (reused ~10 pages) → `ClassDetailClient.tsx` → `BookingCheckout.tsx` (already required by §5's fix) → public `CenterProfileClient.tsx`. All four currently have zero i18n despite being core student-facing surfaces, not admin-only tooling.
- **Terminology consistency**: since dashboard i18n (~130 DICT keys) was already done properly in the prior "V2 pass" per project memory, use that pass as the style reference for term choices (e.g. how "class" vs. "session" vs. "booking" are rendered in Arabic) rather than inventing new terminology for the surfaces above — the goal is one consistent vocabulary app-wide, not four independently-translated pockets.
- **Booking-flow copy**: folds into §5's restoration of `e500435`'s "honest scheduling" copy — do this as one pass, not two, since the same file is being touched for both correctness and localization.
- **What to explicitly not do**: don't spin up a new translation-key naming convention or a new i18n library/pattern. The existing DICT-key system works (proven by the dashboard's ~130-key pass); the gap is coverage, not architecture.

---

## Summary: disposition of every flagged element

| Element | Disposition |
|---|---|
| Landing page chapters 4–6 (of 6) | Delete scroll-jack mechanism; keep copy as static sections lower on page |
| Desktop reduced-motion shrink-only behavior | Delete; replace with `MobileBookScroller` reused as universal reduced-motion fallback |
| Fake "May 2025" calendar in `BookingCheckout.tsx` | Delete outright; re-port `e500435`'s real-schedule logic forward |
| Placeholder student-name/school defaults in checkout | Delete outright |
| `lockSeat()` dead code | Wire in as the real seat-allocation path (not deleted — it's the correct fix, just uncalled) |
| Abandoned-booking cleanup cron | Fix by dependency (becomes functional once `lockSeat()` is wired) |
| `/centers`, `/centers/[id]` public routes | Hide behind flag until either public access is fixed or a real create-center flow ships |
| Center-admin dashboard | Flag-gate alongside the above; don't polish further until it has real users |
| 5 unwired admin buttons | Fix (wiring only, likely working APIs already exist) |
| "Write review" button | Fix (wiring only, backend already works) |
| Referral code capture on signup | Fix (wiring only) |
| Promo code UI field | Fix (wiring only, backend logic already correct) |
| `/profile` page | Fix (add nav link only — page itself is complete and correctly gated) |
| Revenue leak (dashboard stat + payouts/analytics APIs) | Fix immediately — treat as the top-priority dashboard item |
| Remaining 4-of-7 unenforced tutor access-level surfaces | Fix in one batched pass |
| Parent/guardian accounts | Defer explicitly to next phase, after Critical items above are closed |
| Signup "resend verification" UI | Fix messaging to match actual (disabled) server state, or re-enable verification before production per existing project memory note |
| `ClassCard.tsx`, `ClassDetailClient.tsx`, `BookingCheckout.tsx`, public `CenterProfileClient.tsx` i18n | Wire existing unused DICT keys — not new copywriting |
