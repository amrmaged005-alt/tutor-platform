# CODEX PROMPT: FULL COURSATY UI/UX OVERHAUL

> Hand this entire document to Codex as a single task. It is grounded in the real
> Coursaty codebase (verified file-by-file), not a generic brief. Where this prompt
> states a fact about the code, it has been checked against the repository — trust
> it, but re-verify before you delete or rewrite anything, because the tree changes.

---

## 0. GROUND TRUTH — read this before you touch anything

This section overrides any generic assumption you might bring. **The codebase is more
mature than a prototype.** Your job is to *elevate and unify*, not to rebuild from zero.

### 0.1 Stack (verified in `package.json`)
- **Next.js `16.1.6`** (App Router), **React `19.2.3`**, **TypeScript `5`**.
- **Prisma `6.19.2`** + Supabase (Postgres). DB workflow is `prisma db push` (no migration files).
- **NextAuth `5.0.0-beta.30`** (`lib/auth.ts`), Prisma adapter.
- **Paymob** for online payments (`lib/paymob.ts`), **Resend** for email, **Upstash** for rate limiting.
- **framer-motion `12`**, **lucide-react `1.16`**, **recharts `3`**.
- **Tailwind v4 is installed** (`@tailwindcss/postcss`) **but the app does NOT use utility-class styling.** There is **no shadcn/ui**. Do not introduce shadcn or refactor the app to Tailwind utilities. See 0.2.
- Scripts: `npm run dev`, `npm run build`, `npm run lint`. There is **no typecheck script and no test runner configured**. `postinstall` runs `prisma generate`.

### 0.2 The real styling system (verified in `app/globals.css`, 1177 lines)
The design system already exists and is genuinely good. It is **three layers**:
1. **CSS custom properties** (design tokens) on `:root`, with a complete dark theme under
   `:root[data-theme="dark"]`. Tokens include: `--bg`, `--bg-alt`, `--bg-card`,
   `--bg-elevated`, `--border`, `--border-light`, `--border-strong`, `--text`,
   `--text-secondary`, `--text-muted`, `--text-dim`, `--accent` (`#0d5946` deep emerald),
   `--accent-hover`, `--accent-bg`, `--accent-border`, `--paper`, `--bronze`, `--rating`,
   `--success`, `--error`, `--warning`, subject accents (`--subject-plum/teal/ochre`),
   a `--radius-*` scale, a `--shadow-*` scale, `--space-*`, and `--transition-*`.
   **There is a legacy duplicate token block (`--color-*`) that is re-aliased at the bottom
   of `:root`. This double-definition is a real smell — consolidate to ONE source of truth.**
2. **Global component classes**: `.btn-primary`, `.btn-secondary`, `.btn-ghost`,
   `.btn-destructive`, `.card`, `.card-hover`, `.class-card`, `.badge`, `.badge-accent`,
   `.input`, `.floating-field`, `.field-error`, `.auth-shell`, `.auth-editorial`,
   `.auth-card`, `.nav-link`, `.message-bubble`, `.dashboard-app-shell`,
   `.dashboard-sidebar`, `.skeleton`, `.modal`, etc.
3. **Heavy inline `style={{}}` objects** scattered through nearly every `.tsx`. **This is the
   single biggest source of inconsistency and the main thing to fix.** Magic numbers, one-off
   paddings, repeated `style={{ display:"flex", gap:12, ... }}` blocks everywhere.

**Therefore the design-system task is NOT "create tokens" (they exist) — it is:**
- consolidate the duplicate token blocks into one canonical set,
- add the **missing** tokens (see 0.3),
- migrate the worst inline-style offenders into reusable components / global classes,
- enforce token usage so nothing hardcodes `#fff`, `12px`, `system-ui`, etc.

### 0.3 Concrete gaps already identified (fix these specifically)
1. **Serif display font is loaded but unused.** `app/layout.tsx` loads `Playfair Display`
   and `Lora` from Google Fonts, but `globals.css` only defines `--font-sans` (Inter) and
   `--font-arabic` (Cairo). **There is no `--font-serif` token.** The references demand an
   elegant academic serif for headlines ("Welcome back", "Browse Classes", "Good morning,
   Ahmed"). Action: add `--font-serif: 'Lora', Georgia, serif;` (or Playfair for the very
   largest display sizes), define a typographic scale, and apply serif to display/page
   headings consistently. Migrate `app/layout.tsx`'s raw Google `<link>` to `next/font`
   (`next/font/google`) for performance + no FOUT, and drop the duplicate `@import` of
   Inter/Cairo that exists at the top of `globals.css` (fonts are loaded twice today).
2. **`app/classes/[id]/book/page.tsx` hardcodes `fontFamily: "system-ui, -apple-system,
   sans-serif"`** on the booking `<main>`, throwing away the brand font on the entire
   checkout. Remove it; inherit the brand stack.
3. **Inline styles dominate** in: `BookingCheckout.tsx`, all `app/dashboard/components/*`,
   `app/classes/*Client.tsx`, `app/messages/*`, `app/settings/*`. Token-ize them.

### 0.4 THE BOOKING BUG — root cause is identified, fix it properly
Symptom reported by the owner: *"booking appears in the dashboard / database, but the page
shows an error."* Verified causes in code:

- **Response-key mismatch (real bug).** `app/classes/[id]/book/BookingCheckout.tsx` (line ~56)
  reads `data.iframeUrl` to decide whether to redirect to payment. But the API
  `app/api/bookings/route.ts` returns the field as **`paymentUrl`** (line ~211), never
  `iframeUrl`. For online (Paymob) bookings the redirect therefore never fires and the user
  is dropped on a success screen while payment was actually required. **Fix: read
  `data.paymentUrl`** (and align naming across mobile API routes too).
- **409 "already booked" is rendered as a raw error.** When a student already has a
  non-cancelled booking, the API returns HTTP 409 with `{ error: "You have already booked
  this class.", bookingId }`. The client treats any non-OK response as a failure and prints
  the error string — even though a valid booking exists (hence "shows in dashboard but page
  errors"). **Fix: detect 409 + presence of `bookingId` and render a friendly
  `AlreadyBookedState`** ("You're already booked for this class") with **View booking** /
  **Go to dashboard** / **Message tutor** actions, not an error banner.
- **The Schedule step is 100% cosmetic and dishonest.** In `BookingCheckout.tsx`,
  `ScheduleStep` renders a hardcoded **"May 2025"** calendar, a random hardcoded
  `available = [3,7,13,14,15,16,20,21,22,27,28,29]` day array, fixed time chips, and
  **uncontrolled** student-name / grade inputs. **None of `selectedDay`, `selectedTime`, or
  the student fields are ever sent** — `handleBook` POSTs only `{ classId, paymentType:
  "IN_PERSON", promoCode? }`. The API has no concept of a chosen date/time. This means the
  product *promises* scheduling it does not deliver. **Resolve one of two ways (ask/decide,
  see §14):** either (a) wire real scheduling end-to-end (lift state up, validate, send a
  `scheduledAt`, extend the Prisma `Booking` model + API), or (b) if the MVP is "book the
  class, tutor coordinates timing", **remove the fake calendar** and replace the Schedule
  step with the real available `schedule` string from the class + honest copy. Do **not**
  ship a fake date picker.
- **Two booking entry points exist:** `app/book/page.tsx` and `app/classes/[id]/book/page.tsx`.
  Audit both; consolidate to one canonical flow and redirect the other, so there is a single
  source of truth.
- Note: `app/classes/[id]/book/page.tsx` already guards server-side (redirects to
  `/classes/[id]?alreadyBooked=1` when a booking exists). Keep that guard; the client-side
  409 handling is the belt-and-suspenders for races/double-submits.

### 0.5 Components that ALREADY EXIST (refine — do not recreate)
Under `components/ui/` and `app/components/`:
`AuthShell`, `AuthFields`, `CoursatyLogo`, `CairoSkyline`, `DashboardSidebar`,
`MobileBottomNav`, `EmptyState`, `GlobalStateCards`, `SkeletonCard`, `RatingStars`,
`SubjectTag`, `StatBadge`, `SectionHeader`, `PageShell`, `PageTransition`, `ToastProvider`,
`PromoCodeInput`, `SignInRequiredModal`, `OnboardingChecklist`, `AttendanceGrid`,
`PayoutHistory`, `ExportButton`, `AnimatedCheck`, `BackgroundFloaters`,
`EmailVerificationBanner`, `NavbarClient`, plus `app/Navbar.tsx`, `app/components/Theme.tsx`
(theme provider, `data-theme` on `<html>`, persisted to `localStorage` key `coursaty-theme`),
`app/components/i18n.tsx` (EN/AR dictionary + `useI18n`, persisted to `coursaty-lang`, sets
`dir`/`lang` on `<html>`). Landing is fully built under `app/components/landing/*`.

**Implication:** the §6 component list below is a *refinement checklist*, not a build list.
For each, first locate the existing implementation; only create new when truly absent.

### 0.6 Internationalization & RTL are real, first-class constraints
EN/AR with full RTL is wired (`i18n.tsx`, `dir="rtl"`, logical CSS properties like
`inset-inline-start` are already used in `globals.css`). **Every change you make must work in
both LTR and RTL and both EN/AR.** Use logical properties (`margin-inline`, `inset-inline-*`,
`padding-block`), never hardcoded `left/right`. Add any new user-facing string to the `DICT`
in `app/components/i18n.tsx` in **both** `en` and `ar`. Never hardcode an English string in JSX.

### 0.7 Scope boundary
- **In scope:** the Next.js web app (`app/`, `components/`, `lib/`, `app/globals.css`).
- **Out of scope:** `flutter_application_1/` (separate mobile app) and the `app/api/mobile/*`
  contract **shape** (you may fix the `iframeUrl`/`paymentUrl` naming, but do not break the
  fields the Flutter client consumes — grep the Flutter app first if you touch them).
- **Never break:** auth/session, role-based routing, Prisma client, Paymob webhook
  (`app/api/webhooks/paymob/route.ts`), Supabase access, Vercel build.

---

## 1. Mission

You are Codex acting simultaneously as:
- senior frontend engineer,
- senior product designer,
- UX architect,
- design-systems engineer,
- interaction designer,
- accessibility reviewer,
- and QA engineer.

Your mission: deeply inspect the full Coursaty codebase and perform a **full, visible UI/UX
overhaul of the entire website** — moving it from a "good 6/10 concept" to a polished,
premium, production-grade 10/10 product.

Coursaty is a premium tutoring marketplace for Egypt. It must feel **trustworthy, refined,
academic, culturally grounded, modern, and conversion-focused**. The final product should
read like a serious Egyptian education platform you could show investors, parents, tutors,
and centers — not a rough prototype.

It should feel closer to the best of:
- **Vezeeta** — booking clarity and trust.
- **Talabat** — fast browsing and action clarity.
- **Airbnb** — discovery, filters, cards, mobile behavior.
- **Stripe** — premium spacing, typographic restraint, hierarchy.
- **Coursera / Udemy** — class metadata and educational browsing.
- **Preply / Superprof** — tutor discovery and profiles.
- **Linear / Notion** — dashboard cleanliness.
- **Apple** — polish and motion restraint.
- **WhatsApp / iMessage** — simplicity of messaging, but with Coursaty's academic identity.

**Hard rules:**
- Do NOT only change colors. Do NOT polish just one screen. Do NOT leave "good enough" routes
  untouched. Do NOT spend the whole effort on the landing page. Do NOT break backend/data/
  auth/booking behavior. Do NOT introduce a new CSS framework, shadcn, or a component library.
- Deliver **visible, obvious** improvement across the **entire** product.

---

## 2. Visual direction (from the provided reference screenshots + existing tokens)

The current token palette is already on-brand — preserve and refine it rather than replacing it.

**Brand**
- Wordmark: **Coursaty** with the refined green mark (`components/ui/CoursatyLogo.tsx`).
- Primary action color: **deep emerald** `--accent: #0d5946` (dark mode `#3fae8c`).
- Base background: **warm ivory/fog** `--bg: #f1efe9`; card surface `--bg-card: #fbfaf6`.
- Borders: warm beige neutrals (`--border #d8d4c7`, `--border-light #e3dfd3`).
- Accents: bronze/gold **only** where it earns attention (`--bronze`, `--rating`).
- Subtle Egyptian/academic linework (see `CairoSkyline.tsx`); never touristy, never childish.
- Soft borders + gentle shadows; **no heavy glassmorphism**, no random gradients, no emoji-heavy copy.

**Typography**
- **Serif display** (`Lora`/`Playfair Display`) for page titles & headlines.
- **Inter** for UI: labels, metadata, forms, dashboard text, buttons.
- **Cairo** for all Arabic.
- Large headings elegant + academic; body always highly readable; no tiny unreadable card text.

**Cards**
- Cream/white surface, 1px subtle border, radius `--radius-md`→`--radius-2xl` by component,
  light shadow only where elevation is real, generous internal spacing, strong metadata
  hierarchy. Clickable cards must *look* clickable, with refined hover/tap states (the
  `.class-card` hover already lifts -3px; standardize this everywhere).

**Mobile**
- Native-feeling, not squeezed desktop. Bottom nav (`MobileBottomNav` exists), sticky booking
  CTA, bottom-sheet filters, compact reachable search, ≥44px touch targets, thumb-friendly cards.

**Desktop**
- Strong grids: left filters / center content / right context panel where useful. Simple top
  nav. No vast empty areas. Dashboard panels with real hierarchy.

---

## 3. Required first step: deep codebase inspection (then write a plan)

Before editing, inventory the project and produce an internal implementation plan. Capture:
- framework + versions (already in §0.1 — confirm), App Router structure, **every route**
  (full list in §4), every shared component (start from §0.5), the styling system (§0.2),
  token definitions, global CSS, auth flow (`lib/auth.ts`, `app/api/auth/*`), booking flow
  (§0.4), Prisma schema (`prisma/schema.prisma`) + Supabase setup, dashboard routes, message
  routes, tutor/class/center pages, mobile nav, dark-mode implementation
  (`app/components/Theme.tsx`), loading/error/empty states, image handling
  (`app/lib/imagery.ts` is used by cards/booking), current asset structure, TODOs, broken
  imports, duplicated components, and the duplicate token/font definitions called out in §0.
- **Prioritize visible UI/UX changes.** Output the plan as an ordered task list before coding.

---

## 4. Full-site route audit (every route — verified list)

Inspect and improve every route below. For **each** route define & improve: primary user
goal, primary CTA, secondary CTA, visual hierarchy, trust signals, metadata, loading state,
empty state, error state, mobile layout, desktop layout, dark-mode behavior, accessibility.

**Marketing / auth**
1. `/` landing — `app/page.tsx` + `app/components/landing/*`
2. `/login` — `app/login/page.tsx`
3. `/signup` — `app/signup/page.tsx`
4. `/forgot-password` — `app/forgot-password/page.tsx`
5. `/reset-password` — `app/reset-password/page.tsx`
6. `/verify-email` — `app/verify-email/page.tsx`
7. `/onboarding/role` — `app/onboarding/role/page.tsx`

**Discovery**
8. `/classes` — `app/classes/page.tsx` + `ClassesClient.tsx`
9. `/classes/[id]` — `app/classes/[id]/page.tsx` + `ClassDetailClient.tsx`
10. `/tutors` — `app/tutors/page.tsx` + `TutorCard.tsx`
11. `/tutors/[id]` — `app/tutors/[id]/page.tsx`
12. `/tutors/[id]/edit` — `app/tutors/[id]/edit/page.tsx`
13. `/centers` — `app/centers/page.tsx`
14. `/centers/[id]` — `app/centers/[id]/page.tsx`
15. `/centers/[id]/admin` — `app/centers/[id]/admin/page.tsx`
16. `/search` — `app/search/page.tsx`

**Booking**
17. `/classes/[id]/book` — `app/classes/[id]/book/page.tsx` + `BookingCheckout.tsx` (PRIMARY)
18. `/book` — `app/book/page.tsx` (secondary entry — consolidate, see §0.4)
19. `/booking-confirmed` — `app/booking-confirmed/page.tsx` + `BookingConfirmedClient.tsx`

**Authed app**
20. `/dashboard` — `app/dashboard/page.tsx` + `DashboardClient.tsx` + `app/dashboard/components/*`
21. `/dashboard/bookings` — `app/dashboard/bookings/page.tsx`
22. `/bookings` — `app/bookings/page.tsx`
23. `/favorites` — `app/favorites/page.tsx`
24. `/messages` — `app/messages/page.tsx` + `MessagesClient.tsx`
25. `/messages/[threadId]` — `app/messages/[threadId]/page.tsx` + `ThreadClient.tsx`
26. `/messages/new` — `app/messages/new/page.tsx`
27. `/create-class` — `app/create-class/page.tsx`
28. `/referral` — `app/referral/page.tsx`
29. `/settings` — `app/settings/page.tsx` + `SettingsClient.tsx` + `SecuritySettings.tsx`
30. `/admin` — `app/admin/page.tsx`
31. `/unauthorized` — `app/unauthorized/page.tsx`

**Global states**
32. `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`
33. route-level `loading.tsx` (`classes`, `dashboard`, `settings` already have them — add more)
34. `/global-states` — `app/global-states/page.tsx` (the existing showcase; keep it in sync
    with the real components)

---

## 5. Design-system overhaul (consolidate, don't reinvent)

Work inside `app/globals.css` and a small set of shared components.

### 5.1 Tokens — make ONE canonical set
- The `--color-*` block and the `--bg/--text/--accent/...` block are duplicated and aliased.
  **Pick the semantic (`--bg`, `--text`, `--accent`…) set as canonical**, delete the legacy
  `--color-*` duplicates, and update the handful of files that still read `--color-*`.
- Ensure full coverage of semantic tokens for: background, foreground, muted, muted-foreground,
  card, card-foreground, border, input, primary, primary-foreground, secondary, accent,
  success, warning, danger, info, ring/focus, sidebar surface, dashboard surface, booking
  surface. Most exist — fill the missing ones (e.g. an explicit `--info`, `--ring`,
  `--surface-booking`, `--surface-dashboard`).
- Keep the dark theme parity: **every** new token must have a `:root[data-theme="dark"]` value.

### 5.2 Typography scale (new)
Add `--font-serif` and a documented scale used everywhere:
`--text-display`, `--text-h1`, `--text-h2`, `--text-h3`, `--text-card-title`, `--text-body`,
`--text-small`, `--text-label`, `--text-meta`, `--text-button`, `--text-badge`,
`--text-dashboard-number`. Serif for display/page headings, Inter for the rest, Cairo for AR.
Migrate font loading to `next/font` and remove the double font load.

### 5.3 Spacing / radius / shadow / motion
- Spacing, radius, shadow, and transition scales already exist — **enforce** them and add
  semantic spacing tokens: `--space-page`, `--space-section`, `--space-card`, `--space-form`,
  `--space-dashboard-grid`, `--safe-bottom` (already partly handled via `env(safe-area-inset-*)`),
  `--sticky-cta-offset`.
- Motion: keep `--transition-fast/base/slow`; ensure all motion respects the existing
  `@media (prefers-reduced-motion: reduce)` block (already present — extend it to any new motion).

### 5.4 Dark mode quality bar
Audit every route in dark mode. Forbidden: invisible text, low-contrast inputs, unreadable
cards, white icons on white, green text on green that fails contrast, disappearing input
borders, cards blending into background. Fix only via tokens — never one-off dark hacks.

---

## 6. Component system to build / refine

For each, **find the existing implementation first** (§0.5). Refine it; create only if absent.
The goal is to replace repeated inline-style blocks with these reusable pieces.

**Global layout:** AppShell, MarketingShell, DashboardShell (`dashboard-app-shell` exists),
AuthShell (exists), Sidebar (`DashboardSidebar` exists), DesktopNavbar (`Navbar`/`NavbarClient`),
MobileHeader, MobileBottomNav (exists), Footer (`FooterContent`), LanguageToggle (`LangToggle`),
ThemeToggle (in `Theme`/Navbar), NotificationButton, UserMenu.

**Content cards:** ClassCard (`app/classes/components/ClassCard.tsx`), TutorCard
(`app/tutors/TutorCard.tsx`), CenterCard, BookingCard, DashboardStatCard (`StatBadge`),
UpcomingSessionCard, ReviewCard (`ReviewSection`), MessageThreadCard, EmptyStateCard
(`EmptyState`), LoadingSkeletonCard (`SkeletonCard`).

**Search/filter:** CompactSearchInput, FilterChips, FilterDrawer (bottom sheet on mobile),
SortDropdown, ActiveFilterBar, SubjectCarousel, LevelSelector, PriceRangeFilter,
AvailabilityFilter, LocationOnlineFilter. (`app/classes/components/ClassFilters.tsx` exists —
refine into these.)

**Booking:** BookingStepper (exists as `StepIndicator`), DatePicker, TimeSlotPicker,
StudentDetailsForm, PaymentMethodSelector, OrderSummary (exists), StickyBookingCTA,
BookingSuccessCard (`BookingConfirmedClient`), BookingErrorCard, **AlreadyBookedState (new —
required by §0.4)**.

**Auth/forms:** AuthCard (`.auth-card`), FormInput (`AuthFields`), PasswordInput, FormError,
VerificationBanner (`EmailVerificationBanner`), ProfileCompletionPrompt (`OnboardingChecklist`).

**Dashboard:** DashboardHeader, GreetingHeader, MetricCard, ActivityPanel, SchedulePanel,
RevenueChart (recharts; tutor/center), QuickActions, TodoChecklist, ClassManagementTable,
BookingManagementTable. (See `app/dashboard/components/*`: DashboardStats, DashboardBookings,
DashboardClasses, DashboardRevenue, DashboardChecklist, DashboardPrimitives — refine these.)

**Messages:** ThreadList, ChatHeader, MessageBubble (`.message-bubble*` exists), Composer,
AttachmentButton, SendingState, EmptyConversationState, MessageTrustFooter.

**Global states:** PageLoader, RouteSkeleton, ErrorState, NotFoundState, EmptyState (exists),
Toast (`ToastProvider`), ConfirmationDialog (`.modal` exists).

---

## 7. Landing page — improve only where needed

The landing/book concept is already strong (`app/components/landing/*`,
`LandingBookScroller`, scroll-snap hero). **Do not rebuild it from scratch.** Inspect and fix
only visible issues: performance, mobile smoothness, responsive scaling, CTA clarity, dark
mode, image optimization, reduced-motion, scroll locking, section transitions, accessibility,
text contrast, and a graceful fallback if any animated/3D element fails to load. It must keep
its academic, Egyptian, premium, immersive feel with a clear CTA to browse / sign up / book.

---

## 8. Auth screens overhaul

`.auth-shell` split layout already exists. Elevate it.
- **Desktop:** left = brand story + value prop + small trust proof cards (`.auth-proof`) +
  subtle Egyptian academic background (`CairoSkyline`); right = clean auth card. Keep
  language + theme toggles visible (`.auth-preferences`). Refined inputs + clear validation.
- **Mobile:** centered logo, large serif "Welcome back", full-width soft card, large readable
  inputs, password visibility toggle, clearly aligned "Forgot password?", full-width primary
  CTA, signup link below, AR/EN toggle reachable, no cramped layout.
- **Fix the real auth issues:** confusing invalid-login message; redirect after login
  (honor `?next=`); role-based destination (student → `/dashboard`, tutor/center →
  their dashboard, admin → `/admin`); loading + disabled states; validation + a11y labels.
- Copy: "Welcome back" / "Log in to continue your learning journey." / "Forgot password?" /
  "Don't have an account? Sign up". No emojis. Add all strings to `i18n` EN+AR.

---

## 9. Navbar & navigation overhaul

`app/Navbar.tsx` + `components/NavbarClient.tsx` + `MobileBottomNav`.
- **Desktop:** logo left; Browse Classes, Find Tutors, Dashboard, Messages (+ Resources if
  present); a **compact** search in the nav where appropriate; AR/EN toggle; theme toggle;
  notification icon (`.notification-dot` pulse exists); user menu/avatar. Logged-out: Sign in
  + Get started.
- **Mobile:** compact top header (logo, search icon, notifications if authed, language
  toggle, menu) + bottom nav: Home, Classes, Tutors, Messages, Profile/Bookings (by auth
  state). Active route must be visually clear (`.nav-link.is-active` underline exists — extend
  to bottom nav). The mobile menu must not feel like an afterthought.

---

## 10. Browse Classes overhaul

`app/classes/ClassesClient.tsx`, `components/ClassCard.tsx`, `ClassFilters.tsx`. Make content the star.
- **Desktop:** left sidebar filters, center grid/list, right contextual panel (no-results /
  recommended filters / loading). Header "Browse Classes" + short subtitle. **Compact** search
  (not oversized). Sort dropdown. Active filter chips. Subject/category carousel. Results
  count. Clear "Reset filters".
- **Class card** shows: image (`app/lib/imagery.ts` `classBanner`/`subjectAccent`), subject
  badge, title, tutor/center name, rating, level/grade, online/in-person, duration, price in
  EGP, favorite/save icon (`.class-favorite`), seats/availability if present, primary CTA.
- **Mobile:** title+subtitle, compact search, filter-chip button with count, horizontal
  subject chips, 1-col cards (2-col only if readable), reachable filters, bottom nav.
- **No-results:** "No classes found" + "Try removing a filter or searching another subject."
  + "Reset filters" + suggested popular subjects.
- **Loading:** skeleton cards matching card shape (`SkeletonCard`).

---

## 11. Browse Tutors overhaul

`app/tutors/page.tsx`, `TutorCard.tsx`.
- **Tutor card:** photo, online badge, verified badge, name, subjects, level/exam tags,
  rating + review count, hourly/session price, favorite, short credibility cue.
- **Mobile grid:** clean 2-col when width allows; consistent image crops; CTAs not crowding;
  bottom nav; filters as chips/bottom sheet.
- **Desktop:** left filters, tutor grid, optional right recommendation/trust panel.
- **Filters:** subject, grade/level, curriculum, price, rating, online-now, language,
  availability, verified-only.

---

## 12. Tutor profile overhaul

`app/tutors/[id]/page.tsx`. Make it convert, not look like a DB row.
- Large photo, name, verified badge, rating/reviews, price, favorite/share, online status,
  subject tags, short bio, "From Egypt", languages (AR/EN), experience years, reviews summary,
  availability calendar, **sticky "Book a session" CTA**.
- **Desktop:** profile hero left, sticky booking card right, sections below — About, Subjects,
  Availability, Reviews, Policies, Related tutors/classes.
- **Mobile:** image + summary top, compact stat cards, availability, sticky bottom booking CTA.

---

## 13. Class detail overhaul

`app/classes/[id]/ClassDetailClient.tsx`.
- Hero banner (class image / academic texture via `imagery.ts`), title, rating, review count,
  students/bookings count, instructor/center card, "What you'll learn", curriculum/session
  details, schedule, duration, level, online/in-person, language, requirements, reviews
  (`ReviewSection`), related classes, **desktop sticky booking card**, **mobile sticky CTA**.
- Booking card: price, included features, schedule choices, availability, secure-payment
  indicator, clear CTA, and the **already-booked** state (respect `?alreadyBooked=1`,
  `?full=1` query flags the server already sets).
- Warm academic imagery; subtle cultural texture; never touristy.

---

## 14. Booking flow overhaul — AND fix the bug (§0.4)

`app/classes/[id]/book/BookingCheckout.tsx` (+ `app/api/bookings/route.ts`).

Make it a premium checkout: top logo, back button, AR/EN toggle, stepper (Schedule → Details
→ Pay), class/session summary, date picker, time slot picker, student details, payment method,
order summary, total, secure-payment indication, confirm CTA, processing state, success state.

**Mandatory fixes (verified causes in §0.4):**
1. Read `data.paymentUrl` (not `data.iframeUrl`) for the Paymob redirect.
2. On HTTP 409 with `bookingId`, render **AlreadyBookedState** (not an error banner) with
   View booking / Go to dashboard / Message tutor.
3. Resolve the fake Schedule step. **Decide between:**
   - **(A) Real scheduling:** lift `selectedDay`/`selectedTime`/student fields into
     `BookingCheckout` state, validate, send a real `scheduledAt` (+ student name) in the POST,
     extend the Prisma `Booking` model and `app/api/bookings/route.ts` to persist it, and show
     real available dates from the class. (Bigger; touches schema + `prisma db push`.)
   - **(B) Honest MVP:** remove the cosmetic calendar/time/student inputs and replace the
     Schedule step with the class's real `schedule` string + copy like "Your tutor will confirm
     the exact time after booking." Keep promo + payment-method selection real.
   - If unsure which, surface the tradeoff and pick (B) as the safe default unless the schema
     clearly supports (A). **Either way, do not ship a fake date picker.**
4. Remove the hardcoded `system-ui` font on the booking `<main>` (§0.3.2).
5. Disable the confirm button while submitting (already partly done) and guard against double
   submission; keep the order summary accurate after promo application.
6. Add post-success actions: View booking, Go to dashboard, Message tutor, Add to calendar
   (`.ics`) if feasible.

Expected behavior: success → confirmation + dashboard tie-in; already booked → friendly state;
payment pending → clear pending state (Paymob); failure → human-readable recovery.

---

## 15. Dashboard overhaul

`app/dashboard/DashboardClient.tsx` + `app/dashboard/components/*`. Make it a command center.
- **Student:** greeting header, today's schedule, upcoming sessions, total bookings, active
  classes, avg rating/reviews (if applicable), messages preview, recommended classes/tutors,
  quick actions, booking status, profile completion (`OnboardingChecklist`).
- **Tutor:** upcoming sessions, pending bookings, revenue overview (`DashboardRevenue` +
  recharts), class performance, availability tasks, messages, reviews, quick edit actions.
- **Center/admin:** class management, tutor management, bookings, revenue, pending actions,
  schedule management, review management (`app/centers/[id]/admin`, `app/admin`).
- **UI:** `dashboard-app-shell` left sidebar + clean top bar, compact stat cards, readable
  tables, checklist panels, charts only when meaningful, strong spacing.
- **Mobile:** stacked cards, bottom nav, quick-action row, upcoming session card first.

---

## 16. Messages overhaul

`app/messages/MessagesClient.tsx`, `app/messages/[threadId]/ThreadClient.tsx`. WhatsApp-familiar,
Coursaty-branded, safe and calm.
- **Thread list:** filters All / Unread / Students / Tutors; avatar; name; online dot; last
  message; timestamp; unread count; empty state nudging to browse tutors.
- **Conversation:** header (name, online status, video/session icon if relevant), booking
  context row, bubbles (`.message-bubble*`, RTL-aware), timestamps, sending/read/delivered
  cues, attachment button, composer, send button, loading.
- **Trust footer:** Safe & secure · Real-time updates · Trusted tutors · Built for families.
- **Mobile:** thread list and open conversation as separate screens / responsive panels;
  bottom nav consistent.

---

## 17. Settings overhaul

`app/settings/SettingsClient.tsx`, `SecuritySettings.tsx`. Sections: Profile, Security,
Notifications, Connected accounts, Sessions/devices (`/api/me/sessions`), Language, Theme,
Danger zone. Sidebar/tabs, clean forms, clear verification states, sticky save if needed,
unsaved-changes warning, accessible inputs, connected-account cards, distinct-but-not-ugly
danger zone. Fix inconsistent inputs, weak dark mode, unclear save states, weak messages.

---

## 18. Global states

`app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`, `EmptyState`, `SkeletonCard`,
`GlobalStateCards`, and the `/global-states` showcase. All branded Coursaty.
- **404:** large elegant "404", "The page you're looking for doesn't exist.", buttons Browse
  Classes + Go home.
- **Error:** "Something went wrong", retry + go home; never raw stack traces.
- **Loading:** branded skeleton layout (not just a spinner); high perceived performance.
- **Empty:** explain what's missing + next action.

---

## 19. Browse/search usability (cross-cutting)

Across all browse pages: search bars **smaller and elegant**; content cards are the focus;
filtering powerful but not visually dominant; clear active filters; easy reset; accessible
sort; guiding no-results; mobile filters as bottom sheets (not full-page unless opened).
Implement: compact search input, filter-chip count, bottom-sheet filters, subject chip
carousel, active filter row, sorting, result count, skeleton loading, no-results suggestions.

---

## 20. Data-driven visible improvements

Use real Prisma fields; never fabricate data. Safe fallbacks, clearly marked:
- rating missing → hide rating or show "New".
- image missing → branded academic placeholder (`imagery.ts`).
- availability missing → "Check availability".
- price missing → "Contact for price".
- verification missing → do NOT show a verified badge.

---

## 21. Image & asset strategy

Use `app/lib/imagery.ts` patterns; you may generate/curate new assets (Higgsfield / Nanobanana
/ Figma / image-gen tools) for: study-desk backgrounds, book pages, class thumbnails, tutor &
center placeholders, Egyptian academic line illustrations, subtle Cairo/education textures,
paper/grain overlays, empty-state illustrations.
**Rules:** don't overuse pyramids; not a tourism site; refined/academic/premium, not childish;
backgrounds support readability; subtle culture (geometry, paper, Cairo skyline linework,
calligraphic rhythm, warm materials) blended with modern study imagery (books, laptops,
classrooms, students). Optimize (AVIF/WebP), responsive sizes, explicit width/height, alt text,
no huge files, dark-mode-safe contrast (overlays where needed). Prefer `next/image`.

---

## 22. Motion & microinteractions

Visible but restrained: cards lift subtly on hover (standardize `.class-card`), buttons have
press/loading states, filters animate open/close, modals/sheets slide smoothly, dashboard
cards reveal softly, booking success has a small refined animation (the `.confetti-burst`
already exists — keep tasteful), message send state visible, nav active states animate, premium
skeletons. No random animation, no lag. Respect `prefers-reduced-motion` (block already exists).

---

## 23. Accessibility

Verify: keyboard nav, visible focus rings (`:focus-visible` exists), ARIA labels, semantic
headings, form labels + error associations (`aria-describedby`), light+dark contrast (WCAG AA),
alt text, ≥44px touch targets, reduced motion, correct button vs link semantics, language-toggle
a11y, RTL correctness. Keep/extend the existing `.skip-link`.

---

## 24. Performance

Optimize: landing animations, route-level code splitting, image loading (`next/image`,
priority only on hero), repeated re-renders (memoize where it matters per React 19 rules),
UI-dependent dashboard queries, skeletons over blank screens, lazy-load heavy visuals
(`dynamic()` for framer-heavy/recharts where below the fold), avoid hydration mismatch (note
the `PREFS_BOOTSTRAP` inline script in `layout.tsx` already prevents theme/lang flash — keep
it), remove unused heavy UI code where safe. Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1.
Must feel fast on mobile.

---

## 25. Mobile-first requirements

Check every major page at 320/375/768/1024/1440/1920. Bottom nav, thumb-friendly CTAs, sticky
booking button, compact search, filter bottom sheets, readable cards, no horizontal overflow,
no tiny text, no crowded tables, mobile dashboard cards, safe-area padding (`env(safe-area-
inset-*)` already used), smooth scroll. Mobile is not secondary.

---

## 26. Dark mode requirements

Audit every route. Fix invisible text, bad contrast, disappearing input borders, cards
blending into bg, icon visibility, disabled-state readability, dark hover states, dark booking
card / dashboard / messages / auth. Tokens only — no per-screen dark patches.

---

## 27. Copywriting rules

Professional, clear, warm, trustworthy; not childish, not corporate-nonsense, no emoji-heavy
copy. Examples: "Find trusted tutors near you." / "Book verified classes with clear schedules
and secure payments." / "You're already booked for this class." / "No classes found. Try
removing a filter or searching another subject." / "Your booking is confirmed." / "Message your
tutor before the session." / "Complete your profile to get better recommendations." Every new
string goes into `i18n` `DICT` in **both** EN and AR.

---

## 28. Concrete screen-by-screen expectations

- **Login:** desktop split, mobile stacked, premium card, serif heading, green CTA, language
  toggle, clean validation.
- **Browse Classes:** left filters, center cards, compact search, category chips,
  no-results/right panel, skeletons.
- **Class Detail:** large hero, class info, "what you'll learn", instructor card, reviews,
  related classes, right sticky booking card.
- **Booking:** stepper, class summary, date/time (real or honest, §14), student details,
  payment, summary, processing state — and the fixed already-booked path.
- **Dashboard:** clean sidebar, greeting, stat cards, today schedule, upcoming sessions,
  management table, chart if useful, quick actions.
- **Tutors browse/profile:** premium cards, verified badges, subject chips, profile summary,
  availability, reviews, sticky booking CTA.
- **Messages:** thread list, conversation, branded bubbles, booking context row, composer,
  secure trust row.
- **Settings:** clean tabs/sidebar, security cards, connected accounts, danger zone.
- **Global states:** branded loading, error, 404.

---

## 29. Backend-sensitive areas (do not break)

Auth/session (`lib/auth.ts`, NextAuth v5), role-based routing, bookings + Prisma client +
Paymob webhook, Supabase, dashboard queries, class/tutor/center relationships, the
`/api/mobile/*` contract consumed by the Flutter app, and the Vercel build. When changing UI,
preserve working data flow. For the booking bug, fix the **root cause** (§0.4) — do not just
hide the error. Handle duplicate booking safely and make the confirm action idempotent in the UI.

---

## 30. Implementation workflow (do in this order)

1. Inspect project structure → 2. Confirm framework/styling (§0) → 3. Map all routes (§4) →
4. Map shared components (§0.5) → 5. Inspect theme/dark mode → 6. Inspect auth → 7. Inspect
booking (§0.4) → 8. Inspect browse/class/tutor/dashboard/message/settings → 9. Write the
implementation plan → 10. Consolidate tokens + global styles (§5) → 11. Refine shared
components (§6) → 12. Auth screens → 13. Navigation/app shell → 14. Browse pages → 15. Class
detail → 16. Tutor pages → 17. Booking flow + bug fix → 18. Dashboards → 19. Messages →
20. Settings → 21. Global states → 22. Mobile polish → 23. Dark-mode polish → 24. A11y polish →
25. Performance polish → 26. Run lint/build → 27. Fix errors → 28. Final report.

Commit in logical, reviewable chunks (conventional commits: `feat:`, `fix:`, `refactor:`,
`style:`). Do not bundle the entire overhaul into one commit.

---

## 31. Testing / verification commands

There is **no test runner or typecheck script** configured. At minimum run:
- `npm install` (if deps missing)
- `npx prisma generate`
- `npm run lint`
- `npm run build`  ← the real gate; it runs `next build` + type checking. Must pass.
- `npm run dev` smoke test if possible.

Manually verify in mobile + desktop, light + dark, EN + AR (RTL): login, signup, browse
classes, browse tutors, class detail, tutor detail, **booking (including the already-booked
path and a real/honest schedule step)**, dashboard, messages, settings, 404, error/loading/
empty. Fix failures; do not ignore them. If you add tests, Playwright is the house E2E choice,
but build-green + manual verification is the baseline acceptance.

---

## 32. Acceptance criteria

Success only if:
- The whole site visibly looks more premium and coherent; Coursaty brand consistent across routes.
- Auth screens polished; browse classes/tutors clearly improved; cards stronger, content
  prioritized; search bars smaller/refined; filters better on desktop + mobile.
- Class detail + tutor profile feel conversion-ready.
- **Booking flow polished AND the known error fixed at the root** (paymentUrl key, 409
  already-booked state, honest scheduling, brand font restored).
- Dashboard looks like a real product dashboard; messages polished; settings professional;
  global states branded.
- Dark mode readable everywhere; mobile excellent; accessibility improved; performance not worse.
- Tokens consolidated to one source; serif headings applied; double font load removed.
- `npm run build` and `npm run lint` pass (or failures clearly explained and fixed where possible).
- Works in EN + AR (RTL) and light + dark.

---

## 33. Final report required from Codex

At the end, report:
1. What changed visually. 2. Which routes improved. 3. Components created/refactored.
4. What was fixed in booking/auth (cite the paymentUrl + 409 + schedule fixes). 5. Mobile
improvements. 6. Dark-mode improvements. 7. Accessibility improvements. 8. Performance
improvements. 9. Files changed. 10. Commands run + results (lint/build output). 11. Remaining
limitations + recommended next steps (e.g. if you chose the honest-MVP schedule and real
scheduling is still wanted).

---

## 34. Research freedom & Egyptian visual direction

Treat this as a research-backed, reference-driven redesign. You may use: public GitHub repos,
high-quality UI clones, marketplace/education/booking templates, design-system examples,
open-source component libraries, animation/dashboard/mobile references, accessibility &
performance references, best-in-class public sites, MCPs, plugins, installed skills, browser/
search tools, Figma, Higgsfield, Nanobanana, AI image generation/editing tools, and design
inspiration platforms. Don't blindly copy code unless licenses are safe; use references for
structure, spacing, interaction, responsive behavior, component architecture, and polish.
Prioritize visible, high-impact change.

**Egyptian cultural direction:** make Coursaty feel rooted in Egypt, never generic, never
touristy. Draw subtly on: papyrus/paper textures, hieroglyphic-inspired patterns, ancient
columns/temples/statues as *atmospheric* imagery, Cairo study atmosphere, old books, libraries,
study desks, desert-stone tones, Nile-calm accents, Islamic geometric patterns, Arabic
calligraphic rhythm, museum/archive textures, campus/study visuals — blended with modern
tutoring (books, laptops, classrooms, students). Palette: warm cream, deep emerald, stone
beige, muted gold, soft charcoal (your existing tokens). Don't overuse pyramids, don't be
childish, keep backgrounds readable, optimize + responsive + alt text + dark-mode-safe.

For pages that feel visually empty, add fitting treatments: auth (papyrus/Cairo academic bg),
browse (subtle paper texture, refined subject illustrations), class detail (subject-specific
academic imagery), tutor profiles (warm card backgrounds, not plain DB layouts), dashboards
(subtle paper/green surfaces, light patterning), messages (calm paper-texture bg), empty
states (tasteful academic illustrations), 404/error (branded papyrus/books/subtle Egyptian
references). Generate assets where needed instead of leaving blank placeholder boxes; if no
asset pipeline is available, create clear placeholders and document what to generate later.

---

### Final instruction
This is a large, visible UI/UX overhaul. Do not stop after tiny improvements. Do not only
adjust colors. Do not spend all effort on the landing page. Work through the **entire** website
and all UI/UX-related code. Use the provided Coursaty references as the north star. The final
product must look and feel like a premium Egyptian tutoring platform ready to show investors,
parents, tutors, centers, and real users.
