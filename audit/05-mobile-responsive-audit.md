# 05 — Mobile / Responsive Audit

**Method: static code analysis only.** No Playwright or other browser-automation tool was available in this environment. Nothing below reflects an actual rendered layout at any breakpoint, a real touch interaction, real on-screen-keyboard behavior, or real scroll/animation performance on a device. All findings are inferred from reading Tailwind class usage, component structure, and CSS files. Where a finding says a layout "should" or "will likely" behave a certain way, treat that as a code-reading inference, not a verified observation. This audit could not verify:
- Actual rendered layout at 320/375/768/1024/1440px
- Real touch target hit-testing (computed padding vs. actual tappable area including any invisible hit-slop)
- Real mobile browser chrome behavior (address bar collapse/expand affecting `100vh`, iOS Safari bottom bar overlaying fixed elements)
- Real on-screen keyboard appearance/resize behavior on form-heavy pages
- Real scroll performance / jank
- Cross-browser differences (Safari iOS vs Chrome Android)

Findings are still being gathered below; this file is being written incrementally.

---

## 1. Global setup

**Viewport meta** (`app/layout.tsx:86`): `<meta name="viewport" content="width=device-width, initial-scale=1" />` — standard, no `maximum-scale=1` or `user-scalable=no` lockout, which is good for accessibility (pinch-zoom remains available).

**Breakpoints** (`tailwind.config.ts`): no custom `screens` override — project uses Tailwind's default breakpoints (`sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`). No project-specific breakpoint tokens found.

**Root layout structure** (`app/layout.tsx:94-99`): `Navbar`, `main`, `FooterContent`, `MobileBottomNav` are siblings rendered unconditionally — `MobileBottomNav` is a separate always-mounted component (likely CSS-hidden above a breakpoint) rather than conditionally rendered via JS media query. Need to confirm inside the component itself.

---

## 2. Navigation

Two independent, differently-triggered mobile nav patterns coexist:

### 2a. Top nav → hamburger drawer (`components/NavbarClient.tsx`)
- Desktop nav links (`nav.desktop-only`) vs. hamburger button (`.mobile-only`) toggle via a **CSS media query at `max-width: 768px`** (`app/globals.css:894-896`) — this is a clean, flash-free CSS-only breakpoint (no hydration flash).
- Hamburger opens `MobileDrawer`, a right-side slide-in panel (`width: min(88vw, 360px)`) built with framer-motion, `role="dialog" aria-modal="true"`, a focus trap (`useFocusTrap`), Escape-to-close, and body-scroll lock while open (`NavbarClient.tsx:109-125`). This is a solid, accessible implementation.
- **RTL**: drawer uses `insetInlineEnd: 0` and `borderInlineStart` (logical properties) — correctly flips to the left edge in RTL (`NavbarClient.tsx:156-159`). Good.
- Top navbar is entirely hidden (`return null`) on any `/dashboard` or `/settings` route (`NavbarClient.tsx:401`) — dashboard pages must supply their own header/nav (see §6).

### 2b. Bottom tab bar (`components/ui/MobileBottomNav.tsx`)
- Rendered independently at the root layout, always mounted, gated by `useIsMobile()` — a **JS `matchMedia` hook, default breakpoint 640px** (`app/hooks/useIsMobile.ts:5`), not a CSS media query.
- Correctly applies `env(safe-area-inset-*)` for left/right/bottom padding (`MobileBottomNav.tsx:96`) — good iOS notch/home-indicator handling.
- `useSyncExternalStore` with `getServerSnapshot() => false` means the bottom nav **always renders as absent on the server and first paint**, then pops in after hydration on real mobile devices. This is a deliberate no-mismatch-safe pattern (avoids hydration errors) but does mean a visible layout shift/flash-in on every mobile page load — see MOBILE-001.
- 5 equal-width grid items, each `height: 54`, icon 21px — reasonable touch target height; width is viewport/5 (e.g. ~75px at 375px width), comfortably above 44px minimum. Labels truncate with ellipsis at `maxWidth: 100%`.

### MOBILE-001 — Two independent, mismatched mobile-nav breakpoints
- **Severity**: Medium | **Priority**: P2
- **Evidence**: `app/globals.css:894` (`.mobile-only`/`.desktop-only` switch at `max-width: 768px`) vs. `app/hooks/useIsMobile.ts:5` (bottom nav switches at `max-width: 640px`, default param). Also `app/globals.css:894-901` unconditionally adds `.app-main { padding-bottom: calc(76px + env(safe-area-inset-bottom)) }` for the entire `≤768px` range even though the bottom nav (which that padding reserves space for) only renders `≤640px`.
- **Impact**: Viewports between 641px and 768px (e.g. small tablets in portrait, large phones in landscape, foldables) show the hamburger-drawer nav (tablet/mobile CSS breakpoint) but not the bottom tab bar, while still carrying ~76px of unused bottom padding on `<main>`. Not breaking, but an inconsistent, un-reviewed middle zone — genuinely large phones (e.g. many Android phones in landscape are 700-800px logical width) could show empty dead space at the bottom of every page. Cannot be visually confirmed without a live device.
- **Recommendation**: Standardize both mechanisms on the same breakpoint (either move `useIsMobile()`'s default to 768 to match the CSS cutoff, or move the `.mobile-only`/`.desktop-only` CSS switch to 640px). Tie the `.app-main` bottom padding to the same breakpoint/condition as the bottom nav's actual render condition.
- **Complexity**: S

### MOBILE-002 — Bottom nav pop-in after hydration (no SSR/CSS fallback)
- **Severity**: Low | **Priority**: P3
- **Evidence**: `app/hooks/useIsMobile.ts:15` (`getServerSnapshot` hardcoded to `false`); `components/ui/MobileBottomNav.tsx:45` (`if (!isMobile...) return null`).
- **Impact**: On every fresh mobile page load (especially over a slow connection, called out as relevant per project history of zero static generation), the bottom tab bar is absent until React hydrates and `matchMedia` resolves client-side, then appears. This is a minor CLS/flash on real devices, not verifiable statically beyond noting the SSR snapshot is unconditionally `false`.
- **Recommendation**: Consider a CSS-only fallback (render the nav server-side hidden behind a `@media` query, like the top-nav pattern already does) instead of a fully JS-gated mount, to eliminate the pop-in.
- **Complexity**: S

### MOBILE-003 — Hamburger/close icon buttons under the 44px touch-target guideline
- **Severity**: Low | **Priority**: P3
- **Evidence**: `components/NavbarClient.tsx:610-625` (hamburger `<button className="mobile-only" ... padding: 4>` wrapping a 22px icon → ~30px effective box); `components/NavbarClient.tsx:169-181` (drawer close button, `padding: 4` around a 20px icon → ~28px box).
- **Impact**: Both fall noticeably short of the ~44×44px WCAG 2.5.5/2.5.8 target size recommendation for primary navigation triggers. These are two of the highest-traffic tap targets on mobile (menu open/close).
- **Recommendation**: Increase padding to at least 10-12px (yielding ~44px+ boxes), or set explicit `minWidth`/`minHeight: 44`.
- **Complexity**: S

---

## 3. Filters & search — mobile bottom sheet

`app/classes/components/ClassFilterBottomSheet.tsx` is a genuinely well-built mobile filter pattern, distinct from the desktop sidebar (`ClassFilterControls` is shared/reused inside both — good DRY):
- Slide-up sheet (`y: "100%"` → `0`) with a native-feeling **drag-to-dismiss** gesture (`onTouchStart/Move/End`, closes if dragged down >80px) — a level of polish above a typical AI-generated bottom sheet.
- `role="dialog" aria-modal="true"`, focus trap (`useFocusTrap`), Escape-to-close, body-scroll lock while open — matches the same accessible-modal pattern used in the nav drawer.
- `maxHeight: "86vh"` with internal `overflowY: auto` on the filter body — sheet won't exceed viewport height even with many filter controls, avoiding an unreachable "Apply" button.
- Footer action bar (Clear / Apply) padded with `calc(14px + env(safe-area-inset-bottom))` — correctly reserves space for the iOS home indicator.
- **RTL**: uses `insetInlineStart`/`insetInlineEnd` logical properties throughout (`ClassFilterBottomSheet.tsx:91-92`) — consistent with the RTL audit's finding that logical properties are used correctly; holds at this mobile-specific component too.
- Close button (`ClassFilterBottomSheet.tsx:140`) has the same `padding: 4` around a 20px icon (~28px effective target) as the nav drawer close button — same touch-target shortfall, see MOBILE-003.

No separate review was done of the tutors/centers browse pages' filter UI beyond confirming they were not found reusing this exact component — a full inventory of every filter surface (tutors list, centers list) was not performed; this section covers the `/classes` browse page specifically, which was the pattern named in the task brief.

---

## 4. Cards & grids

`app/classes/components/ClassGrid.tsx` uses a fluid CSS Grid (`gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))"`) rather than fixed Tailwind `grid-cols-N` breakpoints — this is actually a more robust responsive pattern than typical `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` chains since it self-adjusts to any container width without breakpoint gaps. Note for context: **this codebase does not appear to use Tailwind utility classes for layout at all** in the files sampled — layout is done via inline `style={{ display: "grid", ... }}` objects and a handful of global CSS classes in `app/globals.css`, despite Tailwind being configured in `tailwind.config.ts`. This audit's grep for `grid-cols`/`md:grid`/`lg:grid` Tailwind patterns across `app/` returned zero matches — worth flagging as a discrepancy from the task brief's assumption, not a bug.

### MOBILE-004 — Forced 2-column card grid below 640px can crush card content on 320-375px phones
- **Severity**: Medium | **Priority**: P2
- **Evidence**: `app/globals.css:979-986` — `@media (max-width: 640px) { .card-grid-mobile-2 { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; } }`, applied by `app/classes/components/ClassGrid.tsx:24`. Page shell padding at the same breakpoint is `1rem 0.875rem 3rem` (`globals.css:980-982`).
- **Impact**: At a 320px-wide viewport (smallest commonly-supported phone width, e.g. iPhone SE), available width after page padding (2×14px) and grid gap (10px) leaves roughly **141px per card**. `ClassCard.tsx` does reduce font sizes and banner height in `isCompact` mode (via a matching `useIsMobile()` 640px check — breakpoints agree here, unlike §2), but card copy still runs as low as 9-11px font size (`ClassCard.tsx:164,183,197,204,209,216`) even before the 2-column squeeze. Two-up cards at ~141px with 9-11px text is a legitimate legibility/cramping risk that cannot be confirmed without a live render.
- **Recommendation**: Verify by loading `/classes` at 320px width. If cards feel cramped, either drop to a single column below ~380px, or use the same `auto-fill, minmax()` fluid approach on mobile instead of a hard-coded 2-column override, and reconsider the sub-12px font sizes for mobile legibility.
- **Complexity**: S (CSS-only change once confirmed)

### MOBILE-005 — Favorite-heart icon button under touch-target size
- **Severity**: Low | **Priority**: P3
- **Evidence**: `app/classes/components/ClassCard.tsx:137-138` — favorite button is `32×32` in compact/mobile mode (`24×24` on desktop).
- **Impact**: 32px is below the ~44px recommended minimum; positioned in the top-right corner of a card overlapping the image, adjacent to the tappable card `<Link>` itself, which raises mis-tap risk (tapping "favorite" vs. navigating into the class).
- **Recommendation**: Increase to at least 40-44px hit area (can keep the visual circle smaller via padding, expand the actual button/hitbox).
- **Complexity**: S

---

## 5. Dashboards & tables

Only two components in the codebase actually use `recharts`: `app/dashboard/components/DashboardRevenue.tsx` and `app/admin/AdminClient.tsx`. Both correctly wrap every chart in `<ResponsiveContainer width="100%" height="100%">` (`DashboardRevenue.tsx:84`; `AdminClient.tsx:421,452,476`) — no fixed-pixel chart widths found. The one non-`ResponsiveContainer` numeric width (`AdminClient.tsx:455`, `<YAxis ... width={120}>`) is a legitimate recharts axis-label-width prop, not a layout bug.

`app/centers/[id]/admin/CenterAdminRevenue.tsx` does **not** use recharts at all — its "weekly revenue" bar chart is a hand-rolled `flex`/percentage-height div chart (`CenterAdminRevenue.tsx:36-51`), which is inherently fluid (no fixed pixel widths) and resizes correctly by construction.

Table responsiveness: `CenterAdminTutors.tsx:167`, `CenterAdminStudents.tsx:96`, `CenterAdminBookings.tsx:143`, `CenterAdminClasses.tsx:271`, `CenterAdminClient.tsx:47`, `DashboardBookings.tsx:51`, `DashboardPayouts.tsx:57`, `AdminClient.tsx:385,569,640,699`, `admin/components/PayoutsTab.tsx:179`, and `admin/components/PromoCodesTab.tsx:281` all correctly wrap their `<table>`/scrollable-row-of-controls in `style={{ overflowX: "auto" }}`. This is a consistently-applied pattern across dashboards/admin — good.

### MOBILE-006 — Two revenue-breakdown tables in `CenterAdminRevenue.tsx` are missing the `overflowX: "auto"` wrapper used everywhere else
- **Severity**: Low | **Priority**: P3
- **Evidence**: `app/centers/[id]/admin/CenterAdminRevenue.tsx:124` and `:153` — the "Top classes" and "Top tutors" `<table style={{ width: "100%" }}>` elements are each wrapped only in `style={{ ..., overflow: "hidden" }}` (clips, does not scroll), unlike every other admin table in the codebase (see §5 above) which uses `overflowX: "auto"`.
- **Impact**: These specific tables are only 3 columns (name / count / revenue in EGP), so real overflow risk is low today, but the inconsistency means any future column addition (or a long tutor/class name) will silently clip content instead of scrolling, unlike its sibling admin tables.
- **Recommendation**: Change `overflow: "hidden"` to `overflowX: "auto"` on both wrapper divs (`:124`, `:153`) to match the established pattern.
- **Complexity**: S

---

## 6. Modals

No shared `Modal.tsx`/`Dialog.tsx` component exists — each modal is a hand-rolled `role="dialog"` implementation. Three patterns found:
1. A shared CSS class pair (`app/globals.css:848-868`, `.modal-backdrop` + `.modal`) used by `components/ui/SignInRequiredModal.tsx` and the nav drawer trigger in `components/NavbarClient.tsx`.
2. Two component-local inline-style clones of the same pattern: `app/dashboard/components/DashboardPrimitives.tsx:178` (refund-request dialog) and `app/dashboard/components/DashboardMaterials.tsx:155` (add-material form dialog).
3. The purpose-built mobile bottom-sheet/drawer patterns already covered in §2-3 (`MobileDrawer`, `ClassFilterBottomSheet`), which are correctly mobile-adapted.

### MOBILE-007 — All non-sheet modals are fixed centered dialogs with no max-height/scroll handling, regardless of viewport
- **Severity**: Medium | **Priority**: P2
- **Evidence**: `.modal` (`app/globals.css:856-868`): `position: fixed; top: 50%; inset-inline-start: 50%; transform: translate(-50%, -50%); max-width: 480px; width: calc(100% - 2rem);` — no `max-height` or `overflow-y` anywhere in the rule. Same shape duplicated inline at `DashboardPrimitives.tsx:178` (`width: "min(420px, calc(100vw - 32px))"`) and `DashboardMaterials.tsx:155` (`width: "min(460px, calc(100vw - 32px))"`) — neither sets `maxHeight`/`overflowY` either.
- **Impact**: All three implementations correctly cap *width* for small viewports but never cap *height*. On a short viewport (mobile landscape, or a phone with the on-screen keyboard open shrinking the visual viewport — relevant here since two of the three are forms with text inputs/textareas), a modal taller than the available height has no defined behavior: it will either overflow off-screen top/bottom with `top:50%` centering pushing content out of reach, or rely on the browser's default (no scroll container is declared). Unlike the bottom-sheet pattern in §3 (`maxHeight: "86vh"` + `overflowY: auto`), none of these modals apply the same safeguard. Cannot be visually confirmed without a live render at a short viewport height.
- **Recommendation**: Add `maxHeight: "85vh"` (or similar) and `overflowY: "auto"` to `.modal` in `globals.css` and to the two inline-style dialog clones, matching the pattern already proven out in `ClassFilterBottomSheet.tsx`. Consider consolidating all three into one shared `Modal` component to prevent this kind of drift going forward.
- **Complexity**: S (CSS-only fix); a shared-component consolidation would be M.

Separately, none of these three dialogs switch to a full-screen mobile layout (unlike the nav drawer and filter sheet, which are mobile-native patterns) — they stay small centered cards at every viewport width, just narrower than 480px. This is a legitimate design choice for short forms (refund reason, add-material) rather than a bug, so not filed as a separate finding, but worth noting as an inconsistency in how "mobile-aware" the app's various overlay surfaces are.

---

## 7. RTL at mobile breakpoints — dashboard/admin/nav sweep

Grepped `app/dashboard/`, `app/centers/[id]/admin/`, and `components/ui/MobileBottomNav.tsx` for hardcoded physical-direction properties (`left:`/`right:`/`marginLeft`/`marginRight`/`paddingLeft`/`paddingRight`/`borderLeft:`/`borderRight:`) that would break in RTL, since the earlier RTL audit (`audit/06-content-localization-rtl-audit.md`) focused on desktop components.

`components/ui/MobileBottomNav.tsx` is clean — confirmed use of `insetInlineStart`/`insetInlineEnd` logical properties throughout (`:91-92`, `:144`), consistent with the earlier finding that this component is well-built. No hardcoded `left`/`right` found.

`app/centers/[id]/admin/` — no hardcoded physical-direction properties found in this sweep.

### MOBILE-008 — Hardcoded `borderLeft` divider in dashboard revenue stat row won't flip in RTL
- **Severity**: Low | **Priority**: P4
- **Evidence**: `app/dashboard/components/DashboardRevenue.tsx:141` — `borderLeft: i > 0 ? "1px solid var(--border-light)" : "none"` inside a 3-column CSS grid (`gridTemplateColumns: "repeat(3, 1fr)"`, `:127-128`) used as a column-separator between the gross/fee/net revenue stat cells.
- **Impact**: Purely cosmetic — in RTL the divider line stays on the physical left of items 2 and 3 instead of flipping to the visual "start" side of each cell, producing a subtle asymmetry (harder to notice than a functional bug, but a real inconsistency versus the `insetInlineStart/End` discipline followed elsewhere in the codebase).
- **Recommendation**: Replace with `borderInlineStart` (logical property) so it flips correctly under `dir="rtl"`.
- **Complexity**: S

No hardcoded Tailwind `ml-`/`mr-`/`pl-`/`pr-` utility classes were found in either `app/dashboard/` or `app/centers/[id]/admin/`, consistent with §4's finding that this codebase does not use Tailwind utility classes for layout — it's all inline styles/global CSS, so the RTL risk surface is CSS logical-property discipline rather than Tailwind's non-logical spacing utilities.

Recharts library note: `DashboardRevenue.tsx:85` passes `margin={{ top: 4, right: 4, left: -24, bottom: 0 }}` to a recharts `<BarChart>` — recharts' own `margin` prop only accepts physical `left`/`right` keys (no logical equivalent in the library API), so this one is a third-party API constraint, not an app-code bug. Not filed as a finding, noted for completeness since it matched the grep pattern.

---

## 8. Touch targets & safe areas — broader sweep

Beyond the four sub-44px targets already found (hamburger MOBILE-003, drawer-close, filter-sheet-close, favorite-heart MOBILE-005), a sweep of `app/messages/`, `app/dashboard/components/`, and `app/classes/[id]/` (excluding `BookingCheckout.tsx` per instruction) for icon-only buttons with small/no padding found the same shortfall repeated in multiple places — this looks like a systemic pattern (icon buttons built to visually match their icon size rather than a minimum hit-area convention) rather than something isolated to nav/filters.

### MOBILE-009 — Multiple icon-only action buttons across messages/dashboard/class-detail have no minimum touch-target size
- **Severity**: Medium | **Priority**: P2
- **Evidence**:
  - `app/messages/[threadId]/ThreadClient.tsx:75-77` — the thread "back" control is a bare `<Link>` (`display: "inline-flex"`, no padding) wrapping an 18px `ArrowLeft` icon → ~18px effective tap target, the smallest found in this sweep, on a primary navigation control used on every visit to a conversation.
  - `app/dashboard/components/DashboardMaterials.tsx:67-69` — the delete-material `<button>` has `border: "none", background: "transparent"` with no padding, wrapping a 16px `Trash2` icon → ~16-20px effective box, next to other list items in a repeatable list (higher accidental mis-tap risk the more items are listed).
  - `app/classes/[id]/ClassDetailClient.tsx:450-452` — the sticky-sidebar favorite/heart button is `width: 28, height: 28` (`display: "grid", placeItems: "center"`) — smaller even than the 32px card-grid version already flagged as MOBILE-005, on the class detail page's primary save action.
  - By contrast, `app/messages/[threadId]/ThreadClient.tsx:133` (send button, `width: 42, height: 42`) and `components/ui/MobileBottomNav.tsx` items (§2b) are both close to or above the 44px guideline — so the codebase clearly *can* build to-spec targets, it's just inconsistently applied.
- **Impact**: All WCAG 2.5.5/2.5.8 shortfalls, same category as MOBILE-003/005. The messages back-link and dashboard delete button are the most concerning of this batch since they're either a high-frequency navigation action or an irreversible destructive action.
- **Recommendation**: Establish a shared minimum (e.g., a `.icon-btn` utility class or a shared `IconButton` component defaulting to `min-width/min-height: 44px`) rather than hand-tuning padding per instance — the current per-component inline-style approach is why this keeps recurring. Prioritize the back-link (nav) and delete button (destructive) fixes over the sidebar heart (duplicate of MOBILE-005).
- **Complexity**: S per instance; M if consolidated into a shared component.

---

## 9. Landing page mobile handling

`app/components/landing/LandingBookScroller.tsx` (`BookScroller`, the scroll-linked "book pages" hero section) was checked specifically for whether the heavy scroll-driven animation is disabled or simplified on mobile, since a parallel agent owns the full landing-page UX review.

**Good finding — this one is handled correctly.** The component:
- Checks `useReducedMotion()` (framer-motion's hook, respects OS-level `prefers-reduced-motion`) at `:120`.
- Independently tracks a `window.matchMedia("(max-width: 900px)")` mobile breakpoint via a proper `addEventListener("change", ...)` listener with cleanup (`:132-138`) — not a one-shot check.
- At `:204-206`, when `isMobile` is true, the component **early-returns a completely different, purpose-built `MobileBookScroller` component** (defined at `:283`) instead of the desktop `BookScroller` — this mobile variant uses native `scrollIntoView({ behavior: "smooth" })` per-section snapping (`:304-307`) rather than the desktop version's continuous `useSpring`/`useMotionValue`-driven scroll-linked transform interpolation (`:125-130`, `:155-179`). This is a genuine reduced-complexity mobile code path, not just a CSS override on the same heavy JS.
- A `simpleMotion` flag (`prefersReduced || isMobile`, `:202`) also exists for any remaining animated elements that render before the mobile/desktop branch splits.

The same defensive pattern (`useIsMobile`/`matchMedia`/`useReducedMotion` checks) also appears in `LandingPreviews.tsx`, `LandingCards.tsx`, `HowItWorksSection.tsx`, and the `LandingStylesB.ts`/`LandingStylesC.ts` style modules — i.e., this is a consistently-applied convention across the landing page's animated sections, not a one-off. No finding filed for this section; noted as a positive pattern worth preserving as a reference for fixing MOBILE-002 (bottom nav) and MOBILE-009 (icon buttons) elsewhere.

---

## Summary table

| ID | Area | Severity | Priority | Complexity |
|----|------|----------|----------|------------|
| MOBILE-001 | Nav | Medium | P2 | S |
| MOBILE-002 | Nav | Low | P3 | S |
| MOBILE-003 | Nav | Low | P3 | S |
| MOBILE-004 | Cards/grids | Medium | P2 | S |
| MOBILE-005 | Cards/grids | Low | P3 | S |
| MOBILE-006 | Dashboards/tables | Low | P3 | S |
| MOBILE-007 | Modals | Medium | P2 | S (CSS) / M (consolidation) |
| MOBILE-008 | RTL | Low | P4 | S |
| MOBILE-009 | Touch targets | Medium | P2 | S per instance / M consolidated |

No finding was filed for §9 (landing page) — mobile handling there was verified as a positive pattern (dedicated `MobileBookScroller` path, `matchMedia` + `useReducedMotion` checks), not a gap.

**Cross-cutting recommendation**: MOBILE-003, MOBILE-005, and MOBILE-009 are all instances of the same root cause — no shared icon-button component with an enforced minimum hit area. Fixing this once (a shared `IconButton`/`.icon-btn` convention defaulting to 44px) would resolve three separate findings across nav, cards, messages, dashboard, and class-detail in one pass, and prevent recurrence. Similarly, MOBILE-007's fix (max-height + scroll on modals) is a two-line pattern already proven correct in `ClassFilterBottomSheet.tsx` (§3) — it just needs to be applied to the other three dialog implementations.

This audit remains static-analysis-only; all findings above should be confirmed against real rendered layouts (per the caveats at the top of this file) before prioritizing fixes.
