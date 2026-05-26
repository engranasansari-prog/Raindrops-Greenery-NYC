# Raindrops Greenery — Design Upgrade Brief for Claude Code

**Site:** https://raindrops-greenery-nyc.vercel.app/
**Audited:** May 2026
**Goal:** Elevate the site from a clean functional template into a premium, memorable cannabis brand experience that competes with top US dispensaries (Cookies, Stiiizy, Verano, Sunnyside, MedMen).

---

## 1. Current Audit & Rating

### Overall Score: **6.2 / 10**

| Category | Score | Notes |
|----------|-------|-------|
| Information architecture | 8.5/10 | Strong. All the right sections exist (hero, coverage, categories, deals, social proof, FAQ, footer). |
| Content & copywriting | 8/10 | Clean, confident, compliant. Some sections feel a touch generic. |
| Compliance & trust signals | 8.5/10 | 21+ gating, Shinnecock licensing, disclaimers all visible. |
| Typography hierarchy | 5.5/10 | Functional but generic. No display font personality. |
| Color & visual identity | 5/10 | The dark navy/green is fine but flat — no signature accent, no atmosphere. |
| Imagery & art direction | 5.5/10 | Photos are okay but inconsistent in mood. Product cards feel like placeholders. |
| Motion & micro-interactions | 4/10 | Mostly static. No scroll reveals, no hover delight, no loading polish. |
| Mobile experience | 6.5/10 | Responsive but the hero and category tiles don't feel native-app-like. |
| Conversion & CRO | 6/10 | Free gift CTA is good; product cards lack urgency, badges, social proof. |
| Performance perception | 6.5/10 | "Loading" text shows in nav (bad signal). Image-heavy. |

### Projected Score After Changes: **9.0 / 10**

This puts the site in the top tier of US dispensary sites — better than 90% of state-licensed competitors.

---

## 2. Brand Positioning & Aesthetic Direction

Pick **one** aesthetic direction and execute it precisely. My recommendation:

> **"Editorial luxury meets botanical."**
> Think: *Aesop* (skincare) meets *Cookies* (cannabis) meets *Apple* (clarity). Premium, calm, confident — not stoner-coded, not corporate, not trying too hard.

**Brand mood keywords:** premium, botanical, nocturnal, considered, NY-native, discreet.

### Color System (replace current palette)

```css
:root {
  /* Foundation */
  --rd-ink:        #0A1410;   /* near-black with green undertone — primary bg */
  --rd-ink-soft:   #11201A;   /* card / panel bg */
  --rd-paper:      #F5F1E8;   /* warm cream — for light sections */
  --rd-paper-soft: #EBE5D6;

  /* Greenery — your signature */
  --rd-moss:       #2D4A3A;   /* deep moss */
  --rd-fern:       #5B8C6E;   /* mid green */
  --rd-mint:       #B8D4C2;   /* soft sage accent */
  --rd-glow:       #C8E66E;   /* electric lime — sparing accent only */

  /* Accents */
  --rd-amber:      #D4A574;   /* warm gold for premium signals */
  --rd-rain:       #6FA8DC;   /* the "raindrop" — tiny pops */

  /* Text */
  --rd-text:       #F5F1E8;
  --rd-text-dim:   rgba(245, 241, 232, 0.65);
  --rd-text-mute:  rgba(245, 241, 232, 0.45);
}
```

**Usage rule:** 80% ink + paper, 15% greens, 5% glow/amber. The lime `--rd-glow` is your signature — use it ONLY on CTAs, sale badges, and one or two delight moments.

### Typography (no Inter, no Arial, no system fonts)

```css
/* Display — for H1, H2, hero, section openers */
font-family: 'Fraunces', 'Tiempos Headline', Georgia, serif;
/* alt: 'Editorial New', 'PP Editorial', 'Söhne Breit' */

/* Body */
font-family: 'Söhne', 'Inter Display', 'Neue Haas Grotesk', sans-serif;
/* alt: 'GT America', 'Suisse Int'l' */

/* Mono — for prices, product specs, badges */
font-family: 'JetBrains Mono', 'Söhne Mono', monospace;
```

Free alternatives via Google Fonts:
- **Display:** `Fraunces` (free, gorgeous serif with optical sizes)
- **Body:** `Geist` or `DM Sans` (avoid Inter — overused)
- **Mono:** `JetBrains Mono` or `Geist Mono`

**Type rules:**
- H1: Fraunces 64–96px, weight 300, tight tracking `(-0.03em)`, italic optional for emphasis
- H2: Fraunces 40–56px
- Body: 16–17px, line-height 1.6, weight 400
- Eyebrow labels: 11–12px, uppercase, tracking +0.18em, mono or sans

---

## 3. Section-by-Section Changes

### 3.1 Navigation Bar
**Current issues:** "Loading21+" text glitch visible. Logo small. Nav links feel cramped.

**Changes:**
- Remove "Loading" text entirely (it's a stuck state — fix the underlying hydration issue)
- Logo: increase to 36–40px, with proper spacing
- Sticky nav with **scroll-triggered backdrop blur**: transparent at top → `backdrop-filter: blur(20px) saturate(180%)` + 80% opacity bg on scroll
- "21+" pill: solid `--rd-glow` background, ink text, monospace
- "Order now" CTA: distinct from nav links — pill-shaped, `--rd-glow` background
- Add a thin animated underline on hover for nav links (CSS only)

### 3.2 Hero Section
**Current issues:** Banner image feels stock. Headline is good but typography is flat. No motion. No depth.

**Changes:**
- Replace banner with a **layered composition**:
  - Background: full-bleed close-up of cannabis flower or botanical macro, dark-graded
  - Subtle film grain overlay (`background-image: url(noise.png); opacity: 0.06; mix-blend-mode: overlay`)
  - Soft radial gradient vignette to focus attention center
- Headline "Your FREE GIFT is waiting" — set in Fraunces, 80px+, with **mixed weight** ("Your *free gift* is" in light italic, "waiting" in semibold)
- Add a small animated "● live" indicator (pulsing dot) next to "NYC ONLY · 21+"
- Two CTAs side by side:
  - Primary: "Claim free gift →" in `--rd-glow`
  - Secondary: ghost button with `--rd-glow` underline on hover
- **Scroll cue**: tiny animated chevron at bottom that bobs gently
- On load: staggered fade-up of eyebrow → headline → subhead → CTAs (50ms apart)

### 3.3 ZIP Coverage Checker
**Current issues:** "HUDSONLONG ISLANDATLANTICManhattanBrooklynQueens" reads as broken text. Map element looks unfinished. No reward feedback.

**Changes:**
- Build a **proper interactive SVG map** of the 3 boroughs with subtle green fill, hover highlight per borough
- Input field: large, centered, with `--rd-glow` focus ring
- On valid ZIP submit:
  - Animated checkmark ✓
  - "You're in. Same-day delivery available in {Borough}."
  - Show estimated delivery window
  - One-tap "Continue to menu" CTA
- On invalid ZIP: gentle copy "Not yet — we're expanding fast. Drop your email and we'll notify you."
- The 3 borough cards (Manhattan/Brooklyn/Queens with "9+ ZIPs") — convert to mini info cards with borough silhouette icons

### 3.4 Shop by Category (Flower / Pre-Rolls / Edibles)
**Current issues:** Tiles are functional but feel like a CMS default. No visual difference between categories.

**Changes:**
- Three **large editorial cards** with distinct visual treatments per category:
  - **Flower**: macro photo of bud, deep green palette, serif label
  - **Pre-Rolls**: minimal product still life on cream, monospace count
  - **Edibles**: warm amber-toned, soft focus, candy-store mood
- Each card: hover state with smooth scale (1.02), image parallax (10px translateY), and CTA underline fill
- Show product count as oversized mono number ("33") with small "items" label
- Move from flat grid to **asymmetric layout**: e.g., Flower spans 2 columns, Pre-Rolls + Edibles stack on the right

### 3.5 Deals Section
**Current issues:** Product cards are tight, prices crash into each other, no urgency.

**Changes:**
- Card redesign:
  - Larger product image (1:1 aspect ratio, soft shadow)
  - Strain type badge (top-left): "SATIVA" / "INDICA" / "HYBRID" in mono, color-coded
  - "% OFF" badge top-right in `--rd-glow`
  - Strikethrough original price → sale price in `--rd-amber`
  - THC % visible as mono number
  - Subtle "Add" button that appears on hover (slide up from bottom)
- Horizontal scroll carousel on mobile, 4-up grid on desktop
- Section header: "Tonight's drops" with a small live timer "Resets in 4h 22m" for FOMO
- Add **strain category filter chips** above (All / Indica / Sativa / Hybrid)

### 3.6 "Why Choose Raindrops" / Value Props
**Current issues:** Four boxes with text — generic. No icons, no visual rhythm.

**Changes:**
- Replace with a **2x2 layout of large editorial cards**:
  - Each card has a custom-drawn line illustration (raindrop, license seal, package box, repeat arrow)
  - Number prefix in oversized Fraunces ("01", "02", "03", "04")
  - Hover: card lifts subtly, illustration animates (SVG stroke draw-in)
- Add a fifth element: "Backed by **{X,XXX}** New Yorkers since launch" — live counter
- Lab testing: add **clickable COA badge** ("Lab tested · view reports") linking to actual certificates

### 3.7 How Ordering Works
**Current issues:** Three steps in plain text — easy to skip.

**Changes:**
- Convert to a **horizontal stepper** with connected line between dots
- Each step has an inline animated illustration (cursor browsing, tap-comparing, secure checkout lock)
- Use scroll-triggered animation: as user scrolls, dots fill with `--rd-glow` one by one

### 3.8 Customer Testimonials
**Current issues:** Block quotes with text-only attribution. Looks like a CMS feed.

**Changes:**
- Convert to **3-card carousel** with:
  - 5-star rating in `--rd-glow`
  - Quote in Fraunces italic, large
  - Customer initial avatar (colored circle, mono letter) + name + neighborhood
  - "Verified order" badge
- Auto-advance every 6 seconds, pause on hover
- Add overall rating: "★ 4.9 from 1,200+ NYC orders"

### 3.9 Journal / Blog Section
**Current issues:** Cards are okay but generic.

**Changes:**
- Editorial magazine layout: one large featured article (60% width) + two smaller stacked
- Hover: image scales subtly, title underline animates in
- Add reading time + category tag in mono
- Cream background section to break the dark rhythm

### 3.10 FAQ
**Current issues:** Functional. Default accordion behavior.

**Changes:**
- Two-column layout on desktop (questions left, answers right or split into 2 columns)
- Smooth open/close with easing `cubic-bezier(0.22, 1, 0.36, 1)`
- Plus icon that rotates to X
- Add a search bar above: "Search questions..."
- Group questions: "Ordering" / "Delivery" / "Products" / "Legal"

### 3.11 Footer
**Current issues:** Dense. Email field cramped. Logo repeats are okay.

**Changes:**
- Newsletter: full-width form with large input, inline submit button. Copy: "Get drops weekly — new strains, deals, NYC events."
- Add small SMS opt-in beside email
- Social icons: monoline custom set, hover fill with brand colors
- Add **store hours live indicator**: "● Open · until 12:00 AM" (turns red after hours)
- Compliance text: smaller, more readable spacing, in `--rd-text-mute`

---

## 4. New Features Worth Adding

1. **Age-gate splash screen** (one-time per session, cookie-stored) — premium dispensaries all have this. Make it on-brand, not a generic modal.
2. **Loyalty teaser** — "Join Raindrops Club: free deliveries on orders 3+." Modal or footer strip.
3. **Strain finder quiz** — 4-question quiz ("How do you want to feel? Energized / Calm / Sleepy / Social") → recommended products. Huge conversion driver.
4. **Live delivery ETA widget** — small bottom-right floating badge: "Avg delivery: 47 min in your area."
5. **Recently viewed** strip — persistent on menu pages.
6. **Trust strip under nav**: "🌿 Lab tested · 🚚 Same-day · 🔒 Discreet packaging · ⭐ 4.9/5" — small monospace text scrolling marquee.
7. **Better OG/social card** — current one is plain. Design a branded one with the wordmark + tagline.
8. **Cursor effect** (subtle) — custom dot cursor on desktop only, scales up on hover targets. Skip if it feels gimmicky for the brand.

---

## 5. Motion & Micro-Interactions

Add (use Framer Motion if React, or CSS-only):

- **Page load**: 400ms fade-up on hero elements, staggered 80ms apart
- **Scroll reveals**: sections fade-up with `IntersectionObserver`, threshold 0.15
- **Hover states**: all buttons get a subtle "fill from left" or "underline grow" — never just opacity changes
- **Click feedback**: 100ms scale-down (0.97) on press
- **Image hover**: 4-second slow zoom on product images
- **Easing**: use `cubic-bezier(0.22, 1, 0.36, 1)` (Apple-style) globally, not default ease

**Don't overdo it.** Premium = restraint. One delightful moment per scroll-view is enough.

---

## 6. Performance & SEO

- Lazy-load images below the fold (already partially done — verify)
- Convert hero image to AVIF + WebP fallback
- Add `loading="lazy"` and proper `sizes` attributes
- Preload the display font (`<link rel="preload" as="font" crossorigin>`)
- Fix the "Loading" text leaking into nav — looks like a hydration mismatch in Next.js
- Add structured data (`Schema.org/LocalBusiness` + `Product` schemas) for SEO — huge for local cannabis search
- Add a sitemap.xml and robots.txt if missing
- Target Lighthouse: Performance ≥ 92, Accessibility ≥ 100, SEO ≥ 100

---

## 7. Accessibility

- Color contrast: check the green-on-dark combinations against WCAG AA (4.5:1 for body text)
- All interactive elements need visible focus rings (`--rd-glow` 2px outline with 2px offset)
- Add `aria-label` to icon-only buttons
- Skip-to-content link is already there — keep it visible on focus
- Reduce motion: respect `prefers-reduced-motion` for all animations

---

## 8. Mobile-Specific

- Hero should feel like an app, not a shrunken desktop view: shorter headline, single CTA, scroll cue more prominent
- Sticky bottom-bar on menu/product pages: "View cart (3) · $127" — big touch target
- Category tiles: full-width single column, with large image and arrow
- Tap targets minimum 48x48px
- Bottom-sheet style modals for filters (not center modals)

---

## 10. Order of Operations (priority)

If prioritizing, do these in this order for maximum visual impact per hour:

1. Fix the "Loading" bug in nav (5 min — kills trust on first view)
2. Typography overhaul (Fraunces + Geist) — biggest single perceived-quality jump
3. Hero redesign (most-seen real estate)
4. Color palette update (CSS vars only — propagates everywhere)
5. Product card redesign on Deals/Menu
6. Scroll reveals + page-load stagger
7. ZIP map redesign
8. Everything else

---

**Final note:** Don't try to copy Cookies, Stiiizy, or any other brand directly. Build *Raindrops* — a NY-native, editorial, botanical brand. The competitive edge isn't matching them; it's having a clearer point of view than they do.
