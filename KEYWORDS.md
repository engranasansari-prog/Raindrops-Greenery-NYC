# Raindrops Greenery NYC — Keyword Research

Real keywords pulled from **Google Autocomplete** (actual queries people type)
via `scripts/keyword-finder.mjs`. 315 raw suggestions, curated below into what's
worth targeting vs. what to ignore.

> **Search volumes:** these are real *keywords*, not volumes. For exact monthly
> numbers, paste any keyword into **Google Keyword Planner** (free with a Google
> account). The "Demand" column below is an experienced estimate, not exact data.

---

## 📋 Paste-ready list (copy → Google Keyword Planner)

Filtered to areas we actually serve (no other-city noise, no competitor names):

```
tax free weed nyc
tax free weed delivery nyc
shinnecock cannabis
shinnecock cannabis dispensary
free weed delivery nyc
weed delivery nyc
cannabis delivery nyc
same day weed delivery nyc
same day cannabis delivery nyc
weed delivery manhattan
best weed delivery nyc
best weed delivery manhattan
cheap weed delivery nyc
cheapest weed delivery nyc
weed delivery app nyc
online weed delivery nyc
weed delivery service nyc
weed delivery midtown manhattan
weed delivery nyc east village
weed delivery nyc upper east side
weed delivery nyc upper west side
weed delivery fidi nyc
weed delivery williamsburg
weed delivery greenpoint
weed delivery long island city
edibles delivery nyc
weed edibles delivery nyc
thc gummies nyc
thc gummies nyc delivery
pre rolls nyc
pre rolls online delivery nyc
weed strains nyc
weed delivery nyc 24/7
24 hour weed delivery manhattan
late night weed delivery nyc
weed delivery near me
```

**Workflow:** paste → Keyword Planner ("Get search volume and forecasts") →
bring the avg. monthly-search numbers back → we re-prioritize and refine the
on-page targeting by real volume.

---

## ✅ TIER 1 — Target these first (match our coverage + our edge)

### Our unique differentiators (lowest competition, highest win-rate)
| Keyword | Demand (est.) | Page |
|---|---|---|
| tax free weed nyc / tax-free weed delivery nyc | Low–Med | Home, /faq |
| shinnecock cannabis / shinnecock cannabis dispensary | Low | /about, blog |
| free weed delivery nyc / free weed gift | Med | Home, /deals |

### Core commercial (competitive — long game)
| Keyword | Demand (est.) | Page |
|---|---|---|
| weed delivery nyc | High | Home |
| cannabis delivery nyc | High | Home |
| same day weed delivery nyc | Med–High | /delivery |
| weed delivery manhattan | High | /delivery |
| best weed delivery nyc / best weed delivery manhattan | Med | Home, /deals |
| weed delivery app nyc / online weed delivery nyc | Med | Home |
| cheap / cheapest weed delivery nyc | Med | /deals |

### Neighborhoods we ACTUALLY serve (best ROI — less competition)
| Keyword | Demand (est.) | Page |
|---|---|---|
| weed delivery midtown manhattan | Med | /delivery |
| weed delivery nyc east village | Med | /delivery |
| weed delivery nyc upper east side / upper west side | Low–Med | /delivery |
| weed delivery fidi nyc | Low | /delivery |
| weed delivery williamsburg | Med | /delivery |
| weed delivery greenpoint (brooklyn) | Low–Med | /delivery |
| weed delivery long island city | Low–Med | /delivery |

### Products
| Keyword | Demand (est.) | Page |
|---|---|---|
| edibles delivery nyc / weed edibles delivery nyc | Med | /menu |
| thc gummies nyc / thc gummies nyc delivery | Med | /menu |
| pre rolls nyc / pre rolls online delivery nyc / where to buy pre rolls nyc | Med | /menu |
| weed strains nyc | Low–Med | /menu |

### Timing / convenience
| Keyword | Demand (est.) | Page |
|---|---|---|
| weed delivery nyc 24/7 / 24 hour weed delivery manhattan | Med | /delivery |
| late night weed delivery nyc | Low–Med | /delivery |
| weed delivery nyc open now | Med | (Google Business Profile) |

---

## 📍 TIER 2 — "near me" searches → win via Google Business Profile

These have **high** demand but are won through **Google Business Profile + the
map pack + reviews**, not on-page text:
`weed delivery near me`, `+ open now`, `+ recreational`, `+ free delivery`,
`+ low minimum`, `+ pay with card`, `+ late night`, `+ reddit`.
👉 Action: optimize the GBP listing, not the website copy, for these.

---

## ⛔ IGNORE — surfaced by the tool but NOT for us

**Areas we don't serve** (targeting these = false promises + ranking penalties):
- Other NYC areas: Astoria, Flushing, Jamaica, Far Rockaway (Queens), Flatbush
  (Brooklyn), Staten Island
- Other regions: Jersey City + NJ towns, Phoenix, Las Vegas, LA, Maryland,
  Canada, etc.

**Competitor brand names** (not our keywords): MetroBud, The Travel Agency,
VGTNYC, NICKLZ, "The Cannabis Place," New Metro, Blaze, etc.

---

## How to get exact search volumes (free)
1. Sign in at **ads.google.com** → Tools → **Keyword Planner**
2. **Get search volume and forecasts** → paste keywords from this file
3. It returns avg. monthly searches + competition. (No ad spend required.)

Re-run discovery anytime: `node scripts/keyword-finder.mjs --deep`
