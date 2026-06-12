---
name: Coursaty
description: Calm, trustworthy tutoring marketplace UI for Egypt.
colors:
  emerald: "#0D5946"
  emerald-hover: "#084030"
  emerald-active: "#062A20"
  emerald-soft: "#E3EBE6"
  warm-fog: "#F1EFE9"
  warm-stone: "#E8E5DD"
  card-ivory: "#FBFAF6"
  elevated-white: "#FFFFFF"
  charcoal: "#181715"
  charcoal-secondary: "#4A4843"
  muted-stone: "#6F6B61"
  border-stone: "#D8D4C7"
  border-light: "#E3DFD3"
  error: "#A33028"
  warning: "#8A5A14"
  rating-gold: "#B8861B"
typography:
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "18px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.emerald}"
    textColor: "{colors.card-ivory}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.emerald-hover}"
  button-secondary:
    backgroundColor: "{colors.card-ivory}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.md}"
    padding: "12px 18px"
  card:
    backgroundColor: "{colors.card-ivory}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  input:
    backgroundColor: "{colors.card-ivory}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  chip:
    backgroundColor: "{colors.warm-stone}"
    textColor: "{colors.charcoal-secondary}"
    rounded: "{rounded.pill}"
    padding: "6px 10px"
---

# Design System: Coursaty

## 1. Overview

**Creative North Star: "The Trusted Study Desk"**

Coursaty is a task-first marketplace for students, parents, tutors, and learning centers in Egypt. Its visual system should feel like a well-organized study desk: warm enough to be welcoming, structured enough to support quick decisions, and quiet enough that schedules, prices, availability, and actions stay easy to scan.

The default register is product UI. The landing page may carry more narrative expression, but authenticated surfaces, search results, forms, and dashboards prioritize familiar controls and consistent hierarchy. The system explicitly rejects generic SaaS dashboards, decorative glassmorphism, loud gradients, neon accents, excessive card nesting, and ornamental motion that slows task completion.

**Key Characteristics:**
- Restrained deep emerald actions on warm stone surfaces.
- Compact, predictable controls across web and mobile.
- English and Arabic support with RTL layouts treated as a first-class requirement.
- Tonal layering and light borders before decorative shadow.
- State-driven motion with reduced-motion alternatives.

## 2. Colors

The palette uses warm stone neutrals and a single deep emerald accent to communicate calm, local trust.

### Primary
- **Study Emerald** (`#0D5946`): Primary actions, selected states, focus indicators, and verified trust cues.
- **Deep Emerald** (`#084030`): Hover state for primary actions.
- **Pressed Emerald** (`#062A20`): Active state for primary actions.
- **Soft Emerald Wash** (`#E3EBE6`): Selected chips, positive status backgrounds, and restrained emphasis.

### Neutral
- **Warm Fog** (`#F1EFE9`): Main page background.
- **Warm Stone** (`#E8E5DD`): Alternate surface layer, filter groups, and subtle section contrast.
- **Card Ivory** (`#FBFAF6`): Cards, fields, and content surfaces.
- **Warm Charcoal** (`#181715`): Primary text.
- **Secondary Charcoal** (`#4A4843`): Supporting text.
- **Border Stone** (`#D8D4C7`): Dividers and control outlines.

### Tertiary
- **Error Brick** (`#A33028`): Errors and destructive actions.
- **Warning Ochre** (`#8A5A14`): Warnings requiring attention.
- **Rating Gold** (`#B8861B`): Ratings only.

### Named Rules
**The One Accent Rule.** Use emerald for primary actions, selection, focus, and trust states. Do not scatter it as decoration.

## 3. Typography

**Display Font:** Lora (with Georgia and serif fallbacks)
**Body Font:** Inter (with system-ui fallback)
**Arabic Font:** Cairo (with Inter and system-ui fallback)

**Character:** English page and section headings may use Lora for a quiet editorial note. Inter remains the disciplined product vocabulary for controls and dense task surfaces. Cairo carries Arabic layouts without changing the visual hierarchy.

### Hierarchy
- **Headline** (800, `1.5rem`, `1.2`): Page and section headings.
- **Title** (700, `1.125rem`, `1.3`): Card titles, dialog titles, and compact headers.
- **Body** (400, `1rem`, `1.6`): Supporting text, capped near `70ch` for prose.
- **Label** (700, `0.875rem`, `1.3`): Buttons, field labels, compact metadata, and navigation.

### Named Rules
**The Task Clarity Rule.** Use the display serif only for English page and section headings. Avoid display fonts in Arabic headings, UI labels, buttons, forms, tables, and dashboards.

## 4. Elevation

Coursaty uses a hybrid elevation system: tonal layering and borders establish most structure, while shadows are reserved for overlays, menus, and surfaces that genuinely float above the page.

### Shadow Vocabulary
- **Subtle Surface** (`box-shadow: 0 1px 2px rgba(24,23,21,0.05), 0 1px 3px rgba(24,23,21,0.04)`): Small lifted controls and quiet surface separation.
- **Overlay** (`box-shadow: 0 12px 28px rgba(24,23,21,0.09), 0 4px 10px rgba(24,23,21,0.05)`): Dialogs, menus, and popovers.

### Named Rules
**The Layer Before Shadow Rule.** Prefer a surface tone or border before adding a shadow. Never pair a decorative wide shadow with a decorative border.

## 5. Components

### Buttons
- **Shape:** Restrained rounded corners (`10px` to `12px`).
- **Primary:** Study Emerald background, Card Ivory text, compact confident padding.
- **Hover / Focus:** Deep Emerald on hover; visible `2px` emerald focus outline with offset.
- **Secondary / Ghost:** Card Ivory or transparent background with warm charcoal text and a subtle border only when needed.

### Chips
- **Style:** Pill shape, Warm Stone background, compact label text, subtle border when needed.
- **State:** Selected chips use Soft Emerald Wash and Study Emerald text.

### Cards / Containers
- **Corner Style:** `14px` to `16px`, depending on platform.
- **Background:** Card Ivory above Warm Fog or Warm Stone.
- **Shadow Strategy:** Flat by default; use borders or surface contrast before shadow.
- **Internal Padding:** Usually `16px` to `24px`.

### Inputs / Fields
- **Style:** Filled Card Ivory surface, subtle border, `10px` to `12px` corners.
- **Focus:** Emerald border and visible focus ring.
- **Error / Disabled:** Use semantic color plus explanatory text; never rely on color alone.

### Navigation
- Use familiar top navigation, bottom navigation, tabs, and dashboard structures. Active states use emerald sparingly. Keep labels readable in both English and Arabic layouts.

### Marketplace Cards
- Surface comparison details early: title, tutor or center, subject, curriculum, price, format, availability, and rating. Keep the booking or details action predictable across cards.

## 6. Do's and Don'ts

### Do:
- **Do** use `#0D5946` for primary actions, selected states, and visible focus cues.
- **Do** preserve keyboard focus, touch-friendly targets, reduced-motion alternatives, Arabic localization, and RTL layouts.
- **Do** use loading skeletons, useful empty states, and clear error recovery.
- **Do** keep marketplace details scannable before asking users to commit to booking.
- **Do** preserve consistent controls across the Next.js web app and Flutter mobile app.

### Don't:
- **Don't** create generic SaaS dashboards.
- **Don't** use decorative glassmorphism, loud gradients, neon accents, excessive card nesting, or ornamental motion that slows task completion.
- **Don't** treat Arabic and RTL layouts as a visual afterthought.
- **Don't** use side-stripe accent borders, gradient text, or identical icon-card grids as default scaffolding.
- **Don't** use display fonts in UI labels, buttons, forms, tables, or dashboards.
