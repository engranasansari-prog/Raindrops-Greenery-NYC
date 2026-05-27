# Raindrops Greenery — V6 FINAL Brief for Claude Code

**Site:** https://raindrops-greenery-nyc.vercel.app/
**Audit date:** May 27, 2026
**Status:** Final consolidated brief. Supersedes V1 through V5.

Key V6 deltas:
- Mailchimp integration locked in (env vars in Vercel, API key never in repo)
- Social reduced to Instagram only
- Home page condensed from 11 → 6 sections
- Per-phase verification protocol added (see §13)
- Final Acceptance Checklist (see §14)

> **Operator overrides applied to this copy of the brief** (verbal decisions
> the owner gave after V6 was drafted):
>
> - Hero copy uses **"Free weed gift with every order"** (not just "Free weed")
> - Hours are **10 AM – 10 PM**, so the promo banner reads
>   "Open 10am–10pm" rather than V6's "Order by 11pm"
> - Trust marquee rating is **5.0★** (owner bumped from 4.9)
>
> Everywhere V6 contradicts these decisions, the operator overrides win.
> See §13 / §14 for verification.

---

## 1. Reality check vs. prior briefs

V6 lists many V1–V5 items as "still pending." Most of those were shipped in
earlier turns and confirmed live (see git history). Re-audit before assuming
something is broken.

Confirmed shipped before V6:
- "Loading" nav + footer text removed (V4 Phase 0)
- "Loading menu / Pulling the latest" replaced with skeleton (V4 Phase 0)
- Footer social icons rebuilt as monoline SVGs (V4 Phase 0)
- Trust marquee dedup (single mount in SiteChrome)
- Astoria testimonial → LIC swap (V4 Phase 1)
- Nav scroll consistency on subpages (V4 Phase 0)
- BackToTop button (V4 Phase 0)
- Coverage data restructure to 31 ZIPs / 7 clusters (V4 Phase 1)
- HookPills component + sticky promo banner (V4 Phase 3)
- Lab/COA language removal (V4 Phase 5)
- CoverageMap with cluster polygons, raindrops, bridges (V4 Phase 2)
- /delivery rewrite with 7 cluster cards (V4 Phase 2)
- Banner-gift1.jpg swap (V4 Phase 1)
- STICKY badge for THC ≥30% (Block A)
- Schema.org BreadcrumbList on inner pages (Block A)
- Three new blog drafts (Block A)
- noscript fallback (Block A)

Genuinely new from V6:
- Mailchimp API integration (API key in Vercel env vars, never repo)
- Social: Instagram-only across the site
- Home page condensed from current 9–10 sections to 6
- Featured-deals carousel on mobile

---

## 2. Design system (unchanged from V4 §12)

Palette, fonts, easing, typography all locked. See `app/globals.css`.

---

## 4. Home Page restructure (V6 §4)

### Keep these 6 sections only

1. Hero (with HookPills row)
2. Coverage map (CoverageMap component — already shipped)
3. Why Raindrops — 4 hooks-aligned value cards
4. Featured deals — **3 products MAX** on home (carousel on mobile)
5. One testimonial (+ link to more on /about)
6. Footer (with Mailchimp form)

### Remove from home
- "Free gift drop" mid-page hero — redundant
- Shop by category 3-up — already on /menu
- How ordering works 3 steps — move to /about
- 2 of 3 testimonials — keep best one, others on /about
- Journal preview — nav link is enough
- FAQ section — nav link is enough
- "Menu note:" CMS disclaimer

### Featured deals carousel
- Desktop: 3-column grid
- Mobile: horizontal swipe carousel with scroll-snap, hidden scrollbars
- Dots indicator below
- "See all deals" CTA

---

## 5. Hero (unchanged from V4 §8, with operator overrides)

Headline: **"Guaranteed best flower on the market."**
Subhead: **"Free weed gift with every order. Tax-free under Shinnecock authority. Same-day delivery."**

CTAs:
- Primary: "Claim free weed gift" → /menu (--rd-glow)
- Secondary: "Check coverage" → #coverage (ghost)

Banner: `/assets/banner-gift1.jpg` — already wired.

---

## 7. Coverage data — 31 ZIPs / 7 clusters

Already shipped in `/lib/coverage.ts`. No changes needed.

---

## 9. Mailchimp newsletter integration

### Owner sets these in Vercel → Project Settings → Environment Variables (Production, Preview, Development):

| Name | Value |
| --- | --- |
| `MAILCHIMP_API_KEY` | (paste the full key from Mailchimp, includes `-us12` suffix) |
| `MAILCHIMP_AUDIENCE_ID` | `8fd507d60f` |
| `MAILCHIMP_SERVER_PREFIX` | `us12` |

🔒 Security: API key never goes in this brief, code, or chat. After launch,
rotate the key (Mailchimp → Account → Extras → API keys → revoke + recreate)
since it traveled through chat history.

After setting, trigger a redeploy in Vercel.

### What ships in code

- `scripts/verify-mailchimp.ts` — sanity check the credentials (logs ✅ or ❌)
- `app/api/subscribe/route.ts` — POST handler that adds the email to Mailchimp
- `components/NewsletterForm.tsx` — client component, posts to the API route,
  handles loading / success / duplicate / error states

(Full code provided in the V6 source at §9.3 and §9.4.)

---

## 10. Social — Instagram only

Replace the 4-icon footer row with a single Instagram link:

```
https://www.instagram.com/raindropsgreenery/
```

Show the `@raindropsgreenery` handle next to the icon — better recognition than icon alone.

Grep cleanup for: `tiktok.com/@raindropsgreenery`, `x.com/raindropsgreenery`,
`facebook.com/raindropsgreenery`, and unused lucide imports.

---

## 11. Navigation redesign (V6 §11)

Most of this is already shipped (nav scroll behavior, mobile drawer, padding
for fixed nav). V6 wants a more aggressive icon+label drawer on mobile:

- Mobile drawer slides from LEFT, 85vw width
- Each nav item: 56px tall, 20px icon, 16px label, lime left border on active
- Bottom of drawer: full-width "Order now" CTA + single Instagram link
- ESC closes, focus trap, ARIA expanded state

---

## 13. Verification protocol

After every phase, run the checks before moving on. See V6 source for the
per-phase checklist.

---

## 14. Final Acceptance Checklist

Live URL must pass on both mobile (375px) and desktop (1280px+):

### Visible content
- Hero headline: "Guaranteed best flower on the market."
- 4 hooks visible: TAX FREE / FREE WEED GIFT / FREE DELIVERY / STICKY · ICKY
- Banner: banner-gift1.jpg
- Home page = 6 sections
- No "Loading" text bug
- No "Lab tested" anywhere
- LIC testimonial (not Astoria)

### Map
- Real interactive map with 7 clusters
- Pinch-zoom (mobile) + scroll-zoom (desktop)
- 31 ZIPs validate

### Nav
- Two scroll states on every page
- Mobile drawer with icon + label items

### Social
- Only Instagram link visible site-wide
- Points to `https://www.instagram.com/raindropsgreenery/`

### Newsletter
- Mailchimp verification ✅
- Form on every page submits to Mailchimp
- Test email arrives within 30s
- Duplicate emails handled gracefully

### Mobile
- No horizontal overflow at 375px
- Featured deals carousel swipes cleanly
- Tap targets ≥48px
- Sticky bottom CTAs on /menu and /deals

### Performance
- Lighthouse Performance ≥92 on /
- Lighthouse Accessibility ≥100 on /
- Lighthouse SEO ≥100 on /

### Deploy
- Latest Vercel deploy "Ready"
- Live URL reflects all changes

---

## 16. Post-V6: product catalog import

When V6 signs off, owner sends:
1. CSV file or sample row
2. Current product data location
3. Column structure (name / category / profile / size / THC / price / sale_price / brand / deal_tag / image_url / sku / dutchie_url)
4. Replace all 88 vs merge?

I deliver V7: import script, migration notes, updated card design, Dutchie link mapping.
