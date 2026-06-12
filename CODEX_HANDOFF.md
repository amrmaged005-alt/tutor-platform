# Codex Handoff - UI/UX Overhaul Complete

## Status

The Coursaty frontend overhaul is implemented and verified across the Next.js web app and the existing Flutter mobile surfaces. The worktree already contained a broad mixed set of edits before the final pass, so no commit was created.

## Completed

- Unified semantic design tokens in `app/globals.css`, including dark-mode parity, spacing, type scale, surface, ring, and z-index tokens.
- Replaced remote font stylesheets with `next/font/google`: Inter for product UI, Cairo for Arabic, and Lora for English display headings.
- Synced `DESIGN.md` and `.impeccable/design.json` with the live typography contract.
- Preserved the generated study imagery already integrated under `public/higgsfield/` and `public/landing/`.
- Removed route-level system-font overrides and legacy `--color-*` aliases.
- Fixed theme hydration by keeping the first React render deterministic while the inline bootstrap paints the saved theme before hydration.
- Added stable names and accessible labels to class and tutor marketplace filters.
- Scoped ESLint away from generated/plugin/cache directories and removed the remaining code warnings.

## Booking Flow

- `/classes/[id]/book` is the canonical checkout route.
- Class detail now routes authenticated booking actions into that checkout.
- `/book` remains intentionally available as a branded interactive story page; it is not a duplicate checkout.
- Checkout uses real class schedule data instead of fabricated calendar slots.
- Tutor profiles use real stored schedule data instead of the removed May 2025 calendar.
- Checkout reads the API `paymentUrl` response and keeps Flutter compatibility.
- `/api/bookings` accepts browser sessions and mobile bearer tokens.
- Online-only classes cannot be downgraded to cash payment.
- Duplicate bookings return a friendly existing-booking state before capacity errors.
- Existing-booking recovery includes dashboard, booking, and message-tutor actions.

## Verification

Passed on May 31, 2026:

```powershell
npx prisma generate
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Browser smoke tests passed with Chrome DevTools at desktop and `390x844` mobile widths:

- `/`
- `/login`
- `/classes`
- `/tutors`
- `/tutors/cmm6mnt9t0000v2d4t7iaszhw`
- `/classes/cmm70h0af0001v2ascgxpy244`
- `/classes/cmm70h0af0001v2ascgxpy244/book`
- `/global-states`
- `/book`
- `/centers` authentication redirect

Verified: no horizontal overflow, quiet browser console, dark-mode rendering, Arabic RTL direction, Cairo Arabic heading font, Lora English display font, sign-in modal callback, direct checkout redirect, and unauthenticated `GET /api/bookings` returning `401 {"error":"Sign in is required."}`.

## Notes

- Prisma still reports that `package.json#prisma` is deprecated because `prisma.config.ts` now overrides it. This is non-blocking cleanup for a later maintenance pass.
- Full paid checkout requires real Paymob credentials and an authenticated student session, so the external payment redirect was verified by code path and contract rather than a live charge.
- Screenshots from the rendered pass are in `output/overhaul/`.
