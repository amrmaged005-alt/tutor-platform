# Content, Localization & RTL Audit

**Scope:** `app/` — i18n architecture, hardcoded strings, RTL layout correctness, date/number/currency formatting, terminology consistency, content quality, Arabic typography.

**Method:** Static review of `app/components/i18n.tsx` (the DICT/`useI18n` system, 1115 lines, ~500+ keys), `git log`/`git show` on recently-touched files, and targeted `grep` across the ~55 files that import `useI18n` plus the student/tutor-facing files that don't. Cross-checked against `REMAINING_LIMITATIONS.md` (dated 2026-06-12).

**Headline finding:** the most recent commit on `main` (`51b48a1`, "feat: add profile editing and checkout refresh") **regressed the booking checkout flow** — it replaced a fully-localized, honest-scheduling checkout (`e500435`) with a new 1,437-line version that reintroduces a fake "May 2025" calendar and hardcodes ~95% of its UI text in English, directly contradicting two things `REMAINING_LIMITATIONS.md` says are done. See I18N-001.

---

## 1. Localization architecture

- **Mechanism:** `app/components/i18n.tsx` exports `I18nProvider` (wraps the whole app in `app/layout.tsx`) and a `useI18n()` hook returning `{ lang, setLang, t, dir }`. Translations live in one large `DICT` object (`{ en, ar }` per key), consumed via `t("some.key", vars?)`.
- **Routing:** **No URL localization.** Both languages render at the same route (`/classes`, `/dashboard`, etc.) — there is no `/en/...` or `/ar/...` prefix, no `?lang=` query param, and no `Accept-Language` negotiation on the server. Language is a pure client-side UI state.
- **Persistence:** `localStorage.setItem("coursaty-lang", l)` (`app/components/i18n.tsx:1083`). No cookie, so **the server always renders the English (`lang: "en"`) default** on first paint (SSR `useState<Lang>("en")`, `i18n.tsx:1078`) regardless of the visitor's stored preference.
- **FOUC mitigation (partial):** `app/layout.tsx:32-45` has an inline `PREFS_BOOTSTRAP` script that runs before hydration and sets `document.documentElement.lang`/`dir` from `localStorage` immediately, so the page *shell* (RTL direction, font-family cascade) doesn't flash. However, this only sets the `dir`/`lang` attribute — it does **not** change the actual rendered text. `I18nProvider`'s `lang` state starts at `"en"` and only flips to `"ar"` inside a `useEffect` + `queueMicrotask` after mount (`i18n.tsx:1096-1100`). Net effect: **returning Arabic-preferring users see one frame of English text (in an RTL-flowing, Arabic-font shell) before the client-side effect swaps the copy to Arabic.** This is a real, if minor, architecture gap — not documented anywhere.
- **Switcher UI:** `app/components/LangToggle.tsx` (a floating global button) and an inline toggle inside `NavbarClient.tsx` both call `setLang(lang === "en" ? "ar" : "en")`. `NavbarClient.tsx` is properly wired to `useI18n` (`components/NavbarClient.tsx:9,73,107,341`) — the navbar shown on every page is fully localized.
- **Fallback behavior:** `translate()` (`i18n.tsx:1058-1067`) returns the raw dict **key string** if the key doesn't exist in `DICT` at all (`return String(key)`), and falls back to the English value if a specific-language entry is missing (`entry[lang] ?? entry.en`). This is reasonable — a missing AR translation silently shows English rather than a blank string or a `[MISSING]` marker, and a missing key shows an ugly-but-debuggable raw key instead of crashing.
- **RTL direction:** Driven globally by `document.documentElement.dir` (set in both the bootstrap script and the `I18nProvider` effect), plus CSS in `app/globals.css:229-249` (`:lang(ar)`, `[dir="rtl"]` selectors set `direction: rtl`, `text-align: right`, swap to `var(--font-arabic)`, and bump `line-height`/`letter-spacing` for Arabic readability). This part is correctly implemented and centralized.

---

## 2. Missing/hardcoded strings

### I18N-001 — CRITICAL — Booking checkout regressed to fully hardcoded English + fake calendar (P0)

- **File:** `app/classes/[id]/book/BookingCheckout.tsx` (live component, rendered by `app/classes/[id]/book/page.tsx:110` — this is the production booking flow, not dead code)
- **Evidence:** `git log` shows the file went from 340 lines (commit `e500435`, "honest scheduling", fully wired to `t("booking.checkout.*")` DICT keys — 20+ call sites) to **1,437 lines** in the very latest commit `51b48a1` ("feat: add profile editing and checkout refresh"). In the new version, `useI18n`/`t` is still imported and destructured (line 90: `const { lang, setLang, t } = useI18n();`) but is used in only ~6 places (all inside the `AlreadyBookedState` sub-component, lines 531-542) — the entire primary checkout UI (roughly lines 158-500) uses raw English string literals instead. Examples:
  - `app/classes/[id]/book/BookingCheckout.tsx:165` — `<h1>Booking received</h1>` (a DICT key `booking.checkout.received` with this exact English text already exists and is unused here)
  - `app/classes/[id]/book/BookingCheckout.tsx:166` — `<p>Opening your confirmation...</p>` (DICT key `booking.checkout.openingConfirmation` exists, unused)
  - `:177` — `aria-label="Back to class"` (DICT key `booking.checkout.backToClass` exists, unused)
  - `:195` — `<h2 id="date-title">1. Choose date</h2>`
  - `:197` — `May 2025 <ChevronRight ...>` — **hardcoded month/year**
  - `:215` — `aria-label={\`${date.day} May${...}\`}` — hardcoded "May"
  - `:224-228` — `"Calendar legend"`, `"Selected"`, `"Today"`, `"Available"`, `"Unavailable"`
  - `:233` — `<h2 id="time-title">2. Choose time</h2>`
  - `:250, :255, :262` — `"3. Student details"`, `"Student full name"`, `"Grade / School (optional)"`
  - `:270-309` — `"4. Payment method"`, `"Card"`, `"Visa, MasterCard"`, `"Fawry Pay"`, `"Bank Transfer"`, `"Manual review"`, `"Cash"`, `"At center/tutor"`, and the multi-line cash policy paragraph
  - `:338-346` — `StepIndicator()` hardcodes `["Schedule", "Details", "Pay"]` (DICT keys `booking.checkout.step.schedule/details/pay` already exist with this exact text, unused)
  - `:358-378` — `"with {tutorName}"`, `"seats left"`, `"Online session"`, `"In person"`, `"60 min"`, `"per session"` — all hardcoded despite matching DICT keys existing (`booking.checkout.withTutor`, `.seatsLeft`, `.onlineSession`, `.inPerson`)
  - `:446-499` — `"Order summary"`, `"Details"`, `"Class session"`, `"Platform fee"`, `"Date"`, `"Time"`, `"Total"`, `"Confirming booking"`, `"Confirm booking"`, `"Secure payment"`, `"Processing your booking..."`, `"Protected checkout"`, `"Confirmation is saved to your dashboard."`
  - `:136` — `"Network error. Please try again."` (matches DICT `verify.network` almost verbatim, unused)
- **Content-quality compounding issue:** the same regressed file hardcodes demo/placeholder form defaults that will populate every real booking unless the user notices and edits them: `app/classes/[id]/book/BookingCheckout.tsx:93` — `useState("Omar Hossam")` and `:94` — `useState("IGCSE - Al Nafees International School")`.
- **Scheduling-integrity issue:** `REMAINING_LIMITATIONS.md` §2 states "Option B (honest MVP) is implemented... No fake calendar or hardcoded May 2025 dates remain." That is **no longer true** — `CALENDAR_DAYS` (`:47-83`) and `TIME_OPTIONS` (`:85`) are static, fake, hardcoded arrays, and the booking `note` field (`:107-118`) synthesizes a fake `Schedule: May {day}, 2025 at {time}` string that gets silently attached to the real booking record — presenting fabricated scheduling data as if it were real, functioning input.
- **Recommendation:** Revert or re-port the localization + honest-scheduling work from `e500435` on top of whatever new "profile editing" functionality `51b48a1` intended to add. At minimum: (a) route all UI copy back through `t()`/DICT (the correct keys already exist in `app/components/i18n.tsx` — they just need to be called), (b) remove `CALENDAR_DAYS`/`TIME_OPTIONS`/fake `May 2025` scheduling UI and go back to displaying the class's real `schedule` field, (c) remove the `"Omar Hossam"` / `"IGCSE - Al Nafees International School"` seed defaults.
- **Complexity:** Medium (mostly mechanical swap of literals for `t()` calls against pre-existing keys; the scheduling revert is a larger but well-scoped diff since the honest version still exists in git history at `e500435`).

### I18N-002 — HIGH — Class detail page (`/classes/[id]`) has zero i18n (P1)

- **File:** `app/classes/[id]/ClassDetailClient.tsx` (724 lines) — reachable from every `ClassCard` click across the site (landing, `/classes`, `/tutors/[id]`, `/centers/[id]`, favorites)
- **Evidence:** No `useI18n`/`i18n` import anywhere in the file (`grep -n "i18n" ...` returns nothing). All copy is hardcoded English, e.g. `app/classes/[id]/ClassDetailClient.tsx:601` — `<ArrowLeft size={12} aria-hidden /> Back to classes`.
- **Compounding RTL issue:** the same `<ArrowLeft>` (:601) has no direction-aware flip (contrast with `app/messages/[threadId]/ThreadClient.tsx:76`, which correctly does `style={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }}` on its own `ArrowLeft`) — in Arabic this "back" arrow will point the wrong way relative to reading direction, on top of the label staying in English.
- **Recommendation:** Wire the page to `useI18n`, add a `classDetail.*` DICT namespace, and RTL-flip the back arrow to match `ThreadClient.tsx`'s existing pattern.
- **Complexity:** Medium-High (724-line file, many strings).

### I18N-003 — HIGH — `ClassCard` (the primary class card, used app-wide) has zero i18n (P1)

- **File:** `app/classes/components/ClassCard.tsx` — imported by `ClassesClient`, `ClassGrid`, `TrendingClassesRow`, `ClassDetailClient`, `FeaturedClassesSection`, `HeroSection`, `LandingCards`, `RecommendationsSection`, `TrendingSection`, `FavoritesClient`, `TutorProfileClient`, and `CenterProfileClient` — i.e. it's the single most reused piece of UI on the student journey.
- **Evidence:** No `useI18n` import. Hardcoded strings:
  - `app/classes/components/ClassCard.tsx:36` — `?? "Coursaty Tutor"` (fallback tutor name; matching DICT key `tutor.unnamed` = "Coursaty Tutor" exists, unused)
  - `:128` — `aria-label={saved ? "Remove class from favorites" : "Save class to favorites"}` (matches DICT `tutor.removeFavorite`/`tutor.saveFavorite`... but those are tutor-specific keys, a `class.*` equivalent doesn't exist yet)
  - `:231` — `title="Verified tutor"`
  - `:246` — `{price === 0 ? "Free" : \`${price.toLocaleString()} EGP\`}` — hardcoded "Free" (DICT `common.free`/`dash.free` exist with this exact text, unused) and an un-localized number format (see FORMAT-001 below)
- **Recommendation:** Add a `classCard.*` namespace and route through `t()`. Given the component's reach, this single fix propagates the localization fix to ~10 pages at once.
- **Complexity:** Low (small, self-contained file — high leverage).

### I18N-004 — HIGH — Center public profile page has zero i18n (P1)

- **File:** `app/centers/[id]/CenterProfileClient.tsx` (514 lines) — this is the **public**, student-facing center profile (distinct from the internal `/centers/[id]/admin` module that `REMAINING_LIMITATIONS.md` already documents as English-only by design).
- **Evidence:** No `useI18n` import anywhere in the file.
- **Note for the record:** this is a *different, undocumented* gap from the one in `REMAINING_LIMITATIONS.md` §3 — that entry only covers the admin dashboard. The public profile page students actually browse was not mentioned and is not localized.
- **Recommendation:** Same treatment as I18N-002/003 — add `centerProfile.*` DICT namespace.
- **Complexity:** Medium.

### I18N-005 — MEDIUM — `DashboardMaterials.tsx` mixed usage (P2)

- **File:** `app/dashboard/components/DashboardMaterials.tsx` — imports `useI18n` and uses `t()` once (line 112, inside the add-material modal form), but the main panel (rendered for every tutor on every page load) is hardcoded:
  - `app/dashboard/components/DashboardMaterials.tsx:41` — `<h2>Class Materials</h2>`
  - `:52` — `Upload Material`
  - `:56` — `No materials uploaded yet.`
  - `:65,154,156` — `aria-label="Locked material"`, `aria-label="Close material modal"` (×2)
  - `:177` — `Cancel`
  - `:32,34` (toast calls) — `title: "Material deleted"`, `title: "Could not delete material"`
- **Recommendation:** Route the remaining literals through `t()`; DICT already has `common.cancel`, `materials.*` entries to reuse for some of these.
- **Complexity:** Low.

### I18N-006 — MEDIUM — `DashboardPrimitives.tsx` `StudentBookingRow` mixed usage (P2)

- **File:** `app/dashboard/components/DashboardPrimitives.tsx` — `useI18n`'s `t` is in scope (line 201) and used for one field (`t("dash.noteHint")`, line 254), but adjacent buttons in the same component are hardcoded despite exact-match DICT keys already existing and unused right next to them:
  - `:255` — `Save Note` / `Cancel` (DICT: `dash.action.saveNote` = "Save note", `common.cancel` = "Cancel")
  - `:262` — `Mark Paid` (DICT: `dash.action.markPaid` = "Mark paid")
  - `:263` — `Mark Attended` (DICT: `dash.action.markAttended` = "Mark attended")
  - `:264` — `No Show` (DICT: `dash.action.noShow` = "No-show")
  - `:265` — `"Edit Note"` / `"Add Note"` (DICT: `dash.action.addNote`/`dash.action.editNote` exist)
  - `:240-242` — `Email`, `WhatsApp`, `"Free"` (fallback when `amountEgp` is falsy) all hardcoded
  - `:185` — label `Notes` hardcoded
- **Recommendation:** Swap literals for the already-defined `t()` calls — this is the fastest fix in the whole audit since no new DICT keys are needed.
- **Complexity:** Low.

### I18N-007 — LOW — `ClassFilters.tsx` demo/example chips are hardcoded (P3)

- **File:** `app/classes/components/ClassFilters.tsx:175-178` — an "Active filters" example row hardcodes `Active filters`, `Mathematics`, `Online` even though the rest of the file (and sibling `ClassFilterBottomSheet.tsx`) is properly localized via `t()`.
- **Recommendation:** Localize or remove if this is dead/preview markup.
- **Complexity:** Low.

### Lower-priority / internal-facing (noted, not detailed)

- `app/classes/[id]/book/BookingCheckout.tsx`'s `ClassSummaryCard`/`PriceRow`/`PaymentOption` sub-components (part of I18N-001, same file).
- `app/admin/AdminClient.tsx` and `app/admin/components/*` (platform super-admin, internal, English-only — consistent with Center Admin being deprioritized per `REMAINING_LIMITATIONS.md` §3, arguably the platform admin module should be listed there too for completeness).
- `app/ClassSearch.tsx` and `app/classes/ClassClient.tsx` — both entirely English-hardcoded, but `ClassSearch.tsx` is only consumed by `app/admin/AdminClient.tsx` (internal), and `ClassClient.tsx` is **dead code** (not imported by any page — superseded by `ClassesClient.tsx`). Neither is user-facing; flagged only so they aren't mistaken for live surfaces in a future pass.
- `app/book/BookClient.tsx` / `BookMobile.tsx` (910+ lines, no i18n) — not linked from any nav or `href="/book"` reference found in the codebase; appears to be an orphaned legacy route. Confirm it's actually unreachable before deprioritizing further, or remove it.

---

## 3. RTL layout correctness

Overall RTL handling is **better than average** for this class of codebase: the project mostly avoids Tailwind physical-direction utilities (`ml-`/`mr-`/`pl-`/`pr-` grep returned zero hits in `className`), uses inline `style` objects, and several components already correctly use logical CSS properties — `LangToggle.tsx:15` uses `insetInlineStart`, `DashboardMaterials.tsx:156` uses `insetInlineEnd`. `app/globals.css:229-249` centralizes `[dir="rtl"]`/`:lang(ar)` overrides (direction, text-align, font-family, line-height) at the global level rather than per-component, which is the right pattern.

That said, several `position: absolute` usages hardcode physical `left`/`right` instead of logical `insetInlineStart`/`insetInlineEnd`, which will **not** mirror under `dir="rtl"`:

- **RTL-001 (MEDIUM, P2):** `app/classes/[id]/book/BookingCheckout.tsx:638-639,727` — calendar-highlight CSS (`right: 16.5%; left: 16.5%;`, `left: 9px`) inside the same file already flagged in I18N-001. Since this file is getting reworked anyway, fold the fix in.
- **RTL-002 (LOW, P3):** `app/ClassSearch.tsx:369,398,177` — search icon `left: 16`, clear button `right: 14`, loading-bar `left: 0; right: 0`. Lower priority since this component is admin-only (see I18N section), but worth fixing if `ClassSearch.tsx` is ever promoted back to a student-facing surface.
- **RTL-003 (LOW, P4):** `app/unauthorized/page.tsx:16-17` and `app/centers/[id]/CenterProfileClient.tsx:242-243` — decorative background-blob positioning (`top/left`, `bottom/right`). These are symmetric-enough decorative elements that mirroring is cosmetic, not functional — low priority.
- **RTL-004 (LOW, P4):** `app/admin/AdminClient.tsx` (multiple `left`/`right` in chart margins and decorative elements) — internal admin surface, not currently bilingual, lowest priority.

**Icon direction (arrows/chevrons):** grep found 32 files using `ArrowLeft`/`ArrowRight`/`ChevronLeft`/`ChevronRight` from `lucide-react`, but only 5 of them apply any `lang`/`dir`-conditional transform:

- **Correctly RTL-aware:** `app/messages/[threadId]/ThreadClient.tsx:76` — `style={{ transform: dir === "rtl" ? "scaleX(-1)" : undefined }}` on its back arrow. This is the reference pattern other components should copy.
- **Not RTL-aware despite being directional "back" affordances:** `app/classes/[id]/book/BookingCheckout.tsx:178` (`<ArrowLeft>` for "Back to class") and `app/classes/[id]/ClassDetailClient.tsx:601` (`<ArrowLeft>` for "Back to classes", already flagged in I18N-002) both point a fixed direction regardless of `dir`. `app/centers/[id]/admin/CenterAdminBookings.tsx` (pagination `ChevronLeft`/`ChevronRight`) and `app/components/landing/LandingCards.tsx`/`HeroSection.tsx` (carousel arrows) do reference `lang`/`dir` elsewhere in the file but were not verified to apply it specifically to the chevrons — worth a manual check if the carousel arrows are reported as pointing the wrong way in Arabic.
- **Correctly non-flipping (as expected):** the Coursaty logo (`CoursatyLogo`) is not in the arrow/chevron grep and is treated as a brand mark, not a directional icon — no issue found there.

**Recommendation:** Standardize on a small `useRtlFlip()` helper (or a `<DirectionalIcon>` wrapper) that applies `scaleX(-1)` for icons that encode "previous/next/back/forward" semantics, and audit the 32 call sites against it. Start with I18N-001/002's back arrows since those files are already being touched.

---

## 4. Number/date/currency formatting

The dashboard and center-admin surfaces mostly do this correctly — `DashboardStats.tsx`, `DashboardRevenue.tsx`, `DashboardPayouts.tsx`, `DashboardReviews.tsx`, `ThreadClient.tsx`, `MessagesClient.tsx`, and `SecuritySettings.tsx` all thread a `locale` variable (`lang === "ar" ? "ar-EG" : "en-EG"`) into `toLocaleDateString`/`toLocaleString`/`toLocaleTimeString`. `app/api/bookings/[id]/receipt/route.ts:41` correctly uses `"en-EG"` server-side for the receipt (English by design, but at least EG-flavored formatting, not `en-US`).

Issues found:

### FORMAT-001 — MEDIUM — `ClassCard`/`ClassClient`/`ClassSearch` prices use un-locale-aware `.toLocaleString()` (P2)

- **Evidence:** `app/classes/components/ClassCard.tsx:246`, `app/classes/ClassClient.tsx:225`, `app/ClassSearch.tsx:257` all call `price.toLocaleString()` with **no locale argument**, so formatting falls back to the browser/runtime default locale rather than the site's active `lang` (`ar-EG`/`en-EG`). Since Arabic-Indic numerals are not used by `ar-EG` for these components' contexts this mostly self-corrects to Western digits either way, but it's inconsistent with the pattern used everywhere else in the dashboard (`common.priceEgp` + `toLocaleString(locale)`), and does not respect a browser locale that differs from the site's toggle state (e.g., an Egyptian visitor with an `en-US` browser but the site set to Arabic would get English digit grouping despite reading Arabic UI).
- **Recommendation:** Route through the existing `common.priceEgp` DICT key (already used elsewhere: `t("common.priceEgp", { price: price.toLocaleString(numLocale) })`) for consistency, once I18N-003 wires these components to `useI18n` anyway.
- **Complexity:** Low (bundled with I18N-003).

### FORMAT-002 — MEDIUM — `TutorProfileClient.tsx` hardcodes `en-US` for review dates despite using `t()` elsewhere (P2)

- **Evidence:** `app/tutors/[id]/TutorProfileClient.tsx:187` — `new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })`. This file imports `useI18n` and uses `t()` extensively (line 238) but this one date format is hardcoded to `en-US` — a genuine mixed-usage bug: an Arabic-language tutor profile page will still show review dates in English month names.
- **Recommendation:** Replace `"en-US"` with `lang === "ar" ? "ar-EG" : "en-EG"` matching the pattern in `DashboardReviews.tsx`/`DashboardPayouts.tsx`.
- **Complexity:** Low.

### FORMAT-003 — LOW — `ReviewSection.tsx` hardcodes `en-US`, no i18n at all (P3)

- **Evidence:** `app/components/ReviewSection.tsx:329` — `new Date(review.createdAt).toLocaleDateString("en-US", {...})`. This component doesn't use `useI18n` at all, so this isn't "mixed usage" in the strict sense, but it's the same underlying bug — confirm whether `ReviewSection.tsx` is rendered on a student-facing page (tutor/class profile) before triaging priority.
- **Complexity:** Low.

### FORMAT-004 — LOW — `app/dashboard/bookings/page.tsx` and `DashboardPrimitives.tsx` hardcode `"en-EG"` unconditionally (P3)

- **Evidence:** `app/dashboard/bookings/page.tsx:138` — `new Date(booking.paidAt).toLocaleString("en-EG")`; `app/dashboard/components/DashboardPrimitives.tsx:251` — `new Date(booking.paidAt).toLocaleString("en-EG")`. Both always use `en-EG` regardless of active `lang`, so Arabic-mode dashboards still show English month names for paid-at timestamps even though the rest of the dashboard (`DashboardStats`, `DashboardRevenue`, etc.) correctly switches to `ar-EG`.
- **Recommendation:** Thread `lang`/`locale` through, matching the sibling dashboard components.
- **Complexity:** Low.

### FORMAT-005 — INFO — Center Admin module's "English-only" status is not quite accurate for dates (P4, informational)

- **Evidence:** `app/centers/[id]/admin/CenterAdminBookings.tsx:173` and `CenterAdminStudents.tsx:138` both do `new Date(...).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-EG")`, and `CenterAdminRevenue.tsx` threads a `numLocale` variable into `toLocaleString(numLocale)` for revenue figures. This means that if a center admin toggles the global language switch to Arabic, **dates and numbers in the (documented-as-English-only) Center Admin module will render in Arabic locale formatting while all surrounding labels stay in English** — a small but real inconsistency, not previously called out. `REMAINING_LIMITATIONS.md` §3's characterization ("hardcodes English throughout") is accurate for *text* but not for *number/date formatting*, which is partially locale-aware. Worth a one-line addendum to that doc rather than a full remediation item, since full remediation (localizing the whole module) is already tracked there.

**Confirmed still accurate from `REMAINING_LIMITATIONS.md`:** Center Admin text labels (buttons, headers, table columns) are indeed still 100% English across all 8 `CenterAdmin*.tsx` files — verified via the same grep pass; no drift since the June 12 pass on that front.

---

## 5. Terminology consistency

| Concept | EN label(s) found | AR label(s) found | Consistent? |
|---|---|---|---|
| Tutor | "Tutor" (`nav.tutors`, `role.tutor`, `dash.role.TUTOR`) | مدرّس / المدرسون | Yes — consistently مدرّس/مدرّسون throughout. |
| Class | "Class"/"Classes" (`nav.classes`, `common.classes`, `dash.tab.classes`) | فصل / الفصول | Yes — consistently فصل(الفصول), never conflated with "course" in AR. |
| Course | Not used as a distinct concept in the DICT (no `course.*` namespace) | — | N/A — the product consistently says "class," never "course," in English either. No EN/AR drift found here. |
| Session / Lesson | "session" used generically (booking, security, payouts) | Two different words used for "session" depending on context: **حصة** (`booking.checkout.onlineSession`, `booking.checkout.scheduleBody`) vs **جلسة** (`landing.perSession`, `dash.payouts.empty`, `tutor.sessions`, `security.activeSessions`) | **TERM-001 — LOW, P3: Inconsistent.** حصة (a school "period/lesson") is used for teaching-session contexts, جلسة (a generic "sitting/session," also used for login sessions) is used for booking/earning contexts. Not wrong per se (both are legitimate Arabic words) but there's no discernible rule for which concept gets which word — e.g. `tutor.sessions` (a tutor's *class* count) uses جلسة while `booking.checkout.onlineSession` (also a class) uses حصة. Recommend picking one term for "class session" (حصة reads more naturally for an academic context) and reserving جلسة for account/login sessions only. |
| Student | "Student" (`role.student`, `dash.role.STUDENT`) | طالب | Yes — consistent. |
| Parent | Not modeled as a distinct role in the DICT; "parent" appears only in testimonial copy (`auth.shell.author1`: "Mona, parent in Cairo" → "منى، ولية أمر من القاهرة") | ولي أمر / ولية أمر | Consistent where it appears, but note the product has no distinct Parent role/account type — parents use the Student role. Not a bug, just worth flagging as a modeling note if Parent-specific features are ever planned. |
| Booking | "Booking"/"Bookings" (`nav.bookings`, `dash.tab.bookings`, `booking.*`) | حجز / حجوزات / الحجز | Yes — consistent. |
| Enrollment | "Enrollment"/"Enrolled" (`dash.section.topEnrollments`, `dash.enrolled`) | تسجيل / تسجيلات / مسجّل | Mostly consistent, though "enrolled" (`dash.enrolled` → مسجّل) and "Booking" (حجز) are two different English *and* Arabic words for what is functionally the same underlying `Booking` DB record in this product (there's no separate Enrollment entity). Low-priority conceptual overlap, not a translation bug. |
| Center | "Center"/"Centers" (`nav.centers`, `roles.centers`) | مركز / المراكز | **TERM-002 — LOW-MEDIUM, P2-P3: Inconsistent.** `dash.role.CENTER_ADMIN` (`app/components/i18n.tsx:437`) translates "Center Admin" → **مدير مركز** (proper Arabic "center"), while `role.center_admin` (`app/components/i18n.tsx:624`) translates "Center admin" → **مدير سنتر** (colloquial/Franco-Arabic transliteration of "center," common in spoken Egyptian Arabic but inconsistent with the formal مركز used everywhere else in the product, including `nav.centers`, `roles.centers`, `landing.trust.centers`). Two DICT keys for the same real-world role label, disagreeing on register/word choice. Recommend standardizing on مدير مركز and updating `role.center_admin` to match — check both keys' call sites first to confirm which one is actually user-visible in the role display before editing. |

---

## 6. Content quality (placeholder/test content)

- No `lorem ipsum`, `dolor sit amet`, `test test`, `asdf`, `foobar`, or similar filler text found anywhere in `app/` (component defaults, DICT values, or seed data).
- No leaked `TODO`/`FIXME`/"coming soon" placeholder markers found in user-facing copy (`grep` found exactly one `// TODO` in `app/generated/prisma/runtime/library.d.ts`, which is Prisma-generated code, not product content — not counted).
- **The one real content-quality issue** is the demo data reintroduced in the checkout regression (I18N-001): `app/classes/[id]/book/BookingCheckout.tsx:93-94` defaults the student-name and school fields to `"Omar Hossam"` / `"IGCSE - Al Nafees International School"` — these look like seed/test fixtures that leaked into the live component and will silently populate every real booking's `note` field unless a user overwrites them. Already covered under I18N-001's recommendation.

---

## 7. Arabic typography

- **`app/layout.tsx:2,19-23`** — `Cairo` is loaded via `next/font/google` with `subsets: ["arabic", "latin"]` and `display: "swap"`, assigned to CSS variable `--font-cairo`. This is correct: Cairo is a purpose-built Arabic/Latin superfamily (not a Latin font falling back to a system Arabic font), which avoids the classic "inconsistent weight/x-height between EN and AR" problem this check is meant to catch.
- **`app/globals.css:225,229-236`** — headings (`h1`, `.page-title`, `.display-heading`) use `var(--font-serif)` (presumably `Lora`, also loaded in `layout.tsx:25-29`) by default, but switch to `var(--font-arabic)` (Cairo) under `:lang(ar)`/`[dir="rtl"]`. This is the right pattern — it means Arabic headings don't inherit a serif Latin font that has no/poor Arabic glyph coverage.
- **`app/globals.css:246-249`** — `:lang(ar)` bumps `line-height` to `1.8` and resets `letter-spacing` to `0`, both correct adjustments for Arabic (Latin letter-spacing tightening looks broken applied to Arabic joined script; Arabic generally needs more line-height for diacritics/ligature stacking).
- **No issues found** in font configuration. This is one of the stronger parts of the i18n implementation.

---

## Summary table

| ID | Area | Severity | Priority | Complexity |
|---|---|---|---|---|
| I18N-001 | Booking checkout regression (fake calendar + hardcoded EN) | CRITICAL | P0 | Medium |
| I18N-002 | Class detail page has zero i18n | HIGH | P1 | Medium-High |
| I18N-003 | `ClassCard` (site-wide component) has zero i18n | HIGH | P1 | Low |
| I18N-004 | Center public profile page has zero i18n | HIGH | P1 | Medium |
| I18N-005 | `DashboardMaterials.tsx` mixed usage | MEDIUM | P2 | Low |
| I18N-006 | `DashboardPrimitives.tsx` `StudentBookingRow` mixed usage | MEDIUM | P2 | Low |
| I18N-007 | `ClassFilters.tsx` example chips hardcoded | LOW | P3 | Low |
| RTL-001 | BookingCheckout calendar CSS uses physical left/right | MEDIUM | P2 | Low (bundle w/ I18N-001) |
| RTL-002 | `ClassSearch.tsx` physical left/right (admin-only) | LOW | P3 | Low |
| RTL-003 | Decorative blob positioning, physical left/right | LOW | P4 | Low |
| RTL-004 | Admin chart margins, physical left/right | LOW | P4 | Low |
| Icon-RTL | Back-arrow icons not flipped (BookingCheckout, ClassDetailClient) | MEDIUM | P2 | Low |
| FORMAT-001 | ClassCard/ClassClient/ClassSearch price formatting locale-blind | MEDIUM | P2 | Low (bundle w/ I18N-003) |
| FORMAT-002 | TutorProfileClient review dates hardcoded en-US | MEDIUM | P2 | Low |
| FORMAT-003 | ReviewSection hardcoded en-US, no i18n | LOW | P3 | Low |
| FORMAT-004 | dashboard/bookings & DashboardPrimitives hardcode en-EG | LOW | P3 | Low |
| FORMAT-005 | Center Admin dates/numbers partially locale-aware despite EN-only text | INFO | P4 | N/A (doc update) |
| TERM-001 | حصة vs جلسة used inconsistently for "session" | LOW | P3 | Low |
| TERM-002 | "Center Admin" translated two ways (مدير مركز vs مدير سنتر) | LOW-MEDIUM | P2-P3 | Low |

**No issues found:** DICT fallback behavior, global RTL CSS architecture, Arabic font loading (Cairo w/ arabic subset), Navbar/MobileBottomNav localization, placeholder/lorem-ipsum content (clean), Center Admin text-localization status (confirmed unchanged from documented state).
