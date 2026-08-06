# User Journey Audit — Coursaty Tutor Platform

**Scope:** End-to-end trace of the six primary user journeys (new visitor, student, tutor, parent, center admin, platform admin) by reading the actual code path — page component → client component → API route/Server Action → data model → response handling — not by live interaction.

**Method limitation (read before relying on this document):** No browser automation tool was available in this environment. Every finding below is derived from close reading of route files, client components, props, conditional-render branches, state machines, and form validation as they exist in source. This document does **not** verify: actual rendered visual polish, animation smoothness/timing/frame rate, real touch/gesture behavior on mobile devices, actual computed color contrast, or how things look after CSS/responsive breakpoints are applied by the browser. Where a friction point depends on visual judgment rather than code logic, it is flagged as "not verifiable in this pass."

**Ground truth reused from prior passes (not re-derived):** `audit/08-functional-connections-audit.md` (CONN-001 through CONN-012) and `audit/06-content-localization-rtl-audit.md` (I18N-001 through I18N-004+). This document cites those finding IDs rather than re-describing the same root cause.

---

## Finding format

Each friction point uses: **Finding ID**, **Severity** (Critical/High/Medium/Low), **Priority** (P0-P4), **Evidence** (`file:line`), **Recommendation**, **Complexity** (Low/Medium/High).

---

## Journey 1 — New Visitor (landing → browse → detail → signup prompt)

**Entry point:** `app/page.tsx` (Server Component, `revalidate = 60`).

**Actual steps per code:**
1. `HomePage` fetches `tutorCount`, `classCount`, `bookingCount`, featured tutors, and featured classes in parallel via `Promise.all` (`app/page.tsx:33-44`), wrapped in a single try/catch that just logs and falls back to empty arrays/zero counts on any DB failure — the landing page renders with all-zero stats and no tutors/classes rather than an error state if the fetch fails.
2. Rendered by `app/Landing.tsx`, which presumably surfaces value prop, featured tutors/classes, and CTAs (search, browse, signup).
3. Browse tutors/classes → detail pages → signup prompt (see Journey 2 for the continuation once a visitor commits to signing up).

**Findings:**

- **UX-JOURNEY-001** — Silent fallback to empty landing page on DB error.
  - Severity: Medium | Priority: P3
  - Evidence: `app/page.tsx:33-44` — `catch (err) { console.error(...) }` with no user-facing error state; `tutorCount`/`classCount`/`bookingCount` stay at `0`, `rawTutors`/`rawClasses` stay `[]`.
  - Impact: A transient DB hiccup makes the homepage look like an empty, dead marketplace (0 tutors, 0 classes) instead of showing a friendly retry/error message — worst possible first impression for a new visitor.
  - Recommendation: Distinguish "genuinely empty" from "fetch failed" in the UI (e.g., a banner or skeleton-with-retry when the catch fires) rather than rendering the same UI as a zero-inventory marketplace.
  - Complexity: Low

- **UX-JOURNEY-002** — `/centers` nav link leads most visitors to `/unauthorized` (cite `audit/02-route-and-feature-inventory.md`).
  - Severity: High | Priority: P1
  - Evidence: `proxy.ts` role-gates `/centers` and `/centers/[id]` to `CENTER_ADMIN`/`ADMIN` even though centers are meant to be publicly browsable (per prior route-inventory audit finding).
  - Impact: Any new visitor or logged-in student/tutor who clicks "Centers" in primary nav hits a dead-end unauthorized page — this is a top-level navigation item, not an edge case, so it's a first-session dead end for a meaningful fraction of visitors.
  - Recommendation: Split the route into a public browse view and an admin-only management view, or gate only the management actions rather than the whole route tree.
  - Complexity: Medium

*(Visual/motion polish of the landing hero, whether the value proposition reads clearly on first scroll, and actual scroll/interaction feel are not verifiable in this pass — no browser automation available.)*

---

## Journey 2 — Student (signup → book → pay → manage → review)

**Entry point:** `app/signup/page.tsx` (`"use client"`, uses `useI18n()` — this page is localized).

**Actual steps per code:**

1. **Signup**: `SignupPage` reads `?role=` from the URL to preselect STUDENT/TUTOR/CENTER_ADMIN, validates fields client-side with `signupSchema`, submits, and shows a "resend verification" UI (`app/signup/page.tsx:48-58`) with a `resendVerification()` call to `/api/auth/resend-verification`.
2. **Email verification is a no-op in practice.** `lib/auth.ts:119-126` has the entire unverified-email rejection block commented out with `// TEMP: email verification disabled — re-enable this block before going to production.` The credentials authorize function never throws `LoginError("Please verify your email...")`, so a freshly signed-up student can log in immediately regardless of whether they clicked the verification link. The signup page's "Resend verification" button and messaging (`Mail`/`ShieldCheck` icons, resend flow) present a security gate to the user that the backend does not actually enforce — this is a UX/security mismatch, not just a missing feature (confirms prior memory note; now with exact evidence location).
3. **Onboarding role selection**: `app/onboarding/role/page.tsx` — this page is **entirely hardcoded English** with inline `style={}` objects, no `useI18n()` import at all, unlike `signup/page.tsx` one hop earlier which is fully localized. An Arabic-preferring user who just went through a localized signup form hits an abrupt language switch back to English for "How will you use Coursaty?" This is a new instance of missing i18n, not one of the four components already catalogued in `audit/06-content-localization-rtl-audit.md` (I18N-002/003/004 cover ClassDetailClient, ClassCard, CenterProfileClient).
4. **Search/browse → detail → book**: leads into `app/classes/[id]/book/BookingCheckout.tsx`.
5. **Booking checkout — confirmed broken calendar (I18N-001).** Read directly in this pass: `selectedDay` (`useState(7)`) and `selectedTime` (`useState("11:00 AM")`) are local UI state only. The calendar grid (`CALENDAR_DAYS`, hardcoded `May 2025`, `app/classes/[id]/book/BookingCheckout.tsx:193-229`) lets a user click different dates/times, but `handleBook` (`:120-152`) posts only `{ classId, paymentType, note }` to `POST /api/bookings` — `selectedDay`/`selectedTime` are folded into a free-text `note` string (`` `Schedule: May ${selectedDay}, 2025 at ${selectedTime}` ``, `:107-118`) that is never parsed back into a real schedule field. No matter what date/time the student picks, the server has no structured record of it — only a human-readable string buried in a notes field. `studentName`/`school` also default to hardcoded placeholder values `"Omar Hossam"` / `"IGCSE - Al Nafees International School"` (`:93-94`) rather than being pre-filled from the logged-in user's real profile data or left blank. Confirms and extends I18N-001 with the exact non-wiring mechanism.
6. **Payment**: on success, `handleBook` redirects to `data.paymentUrl` (Paymob) if present, else shows a "Booking received" transition state and redirects to `/booking-confirmed?bookingId=...` after 700ms (`:139-146`).
7. **Duplicate booking handling**: a 409 response with a `bookingId` renders an `AlreadyBookedState` rather than a generic error (`:132-135`) — this is a well-handled edge case, worth noting positively.
8. **Manage bookings**: `app/dashboard/components/DashboardBookings.tsx` renders `CancelBookingButton` and, for paid+non-cancelled bookings, `RefundRequestButton` (`:109-112`). Both are genuinely wired: `cancelBooking` is a server action (`app/dashboard/dashboard-actions.ts:7-17`) that sets `status: "CANCELLED"`, and the refund button posts to `POST /api/bookings/[id]/refund-request` (`app/api/bookings/[id]/refund-request/route.ts`), which validates ownership/payment status and writes `refundReason` + an audit log row. A full admin-side approve/deny loop exists (`app/api/admin/refund-requests/route.ts`, `.../[id]/approve/route.ts`, `.../[id]/deny/route.ts`) — this sub-flow works end-to-end and is not a dead end, unlike several other flows in this audit.
9. **Messages**: `app/messages/page.tsx`, `app/messages/new/page.tsx`, `app/messages/[threadId]/page.tsx` exist as real routes with client components (`MessagesClient.tsx`, `ThreadClient.tsx`) — messaging a tutor is a built feature, not a stub.
10. **Leave a review**: dead end — cite `CONN-007` (`audit/08-functional-connections-audit.md`). The "Write a review" button (present in `app/dashboard/components/DashboardReviews.tsx` and `app/tutors/[id]/TutorProfileClient.tsx`) has no working `onClick`. Not re-derived here.
11. **Favorites**: `app/favorites/FavoritesClient.tsx` genuinely fetches from `/api/favorites` and renders saved classes/tutors with sort controls — functional, not a stub.

**Findings:**

- **UX-JOURNEY-003** — Email verification UI presents a security gate the backend does not enforce.
  - Severity: High | Priority: P1
  - Evidence: `lib/auth.ts:119-126` (verification check commented out) vs. `app/signup/page.tsx:48-58` (resend-verification UI still shown to the user as if it matters).
  - Impact: Users are told to check their inbox and verify, but can log in and use the platform (book, pay) with an entirely unverified email. Beyond the known pre-production gap, this is actively misleading UX — it implies a safeguard exists.
  - Recommendation: Either hide the verification messaging while the gate is disabled, or re-enable the gate before allowing checkout/payment flows for unverified accounts.
  - Complexity: Low (config/flag), the messaging fix is trivial; re-enabling the auth gate is already tracked as a pre-production TODO.

- **UX-JOURNEY-004** — Onboarding role-selection page has zero i18n, breaking language continuity immediately after a localized signup.
  - Severity: Medium | Priority: P2
  - Evidence: `app/onboarding/role/page.tsx` — no `useI18n` import, all strings hardcoded English ("How will you use Coursaty?", "Student", "Tutor", "Center Admin", role descriptions, "Continue →").
  - Impact: An Arabic-locale user completes a localized signup form, then immediately lands on an English-only, LTR-styled onboarding screen — breaks the bilingual experience at the very first authenticated screen a new user sees.
  - Recommendation: Wire `useI18n()` into this page and add the missing translation keys; add RTL-aware layout (currently fixed `textAlign: "left"` on role cards).
  - Complexity: Low

- **UX-JOURNEY-005** — Booking checkout pre-fills student identity fields with hardcoded placeholder data instead of the logged-in user's profile.
  - Severity: High | Priority: P1
  - Evidence: `app/classes/[id]/book/BookingCheckout.tsx:93-94` — `useState("Omar Hossam")` and `useState("IGCSE - Al Nafees International School")`.
  - Impact: Every student who doesn't notice and overwrite these fields submits someone else's name/school on their booking. This is a data-integrity bug on a paid transaction, not just cosmetic — extends I18N-001 with the concrete field-level evidence.
  - Recommendation: Initialize from `session.user.fullName`/profile data (empty string if unavailable) instead of literal placeholder strings; treat as required fields with validation rather than pre-filled decoys.
  - Complexity: Low

*(Reused, not re-derived: I18N-001 for the fake "May 2025" calendar and English-only checkout chrome; CONN-007 for the dead review button.)*

---

## Journey 3 — Tutor (signup → profile → create class → receive booking → dashboard → payouts)

**Entry point:** same signup/onboarding path as Journey 2 (`role=TUTOR`).

**Actual steps per code:**

1. Signup → onboarding role selection (`TUTOR`) → `/dashboard`, same friction points as Journey 2 (email verification no-op, English-only onboarding screen).
2. **Create class**: `app/create-class/CreateClassForm.tsx` — client form with local `useState` form state, POSTs to `/api/classes` (`:91`). Not read line-by-line in this pass beyond confirming it's a real, wired form (not a stub).
3. **Tutor dashboard** (`app/dashboard/DashboardClient.tsx`): renders `DashboardChecklist`, `UpcomingBookingsPanel`, `DashboardMessages`, `DashboardClasses` (with `readOnly={isReadOnly}` derived from `accessLevel === "VIEW_ONLY"`, `:33-35,100`), and conditionally `DashboardRevenue` + `DashboardReviews` + `DashboardPayouts` gated behind `canSeeRevenue = accessLevel === "FULL"` (`:101-113`).
4. **Revenue-leak mechanism pinpointed (extends CONN-003).** `DashboardStats` (`app/dashboard/components/DashboardStats.tsx:180`) is rendered unconditionally at `DashboardClient.tsx:76`, **above** and **outside** the `canSeeRevenue` gate that correctly wraps the detailed `DashboardRevenue` panel further down. `DashboardStats` renders a `"Gross revenue"` stat tile from `stats.totalRevenue` for every tutor regardless of `accessLevel`. So a `LIMITED`/`VIEW_ONLY` tutor whose center admin restricted their access still sees the top-line gross revenue number in the stat cards, even though the detailed revenue breakdown panel below is properly hidden. This is the concrete code path behind the already-documented CONN-003 finding — the enforcement is inconsistent within the same page, not simply absent.
5. **Payouts**: `DashboardPayouts` component exists and renders when `canSeeRevenue` is true; not traced further in this pass (component internals not read).

**Findings:**

- **UX-JOURNEY-006** — `DashboardStats` gross-revenue tile bypasses the `canSeeRevenue` access-level gate that protects the detailed revenue panel (root-cause detail for CONN-003).
  - Severity: High | Priority: P1
  - Evidence: `app/dashboard/DashboardClient.tsx:76` (`<DashboardStats .../>` rendered unconditionally) vs. `:101` (`{canSeeRevenue && (<DashboardRevenue .../>...)}`); stat tile source at `app/dashboard/components/DashboardStats.tsx:180` (`stats.totalRevenue`).
  - Impact: A center admin who intentionally restricts a tutor to `LIMITED`/`VIEW_ONLY` to hide revenue data (per `access.limited.desc` messaging shown to the tutor at `:57-66`, which implies revenue is hidden) still leaks the gross revenue figure via the stats bar — the tutor-facing messaging and actual behavior contradict each other on the same page.
  - Recommendation: Pass `canSeeRevenue` (or `accessLevel`) into `DashboardStats` and conditionally omit/mask the gross-revenue tile the same way `DashboardRevenue` is gated.
  - Complexity: Low

*(Reused, not re-derived: CONN-003 for the general finding that tutor access-level enforcement is partial.)*

---

## Journey 4 — Parent

**Verdict: Parent is not a first-class account type anywhere in this codebase.**

- `prisma/schema.prisma:14-19` — `enum Role { STUDENT TUTOR CENTER_ADMIN ADMIN }`. There is no `PARENT` value.
- `app/onboarding/role/page.tsx:7-26` — the `roles` array offered at signup has exactly three entries: `STUDENT`, `TUTOR`, `CENTER_ADMIN`. No parent option.
- `app/signup/page.tsx:28-34` — the `?role=` query param only maps `"tutor"` → `TUTOR` and `"center"` → `CENTER_ADMIN`; anything else (including no param) defaults to `STUDENT`. There is no parent branch.

No child-management, family-account-linking, or parent-specific dashboard surface was found anywhere in the routes explored for this audit. A parent who wants to book classes for their child must either use a `STUDENT` account themselves (booking as if they were the student — note `studentName`/`school` fields at checkout, Journey 2 finding UX-JOURNEY-005, which would need to be manually overwritten with the child's name each time) or the platform simply does not serve this persona as a distinct journey.

- **UX-JOURNEY-007** — No parent/guardian account type or child-management flow exists.
  - Severity: Medium | Priority: P3 (informational/product-scope finding, not a bug)
  - Evidence: `prisma/schema.prisma:14-19` (Role enum), `app/onboarding/role/page.tsx:7-26`, `app/signup/page.tsx:28-34`.
  - Impact: For a tutoring marketplace in a market where parents commonly manage and pay for their children's tutoring (the target market per `Coursaty` positioning), the absence of a parent persona means every parent-driven booking is forced through a workaround (a STUDENT account representing the child, or the parent's own account with manually-entered child details at checkout). This is a product-scope gap worth flagging explicitly rather than assuming it's covered.
  - Recommendation: Product decision, not a code fix — either confirm this is intentionally out of scope for the current milestone, or scope a parent/guardian role + child-profile-linking feature.
  - Complexity: High (new role, new data model for guardian-child relationships, booking-on-behalf-of flow)

---

## Journey 5 — Center Admin

**Entry point:** signup with `role=CENTER_ADMIN` → onboarding → `/dashboard`, and separately `/centers/[id]/admin` for center management.

**Actual steps per code — and a critical gap found in this pass:**

1. Signup/onboarding sets `user.role = "CENTER_ADMIN"` via `PATCH /api/me/role` (same as Journeys 2/3). This does **not** create or attach a `LearningCenter` record.
2. **No self-serve center creation exists anywhere in the application.** Searched the full codebase for `LearningCenter` creation calls: the only hit is `prisma/seed.ts:7` (`prisma.learningCenter.create({...})`), a one-time database seeding script, not reachable from any UI or API route. `app/api/centers/route.ts` exports only a `GET` handler (`:4`) — no `POST`. There is no "Create your center" form, wizard, or action anywhere.
3. **Consequence, traced through the dashboard render path:** `app/dashboard/page.tsx:52` only populates `centerData` `if (role === "CENTER_ADMIN" && user.centerId)`. Since a fresh center admin has no `centerId` (nothing ever sets it outside the seed script), `centerData` stays `null` (`:51`). In `DashboardClient.tsx:118`, the entire center-admin dashboard body is gated on `{role === "CENTER_ADMIN" && centerData && (...)}` — with `centerData` null, **nothing renders in that block**. There is no `else` branch, no empty state, no "Create your center to get started" CTA.
4. **What a brand-new center admin actually sees after completing signup + onboarding:** the dashboard sidebar, an "Export CSV" button (gated on `canSeeRevenue`, which for a centerless admin evaluates from `accessLevel = user.centerAccessLevel ?? "FULL"` at `:33` — likely still shows since there's no center to restrict against), and `DashboardStats` showing all-zero numbers (`centerBookings`/`centerRevenue` derive from `centerData?.classes` with `centerData` null, defaulting to `0` at `:46-47`) — and then nothing else. No error, no guidance, no path forward. This is a complete dead end for the entire Center Admin signup journey as currently built, distinct from the already-documented `/centers` role-gate bug.
5. **The `/centers` role-gate bug does compound this** (per `audit/02-route-and-feature-inventory.md`: `/centers` and `/centers/[id]` are gated to `CENTER_ADMIN`/`ADMIN` in `proxy.ts`). Even if a center admin tried to self-serve by browsing `/centers` looking for a "create" affordance, `CentersClient.tsx` was not found to contain any create-center call either (searched for `fetch(...api/centers...)` — none found), so this path would not have helped regardless.
6. For a center admin whose center *was* provisioned by seed/manual DB action (the only way one currently gets created), `/centers/[id]/admin/CenterAdminClient.tsx` and its tab components (`CenterAdminOverview`, `CenterAdminClasses`, `CenterAdminBookings`, `CenterAdminStudents`, `CenterAdminRevenue`, `CenterAdminSettings`, `CenterAdminTutors`) exist as real, built surfaces — tutor access-level management is English-only per `REMAINING_LIMITATIONS.md` §3 (already documented, not re-reported here).

**Findings:**

- **UX-JOURNEY-008** — Center Admin signup is a complete dead end: no code path exists to create a `LearningCenter`, so the center-admin dashboard renders empty with no guidance.
  - Severity: Critical | Priority: P0
  - Evidence: `prisma/seed.ts:7` (only creation site, seed-only); `app/api/centers/route.ts:4` (GET-only, no POST); `app/dashboard/page.tsx:51-52` (`centerData` stays null without `user.centerId`); `app/dashboard/DashboardClient.tsx:118` (entire center-admin UI gated on truthy `centerData`, no fallback branch).
  - Impact: Every single new Center Admin signup — a full top-level persona explicitly offered at onboarding (`app/onboarding/role/page.tsx:20-25`, "Manage a learning center with multiple tutors and classes") — ends in a blank dashboard with zero explanation. This is not a partial/rough feature; it is entirely unreachable for any account created after the initial seed. This should be treated as more severe than the already-documented `/centers` role-gate bug, since it blocks the persona even before that bug becomes relevant.
  - Recommendation: Build a center-creation form/wizard reachable from the empty-dashboard state (name, city, description at minimum), wired to a new `POST /api/centers`, and set `user.centerId` on creation. Short-term mitigation: add an explicit empty state in `DashboardClient.tsx` for `role === "CENTER_ADMIN" && !centerData` directing the user to contact support or apply for a center, rather than rendering nothing.
  - Complexity: Medium (form + API route + relation wiring) for the full fix; Low for the short-term empty-state mitigation.

*(Reused, not re-derived: the `/centers` route-gate bug from `audit/02-route-and-feature-inventory.md`; the English-only tutor access-level management from `REMAINING_LIMITATIONS.md` §3.)*

---

## Journey 6 — Admin (platform)

**Entry point:** `/admin` → `app/admin/AdminClient.tsx`.

**What actually works (verified live wiring in this pass):**

- Review moderation: `approveReview(r.id)` / `rejectReview(r.id)` have working `onClick` handlers (`AdminClient.tsx:763,766`).
- Refund moderation: `approveRefund(r.id)` / `denyRefund(r.id)` have working `onClick` handlers (`:797,800`), backed by real API routes (`app/api/admin/refund-requests/route.ts`, `.../[id]/approve/route.ts`, `.../[id]/deny/route.ts`) — this is a genuine, functioning moderation queue, worth calling out as a positive since much of the rest of the admin surface is decorative.
- Tab navigation (`setActiveTab`, `:389`) and pagination controls (`:127,131`) are wired.
- Verification toggle: `toggleVerification(u.id, u.isVerified)` (`:592`) is wired.

**What is dead (confirms, does not re-derive, `audit/02-route-and-feature-inventory.md`):**

- "Export CSV" button — no `onClick` (`:365`).
- "Broadcast" button — no `onClick` (`:368`).
- "Edit user" icon button — no `onClick`, only `aria-label` (`:613`).
- "Delete user" icon button — no `onClick`, only `aria-label` (`:614`).
- "Delete class" icon button — no `onClick`, only `aria-label` (`:663`).

**Friction assessment:** The admin surface is split roughly down the middle — the moderation-queue half (reviews, refunds, verification) is real and functional, while the user/content-management half (edit/delete user, delete class, export, broadcast) is entirely decorative. This split is not obvious from the UI itself: buttons in both halves are styled identically (same icon-button treatment for delete-user/delete-class as for the working verification toggle), so an admin has no visual cue which controls do something and which are inert. This compounds the severity of the already-documented dead buttons beyond "missing feature" into "misleading affordance."

- **UX-JOURNEY-009** — Dead admin action buttons are visually indistinguishable from working ones, actively misleading platform admins.
  - Severity: Medium | Priority: P2
  - Evidence: `app/admin/AdminClient.tsx:592` (working `toggleVerification` icon button) styled identically to `:613-614` (dead edit/delete-user icon buttons) and `:663` (dead delete-class icon button) — same `background: "none", border: "none"` icon-button pattern throughout.
  - Impact: An admin trying to remove a bad actor or listing via "Delete user"/"Delete class" gets no feedback that the click did nothing — no toast, no error, no visual state change — indistinguishable from a slow/successful action. This is worse than the button being visibly disabled.
  - Recommendation: Either wire the handlers (tracked already per `audit/02-route-and-feature-inventory.md`) or, as an interim measure, visually disable/gray out non-functional controls and add a tooltip ("Coming soon") so admins don't lose trust in the whole action set.
  - Complexity: Low (interim disable/tooltip) to Medium (full wiring, requires cascade-delete/soft-delete design for delete-class and delete-user).

*(Reused, not re-derived: the five dead admin buttons from `audit/02-route-and-feature-inventory.md`.)*

---

## Summary — Findings Index

| ID | Journey | Severity | Priority | Title |
|----|---------|----------|----------|-------|
| UX-JOURNEY-001 | Visitor | Medium | P3 | Silent fallback to empty landing page on DB error |
| UX-JOURNEY-002 | Visitor | High | P1 | `/centers` nav link leads to `/unauthorized` for most users |
| UX-JOURNEY-003 | Student | High | P1 | Email verification UI implies a gate the backend doesn't enforce |
| UX-JOURNEY-004 | Student | Medium | P2 | Onboarding role-selection page has zero i18n |
| UX-JOURNEY-005 | Student | High | P1 | Booking checkout pre-fills identity fields with fake placeholder data |
| UX-JOURNEY-006 | Tutor | High | P1 | `DashboardStats` revenue tile bypasses the access-level gate (CONN-003 root cause) |
| UX-JOURNEY-007 | Parent | Medium | P3 | No parent/guardian role or child-management flow exists |
| UX-JOURNEY-008 | Center Admin | Critical | P0 | No code path exists to create a `LearningCenter` — signup is a dead end |
| UX-JOURNEY-009 | Admin | Medium | P2 | Dead admin buttons are visually indistinguishable from working ones |

**Top-line takeaways:**

1. **The most severe finding in this pass is UX-JOURNEY-008**: the Center Admin persona — a full onboarding option offered to every new signup — has no working path to create a center at all. Every center admin account created after the initial database seed lands on a blank dashboard with zero explanation. This is more fundamental than the previously-documented `/centers` role-gate bug and should be prioritized above it.
2. **Booking checkout (Journey 2) has two compounding data-integrity problems**, not just a cosmetic one: the calendar UI is fully decorative (I18N-001, reconfirmed with exact wiring at `BookingCheckout.tsx:107-152`), and the student-identity fields default to a hardcoded fake name/school (UX-JOURNEY-005) that a distracted user could easily submit unedited on a real paid transaction.
3. **Revenue-visibility enforcement for restricted tutors is inconsistent within a single page** (UX-JOURNEY-006): the detailed panel is correctly hidden but the summary stat tile above it leaks the same number, directly contradicting the "your access is limited" message shown on that same screen.
4. **The platform admin surface trains admins to distrust it**: functional moderation actions (reviews, refunds, verification) sit next to visually identical dead buttons (edit/delete user, delete class, export, broadcast) with no differentiation, so admins cannot tell which controls to rely on without testing each one.
5. **i18n gaps extend beyond the four components already catalogued** in the localization audit — the onboarding role page (the very first authenticated screen after signup) is English-only despite the signup form one step earlier being fully localized.

**What this pass could not verify** (no browser automation available): actual rendered visual polish and hierarchy on any of these screens, animation/transition smoothness, real touch/gesture behavior on mobile viewports, computed color contrast, and whether error/loading states that exist in code (e.g., `submitting` disabled states, toast notifications) read clearly to a real user in the browser. These would need a follow-up pass with Playwright or manual QA.

---
