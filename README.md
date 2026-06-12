# Raindrops Greenery NY

Premium Next.js 16 + React 19 website for Raindrops Greenery New York delivery. Focused menu (Flower, Pre-Rolls, Edibles), Dutchie-backed checkout, NYC delivery focus, Markdown-authored blog.

**Contact:** (888) 448-4717 · nycraindrops@gmail.com · Daily 10:00 AM – 10:00 PM

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Fengranasansari-prog%2FRaindrops-Greenery-NYC)

Click the badge above (or go to https://vercel.com/new and pick this repo) to deploy a live preview link in ~30 seconds. After it deploys, Vercel gives you a URL like `https://raindrops-greenery-nyc.vercel.app` to share with the client.

> Use **Import**, not "Clone" — the GitHub repo already exists, so Vercel just needs to pull from it.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Customer home — hero slider, value props, deals, live coverage map, testimonials |
| `/menu` | Filtered product menu (brand/profile/size/effect/THC/price) with deep-linkable product detail (`?product=ID`) |
| `/menu/[category]` | Category landing pages — `/menu/flower`, `/menu/pre-rolls`, `/menu/edibles` |
| `/deals` | Active deals grouped into Heavy Hitters / Top Shelf / Under $25 |
| `/quiz` | Strain-finder quiz that recommends products by effect + format |
| `/delivery` | Manhattan / Brooklyn / Queens delivery overview + ZIP check + live map |
| `/delivery/[area]` | Per-neighborhood delivery pages (Williamsburg, Greenpoint, Long Island City, Manhattan sub-areas) |
| `/tax-free-weed-delivery-nyc` | Tax-free delivery SEO landing page |
| `/about` | About / our story / pillars / testimonials |
| `/contact` | Support + press contact form (mailto), hours, social |
| `/blog`, `/blog/[slug]` | Journal with Markdown blog posts (BlogPosting JSON-LD) |
| `/faq` | FAQ with FAQPage JSON-LD |
| `/legal/privacy`, `/legal/terms`, `/legal/accessibility` | Legal documents |
| `/llms.txt`, `/llms-full.txt`, `/api/site-summary` | AI-discoverability endpoints (plain-text + JSON site summary) |
| `/api/subscribe`, `/api/chat` | Mailchimp newsletter signup + AI chat concierge |

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

Product data is hand-maintained in `lib/products.ts` (the real Dutchie catalog, with images served from the Dutchie CDN). `lib/menu.ts` reshapes it into the `LiveMenuProduct` type the UI consumes, and `lib/featured-deals.ts` derives the deals selections. To change products, prices, or images, edit `lib/products.ts` and commit.

The customer menu is intentionally limited to Flower, Pre-Rolls, and Edibles.

## Blog editing

Posts live in `content/blog` as Markdown with frontmatter and are parsed at build time by `lib/blog-posts.ts`. Supported inline markdown: `**bold**`, `*italic*`, `[link text](https://example.com)`. Block syntax: `## Heading`, bullet lists (`- `), ordered lists (`1. `), block quotes (`> `), and images (`![alt](src)`).

Post images reference paths under `public/` (e.g. `/assets/...`). To publish a post, commit a new Markdown file to `content/blog`.

## Environment

Copy `.env.example` to `.env.local` for development, and set the same keys in Vercel for production:

```env
# Mailchimp — powers the newsletter form (footer + post age-gate)
MAILCHIMP_API_KEY=your-32-hex-string-here-us12
MAILCHIMP_SERVER_PREFIX=us12
MAILCHIMP_AUDIENCE_ID=10charhexid

# Optional analytics — scripts only mount when set, so dev/preview stays clean
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX           # GA4 measurement ID
NEXT_PUBLIC_META_PIXEL_ID=000000000000   # Meta Pixel ID

# Optional AI chat concierge — without a key the widget runs a scripted brain
ANTHROPIC_API_KEY=sk-ant-...

# Subscribers dashboard (/dashboard) — owners-only giveaway + list manager
DASHBOARD_PASSWORD=pick-a-long-owner-password
# DASHBOARD_SESSION_SECRET=optional-32-plus-random-chars
```

`NEXT_PUBLIC_BASE_PATH` must stay **unset** in production: the site serves at the subdomain root (`https://nyc.raindropsgreenery.com`), and canonicals, sitemap, and JSON-LD all assume the bare root. Only set it if the site moves to a sub-path host. See `.env.example` for the full annotated list.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run check       # lint + typecheck
npm run build
```

## Launch checklist

Business details live in `lib/site-data.ts` (single source of truth for contact info, hours, licensing, domain, and the Instagram link). Confirm before going live:

- [x] Phone, email, support email, press email — (888) 448-4717 / nycraindrops@gmail.com
- [x] Business hours — Daily 10:00 AM – 10:00 PM
- [x] Licensing — Shinnecock Nation Cannabis Regulatory Division (`license` / `licensingAuthority`)
- [x] Instagram profile URL (`social[]` — Instagram only)
- [x] Production hostname in `business.domain` / `business.baseUrl` (`nyc.raindropsgreenery.com`)

Then:

- [ ] Review the catalog in `lib/products.ts` (prices, availability, images)
- [ ] Confirm every order button opens the correct Dutchie checkout
- [ ] Set `MAILCHIMP_*` env vars (and optionally `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID`) in production
- [ ] Set `DASHBOARD_PASSWORD` in Vercel (Production **and** Preview) and share it with the owners — `/dashboard` is their subscribers + giveaway tool
- [ ] Run `npm run check` and `npm run build`
- [ ] Verify `/legal/privacy`, `/legal/terms`, `/legal/accessibility` reflect the operator’s real practices (review with counsel)
- [ ] Swap higher-res app icons (`app/icon.jpg` / `app/apple-icon.jpg`); the PWA manifest is generated by `app/manifest.ts` and reads `public/assets/logo.jpg`
- [ ] Confirm the production domain has HSTS preload, HTTPS-only redirects, and a valid certificate

## Subscribers dashboard (`/dashboard`)

Owners-only tool for the giveaway program: see new subscribers, check whether someone already received their free gift before handing one out, mark gifts given, add subscribers manually, and bulk-import CSVs (e.g. Gmail signups). Protected by the shared `DASHBOARD_PASSWORD` (30-day session) via `proxy.ts`; hidden from search engines three ways (robots.txt, page metadata, `X-Robots-Tag`).

**Mailchimp is the database** — there is no separate store. Gift state lives on the contact itself, so it's also visible inside Mailchimp:

- tag `gift-given` — whether they received their one-time gift
- merge field `GIFTDATE` — when (auto-created on first use, no setup needed)
- a contact note — audit trail of every mark/unmark

Two operational rules for the owners:

1. **Don't archive contacts in Mailchimp** — archived contacts disappear from the API, taking their gift history with them. Unsubscribed contacts are fine (the dashboard still shows them so a re-subscriber can't claim twice).
2. Only import CSV contacts who actually agreed to receive emails (the import screen requires confirming this).

Key code: `lib/mailchimp.ts` (API client), `lib/dashboard-auth.ts` + `proxy.ts` (sessions), `app/api/dashboard/*` (routes), `components/Dashboard*.tsx` (UI).

## Tech notes

- Chrome (`components/SiteChrome.tsx`) wires the sticky `components/Nav.tsx`, the scrolling `components/AnnouncementBar.tsx`, and the home hero `components/HeroSlider.tsx`
- `lib/menu-utils.ts` derives effect tags (`Energize / Focus / Uplift / Relax / Sleep / Social`) from product profile + name
- Deep-linkable product detail: `MenuExplorer` syncs `?product=...` to the URL so deals/social links open the modal directly
- Live coverage map (`components/CoverageMap.tsx` / `CoverageLiveMap.tsx`, MapLibre) with ZIP check on home + `/delivery`
- Security headers configured in `next.config.mjs`
- Structured data across the site: `LocalBusiness`/`Store`, `Organization`, `WebSite`, `BlogPosting`, `BreadcrumbList`, `Product`, `FAQPage`
- `prefers-reduced-motion` honored globally
