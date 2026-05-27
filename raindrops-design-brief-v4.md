# Raindrops Greenery — V4 Brief for Claude Code

**Site:** https://raindrops-greenery-nyc.vercel.app/
**Audit date:** May 27, 2026
**Status:** Supersedes V1, V2, V3. Single source of truth — discard previous versions.

---

## 1. What Changed Since V3 (read this first)

1. **3 outer-borough ZIPs added** to coverage:
   - `11101` — Long Island City (Queens)
   - `11211` — Williamsburg (Brooklyn)
   - `11222` — Greenpoint (Brooklyn)
   These are the East-River neighborhoods directly across from Manhattan. They form a 7th cluster: **"East River Extensions."**

2. **Coverage story changes again:** the site is no longer "Manhattan only." It's **"Manhattan + East River neighborhoods."** The Williamsburg testimonial can stay (Williamsburg IS covered). The Astoria testimonial still needs replacing (Astoria is NOT covered — only LIC is).

3. **Banner image swap:** the new image `banner-gift1.jpg` is in `/public/assets/`. Replace all references to `banner-gift.jpg` with `banner-gift1.jpg` in the homepage hero.

4. **Map vision is the centerpiece of V4** — see §4 for full spec. This is the component that has to feel premium.

5. **New cleanup pass:** remove all "backstage" text that customers shouldn't see — dev-language, CMS metadata, "coming soon" placeholders, AI-template product descriptions. See §6.

---

## 2. Audit Recap

**Current rating:** 6.3 / 10
**Target after V4:** 9.3 / 10

All carryover bugs from V3 still apply unless owner has confirmed they're fixed. Don't assume — verify on a fresh load:

| Bug | Location | Status |
|-----|----------|--------|
| "Loading" text in nav | Home | Open |
| "Loading" text in footer | Home | Open |
| "Loading menu / Pulling the latest..." stuck text | `/menu` top | Open |
| Trust marquee renders twice | All pages | Open |
| Footer social icons broken ("In Ti X Fa") | All pages | Open |
| Broken map text "HUDSONLONGISLAND..." | Home | Open (replaced entirely in §4) |
| Missing ZIP input + identical borough copy | `/delivery` | Open |
| Nav stays solid/white on non-home pages | All subpages | Open |
| No back-to-top button | All pages | Open |

---

## 3. Updated Coverage Data (31 ZIPs, 7 Clusters)

### `/lib/coverage.ts`

```ts
export const COVERAGE = {
  area: 'Manhattan + East River',
  freeDelivery: true, // unconditional
  clusters: [
    { id: 'ues-uws', name: 'Upper East Side / Upper West Side', etaMinutes: 50,
      zips: ['10024','10025','10028','10128','10021','10075','10065'] },
    { id: 'midtown', name: 'Midtown', etaMinutes: 40,
      zips: ['10001','10016','10017','10018','10019','10022','10036'] },
    { id: 'chelsea-flatiron-ev', name: 'Chelsea / Flatiron / Gramercy / East Village', etaMinutes: 35,
      zips: ['10003','10009','10010','10011'] },
    { id: 'gv-soho-tribeca', name: 'Greenwich Village / Soho / Tribeca / Lower Manhattan', etaMinutes: 35,
      zips: ['10012','10013','10014','10007'] },
    { id: 'fidi-battery', name: 'Financial District / Seaport / Battery Park', etaMinutes: 45,
      zips: ['10004','10005','10006','10280','10282'] },
    { id: 'south-street', name: 'South Street Seaport', etaMinutes: 40,
      zips: ['10038'] },
    { id: 'east-river', name: 'East River Extensions — LIC / Williamsburg / Greenpoint', etaMinutes: 55,
      zips: ['11101','11211','11222'] },
  ],
} as const;

export const ALL_ZIPS = COVERAGE.clusters.flatMap(c => c.zips);
```

Total: **31 ZIPs across 7 clusters.** This is the single source of truth — every coverage check, map polygon, neighborhood card, and FAQ answer must reference this file.

---

## 4. The Map — "Raindrops Over Manhattan"

This is the V4 hero piece. The map can't just be functional — it has to be something customers screenshot and send to friends.

Full spec lives in this brief (Phase 2 work). See §4 of the source markdown for canvas size, polygon palette, raindrop/bridge animation behavior, ZIP cloud, mobile breakpoints, and tech hints.

---

## 5. Hero Banner Image Swap

Find every reference to `banner-gift.jpg` in the homepage hero and replace with `banner-gift1.jpg`. Try `.jpg`, `.png`, `.webp` in order.

---

## 6. Customer-Facing Copy Cleanup

### Remove
- `/menu` — "Updated May 23, 2026..." line
- `/menu` — "Menu note: Browse 88..." footer block
- `/deals` — "Synced May 23, 2026..." line
- All pages — "SMS opt-in coming soon · Unsubscribe anytime"
- Category card "Filter category" duplicate label

### Rewrite category card descriptions
- Flower → "Top-shelf nugs. 33 strains. Sticky as it gets."
- Pre-Rolls → "Ready to spark. 43 ways to do it."
- Edibles → "Eat your high. 12 flavors, all balanced."

### Product descriptions
Default to **Option A**: delete the AI-template description entirely. Cards already show category, profile, size, THC%, price.

### Deals intro
"41 deals live tonight. Codes stack with sale prices."

### Contact form
Upgrade from `mailto` to a real backend (Formspree, Resend, or a Vercel Edge Function). Remove the "will open your email app" disclaimer.

### Stray asterisks
On `/menu` filter labels and `/contact` topic dropdown — remove the `*` or mark required fields properly.

---

## 7. The Four Hooks

> **Tax free · Free weed · Free delivery · Sticky icky weed**

Free delivery is unconditional — no minimum. No `$80+` anywhere.

### Hook pill row
`[ TAX FREE ] [ FREE WEED ] [ FREE DELIVERY ] [ STICKY · ICKY ]` under hero and near top of `/menu`, `/deals`, `/delivery`, `/about`.

### Sticky promo banner under nav
`🟢 Free delivery in Manhattan + East River neighborhoods · Tax-free under Shinnecock · Order by 11pm`

### Trust marquee
`Tax free · Free delivery · Same-day NYC · Shinnecock-licensed · Sticky · icky · delivered · 4.9★ from NYC`

(No "Lab tested", no "$80+", no "Manhattan only.")

---

## 8. Hero Headline + Subhead

> **Guaranteed best flower on the market.**
> *Free weed with every order. Tax-free under Shinnecock authority. Same-day delivery.*

Typography:
- "Guaranteed" → Fraunces 300 italic
- "best flower" → Fraunces 600
- "on the market." → Fraunces 300
- 88px desktop, 48px mobile, tracking -0.03em

CTAs:
- Primary: "Claim free weed →" → `/menu`
- Secondary: "Check coverage" → scrolls to map

Background: the new `banner-gift1.jpg` image with film grain overlay and radial vignette. Move the original free-gift sticker mechanic to a smaller mid-page card.

---

## 9. Coverage Story Update

### Taglines
- Short: "Premium 21+ cannabis delivery for Manhattan."
- Medium: "Same-day NYC delivery — Manhattan + East River neighborhoods. Tax-free. Free."
- Long: "Curated cannabis delivery across Manhattan, plus Long Island City, Williamsburg, and Greenpoint."

### Testimonials
- Jordan M. • Williamsburg, Brooklyn — keep
- Priya S. • Chelsea, Manhattan — keep
- Daniel R. → relocate to **Long Island City, Queens**, quote: "Ordered edibles on a Friday and they crossed the bridge in 50 minutes. Doing this again."

### Footer description
"Premium 21+ cannabis delivery across Manhattan and the East River neighborhoods of LIC, Williamsburg, and Greenpoint. Free delivery, tax-free under Shinnecock authority."

### Meta description template
`Raindrops Greenery — tax-free Shinnecock-licensed cannabis delivery for Manhattan, LIC, Williamsburg, and Greenpoint. Free delivery, no minimum. Same-day. 21+.`

---

## 10. Bug Fixes (Phase 0)

1. Loading text in nav (homepage)
2. Loading text in footer (homepage)
3. /menu Loading stuck text — proper Suspense + skeleton
4. Duplicate trust marquee
5. Footer social icons — replace "In Ti X Fa" with lucide icons (Instagram, Music2, Twitter, Facebook)
6. Nav scroll behavior on subpages — backdrop blur consistent everywhere
7. `<BackToTop />` button — fixed bottom-right, glow background

---

## 11. Remove Lab / COA Language

### About page
Delete: "Sourced from licensed New York operators, lab-tested by NY-certified facilities." and "Lab testing, packaging, and supply records are maintained accordingly."

Replace promise list with:
- Adult, 21+ delivery handled with care and discretion.
- Sourced through the Shinnecock Indian Nation Cannabis Regulatory Division.
- Tax-free under sovereign authority — no NY State cannabis tax.
- Free delivery on every order. No minimum.
- Discreet, unbranded packaging. ID verified at the door.

### FAQ
Delete "Are products lab tested?" Q&A. Add 3 new top entries:
1. "Why is Raindrops tax-free?" — Shinnecock sovereign authority, NY State cannabis tax doesn't apply.
2. "Is delivery really free?" — Yes, no minimum.
3. "Do I get a free gift?" — Complimentary pre-roll for first-time customers, sticker drops around the city.

Grep & remove `lab`, `tested`, `COA`, `Certificate of Analysis` outside legal boilerplate.

---

## 12. Design System

Already shipped in V3 — palette, fonts, easing. Reference §12 of the V4 source for exact values.

---

## 13. Page-by-Page Required Changes

See page checklists in V4 source. Test on 375px after every phase.

---

## 14. Constraints

- Don't touch product data, prices, UUIDs.
- Keep all 21+ legal disclaimers and Shinnecock licensing.
- "Tax-free" must always say "no NY State cannabis tax" or "tax-free under Shinnecock sovereign authority" — never claim general tax exemption.
- Free delivery is unconditional. No `$80+` anywhere.
- Coverage is Manhattan + LIC + Williamsburg + Greenpoint. Don't claim "all of Brooklyn" or "all of Queens."

---

## 15. Priority Order

1. Phase 0 bug fixes — immediate trust wins
2. Phase 1 coverage data + banner swap
3. Phase 4 copy cleanup
4. Phase 3 hero + hooks
5. Phase 5 lab/COA removal
6. Phase 6 design system
7. **Phase 2 the map — 4–6 hrs alone, the showpiece**
8. Phase 7 visual upgrades
9. Phase 8 polish
