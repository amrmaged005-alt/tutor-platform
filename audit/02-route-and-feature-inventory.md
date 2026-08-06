# 02 — Route & Feature Inventory

Coursaty / TutorPlatform, Next.js 16 App Router. Base data: `audit/routes.json` (31 page
routes, previous audit pass — verified complete and accurate, not redone here). This
document adds: full feature classification, internal-link cross-reference (broken +
orphaned), and disposition of the two ambiguous dev artifacts (`app/global-states/page.tsx`,
root `book-landing.html`).

**Verification method & limitation (disclosed per audit spec):** No browser automation tool
is available in this environment. Verification here is code inspection (`grep`/`read` across
`app/`, `components/`) plus a lightweight reachability pass: `npm run dev` on port 3000 with
`curl`/header checks for HTTP status codes on a sample of routes. This confirms a route
*responds* and, via response headers/title, roughly *what* it rendered — it does not confirm
visual correctness, interactive flows (multi-step forms, modals, drag/drop), or that a link
found in JSX actually renders on the page at runtime (conditional rendering by role/session
was reasoned about from code, not observed in a live authenticated session). Anywhere this
matters, it's called out explicitly below rather than silently asserted.

---

## 1. Route Inventory Summary

31 page routes under `app/**/page.tsx`, 84 API routes under `app/api/**/route.ts` (including
`app/api/mobile/*` for the Flutter app in `flutter_application_1/`). Full per-route detail
(file, authRequired, role, status, notes) is in `audit/routes.json` — not duplicated here in
full; only deltas and cross-references are added.

Status tally from routes.json:
- **functional**: 20 routes
- **functional-weak / functional-ui-only / functional (alias)**: 3 routes (`/admin`, `/book`, `/bookings`)
- **functional-not-linked**: 1 route (`/tutors/[id]/edit`)
- **partially-implemented**: 1 route (`/classes/[id]/book`)
- **broken**: 2 routes (`/centers`, `/centers/[id]` — proxy.ts/page.tsx role-gate mismatch)
- **orphaned / orphaned-stub**: 3 routes (`/messages/new`, `/profile`, `/onboarding/role`)
- **broken-link-target (404, no page.tsx)**: 2 routes (`/privacy`, `/terms`)
- **internal-dev-tool**: 1 route (`/global-states`)
- **dead-artifact (stray empty dir)**: 1 non-route (`app/classes/id/`)

---

## 2. Feature Classification

| Feature area | Primary route(s) | Status | Notes |
|---|---|---|---|
| Landing page | `/` | Functional | Book-metaphor hero (`HeroSection.tsx`, `LandingCards.tsx`), bilingual, static image assets from `public/landing/` |
| Tutor discovery / search | `/tutors`, `/search` | Functional | `TutorsClient.tsx` (filters, list), `SearchClient.tsx` (453 lines, combined search) |
| Browse classes | `/classes`, `/classes/[id]` | Functional | Class list + detail |
| Filters | embedded in `/classes`, `/tutors`, `/search` | Functional | `ClassFilters.tsx`, `TutorSearch.tsx` client-side filter state |
| Tutor profiles | `/tutors/[id]` | Functional (public) | |
| Tutor profile editing | `/tutors/[id]/edit` | **Functional-not-linked** | See ROUTE-001 below |
| Centers (browse/profile) | `/centers`, `/centers/[id]` | **Broken (role-gate bug)** | Pre-existing finding from routes.json, re-confirmed live: `curl` to `/centers` anonymous → 307 to `/login`; a signed-in STUDENT/TUTOR is blocked by `proxy.ts` before ever reaching page.tsx's own (more permissive) role check |
| Center-admin dashboard | `/centers/[id]/admin` | Functional | Correctly gated; i18n EN/AR complete (commit `e3cf7cc`) — confirms REMAINING_LIMITATIONS.md item 3 is stale, as routes.json already flagged |
| Booking flow | `/classes/[id]/book`, `/booking-confirmed`, `/bookings`, `/dashboard/bookings` | **Partially implemented** | See ROUTE-002 — contradicts REMAINING_LIMITATIONS.md item 2 |
| Payments | Paymob integration (`/api/bookings`, iframe CSP allowances in `next.config.ts`) | Not re-verified this pass | Out of scope for link/route audit; CSP correctly allowlists `iframe.paymob.com` / `accept.paymobsolutions.com` |
| Reviews | `ReviewSection.tsx`, `DashboardReviews.tsx`, `/api/reviews` | Functional (component-level, not a standalone route) | |
| Favorites | `/favorites` | Functional | Nav heart icon + mobile drawer |
| Messaging | `/messages`, `/messages/[threadId]`, `/messages/new` | Functional except `/messages/new` | `/messages/new` is an **orphaned stub** — see ROUTE-003 |
| Notifications | `/settings` (prefs), `/api/me/notifications` | Functional | |
| Referral | `/referral` | Functional | Nav gift icon |
| Promo codes | `/admin` (`PromoCodesTab.tsx`), `/api/promo/validate`, `/api/admin/promo` | Functional (admin-managed) | Not directly linked from the public nav — expected, admin-only feature |
| Waitlist | `/api/classes/[id]/waitlist` | **API-only, no discoverable UI entry point found** | Grep across `app/` component tree found no button/form wiring this endpoint from a class-detail or booking page — flag for follow-up, not confirmed dead (may be behind a state not exercised in this pass) |
| Admin moderation | `/admin` | Functional-weak | Several dead action buttons — see LINK-004 through LINK-006 in the links/assets audit |
| Payouts | `PayoutsTab.tsx` (admin), `DashboardPayouts` (tutor/center) | Functional (component-level) | |
| Attendance | Not found as a distinct feature/route | **Not implemented** | No route, component, or API path matching attendance tracking found in this pass |
| Onboarding | `/onboarding/role` | **Orphaned** | See ROUTE-004 |
| Mobile app parity | `app/api/mobile/*` (Flutter backend) | Not reviewed in depth this pass | Out of scope — this audit covers web `app/**/page.tsx` routes and their in-app links, not the Flutter client's own navigation. Flagged as unverified, not as broken. |

---

## 3. Internal Link Cross-Reference

Source components grepped for every `href=`, `<Link>`, and `router.push(`: `components/NavbarClient.tsx`,
`app/Navbar.tsx`, `app/components/FooterContent.tsx`, `components/ui/MobileBottomNav.tsx`, plus all 47
files under `app/` matching `href=|<Link|router.push(` (dashboard panels, admin, centers-admin, booking,
messaging, tutor/class cards). A stale worktree at `.claude/worktrees/friendly-raman-8e4a6e/` contains
duplicate copies of `Navbar.tsx`/`NavbarClient.tsx` — excluded from this audit as it is not part of the
deployed app.

### 3a. Broken internal links (link exists, target route does not)

| Finding | Source | Label | Target | Evidence |
|---|---|---|---|---|
| ROUTE-005 | `app/components/FooterContent.tsx:149` | Privacy (footer, every page) | `/privacy` | No `app/privacy/page.tsx`. `curl -> 404` (re-confirmed live this pass) |
| ROUTE-006 | `app/components/FooterContent.tsx:154` | Terms (footer, every page) | `/terms` | No `app/terms/page.tsx`. `curl -> 404` (re-confirmed live this pass) |

### 3b. Routes that exist but are never linked from any nav/footer/dashboard component (orphaned)

| Finding | Route | Evidence |
|---|---|---|
| ROUTE-003 | `/messages/new` | Zero `Link`/`router.push` references anywhere in `app/`. The real "message tutor" flows (`TutorProfileClient.tsx:418`, `BookingCheckout.tsx:516`) call `POST /api/messages/new` directly and redirect to the created thread — this page is superseded dead code. |
| ROUTE-007 | `/profile` (`app/profile/page.tsx`) | Added in commit `51b48a1` ("feat: add profile editing and checkout refresh"). Grepped `NavbarClient.tsx`, `MobileDrawer`, `FooterContent.tsx`, `MobileBottomNav.tsx`, `DashboardClient.tsx` — none link here. Page itself is fully functional (auth-gated via server-side `redirect()` in `page.tsx:14-16`, live-verified: unauthenticated `curl` returns the page shell with empty form fields, then an embedded `NEXT_REDIRECT` RSC instruction that a real browser's JS runtime follows to `/login?callbackUrl=/profile` — the redirect is real, just not a classic HTTP 3xx on a bare `curl`, a Next.js App Router streaming-SSR characteristic, not a bug). Built but unreachable through normal navigation. |
| ROUTE-004 | `/onboarding/role` | Nothing redirects here. `lib/auth.ts:211` always assigns `role: "STUDENT"` by default on signup, so the intended trigger (new user with no role) never fires in current code. Also missing from `proxy.ts` PROTECTED/ROLE_GATES/matcher — an unauthenticated visitor can load the page (though the mutating action, `POST /api/me/role`, is presumably guarded server-side — not independently re-verified this pass). 100% hardcoded English text despite the rest of the app being bilingual — no `useI18n`/`t()` calls found in this file. |
| ROUTE-001 | `/tutors/[id]/edit` | Not covered by `proxy.ts` PROTECTED/ROLE_GATES; relies solely on in-page `session.user.email === tutor.email` check. No `Link` to this route found anywhere, including from `TutorProfileClient.tsx` (the tutor's own profile view) — an owner viewing their own public profile has no discoverable "Edit" button leading here. Reachable only by hand-typing the URL. |

### 3c. Role-gate contract mismatch (re-confirmed, not a new finding — cross-referencing prior pass)

`ROUTE-CENTERS`: `proxy.ts:9` (`ROLE_GATES["/centers"] = ["CENTER_ADMIN", "ADMIN"]`) is stricter than
`app/centers/page.tsx`'s own `ALLOWED_ROLES` (permits `STUDENT`/`TUTOR` too), and stricter than
`app/centers/[id]/page.tsx` (intentionally public, no gate at all). Since `proxy.ts` runs first, this is a
real access bug, not just a link-inventory issue — already documented in `routes.json`, restated here
because it also explains why the "Centers" nav link (`NavbarClient.tsx:378`, shown to **all** signed-in
users regardless of role) leads most clicking users to `/unauthorized`.

---

## 4. Dev Artifact Disposition

### `app/global-states/page.tsx` — internal QA/design-reference tool, confirmed

Read in full: renders `LoadingStateCard`, `ErrorStateCard`, `NotFoundStateCard` side-by-side under the
caption "Consistent. Calm. Confident." with per-card descriptive captions ("Brand moment to skeleton
geometry", "Clear message and recovery action", "Helpful guidance to classes and home"). This is a
component showcase for the three global state-card components, not a product page. Confirmed:
- Not linked from any nav/footer/dashboard component.
- Publicly reachable, `curl -> 200` (re-confirmed live this pass).
- No `robots: { index: false }` metadata export — the page has no `export const metadata` at all, so it
  inherits the root layout's `robots: { index: true, follow: true }` and is technically indexable.
- Excluded from the "immersive shell" nav-hiding logic by *path prefix* in both `NavbarClient.tsx:387`
  and `MobileBottomNav.tsx:25` (`"/global-states"` is in that hardcoded list), meaning someone already
  decided it needs the chrome hidden, but nobody gated it from indexing or added `noindex`.

**Verdict: dev/design tool, safe to keep for internal reference, but should get `robots: { index: false }`
metadata (see LINK-011) or be moved out of the `app/` router entirely (e.g., a Storybook-style setup)
since it currently ships to production and is publicly crawlable.**

### Root `book-landing.html` — static prototype reference, confirmed, not shipped

- Located at the **repository root**, not under `public/` — Next.js only serves static files from
  `public/`, so this file is **not reachable via any URL** in the deployed app. It is not a broken/dead
  route; it was never a route.
- `git log --oneline -- book-landing.html` shows exactly **one commit** ("high-end UI redesign") and no
  further edits since — consistent with a one-off design prototype that was manually ported into React.
- Confirmed as the direct source for the current `/book` page: shares CSS custom-property names
  (`--book-w`, `--spine`, `--flip-dur`, `--open-dur`, etc.) with `app/components/landing/LandingStylesA.ts`
  / `LandingStylesC.ts`, and its class name `book-landing` is used live in
  `app/components/landing/HeroSection.tsx:266`.

**Verdict: harmless historical design-reference artifact, not dead code, not a security or routing
concern (unreachable by URL). Recommend relocating to a `/design` or `/docs` folder to avoid confusion
during future repo audits, but no functional action required.**

---

## 5. Summary of New Findings (this pass)

| ID | Severity | Priority | Summary |
|---|---|---|---|
| ROUTE-007 | HIGH | P2 | `/profile` fully built, auth-correct, but has zero discoverable entry point from any nav/dashboard |
| ROUTE-008 | MEDIUM | P3 | Waitlist API (`/api/classes/[id]/waitlist`) has no discoverable UI trigger found in this pass |
| ROUTE-009 | LOW | P4 | `app/global-states/page.tsx` has no `robots: noindex` despite being an internal tool, publicly indexable |
| ROUTE-010 | INFO | P4 | Root `book-landing.html` confirmed as unshipped design-prototype reference — no action needed beyond optional relocation |

Findings that duplicate/re-confirm the prior pass's `routes.json` (centers role-gate bug, `/messages/new`
orphan, `/tutors/[id]/edit` unlinked, `/onboarding/role` orphan, `/privacy` & `/terms` 404s, booking
calendar contradiction with REMAINING_LIMITATIONS.md) are restated above for completeness of this
document but are **not** double-counted as new discoveries.
