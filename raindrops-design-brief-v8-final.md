# Raindrops Greenery — V8 FINAL Brief

**Source:** Dutchie storefront scrape, May 27, 2026
**Status:** Final V8 — supersedes V8 draft + V7. Runs after V7 is shipped.

---

## What V8 adds

1. **AnnouncementBar (NEW)** — 36px-tall marquee strip pinned ABOVE the main nav.
   Total fixed top stack becomes 108px (36 + 72).
2. **Nav color consistency** — drop the translucent `rgba(10,20,16,0.55)` background
   that reads as "muddy green-grey" over cream-ish pages. Use solid `--rd-ink` at top
   state. Keep blurred-on-scroll behaviour.
3. **44 real products** from the Dutchie scrape replacing the 100 placeholder items.
   Each carries a strain-specific description, a direct Dutchie order URL, and a
   structured THC field (mg vs %).

---

## 1. AnnouncementBar (V8 §1)

- 36px tall, fixed at `top-0` with z-index above the nav
- Background `var(--rd-moss)`, subtle lime border-bottom
- 4 value props in a right-to-left marquee (30s loop, pauses on hover)
- Content: `🎁 Free weed gift with every order · 🌿 Guaranteed best flowers ·
  💰 Tax-free under Shinnecock authority · 🚚 Free delivery in Manhattan +
  East River`
- Items repeated 3× in the DOM so the loop is seamless
- Respect `prefers-reduced-motion` (animation paused)

`<Nav />` shifts down to `top-9` (36px). `<main>` padding-top moves from
`pt-[72px]` → `pt-[108px]`.

---

## 2. Nav color consistency (V8 §2)

**Bug:** `bg-[rgba(10,20,16,0.55)]` at top-of-page state reads dark over a dark
homepage hero, but muddy green-grey over cream content pages.

**Fix (V8 Option A — recommended):** solid `var(--rd-ink)` everywhere at top
state. Keep the data-scrolled state at `rgba(10,20,16,0.88) + backdrop-blur-xl`.
Add a subtle border-bottom always visible, slightly stronger when scrolled.

Hero no longer needs the `-mt-[72px]` negative-margin trick — let it start
cleanly below the 108px stack.

---

## 3. Color consistency audit (V8 §3)

Grep for hardcoded `#fff` / `#000` / `bg-(gray|slate|zinc)-*` / `rgba(` outside
CSS variable definitions. Replace with `var(--rd-*)` equivalents.

All page backgrounds: `--rd-ink`. All card/panel backgrounds: `--rd-ink-soft`.
Lime accent reserved for CTAs, badges, focus, active states.

---

## 4. Product migration (V8 §4)

44 products from Dutchie scrape:
- 14 Flower (`Animal Runtz`, `Bazooka Punch`, … `Super Boof`)
- 14 Pre-Rolls (`Blue Dream Infused 1.5g`, … `Zkittles Infused 1.5g`)
- 16 Edibles (`Belgium Chocolate Bar` × 5, gummies, cookies, cakes, …)

7 STICKY products (3 Flower at 30% THC, 4 1000mg gummies).

Direct order URLs per product (e.g.
`https://dutchie.com/stores/raindrops-greenery-retail/product/animal-runtz`).

Pre-rolls share 3 grouped images (Dutchie's data — expected).

### Files in V8

| File | Path |
| --- | --- |
| `products.json` | `/data/products.json` |
| `products.ts` | `/lib/products.ts` |
| `migrate-products.py` | `/scripts/migrate-products.py` |

### next.config.js — Dutchie CDN whitelist

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 's3-us-west-2.amazonaws.com', pathname: '/dutchie-images/**' },
  ],
}
```

### Adapter strategy (this build)

To avoid a full MenuExplorer rewrite in one pass, the consumer-facing
`lib/menu.ts` is rewritten as an adapter: it imports the new 44-product
dataset from `lib/products.ts` and reshapes each into the legacy
`LiveMenuProduct` shape MenuExplorer + featured-deals already expect. Result:
the site immediately shows the real 44 products with their real descriptions
+ direct Dutchie order URLs, without needing to refactor every product UI
component this turn.

A full structural refactor (new ProductCard, /deals 3-section restructure,
filter UI rework) lands in V8.5.

---

## 5. The stack after V8

```
┌──────────────────────────────────────────────────┐  y=0
│ 🎁 Free weed gift · 🌿 Best flowers · 💰 Tax-free…  │  36px announcement
├──────────────────────────────────────────────────┤  y=36
│  [Logo] Home Menu Deals Quiz Delivery About…     │  72px nav
├──────────────────────────────────────────────────┤  y=108
│                                                    │
│                  Page content                      │
```

Both bars are fixed/sticky. Customer never loses access to value props or nav.
