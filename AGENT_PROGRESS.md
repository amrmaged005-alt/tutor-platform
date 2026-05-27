# Agent Progress — Coursaty Backend Pass

| # | Target | Status |
|---|--------|--------|
| 1 | Trending Classes API | ✅ |
| 2 | Waitlist model, migration, API | ✅ |
| 3 | Session Package model, migration, API | ✅ |
| 4 | Profile Completeness Score API | ✅ |
| 5 | Search Suggestions verify + enhance | ✅ |
| 6 | Tutor Analytics API | ✅ |
| 7 | Reviews: enforce moderation on all endpoints | ✅ |
| 8 | next/image full migration | ✅ |
| 9 | Performance audit + cache headers | ✅ |
| 10 | Security audit of all API routes | ✅ |
| 11 | Waitlist email notification template | ✅ |
| 12 | Promo Code / Discount System | ✅ |
| 13 | Tutor Review Response API | ✅ |
| 14 | Student Attendance Tracking API | ✅ |
| 15 | Notification Preferences API | ✅ |
| 16 | Center Management APIs (list/tutors/stats) | ✅ |
| 17 | Data Export API (CSV) | ✅ |
| 18 | Referral System (codes + wallet credit) | ✅ |
| 19 | Tutor Onboarding Checklist API | ✅ |
| 20 | Advanced Search API (unified) | ✅ |
| 21 | Platform Fee Configuration API | ✅ |
| 22 | Payout System (dashboard + admin status mgmt) | ✅ |
| 23 | Webhook hardening + seat-lock cleanup cron | ✅ |
| 24 | Mobile API completeness (classes/search/favs/notifs/me) | ✅ |

## Pre-flight verification
- Schema migrations (schedule, moderation, favorites, messaging): ✅
- Hooks: ✅
- API routes (favorites, tutors, similar, materials, receipt, refund, recommendations, messaging): ✅
- Google OAuth: ✅
- Zod validation schemas: ✅
- API error format: ✅
- Admin review moderation + refund tabs: ✅
- Search suggestions: ✅ (response shape update needed — Target 5)

## Issues found during verification
- `app/api/reviews/route.ts` GET: missing `isApproved: true` filter — fix in Target 7
- `app/api/reviews/route.ts` POST: missing `isApproved: false` on create — fix in Target 7

## Codex Frontend Targets

- [x] Target 1 - Split Landing.tsx
- [x] Target 2 - Split DashboardClient.tsx
- [x] Target 3 - Split ClassesClient.tsx
- [x] Target 4 - Favorites Heart on Every Card
- [x] Target 5 - /favorites Page
- [x] Target 6 - Post-Class Materials: Tutor Upload UI
- [x] Target 7 - Post-Class Materials: Student View
- [x] Target 8 - Receipt Download Button
- [x] Target 9 - Refund Request Modal
- [x] Target 10 - Verified Badge
- [x] Target 11 - Similar Classes Row
- [x] Target 12 - Recommendations Section on Landing
- [x] Target 13 - In-App Messaging UI
- [x] Target 14 - Availability Calendar on Tutor Profile
- [x] Target 15 - Sticky "Book Now" CTA on Mobile
- [x] Target 16 - Trending This Week Section
- [x] Target 17 - Waitlist UI
- [x] Target 18 - Session Package Booking UI
- [x] Target 19 - Mobile 2-Column Grids
- [x] Target 20 - Mobile Class Detail Stacking
- [x] Target 21 - Mobile Tutor Profile Tightening
- [x] Target 22 - Mobile Bottom Navigation Bar
- [ ] Target 23 - Mobile Filter Bottom Sheet
- [ ] Target 24 - Page Transition Animations
- [ ] Target 25 - Accessibility Pass
- [ ] Target 26 - i18n Completion
