# Raindrops Greenery — V7 Brief for Claude Code

**Site:** https://raindrops-greenery-nyc.vercel.app/
**Audit date:** May 27, 2026
**Status:** Focused 4-phase brief. Runs on top of V6 FINAL.

---

## Sync note before running V7

V7's audit premise reflects the V3/V4 site state — not what is currently on
the live URL. Most V7 "still broken" items were shipped in V4 → V6 → Block A:

| V7 claim | Actual state on live |
| --- | --- |
| "Loading" text in nav / footer | Fixed in V4 Phase 0 — OpenStatus returns null until hydrated |
| "Loading menu / Pulling the latest" stuck text | Fixed in V4 Phase 0 — replaced with 6-card skeleton |
| Trust marquee duplicated | Single mount only; SiteChrome → Header → TrustMarquee |
| Footer social icons broken ("In Ti X Fa") | Fixed in V6 Phase 9 — Instagram-only with @handle |
| "Lab tested" still in marquee | Removed in V4 Phase 5 + V6 trust marquee rebuild |
| Broken `HUDSONLONGISLAND...` text on home | Replaced in V4 Phase 2 with stylized SVG map |
| `/delivery` 3 borough cards | Replaced in V4 Phase 2 with 7 cluster cards |
| Astoria testimonial | Replaced with LIC in V4 Phase 1 |
| Quiz link missing from nav | Present since Phase 4 |

V7's net-new asks (that aren't already done):

1. **Nav rewrite** to the drop-in `<Nav />` in §1 — replaces the current `SiteChrome.Header` with a slimmer fixed nav + drawer
2. **Deals page: remove promo codes** — strip `WELCOME10` / `INVITE-15` / `SOVEREIGN` offer cards and the "Deal terms" fine print, replace intro
3. **Coverage Atlas** — V7 wants to *replace* the elaborate animated CoverageMap (raindrops, breathing polygons, bridges) with a simpler cards+ZipChecker. **This is a destructive design change — confirm with owner first.**
4. **Consistency audit** — grep-driven cleanup pass

---

## Phase 1 — Drop-in `<Nav />` component (V7 §1)

Self-contained `components/Nav.tsx` with: fixed positioning, `data-scrolled`
attribute, logo with lime ring, lime underline on active link, lime Order
CTA, mobile drawer with icon+label items, ESC + backdrop close, body scroll lock.

Key integration points:
- Pulled out of `SiteChrome` and mounted directly in `app/layout.tsx`
- `<main className="pt-[72px]">` everywhere except homepage hero (which gets `-mt-[72px]`)
- `slideInLeft` keyframe added to globals.css

Local adaptation: `lucide-react@1.16` doesn't ship `Instagram`. Use the existing `<InstagramIcon />` from `components/SocialIcons.tsx` instead.

---

## Phase 2 — `/deals` promo cleanup (V7 §2)

Remove from `/deals`:
- The promo-code offers section (`WELCOME10`, `INVITE-15`, `SOVEREIGN`/`AUTO 10% back`)
- "Codes stack with sale prices" / "Use code at checkout"
- "Deal terms" / "Fine print" section that references codes

Keep:
- Sale-priced product cards (these aren't promo codes)
- Strain badges, STICKY badges
- Hooks pill row

New intro:
> **Tonight's drops.** Free weed gift with every order. No codes needed.
> Spend it how you like — every order includes a complimentary pre-roll. Browse the deals below and order direct.

---

## Phase 3 — Coverage Atlas (V7 §3) — DESIGN CHOICE FOR OWNER

V7 proposes replacing the current animated `<CoverageMap />` (1200×900 SVG
with breathing polygons, falling raindrops, bridge flow animation,
landmark markers) with a simpler card-grid layout:

- `<ZipChecker />` search box with geolocation
- 7 `<NeighborhoodCard />` cards (one per cluster, with emoji or custom SVG icon)
- Mobile horizontal scroll-snap carousel
- Click card → expand to show all ZIPs as chips

**Trade-off:**
- The current animated map is the "screenshot moment" we built in V4 Phase 2.
  V7's Atlas is more functional and would shave another ~80–120 KB JS off
  the home page (since the elaborate SVG + Framer animations go away).
- Owner sign-off needed before destroying the map.

If approved, the same `<CoverageAtlas />` replaces the map on both `/` and `/delivery`.

---

## Phase 4 — Consistency audit (V7 §4)

Grep-driven cleanup:
- No hardcoded `#fff` / `#000` / Tailwind `gray-*` etc. outside CSS variable defs
- No `Inter` / `Arial` / `system-ui` font-family references
- No `Loading` literal text anywhere
- No `Manhattan, Brooklyn, Queens` broad-coverage claims
- No `lab.?test` / `COA` / `Certificate of Analysis` outside boilerplate
- Component reuse audit (single Button / HookPills / NewsletterForm / Footer)
- Lighthouse ≥92 perf / 100 a11y / 100 SEO on `/`
- Mailchimp API end-to-end test

---

## After V7 → V8 (product catalog)

Owner sends 5–10 sample rows of the Dutchie CSV. I write the migration
script + updated product cards.
