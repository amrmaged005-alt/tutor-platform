# Remaining Limitations — Coursaty UI/UX Overhaul

Updated June 12, 2026 after the V2 pass. Items 1 and 3 from the previous revision are
**resolved**; this file now records what is still open.

---

## RESOLVED in the V2 pass (June 12, 2026)

1. **Dashboard sub-panel i18n — DONE.** DashboardChecklist, DashboardClasses,
   DashboardRevenue, DashboardPayouts, DashboardReviews, DashboardMessages,
   DashboardStats (labels, greeting, week range), FavoritesClient, ReferralClient,
   and CreateClassForm are fully localized EN/AR (~130 new DICT keys). Dates and
   numbers follow the active locale (`ar-EG`/`en-EG`).
2. **`package.json#prisma` deprecation — DONE.** The `prisma` block was removed from
   `package.json`; the seed command lives in `prisma.config.ts` (`migrations.seed`).
3. **Center tutor access levels — SHIPPED.** `CenterAccessLevel` enum
   (FULL / LIMITED / VIEW_ONLY) on `User`, PATCH endpoint, admin dropdown, and the
   member "My Role" banner on center profiles. Migration `add_center_access_level`
   applied to Supabase via MCP.

---

## 1. AI Image Generation Blocked (No Credits)

**Status:** The V2 spec (§4.6) calls for AI-generated imagery in 8+ locations.
Higgsfield account has **0.92 credits on the free plan; each image costs ~2 credits**,
so no new images could be generated this pass. Existing brand-consistent assets under
`public/higgsfield/` and `public/landing/` (11 images) remain in use.

**Queued generations (run when credits are available):**

| Target file | Prompt summary |
| --- | --- |
| `public/landing/cairo-skyline-golden-hour.jpg` | Photorealistic golden-hour Cairo panorama, Giza pyramids mid-distance, minarets + modern towers, warm amber sky, cinematic architectural photography, 16:9 ≥1200px |
| `public/assets/empty-state-book.webp` | Open book with question mark, academic papyrus aesthetic, warm ivory tones |
| `public/assets/404-books.webp` | Stack of books / scattered papers, warm sepia |
| `public/assets/error-book-warning.webp` | Open book with warning triangle, atmospheric light |
| `public/assets/subjects/{math,arabic,physics,...}.webp` | Per-subject academic imagery (equations on blackboard, calligraphy, telescope, ...) |
| `public/landing/center-classroom.webp` | Egyptian academic center / classroom interior |

Rules per spec §4.6: photorealistic or high-quality illustration, warm ivory/emerald/stone
palette, Egyptian academic context, AVIF/WebP, explicit dimensions, alt text, dark-mode-safe
overlays. The login page currently uses the `CairoSkyline` SVG linework + editorial panel,
which already reads on-brand.

---

## 2. Real Date/Time Scheduling (Option A) Was Deliberately Not Built

**Status:** Option B (honest MVP) is implemented. The booking checkout's Schedule step
displays the class's real `schedule` field from the database and honest copy:
"Your tutor will confirm the exact session time after booking."
No fake calendar or hardcoded May 2025 dates remain.

**What Option A would require (if ever needed):**
- Extend the Prisma `Booking` model with `scheduledAt DateTime?` and `studentName String?`.
- Apply the schema change (Supabase MCP `apply_migration` works when direct 5432 is unreachable).
- Lift `selectedDay`, `selectedTime`, and student fields into `BookingCheckout` state.
- Validate all three fields before allowing the POST.
- Update `app/api/bookings/route.ts` to accept and persist `scheduledAt`.
- Derive real available dates from the class `schedule` string (or add a structured
  `availableDates` field to the `Class` model).
- Update the Flutter mobile API contract to accept `scheduledAt` — grep
  `flutter_application_1/` before touching the shape.

**Decision:** Option A is a feature sprint, not a hotfix. Defer to a dedicated sprint.

**Impact if left as-is:** Students book a class without selecting a specific date/time.
Tutors coordinate timing directly after booking (common in the Egyptian tutoring market).

---

## 3. Center Admin Module Is English-Only

The `/centers/[id]/admin` dashboard (CenterAdminClient + tab components) hardcodes
English throughout. It is an internal admin surface, so it was deprioritized behind the
student/tutor-facing i18n. Remediation: same DICT + `useI18n` pattern, namespaced
`centerAdmin.*`.

---

## 4. Tutor Access Levels Are Stored but Not Yet Enforced

`User.centerAccessLevel` is persisted and manageable by center admins, and surfaced to
the tutor ("My Role" banner). Enforcement (e.g. hiding revenue panels from LIMITED
tutors, blocking edits for VIEW_ONLY) is not yet wired into the dashboard queries/UI.
Enforce in `app/dashboard/*` and center booking APIs in a follow-up.
