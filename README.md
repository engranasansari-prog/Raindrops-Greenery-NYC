# Raindrops Greenery NY

Premium Next.js 16 + React 19 website for Raindrops Greenery New York delivery. Focused menu (Flower, Pre-Rolls, Edibles), Dutchie/Flowhub-backed checkout, NYC delivery focus, blog with Decap CMS admin.

**Contact:** (888) 448-9717 · nycraindrops@gmail.com · Daily 10:00 AM – 10:00 PM

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Fengranasansari-prog%2FRaindrops-Greenery-NYC)

Click the badge above (or go to https://vercel.com/new and pick this repo) to deploy a live preview link in ~30 seconds. After it deploys, Vercel gives you a URL like `https://raindrops-greenery-nyc.vercel.app` to share with the client.

> Use **Import**, not "Clone" — the GitHub repo already exists, so Vercel just needs to pull from it.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Customer home — hero, deals strip, value props, delivery check, testimonials, FAQ |
| `/menu` | Filtered product menu with brand/profile/size/effect/THC/price filters and deep-linkable product detail (`?product=ID`) |
| `/deals` | Active deals, promo codes, and sale products |
| `/delivery` | Manhattan / Brooklyn / Queens delivery overview + ZIP check |
| `/about` | About / our story / pillars / testimonials |
| `/contact` | Support + press contact form (mailto), hours, social |
| `/blog`, `/blog/[slug]` | Journal with markdown blog posts (Article JSON-LD) |
| `/faq` | FAQ with FAQPage JSON-LD |
| `/legal/privacy`, `/legal/terms`, `/legal/accessibility` | Legal documents |
| `/admin/` | Git-backed blog editor (Decap CMS) |

## Local setup

```bash
npm install
npm run dev
```

On Windows PowerShell:

```bash
npm.cmd install
npm.cmd run dev
```

Open <http://localhost:3000>.

## Product menu

Live menu data is generated into `lib/live-menu-products.generated.ts` from the Flowhub source.

```bash
npm run sync:menu
```

The customer menu is intentionally limited to Flower, Pre-Rolls, and Edibles.

## Blog editing

Posts live in `content/blog` as Markdown with frontmatter. Supported inline markdown: `**bold**`, `*italic*`, `[link text](https://example.com)`. Block syntax: `## Heading`, bullet lists (`- `), ordered lists (`1. `), block quotes (`> `), and images (`![alt](src)`).

Uploaded images go to `public/uploads`. The admin editor is at `/admin/` and is wired to Decap CMS with Git Gateway.

## Environment

Set these in `.env.local` (and in your hosting provider) before launch:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX           # Optional: GA4 measurement ID
NEXT_PUBLIC_META_PIXEL_ID=000000000000   # Optional: Meta Pixel ID
```

Analytics scripts only mount when these env vars are set, so dev and preview stays clean.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run check       # lint + typecheck
npm run build
```

## Launch checklist

Before handing off to a client / going live, fill in the values flagged `[REPLACE: ...]` inside `lib/site-data.ts`:

- [x] Phone, email, support email, press email — (888) 448-9717 / nycraindrops@gmail.com
- [x] Business hours — Daily 10:00 AM – 10:00 PM
- [ ] Physical address
- [ ] NY OCM retail license number
- [ ] Social profile URLs (Instagram, TikTok, X, Facebook)
- [ ] Real production hostname in `business.domain` / `business.baseUrl`
- [ ] Press mentions (or remove the press strip on `/about`)

Then:

- [ ] Refresh product data with `npm run sync:menu`
- [ ] Confirm every order button opens the correct checkout store
- [ ] Confirm `/admin/` is connected to the repository before handing it to non-technical editors
- [ ] Set `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_META_PIXEL_ID` in production
- [ ] Run `npm run check` and `npm run build`
- [ ] Verify `/legal/privacy`, `/legal/terms`, `/legal/accessibility` reflect the operator’s real practices (review with counsel)
- [ ] Add favicon / app icons in `public/` and update `public/manifest.json` if higher-res icons are available
- [ ] Confirm the production domain has HSTS preload, HTTPS-only redirects, and a valid certificate

## Tech notes

- Sticky header with promo strip (`components/PromoStrip.tsx`, dismissible per session)
- `lib/menu-utils.ts` derives effect tags (`Energize / Focus / Uplift / Relax / Sleep / Social`) from product profile + name
- Deep-linkable product detail: `MenuExplorer` syncs `?product=...` to URL so deals/social links open the modal directly
- Security headers configured in `next.config.mjs`
- Structured data on every page: `LocalBusiness`, `Organization`, `WebSite`, `BlogPosting`, `FAQPage`
- `prefers-reduced-motion` honored globally
