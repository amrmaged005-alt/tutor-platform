# Remaining Limitations — Coursaty UI/UX Overhaul

This document records known gaps after the initial overhaul pass (verified May 31, 2026).
Each limitation is scoped, explained, and has a clear remediation path.

---

## 1. Dashboard Sub-Panels Not Yet Localized

**Status:** Partial — the i18n infrastructure is fully established (`app/components/i18n.tsx`,
`DICT` object, `useI18n` hook, `coursaty-lang` localStorage, `dir`/`lang` on `<html>`),
but the following components still hardcode English user-facing strings:

| Component | Location |
|---|---|
| `DashboardChecklist` | `app/dashboard/components/DashboardChecklist.tsx` |
| `DashboardClasses` | `app/dashboard/components/DashboardClasses.tsx` |
| `DashboardRevenue` | `app/dashboard/components/DashboardRevenue.tsx` |
| `DashboardPayouts` | `app/dashboard/components/DashboardPayouts.tsx` |
| `DashboardReviews` | `app/dashboard/components/DashboardReviews.tsx` (if present) |
| `DashboardMessages` | `app/dashboard/components/DashboardMessages.tsx` (if present) |
| Favorites | `app/favorites/page.tsx` |
| Referral | `app/referral/page.tsx` |
| Create Class | `app/create-class/CreateClassForm.tsx` |

**Remediation (mechanical follow-up):**
The pattern is established — for each file:
1. Import `useI18n` from `app/components/i18n.tsx`.
2. Identify all hardcoded English strings visible to the user.
3. Add each string to the `DICT` object with an accurate Arabic (`ar`) translation.
4. Replace the hardcoded strings with `t('key')` calls.

This is a mechanical, low-risk follow-up with no architectural changes required.
Estimated effort: 2–4 hours per developer once translations are confirmed.

**Impact if left as-is:** Users who switch to Arabic see English text inside dashboard
sub-panels despite the rest of the UI being in Arabic. Navigation, landing, auth, and
booking flows are all correctly localized.

---

## 2. Real Date/Time Scheduling (Option A) Was Deliberately Not Built

**Status:** Option B (honest MVP) is implemented. The booking checkout's Schedule step
displays the class's real `schedule` field from the database and honest copy:
"Your tutor will confirm the exact session time after booking."
No fake calendar or hardcoded May 2025 dates remain.

**What Option A would require (if ever needed):**
- Extend the Prisma `Booking` model with `scheduledAt DateTime?` and `studentName String?`.
- Run `prisma db push` to apply the schema change.
- Lift `selectedDay`, `selectedTime`, and student fields into `BookingCheckout` state.
- Validate all three fields before allowing the POST.
- Update `app/api/bookings/route.ts` to accept and persist `scheduledAt`.
- Derive real available dates from the class `schedule` string (or add a structured
  `availableDates` field to the `Class` model).
- Update the Flutter mobile API contract to accept `scheduledAt` — grep
  `flutter_application_1/` before touching the shape.

**Decision:** Option A is a feature sprint, not a hotfix. It requires schema changes,
Flutter coordination, and a calendar UX design decision. Defer to a dedicated sprint
after the current overhaul is shipped and validated.

**Impact if left as-is:** Students book a class without selecting a specific date/time.
Tutors coordinate timing directly after booking (common in the Egyptian tutoring market).
The honest copy in the Schedule step sets this expectation correctly.

---

## 3. `package.json#prisma` Deprecation Warning

**Status:** `npm run build` passes and is non-blocking, but emits:

```
warn  The `prisma` key in `package.json` is deprecated
      because `prisma.config.ts` now overrides it.
```

**Root cause:** Both `package.json` (with a `"prisma": { ... }` block pointing to the
schema or seed script) and `prisma.config.ts` are present. Once `prisma.config.ts` exists,
Prisma ignores the `package.json` block but logs a deprecation warning.

**Remediation:**
1. Open `package.json` and locate the `"prisma"` top-level key.
2. Verify that every option inside it is already reflected in `prisma.config.ts`.
3. Remove the `"prisma"` key from `package.json`.
4. Run `npx prisma generate` and `npm run build` to confirm no regressions.

**Estimated effort:** < 15 minutes. Safe to do in isolation with a `chore:` commit.

**Impact if left as-is:** Warning noise in build output only. No runtime behavior is
affected; `prisma.config.ts` takes precedence.

---

*Last updated: June 12, 2026.*
*Next review: after FABLE_UI_PROMPT_V2 pass is complete.*
