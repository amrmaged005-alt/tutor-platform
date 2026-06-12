# FABLE PROMPT — COURSATY UI/UX OVERHAUL V2
## Full Creative Control + Visual Reference Pass + New Features

> Hand this entire document to Fable as a single task. Read CODEX_UI_OVERHAUL_PROMPT.md and
> CODEX_HANDOFF.md first (both in the repo root) to understand the baseline. This document
> is a *supplementary spec* that adds visual reference descriptions, new feature requirements,
> and a remaining-limitations list. Where this doc conflicts with CODEX_UI_OVERHAUL_PROMPT.md,
> this doc takes precedence.

---

## 0. WHO YOU ARE

You are Fable — Anthropic's most creatively capable model. You have full creative authority
over this task. Use every skill, plugin, tool, and agent available to you:

- **Design:** `design-taste-frontend`, `high-end-visual-design`, `impeccable`,
  `ui-ux-pro-max`, `imagegen-frontend-web`, `redesign-existing-projects`, `minimalist-ui`
- **Image generation:** Higgsfield, image-gen tools — generate AI images throughout the site
- **Figma:** mock up sections before coding them to validate layout and hierarchy
- **Code:** multi-agent parallelism, code reviewers, build fixers, security reviewers
- **Research:** web search, Context7, GitHub search for reference patterns and component ideas

You are simultaneously: senior frontend engineer, product designer, UX architect,
design-systems engineer, interaction designer, accessibility reviewer, QA engineer,
and creative director. Your judgment on aesthetics, motion, and visual hierarchy
is the north star — the user trusts it completely.

---

## 1. BASELINE — READ THESE FIRST

Before writing a single line of code:

1. **`CODEX_UI_OVERHAUL_PROMPT.md`** — the 700-line ground-truth spec. Verified against live
   code. Read every section; do not skip §0 (stack), §0.4 (booking bug), or §30 (order).
2. **`CODEX_HANDOFF.md`** — what the prior pass already completed. Do not redo work that
   was already done well. Extend and elevate it.
3. **`REMAINING_LIMITATIONS.md`** — three known gaps to address in this pass (see §9 below).

Working directory: `c:\Users\Amr\tutor-platform`

---

## 2. STEP 1 — COMMIT CURRENT UNCOMMITTED WORK

There is a large set of modified/staged files already in the working tree.
Before writing any new code:

1. Run `git status` and `git diff` to understand staged vs. unstaged changes.
2. Group changes into logical, reviewable units.
3. Commit each group using conventional commits (`feat:`, `fix:`, `refactor:`, `style:`, `chore:`).
4. Write clear commit messages focused on "why", not "what".
5. Do NOT bundle everything into one commit. Do NOT amend existing commits.
6. After all commits, verify `npm run lint` and `npm run build` pass. Fix failures before
   continuing.

---

## 3. VISUAL DIRECTION — REFERENCE SCREENSHOTS PROVIDED

The user provided 11 reference screenshots showing the exact target visual direction.
Implement this visual language across all routes. Descriptions follow.

### 3.1 Browse Tutors Page (`/tutors`)

**Hero section (full-width banner):**
- Left side (~55% width): large bold heading "Find Your Perfect Tutor" in Inter semi-bold,
  subtitle "N verified tutors across Egypt — filter by subject, city, and rating." in
  text-secondary, compact search bar below, then a horizontal scrollable row of subject
  filter pills (Math, Physics, Chemistry, Biology, English, Arabic, History, Geography,
  French, Computer Science, Science, Economics, Accounting, Business — all borderless pill
  chips with `--bg-card` background, 1px `--border` border, hover fills to accent-bg).
- Right side (~45% width): a large high-quality photographic image of students studying
  together, clipped to fill the right half edge-to-edge with no gap, fading into the bg
  on the left edge via a CSS gradient overlay. **Generate this image with Higgsfield or
  similar: two young Egyptian university-age students (man and woman) studying together
  at a desk with laptops, warm indoor lighting, academic atmosphere, warm tones matching
  `--bg` ivory palette.** No stock-photo feel. Natural, real, Egyptian.
- The hero sits above the filter+grid section and should have `--bg` background,
  not the gray `--bg-alt` of the rest of the page.

**Filter + grid:**
- Left sidebar: "Filters" label, CITY section with clickable list items (All Cities,
  Cairo, Alexandria, Giza etc.), active city highlighted in `--accent-bg` with `--accent`
  text. More filter sections below (Subject, Grade, Price, etc.).
- Center: "N tutors available" count text, then section heading "New on Coursaty" with
  subtitle "Recently joined, ready to teach" — only show this section when results include
  new tutors. Then the tutor card grid.

**TUTOR CARDS — make them SMALLER with MORE information:**
- Current cards are too large and show too little. Target: ~280px wide, shorter height.
- Each card contains (in order):
  - Photo: circular avatar (80px) or square cropped top image — if no photo, gradient
    avatar with initials, deep emerald background.
  - Online indicator dot (green pulse) overlaid on photo if tutor has recent activity.
  - Verified badge (small shield checkmark in `--accent`) below name if `isVerified`.
  - Name in Inter semi-bold 15px, city/location in text-muted 12px with pin icon.
  - Subject tags: small pill chips, 2-3 max, overflow hidden with "+N more".
  - Rating: gold star + number + "(N reviews)" in 12px, or "New" badge if no reviews.
  - Price: "EGP N/hr" right-aligned in accent, semi-bold.
  - Session count: subtle "N sessions" in text-dim below price.
  - Favorite heart icon top-right.
  - "Book" CTA button at bottom — full width, `--accent` fill, small 13px text.
- Two-column grid on desktop within the center content area (left sidebar takes ~270px).
- **Do NOT use large photo banners on tutor cards in the browse grid** — save the large
  photo layout for the tutor profile page.

### 3.2 Login Page (`/login`) — Desktop

**Split layout (existing `.auth-shell`):**
- **LEFT PANEL (brand story side):**
  - Deep emerald `--accent` background.
  - **TOP:** Coursaty logo (white version) + tagline "Learn. Grow. Achieve." in small
    Lora italic.
  - **CENTER (large visual):** A **realistic, atmospheric, AI-generated image of the
    Cairo skyline and pyramids together** — not a cartoon, not a touristy clip-art.
    Photorealistic warm golden-hour light, the Giza pyramids visible in the mid-distance,
    the Cairo cityscape (modern towers + minarets) in the foreground, sky in warm ochre/
    amber tones. Overlaid on the bottom half of the image with a gradient to emerald.
    Generate this with Higgsfield: "photorealistic golden hour panorama of Cairo Egypt,
    Giza pyramids visible in distance, city skyline with minarets and modern buildings,
    warm amber sky, cinematic quality, architectural photography style."
    Place this as a `next/image` with `fill` and `object-cover` inside a positioned
    container that takes up ~60% of the left panel height.
  - **BELOW IMAGE:** 3 trust testimonial cards with avatar, name, subject, star rating,
    and a one-line quote. Use real-feeling placeholder data (not "User 1"):
    - "Rena S. — High School Student, Giza" · ★ 4.9 · "Coursaty found me the right tutor and helped me pass my exams."
    - "Samia M. — Parent, Alexandria" · ★ 4.8 · "The tutors are professional and talented. Highly recommend!"
    - "Yousef A. — University Student, Cairo" · ★ 4.9 · "This site works like a great support. The tutors make a difference."
    Each card: small circular avatar with initials (emerald), white/off-white card surface
    with slight transparency, rounded-xl, compact text, star rating right-aligned.

- **RIGHT PANEL (auth form):**
  - Warm `--bg-card` or `--paper` background.
  - Serif heading: "Welcome back" in Lora 32px `--text`.
  - Subtitle: "Log in to your Coursaty account" in text-secondary 15px.
  - Floating-label inputs (`.floating-field` pattern already in globals.css):
    - Email: icon left, label floats on focus/value.
    - Password: icon left, toggle visibility button right, label floats.
  - "Forgot password?" link right-aligned, accent color.
  - Full-width "Log in" button — deep emerald, white text, 48px height, rounded-lg.
  - Divider "or" with horizontal rules.
  - "Don't have an account? Sign up" centered below.
  - AR/EN toggle: NOT in the nav position — place it at bottom of the right panel or
    top-right corner of the right panel. Small, unobtrusive.

### 3.3 Login Page (`/login`) — Mobile

- Centered single-column layout (no split panel).
- Top: Coursaty logo centered (80px, full color).
- Below: Serif heading "Welcome back" in Lora 28px emerald (`--accent`).
- Subtitle: "Log in to continue your learning journey." in text-secondary.
- Floating-label form card: slightly elevated `--bg-card` background, `--radius-2xl`,
  generous padding, email input (with floating label), password input (floating label +
  eye toggle), "Forgot password?" right.
- Full-width "Log in" button, 52px height.
- Divider + "Don't have an account? Sign up" link.
- Bottom: AR | EN language toggle pill (globe icon + "AR | EN" text, bordered pill shape).
- Background: warm `--bg` ivory, no decorative background — keep it calm on mobile.

### 3.4 Desktop Navigation

**Top nav (desktop):**
- Logo left: Coursaty wordmark with icon.
- Nav links centered: Browse Classes, Find Tutors, Dashboard, Messages, (Resources dropdown if exists).
- Right side: compact search icon, notification bell, AR/EN toggle, theme toggle (sun/moon),
  Sign In link, "Get started" primary button.
- Active link: underline with `--accent` color, font-weight 600.
- Sticky, `--bg-card` background, 1px bottom border `--border-light`, 64px height.

**Mobile nav (hamburger/drawer):**
- Top bar: logo left, search icon, notification icon, AR/EN pill toggle, hamburger.
- Drawer slides in from right: shows Browse Classes, Find Tutors, Dashboard, Messages,
  Resources — each with icon left and chevron right. Below: Sign In button + "Get started"
  button full-width. Bottom of drawer: Language + Dark mode toggles.

### 3.5 Browse Classes (`/classes`)

**Layout:**
- Left sidebar (~240px): "Filters" header + "Clear all" link. Sections:
  Subject (checkboxes with count), Grade/Level, Price range, Location (Online toggle +
  In-person), Table type, Availability, Language, Rating. Active filter highlighted.
- Center content: `h1` "Browse Classes" + subtitle, compact search bar (NOT oversized —
  single-line, same height as a normal input), Sort dropdown right-aligned.
  Below: **Trending section** — horizontal scrolling row of subject category chips with
  counts ("IGCSE Mathematics · 10", "Physics Grade 11 · 8", etc.), each chip shows the
  class image thumbnail (40x40 circle) + name + count. Generated academic images.
  Then: results count "242 classes" text.
  Then: card grid — 3 columns on large desktop, 2 columns on medium.
- **Right panel** (appears only when no results OR on large desktop for suggestions):
  "No classes found" state with book illustration, "We couldn't find any classes matching
  your search. Try adjusting your filters or search again." + "Reset Filters" button.
  On large desktop with results: show a "Loading skeleton preview" panel or recommended
  filters panel.

**Class cards:**
- Horizontal image top (generated academic/subject-specific image, 16:9 ratio, 100% width).
- Subject badge overlaid top-left on image (small pill, colored by subject).
- Grade/curriculum badge overlaid top-right.
- Favorite heart top-right.
- Below image: Title (Inter semi-bold, 15px, 2 lines max), tutor/center name + verified
  check, rating stars + count + enrolled count, online/in-person pill, duration, price
  "EGP N" right-aligned in accent bold.

### 3.6 Class Detail (`/classes/[id]`)

**Layout:**
- Subject badge (pill) top, large title (Lora 28px), rating + review count + enrolled count
  in a stats row.
- Main content left (~65%): "What you'll learn" section (2-col bullet grid), instructor
  card (photo, name, verified, rating, subjects, bio excerpt, "View full profile →"),
  reviews section, related classes carousel.
- Right sticky card (~320px): Class image top, session price "EGP N / session", capacity
  "Only N seats left" if < 50%, Schedule string ("Twice a week · Online · 60 min"),
  "Select your schedule" section with available date chips (real dates from `schedule`
  field), time slot chips, price breakdown (Class session + Platform fee = Total),
  "Book this class" primary CTA full-width, "Satisfaction guaranteed" trust indicator.
- The right card sticks on scroll on desktop. On mobile, it collapses to a bottom CTA bar.

### 3.7 Booking Checkout (`/classes/[id]/book`) — Mobile reference

**Stepper:** 3 steps at top — Schedule (1, active), Details (2), Pay (3).
Green filled circle for current, gray circles with step number for upcoming.
Thin connecting line between circles.

**Class summary card:** thumbnail image left (60x60), subject badge, title, tutor name
+ verified icon, rating + seats left, format icon + "Online session", duration, price right.

**Section 1 — Schedule:**
- Real schedule string from class data replaces the fake calendar.
- If option B (honest MVP): display "Your tutor will confirm the exact session time after
  booking." with the class `schedule` field displayed clearly. No fake calendar.
- If data supports it (option A): show a real date picker grid with `schedule` field
  informing availability. Build only if truly supported by data.

**Section 2 — Student details:** student name input, grade/school input (optional).

**Section 3 — Payment method:** Card (Visa/MasterCard), Fawry Pay, Bank Transfer — radio
select with icon and label, current selection shows filled emerald radio.

**Section 4 — Order summary:** collapsible, shows "Class session EGP N", "Platform fee
EGP N", "Total EGP N" in accent bold.

**CTA:** Full-width "Confirm booking" button with lock icon + "Secure payment" below.
While submitting: "Processing your booking..." with spinner, button disabled.

### 3.8 Dashboard — Tutor View (`/dashboard`)

**Shell:** Left sidebar (fixed, 220px) with Coursaty logo top, user avatar + name + role
bottom. Nav items: Bookings, My Classes, Messages, Students, Reviews, Earnings, Settings,
Help Center. Light/Dark toggle at bottom.

**Top bar:** Right side: notification bell, date range picker ("May 24 — 30, 2025"),
notification avatar.

**Greeting header:** "Good morning, [Name]" in Lora 24px + emoji flag/sun, subtitle
"Here's what's happening with your tutoring last today."

**Stats row (4 cards):**
- Total Bookings: large number, "+N% vs last 7 days" green/red trend.
- Upcoming Sessions: number + "Next at N:00PM" subtitle.
- This Week's Earnings: "EGP N" + "+N% vs last 7 days".
- Average Rating: N.N + star icon + "From N reviews".
Each stat card: `--bg-card`, 1px border, subtle shadow, icon top-right corner.

**Two columns below:**
LEFT (wider): Upcoming Bookings panel — list of booking rows with student name, class
name, time badge ("Today, N:00–N:00 PM"), status pill (Confirmed/Pending/Cancelled),
"View full calendar" link. Also: Revenue Overview bar chart (recharts, 6-week bars,
emerald fill, subtle hover, y-axis in EGP).

RIGHT: My Classes panel — list with class name, level, price, student count, actions
(edit/view buttons). "Create new class" card placeholder at top of list.

**Tutor Onboarding checklist (if incomplete):** Show as a dismissable card with progress
bar (e.g. "75% complete"), checklist items: Verify email, Add your subjects, Upload
profile photo, Add your teaching areas, Set your availability. Each row has checkbox +
label + optional link. "Grow your teaching business. Complete your profile to start
getting bookings."

### 3.9 Browse Tutors — Mobile (`/tutors` at 390px)

**Top bar:** notification bell left, centered Coursaty logo, "عربي | EN" language toggle right.

**Heading:** "Find the right tutor" in Lora semi-bold, subtitle "Trusted, verified, and
ready to help" in text-secondary.

**Search bar:** full-width, with filter icon button right (shows active filter count badge).

**Filter chips row:** horizontal scroll, "Filters N" chip with sliders icon, then subject
chips (Math, Physics, Arabic), "Online now" chip with green dot. Active chips filled emerald.

**Tutor card grid — 2 columns:**
Each card is taller with a large square photo top (covers ~55% of card height), filling
edge to edge. Overlaid on photo bottom-left: "Online" green pill. Overlaid on photo
bottom-left below Online: "Verified" white pill with checkmark.
Below photo: Name (Inter semi-bold 14px), subject tag chips (2 max), star rating + review
count + price "EGP N/hr" in a tight row. Favorite heart top-right.

**Bottom nav:** 5 tabs — Home, Classes, Tutors (active, bold icon), Messages, Profile.

### 3.10 Tutor Profile — Mobile (`/tutors/[id]` at 390px)

**Header area:** Large photo top (full width, ~45% screen height), back button top-left,
favorite + share buttons top-right.
Overlaid bottom of photo: name in white bold, verified checkmark (white shield), rating
stars + count + "N sessions" in white semi-transparent.

**Below photo:** Subject tag chips in a horizontal scroll row.

**Short bio:** "Helping students build confidence and fluency through personalized, engaging
lessons." in text-secondary.

**Info row (3 mini-cards):** 🇪🇬 From Egypt | Speaks العربية · English | 🎓 6+ years.

**Reviews section:** "What students say" header. Rating breakdown: star rows (5★ N%,
4★ N%...) as colored bar chart + overall "4.8" large number + star + "(N reviews)".
"See all reviews →" link.

**Availability section:** "Availability" header + month/year navigation + mini calendar
grid showing available dates highlighted in emerald.

**Sticky bottom CTA:** Full-width "Book a session" button in `--accent` green + "EGP N /
hour" price below or inside button. 80px safe area padding at bottom.

### 3.11 Messages (`/messages` + `/messages/[threadId]`)

**Thread list:**
- Tabs: All (N), Unread (N), Students, Tutors — pill tabs, active filled emerald.
- Each thread row: circular avatar (50px), green online dot overlay, name in bold 14px,
  last message preview in text-muted 13px, timestamp right, unread count badge right
  (filled emerald pill).
- "Your" messages prefixed with "You: " in text-dim.
- Attachment icon (📎) if last message had attachment.
- Empty state below list: speech bubble illustration with leaves/plant decoration,
  "No messages yet. Start a conversation with a tutor and we'll see it here." +
  "Browse tutors" CTA button.
- **Bottom nav** at page bottom (mobile).

**Conversation view:**
- Header: back arrow, avatar, name, "Online" green dot, video icon + "..." overflow menu.
- Booking context row: 📅 "Math · Grade 10 · Today, 5:00 PM" + "View booking" link.
- Message bubbles: theirs = white/off-white left-aligned, rounded except bottom-left;
  mine = `--accent` emerald right-aligned, white text, rounded except bottom-right.
  Arabic messages display naturally in RTL direction within the bubble regardless of UI
  direction. Timestamps below each bubble in text-dim.
- Sending state: spinner replacing the send icon while message is in-flight.
- Composer: white bar, clip icon left, "Type a message..." placeholder, send button
  (emerald circle with paper-plane icon) right.

**Trust footer (desktop):**
Four columns: ✅ Safe & Secure — "Your conversations are always private." |
🔔 Real-time — "Instant updates and notifications." |
🏆 Trusted Tutors — "Verified educators, quality learning." |
❤️ Built for Families — "Designed for parents and students."

### 3.12 Global States (`/global-states`, `app/loading.tsx`, etc.)

Three cards side by side on `/global-states` showcase page:
- **LOADING STATE:** Coursaty logo + tagline "Every lesson matters." +
  skeleton layout below (nav skeleton, content skeleton, sidebar skeleton).
  Shows "Brand moment · skeleton geometry" label.
- **ERROR STATE:** Large open book with warning triangle illustration (generate with
  image-gen tools — academic/papyrus aesthetic), "Something went wrong." heading,
  "We ran into a problem while processing your request. Please sign in a moment."
  body text, "Try again" green button + "Go home" ghost link below.
- **NOT FOUND STATE:** Large "404" in serif Lora 120px in `--accent` with subtle texture
  or grain overlay, "Page not found" heading, "The page you're looking for doesn't exist
  or has been moved." body, "Browse Classes" button + "Go home" ghost link.

All states use `--bg-card` surface, Coursaty brand colors, no raw error stacks.

### 3.13 Account Settings (`/settings`)

**Layout:** Left sidebar (same `dashboard-app-shell` shell) + main content area.

**Header:** "Account settings" h1, subtitle "Manage your profile, security and notification
preferences."

**Top tabs:** Profile | Security | Notifications — pill tabs.

**Security tab (shown in reference):**
Left column of setting cards:
- Account security: "Change your password so you don't get disconnected." + "Change password" link.
- Email & verification: "Update your email and verification status." + current email + edit icon + status badge "Verified" (green).
- Two-factor authentication: "Two-factor authentication is off and we recommend turning it on to protect your account." + "Enable 2FA" button (outlined emerald).

Right column:
- Connected accounts: Google account connected (gmail + "Connected" green badge + disconnect icon), Apple (iPhone + "Connected" badge).
- Sessions: current device listed.

**Danger zone card** (red-bordered, at bottom):
"Delete your account. Permanently delete your account and all your data. This action cannot be undone." + "Delete account" red outlined button.

**Footer actions** (sticky at bottom):
"You have unsaved changes. Make sure to save." warning text left + "Discard changes" ghost button + "Save changes" green primary button right.

### 3.14 Browse Classes — No Results + Loading States

No results right panel: book illustration with magnifying glass, "No results" heading,
"We couldn't find any classes matching your search. Try adjusting your filters or search
again." + "Reset filters" button (emerald outline).

Loading state: skeleton cards matching the exact class card shape — image placeholder
(gray rectangle), subject badge placeholder, title lines, metadata lines.

---

## 4. NEW FEATURE REQUIREMENTS

### 4.1 Smaller Tutor Cards with More Information

See §3.1 for the exact card spec. Key changes from current:
- Reduce card height by ~30% (more compact).
- Add: session count, price per hour, verified badge, subject tags (truncated).
- Add: "Book" CTA button inside each card (not just on hover).
- Add: online status indicator overlaid on photo.
- Show 2-column grid within the center content column (not full-width 2-col).
- On mobile: 2-column full-width grid as in §3.9.

### 4.2 Centers Page — Student Access

Currently `/centers` is accessible. **Ensure the following:**
- The centers browse page (`/centers`) is fully accessible to unauthenticated students
  and authenticated students. No auth redirect.
- Update the navbar to include "Centers" as a visible link for all users
  (currently hidden behind auth or missing from primary nav).
- Each center card on the browse page shows: logo/avatar, name, city, class count, tutor
  count, rating, top 3 subjects as chips, "View Center" CTA.
- Center profile page (`/centers/[id]`) must be beautiful and student-facing:
  - Hero: center logo + name + tagline/description + city + verified badge + stats row
    (N tutors, N classes, N students, rating).
  - Tabs: Classes | Tutors | About | Reviews.
  - Classes tab: grid of class cards (same format as browse classes).
  - Tutors tab: grid of smaller tutor cards (same format as §3.1) showing tutors at
    this center.
  - About tab: full description, contact info (phone, email, location), map placeholder.
  - Reviews tab: review list.
  - Sticky "Explore Classes" CTA at bottom on mobile.
  - No admin controls visible to students (admin tab is separate route `/centers/[id]/admin`).

### 4.3 Center Admin — Tutor + Class Management

The center admin already has a dashboard at `/centers/[id]/admin` with tabs:
Overview | Tutors | Classes | Bookings | Students | Revenue | Settings.

**Enhance the Tutors tab (`CenterAdminTutors`) to include:**
- Table with columns: Photo | Name | Subjects | Classes | Students | Revenue | Status
  (Active/Inactive) | Access Level | Actions.
- **Access Level column:** Shows the agreement type between center and tutor:
  - "Full Access" — tutor can see all center bookings for their classes, manage their
    own students, accept/decline bookings.
  - "Limited" — tutor can see their class schedule only, cannot see revenue or other
    students.
  - "View Only" — tutor can see their class info but cannot make changes.
  Display as a styled dropdown/select per row that the center admin can change.
- Actions per row: Edit, Remove from center, Message tutor.
- "Invite Tutor" button top-right (opens a modal to add by email or user ID).

**Enhance the Classes tab (`CenterAdminClasses`) to include:**
- Table with class title, subject, tutor name (linked), enrolled/capacity, price, status,
  actions (Edit, Archive, View bookings).
- Quick-add "Create new class" button.
- Assign tutor dropdown inside class creation/edit modal.

**Tutor's view of their center:**
When a logged-in tutor visits a center profile page (`/centers/[id]`) and they are a
member of that center, show an extra "My Role" banner below the hero: their access level
badge, what they can and cannot do, and a "Manage my classes" link to their dashboard.
This is read-only; center settings remain admin-only.

### 4.4 Login Page — Realistic Cairo/Pyramids Image

See §3.2 for the full left panel spec. Specifically:

Generate with Higgsfield (or equivalent AI image tool):
- Prompt: "Photorealistic golden hour panoramic view of Cairo Egypt with the Giza
  pyramids in the mid-distance, Cairo city skyline visible with a mix of minarets and
  modern buildings, warm amber and orange sunset sky, cinematic architectural photography,
  high resolution, award-winning travel photography style, no cartoons, no illustration"
- Style: photorealistic, warm golden hour, cinematic, documentary photography.
- Format: landscape 16:9, ~1200px wide minimum for retina.
- Save to `public/landing/cairo-skyline-golden-hour.jpg` (AVIF if tools support it).
- Use as `next/image` with `fill` / `object-cover` + `priority` on the auth page.
- Add a gradient overlay from bottom: `linear-gradient(to top, var(--accent) 0%, transparent 50%)`
  so the testimonial cards below have a readable background.
- Dark mode variant: slightly darker with overlay opacity increased.

### 4.5 Dashboard — Fill Empty / Stub Sections

Audit every dashboard panel and fill in sections that currently render empty or show
placeholder-only content. Specifically:

**For student dashboard (`/dashboard` where role = STUDENT):**
- "Upcoming Sessions" panel: if no bookings, show EmptyState "No upcoming sessions.
  Browse classes to book your first session." + "Browse Classes" CTA.
- "Recommended for you" section: if no AI recommendations exist, derive from user's
  past subjects (from their bookings) and show 4 class cards from the same subjects.
  Fall back to featured classes if no booking history.
- "My Bookings" quick view: show last 3 bookings with status pills.
- Profile completion section: use `OnboardingChecklist` properly wired to real
  completion state (check if user has profile photo, bio, subjects, etc.).
- Quick actions row: "Browse Classes", "Find a Tutor", "My Bookings", "Messages" —
  each as an icon card.

**For tutor dashboard:**
- Revenue panel: if no earnings, show "Your earnings will appear here once you receive
  bookings." with the recharts area still visible but showing a flat zero line.
- "My Classes" table: if empty, show "You haven't created any classes yet." + "Create
  your first class" button.
- Upcoming sessions: real data from bookings table, not hardcoded.
- "Students" panel: list of unique students who have booked, with name and subject.

**For center admin dashboard:**
- All overview stat cards wired to real Prisma data (already done per handoff — verify
  they show real numbers, not "—" or null).
- Revenue chart: real data from bookings aggregated by week.

### 4.6 AI-Generated Images Throughout the Site

Generate high-quality, consistent AI images using Higgsfield or available image-gen tools.
Place them throughout the site. Specific placements:

| Location | Prompt / Description |
|---|---|
| Login page left panel | Cairo golden hour panorama (§4.4) |
| Browse tutors hero right | Two Egyptian students studying together, warm indoor light |
| Browse classes hero | Bookshelf/library/study desk academic scene, warm tones |
| Empty state illustrations | Open book with question mark, academic papyrus aesthetic |
| 404 page | Stack of books / scattered papers, warm sepia tones |
| Error page | Open book with warning, atmospheric lighting |
| Dashboard background | Very subtle paper texture (5-8% opacity) for depth |
| Center profile hero | Academic center building or classroom interior, Egyptian |
| Auth pages (signup, forgot-password) | Reuse or variant of Cairo skyline with less prominence |
| Subject-specific class thumbnails | Per-subject academic imagery: math=equations on blackboard, Arabic=calligraphy, physics=telescope, etc. |

**Rules for all generated images:**
- Photorealistic or high-quality illustrated style — never cartoons, never childish.
- Warm ivory/emerald/stone color palette matching the design system.
- Egyptian/academic cultural context, never generic Western stock photo aesthetic.
- Optimize to AVIF or WebP, explicit `width`/`height`, `alt` text, `next/image`.
- Dark-mode safe: images with overlay gradients or darker versions where needed.
- File naming: `public/landing/[descriptive-name].avif` or `public/assets/[name].jpg`.

### 4.7 Motion Fluidity + Button Liquidity

The site should feel alive, not static. Implement the following motion patterns using
Framer Motion (already installed, `framer-motion@12`):

**Button interactions (button liquidity):**
- All `.btn-primary` buttons: on hover, the background smoothly lightens by one step
  (not an abrupt shift). Scale: `1.01` on hover, `0.98` on press. Transition: 150ms ease-out.
- On click: a subtle "press" scale + ripple effect — implement via a `motion.button` wrapper
  with `whileHover` and `whileTap` variants in a `LiquidButton` component or applied
  globally to `.btn-primary` via a Framer Motion global wrapper.
- Primary CTA buttons (book, confirm, etc.): slightly stronger scale effect `0.96` on press.
- Loading buttons: background keeps moving (subtle gradient shimmer while `isLoading`).
- Ghost/secondary buttons: border fades in on hover with scale `1.01`.

**Page-level motion:**
- Route transitions: `PageTransition` component already exists — ensure it's applied to
  all major routes, not just some. Use `AnimatePresence` at the layout level.
- Cards (class cards, tutor cards, dashboard stat cards): lift effect on hover —
  `translateY: -3px`, shadow increases, scale `1.01`. Transition 200ms ease-out.
  Standardize the `.class-card` hover to ALL card types.
- Filter chips: scale in on mount with staggered delay (stagger 30ms per chip).
- Modal/drawer: slide + fade in from bottom (mobile) or fade+scale from center (desktop).
  Existing `.modal` class — animate it with Framer `AnimatePresence` + `motion.div`.

**Dashboard motion:**
- Stat cards: count-up animation when they enter the viewport (number animates from 0 to
  the real value over 600ms). Use `useInView` from framer-motion.
- Revenue chart: bars animate in from bottom on first render.

**Scroll-based motion:**
- Browse pages: cards fade+slide in as they scroll into view (`whileInView` with
  `viewport: { once: true }`), stagger 50ms per card.
- Hero sections: content fades up on page load with a 200ms delay.

**Microinteractions:**
- Favorite heart: pop/scale animation on toggle (1 → 1.3 → 1 in 300ms).
- Notification badge: pulse animation on the bell icon.
- Online status dot: continuous slow pulse (`scale: [1, 1.3, 1]` infinite, 2s duration).
- Form field focus: border color transitions smoothly (already CSS transition — verify all
  fields use `var(--transition-base)`, no instant jumps).
- Booking success: `AnimatedCheck` component already exists — use it with the confetti burst.

**Respect reduced motion:**
- Wrap ALL motion in `useReducedMotion()` check or the existing
  `@media (prefers-reduced-motion: reduce)` block — no new motion that bypasses it.

---

## 5. REMAINING LIMITATIONS TO ADDRESS

Address the three gaps from `REMAINING_LIMITATIONS.md`:

### 5.1 Dashboard sub-panel i18n

The following sub-panels still hardcode English strings. Apply the `DICT` + `useI18n`
pattern (already established in `app/components/i18n.tsx`) to each:
- `app/dashboard/components/DashboardChecklist.tsx`
- `app/dashboard/components/DashboardClasses.tsx`
- `app/dashboard/components/DashboardRevenue.tsx`
- `app/dashboard/components/DashboardPayouts.tsx`
- `app/dashboard/components/DashboardReviews.tsx` (if exists)
- `app/dashboard/components/DashboardMessages.tsx` (if exists)
- `app/favorites/page.tsx`
- `app/referral/page.tsx`
- `app/create-class/CreateClassForm.tsx`

For each: identify all hardcoded English user-facing strings, add them to the `DICT`
in `i18n.tsx` with Arabic translations, replace with `t('key')` using `useI18n`.

### 5.2 Honest MVP scheduling (option B — already chosen)

The prior pass implemented option B (honest schedule step). Verify it is visually clean
and properly displays the class `schedule` field. The copy must say something like:
"Your tutor will confirm the exact session time after booking. See the class schedule below."
followed by the real `schedule` string from the DB formatted nicely (e.g. "Twice a week,
Mondays and Wednesdays, 4:00 PM – 6:00 PM"). Make this section look intentional, not like
a cop-out placeholder.

### 5.3 Prisma package.json deprecation

Remove the `prisma` key from `package.json` if it conflicts with `prisma.config.ts`.
The warning is: "The `prisma` key in `package.json` is deprecated because `prisma.config.ts`
now overrides it." Clean this up so `npm run build` runs without any warnings about
deprecated config keys.

---

## 6. PAGES TO MAKE LOOK LIKE THE REFERENCE SCREENSHOTS

Match the visual direction of the provided reference screenshots **across all pages**,
not just the ones depicted. The screenshots show a cohesive visual system — apply it
everywhere. Per-page instructions:

| Page | Match to screenshot |
|---|---|
| `/tutors` | §3.1 exactly: hero split, smaller cards, more info |
| `/login` (desktop) | §3.2: emerald left panel + Cairo image + testimonials + clean form right |
| `/login` (mobile) | §3.3: centered logo + serif heading + floating-label card + AR/EN toggle |
| Navbar | §3.4: links centered, compact right actions, mobile drawer |
| `/classes` | §3.5: left filters + trending horizontal chips + 3-col grid + right no-results |
| `/classes/[id]` | §3.6: sticky booking card right, "What you'll learn" 2-col, instructor card |
| `/classes/[id]/book` | §3.7: stepper + real/honest schedule + payment + order summary |
| `/dashboard` (tutor) | §3.8: sidebar + greeting + 4 stats + upcoming + revenue chart + classes |
| `/tutors` (mobile) | §3.9: 2-col cards with large photo + online/verified overlays |
| `/tutors/[id]` (mobile) | §3.10: full-bleed photo header + sticky CTA |
| `/messages` + threads | §3.11: tabs + thread list + conversation + trust footer |
| `/global-states` | §3.12: loading skeleton + error illustration + 404 serif number |
| `/settings` | §3.13: tabbed with sidebar + security cards + danger zone + save footer |

---

## 7. HARD CONSTRAINTS (DO NOT BREAK)

- Do NOT install shadcn/ui or any new component library.
- Do NOT refactor to Tailwind utility classes (installed but intentionally unused).
- Do NOT break NextAuth sessions, Prisma client, Paymob webhook, Supabase, Flutter API contract.
- Do NOT ship fake data as real data — every number must come from Prisma or show a proper empty state.
- Do NOT leave `npm run build` or `npm run lint` failing.
- Do NOT skip `prefers-reduced-motion` — all new motion must respect it.
- The booking bug fixes from CODEX_UI_OVERHAUL_PROMPT.md §0.4 are still mandatory:
  `data.paymentUrl` (not `iframeUrl`), 409 AlreadyBookedState, honest schedule, brand font.

---

## 8. IMPLEMENTATION ORDER

Follow this order. Commit after each major section.

1. Commit the existing uncommitted diff (§2).
2. Clean up Prisma deprecation (§5.3 — fast, 2 min).
3. Generate AI images (§4.6) — do this early so they're available for all page work.
4. Consolidate design tokens + motion primitives + `LiquidButton` global wrapper (§4.7 foundation).
5. Login page overhaul: Cairo image, split panel, mobile layout (§3.2, §3.3, §4.4).
6. Navbar: desktop + mobile drawer (§3.4).
7. Browse Classes: layout + trending chips + cards + no-results (§3.5).
8. Class Detail: sticky booking card + "What you'll learn" + instructor card (§3.6).
9. Booking flow: honest schedule + payment UI + order summary + already-booked state (§3.7).
10. Browse Tutors: hero + smaller cards + more info + mobile 2-col (§3.1, §3.9, §4.1).
11. Tutor Profile: photo header + sticky CTA + reviews + availability (§3.10).
12. Centers: student access + profile page + center card + admin tutor management (§4.2, §4.3).
13. Dashboard: fill all empty panels + stat animations + sidebar + greeting (§3.8, §4.5).
14. Messages: thread list + conversation + trust footer (§3.11).
15. Settings: tabs + security cards + save footer (§3.13).
16. Global states: illustrations + 404 + error (§3.12).
17. Dashboard i18n (§5.1) + honest schedule copy (§5.2).
18. Motion fluidity audit: button liquidity, card hovers, stagger animations, count-up (§4.7).
19. Dark mode + mobile polish pass across all routes.
20. Accessibility pass: focus rings, ARIA, contrast, keyboard nav.
21. `npm run lint` → `npm run build` → fix all errors.
22. Final report (§9).

---

## 9. FINAL REPORT

End with a complete report:
1. What changed visually (route by route).
2. New AI-generated images: what was generated, where placed, file paths.
3. New features built: tutor card changes, center student access, center admin tutor management, Cairo login image.
4. Empty dashboard sections filled: what was added per role.
5. Motion additions: what animations, which components.
6. i18n coverage expanded: which files localized.
7. Booking flow status: honest schedule copy, paymentUrl fix, 409 state.
8. Prisma deprecation fix.
9. Remaining limitations after this pass (if any).
10. Files changed (full list).
11. `npm run lint` + `npm run build` output.

---

## 10. ACCEPTANCE CRITERIA

Success only if ALL of the following are true:

- [ ] Login page has realistic Cairo skyline + pyramids AI-generated image.
- [ ] Tutor cards are smaller and show more information (verified, sessions, price, book button).
- [ ] Centers page is accessible to students with a beautiful center profile page.
- [ ] Center admin can assign access levels to tutors (Full/Limited/View Only).
- [ ] Dashboard panels have no blank/stub sections — every tab shows meaningful content or proper empty state.
- [ ] AI-generated images appear in at least 8 distinct locations throughout the site.
- [ ] Button presses feel liquid — scale + press effect on all primary buttons.
- [ ] Card hover effects are standardized across all card types.
- [ ] All reference screenshot layouts are implemented (§6 table).
- [ ] `npm run build` and `npm run lint` pass.
- [ ] Works in EN + AR (RTL) and light + dark.
- [ ] No fake data rendered as real data.
- [ ] All motion respects `prefers-reduced-motion`.
