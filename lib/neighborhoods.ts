/**
 * Neighborhood landing-page data — single source of truth for the
 * /delivery/[area] location pages.
 *
 * SEO + GEO rationale: these capture high-intent local searches the homepage
 * structurally cannot rank for ("weed delivery williamsburg") and give AI
 * answer engines a clean, citable page for "where can I get weed delivered in
 * Greenpoint." Every page is genuinely UNIQUE (real sub-areas, landmarks,
 * routing, local FAQs) — not one template with the name swapped, which Google
 * treats as doorway-page spam.
 *
 * ACCURACY CONSTRAINT: ZIPs + ETAs are derived from lib/coverage.ts. We never
 * claim a ZIP we don't actually serve. Brooklyn/Queens coverage is the
 * specific neighborhoods only (Williamsburg 11211, Greenpoint 11222, LIC
 * 11101) — never "all of Brooklyn/Queens."
 */

import { COVERAGE } from './coverage';

export type NeighborhoodZone = { name: string; blurb: string };
export type NeighborhoodFAQ = { q: string; a: string };
export type NeighborhoodProof = { quote: string; author: string; location: string };

export type Neighborhood = {
  slug: string;
  /** Short display name — "Williamsburg" */
  name: string;
  /** Full name with borough — "Williamsburg, Brooklyn" */
  fullName: string;
  borough: 'Manhattan' | 'Brooklyn' | 'Queens';
  /** Parent neighborhood slug. Manhattan sub-areas (UES/UWS/EV/Midtown) point
   *  to 'manhattan'; primary areas have no parent. Drives the hub→spoke
   *  internal-link architecture (the /delivery hub + footer show primaries;
   *  /delivery/manhattan links to its sub-areas). */
  parent?: string;
  /** Ties back to a COVERAGE cluster id for ETA + ZIP sourcing. */
  clusterId: string;
  /** ZIP(s) we actually serve in this area (from coverage.ts). */
  zips: string[];
  /** Numeric ETA (minutes) for schema. */
  etaMinutes: number;
  /** Human ETA label for display — e.g. "~55 min" or "35–50 min". */
  etaLabel: string;
  /** <title> (brand auto-appended by the layout template). */
  title: string;
  /** ~155-char meta description. */
  metaDescription: string;
  /** Hero eyebrow — "Brooklyn · 11211 · 21+" */
  eyebrow: string;
  /** Hero lead sentence. */
  heroLede: string;
  /** Opening body paragraph (the "same-day delivery in X" answer block). */
  intro: string;
  /** Sub-areas / corridors we cover, each with a unique descriptive blurb. */
  zones: NeighborhoodZone[];
  /** Real local landmarks (used in prose + helps entity/topical relevance). */
  landmarks: string[];
  /** How we route there fast (unique logistics paragraph). */
  routing: string;
  /** Optional local social proof. */
  proof?: NeighborhoodProof;
  /** Unique, answer-first local FAQs (rendered visibly + as FAQPage schema). */
  faqs: NeighborhoodFAQ[];
  /** Blog slugs to cross-link (filtered against real posts at render). */
  relatedPosts: string[];
};

function clusterEta(id: string): number {
  return COVERAGE.clusters.find((c) => c.id === id)?.etaMinutes ?? 55;
}

// All Manhattan ZIPs across the six Manhattan clusters (for the broad
// Manhattan page's areaServed + ZIP count).
const MANHATTAN_ZIPS: string[] = COVERAGE.clusters
  .filter((c) => c.borough === 'Manhattan')
  .flatMap((c) => [...c.zips]);

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    slug: 'williamsburg',
    name: 'Williamsburg',
    fullName: 'Williamsburg, Brooklyn',
    borough: 'Brooklyn',
    clusterId: 'east-river',
    zips: ['11211'],
    etaMinutes: clusterEta('east-river'),
    etaLabel: '~55 min',
    title: 'Weed Delivery in Williamsburg, Brooklyn',
    metaDescription:
      'Same-day, tax-free weed delivery to Williamsburg, Brooklyn (11211) — North Side, South Side, and the waterfront. Free over $25, daily 10 AM–10 PM. 21+.',
    eyebrow: 'Brooklyn · 11211 · 21+',
    heroLede:
      'Tax-free, same-day cannabis delivery to the heart of Williamsburg — North Side, South Side, and the East River waterfront. Free on orders over $25, with a free pre-roll in every bag.',
    intro:
      'Raindrops Greenery delivers weed across Williamsburg (ZIP 11211) every day from 10 AM to 10 PM. We are a Tribally licensed dispensary — all products are produced, packaged, and sold on Native Sovereign Land — and pricing is tax-free, so the price on the menu is the price at your door. Delivery is free on orders over $25.',
    zones: [
      { name: 'North Side', blurb: 'Bedford Avenue above Grand Street, the boutiques and cafés around the Bedford Av L stop, and the blocks running down to the waterfront.' },
      { name: 'South Side', blurb: 'Below Grand toward Broadway and the foot of the Williamsburg Bridge — our quickest drop once a driver clears the bridge from Manhattan.' },
      { name: 'East River waterfront', blurb: 'The towers and parks along Kent Avenue, from Marsha P. Johnson State Park down past Domino Park.' },
      { name: 'Grand Street & Metropolitan Avenue', blurb: 'The east–west corridors connecting the waterfront to East Williamsburg.' }
    ],
    landmarks: ['McCarren Park', 'Domino Park', 'the Williamsburg Bridge', 'the Bedford Av L stop', 'Marsha P. Johnson State Park'],
    routing:
      'We dispatch from Manhattan and cross the Williamsburg Bridge straight into the South Side, which makes 11211 one of our fastest North Brooklyn drops despite the river. Average drop-off is in under an hour, and often quicker outside rush hour. We treat the bridge crossing as a routing problem with a known solution — not an excuse to tack on a surcharge.',
    proof: {
      quote: 'The site made it easy to compare a few hybrids before I ordered. Driver was on time, ID verified at the door, no fuss.',
      author: 'Jordan M.',
      location: 'Williamsburg, Brooklyn'
    },
    faqs: [
      {
        q: 'Is weed delivery legal in Williamsburg?',
        a: 'Raindrops Greenery is a Tribally licensed dispensary and serves adults 21 and older only. A valid government photo ID is verified at the door before every handoff.'
      },
      {
        q: 'How long does weed delivery to Williamsburg take?',
        a: 'Most Williamsburg (11211) orders arrive in under an hour. Our driver crosses the Williamsburg Bridge from Manhattan, so the South Side and Bedford Avenue are some of our fastest North Brooklyn drops. We deliver daily from 10 AM to 10 PM.'
      },
      {
        q: 'Which parts of Williamsburg do you deliver to?',
        a: 'We cover ZIP 11211 — the North Side, the South Side, and the East River waterfront from McCarren Park down to Domino Park. Enter your exact address in the ZIP checker on the delivery page to confirm your block.'
      },
      {
        q: 'Is delivery free in Williamsburg?',
        a: 'Yes — delivery is free on every Williamsburg order over $25. There is no surge pricing and no hidden fees, and every order includes a complimentary pre-roll while supplies last.'
      }
    ],
    relatedPosts: ['east-river-50-minutes', 'nyc-delivery-menu-guide', 'how-checkout-works']
  },
  {
    slug: 'greenpoint',
    name: 'Greenpoint',
    fullName: 'Greenpoint, Brooklyn',
    borough: 'Brooklyn',
    clusterId: 'east-river',
    zips: ['11222'],
    etaMinutes: clusterEta('east-river'),
    etaLabel: '~55 min',
    title: 'Weed Delivery in Greenpoint, Brooklyn',
    metaDescription:
      'Same-day, tax-free weed delivery to Greenpoint, Brooklyn (11222) — Franklin Street, Manhattan Avenue, and the waterfront. Free over $25, daily 10 AM–10 PM. 21+.',
    eyebrow: 'Brooklyn · 11222 · 21+',
    heroLede:
      'Tax-free, same-day cannabis delivery to Greenpoint — Franklin Street, Manhattan Avenue, and the northern Brooklyn waterfront. Free on orders over $25, with a free pre-roll in every bag.',
    intro:
      'Raindrops Greenery delivers weed across Greenpoint (ZIP 11222) every day from 10 AM to 10 PM. We are a Tribally licensed dispensary — all products are produced, packaged, and sold on Native Sovereign Land — and pricing is tax-free, so the listed price is the price you pay, with free delivery over $25.',
    zones: [
      { name: 'Franklin Street corridor', blurb: 'The cafés, bars, and shops running north toward the WNYC Transmitter Park ferry pier.' },
      { name: 'Manhattan Avenue', blurb: 'Greenpoint’s main commercial spine through the historic Polish-American heart of the neighborhood.' },
      { name: 'The waterfront', blurb: 'India Street, the NYC Ferry landing, and the new buildings along the East River.' },
      { name: 'McGolrick Park & east Greenpoint', blurb: 'The quieter residential blocks around Monsignor McGolrick Park toward Newtown Creek.' }
    ],
    landmarks: ['McGolrick Park', 'WNYC Transmitter Park', 'the India Street ferry pier', 'McCarren Park', 'Manhattan Avenue'],
    routing:
      'Greenpoint sits at the northern tip of Brooklyn, so we reach it either up from Williamsburg or across the Pulaski Bridge from Long Island City — the same fast North Brooklyn route. Average drop-off is in under an hour, and there is never a bridge or crossing surcharge.',
    faqs: [
      {
        q: 'Is weed delivery legal in Greenpoint?',
        a: 'Raindrops Greenery is a Tribally licensed dispensary serving adults 21 and older only. A valid government photo ID is checked at the door on every delivery.'
      },
      {
        q: 'How long does weed delivery to Greenpoint take?',
        a: 'Most Greenpoint (11222) orders arrive in under an hour. We route in up from Williamsburg or over the Pulaski Bridge from Long Island City, and deliver daily from 10 AM to 10 PM.'
      },
      {
        q: 'What ZIP code does Greenpoint delivery cover?',
        a: 'We deliver to ZIP 11222, covering Franklin Street, Manhattan Avenue, the waterfront, and the blocks around McGolrick Park. Use the ZIP checker on the delivery page to confirm your exact address.'
      },
      {
        q: 'Is there free weed delivery in Greenpoint?',
        a: 'Yes — delivery is free on every Greenpoint order over $25, with no hidden fees, plus a complimentary pre-roll in every order while supplies last.'
      }
    ],
    relatedPosts: ['east-river-50-minutes', 'flower-prerolls-edibles-guide', 'how-checkout-works']
  },
  {
    slug: 'long-island-city',
    name: 'Long Island City',
    fullName: 'Long Island City, Queens',
    borough: 'Queens',
    clusterId: 'east-river',
    zips: ['11101'],
    etaMinutes: clusterEta('east-river'),
    etaLabel: '~55 min',
    title: 'Weed Delivery in Long Island City, Queens',
    metaDescription:
      'Same-day, tax-free weed delivery to Long Island City, Queens (11101) — Hunters Point, Court Square, and the waterfront. Free over $25, daily 10 AM–10 PM. 21+.',
    eyebrow: 'Queens · 11101 · 21+',
    heroLede:
      'Tax-free, same-day cannabis delivery to Long Island City — Hunters Point, Court Square, and the Gantry Plaza waterfront. Free on orders over $25, with a free pre-roll in every bag.',
    intro:
      'Raindrops Greenery delivers weed across Long Island City (ZIP 11101) every day from 10 AM to 10 PM. We are a Tribally licensed dispensary — all products are produced, packaged, and sold on Native Sovereign Land — and pricing is tax-free, so what you see on the menu is what you pay, with free delivery over $25.',
    zones: [
      { name: 'Hunters Point', blurb: 'The Center Boulevard and Vernon Boulevard high-rises along the waterfront — some of our most frequent LIC stops.' },
      { name: 'Court Square', blurb: 'The towers and offices around the Court Sq subway hub and MoMA PS1.' },
      { name: 'Vernon–Jackson', blurb: 'The restaurant-and-bar strip on Vernon Boulevard near the 7 train.' },
      { name: 'Gantry Plaza waterfront', blurb: 'The parks and residential towers facing Manhattan across the East River.' }
    ],
    landmarks: ['Gantry Plaza State Park', 'MoMA PS1', 'the Pepsi-Cola sign', 'Court Square', 'the Queensboro Bridge'],
    routing:
      'Long Island City is a single bridge or tunnel from Midtown — our drivers take the Queensboro Bridge or the Queens-Midtown Tunnel and are in Hunters Point quickly. Average drop-off is in under an hour, free on orders over $25, with no crossing surcharge.',
    proof: {
      quote: 'Ordered edibles on a Friday and they crossed the bridge in 50 minutes. Doing this again.',
      author: 'Daniel R.',
      location: 'Long Island City, Queens'
    },
    faqs: [
      {
        q: 'Is weed delivery legal in Long Island City?',
        a: 'Raindrops Greenery is a Tribally licensed dispensary serving adults 21 and older only. A valid government photo ID is verified at the door before handoff.'
      },
      {
        q: 'How fast is weed delivery to Long Island City?',
        a: 'Most LIC (11101) orders arrive in under an hour. We cross from Midtown via the Queensboro Bridge or the Queens-Midtown Tunnel, so Hunters Point and the waterfront are quick drops. We deliver daily from 10 AM to 10 PM.'
      },
      {
        q: 'What ZIP does Long Island City delivery cover?',
        a: 'We deliver to ZIP 11101, including Hunters Point, Court Square, Vernon Boulevard, and the Gantry Plaza waterfront. Confirm your exact address with the ZIP checker on the delivery page.'
      },
      {
        q: 'Is delivery free in Long Island City?',
        a: 'Yes — delivery is free on every LIC order over $25, with no hidden fees and a complimentary pre-roll in every order while supplies last.'
      }
    ],
    relatedPosts: ['east-river-50-minutes', 'nyc-delivery-menu-guide', 'flower-prerolls-edibles-guide']
  },
  {
    slug: 'manhattan',
    name: 'Manhattan',
    fullName: 'Manhattan, New York City',
    borough: 'Manhattan',
    clusterId: 'midtown',
    zips: MANHATTAN_ZIPS,
    etaMinutes: 35,
    etaLabel: '35–50 min',
    title: 'Weed Delivery in Manhattan, NYC',
    metaDescription:
      'Same-day, tax-free weed delivery across most of Manhattan — Upper East & West Sides, Midtown, the Village, SoHo, Tribeca & FiDi. Free over $25, daily 10 AM–10 PM. 21+.',
    eyebrow: 'Manhattan · 21+ · Same-day',
    heroLede:
      'Tax-free, same-day cannabis delivery across most of Manhattan — from the Financial District up through Midtown to the Upper East and Upper West Sides. Free on orders over $25, with a free pre-roll in every bag.',
    intro:
      'Raindrops Greenery delivers weed across most of Manhattan every day from 10 AM to 10 PM, covering roughly thirty ZIP codes in six zones. Manhattan is our home turf, so there is no bridge crossing — it is our fastest coverage, with downtown drops in as little as 35 minutes. We are a Tribally licensed dispensary with tax-free pricing, and delivery is free over $25.',
    zones: [
      { name: 'Upper East & Upper West Sides', blurb: 'The avenues flanking Central Park, from the 60s up through the 120s (10023, 10024, 10025, 10028, 10128 and more).' },
      { name: 'Midtown', blurb: 'From Hudson Yards and the Theater District across to Murray Hill and the East 50s.' },
      { name: 'Chelsea, Flatiron & Gramercy', blurb: 'The blocks from the High Line across to Gramercy Park and Madison Square.' },
      { name: 'Greenwich Village, SoHo & Tribeca', blurb: 'Our quickest downtown zone — Washington Square, the SoHo cast-iron district, and Tribeca.' },
      { name: 'East Village & Lower East Side', blurb: 'From Tompkins Square Park down through the LES.' },
      { name: 'Financial District, Battery Park & Seaport', blurb: 'Lower Manhattan from Wall Street to Battery Park City and the South Street Seaport.' }
    ],
    landmarks: ['Central Park', 'Washington Square Park', 'the High Line', 'the Financial District', 'the South Street Seaport'],
    routing:
      'Because every Manhattan zone is reachable without crossing a bridge, this is our fastest and most heavily covered borough. Downtown orders in Greenwich Village, SoHo, Tribeca, and the East Village can arrive in as little as 35 minutes; uptown drops on the Upper East and West Sides average about 50. We deliver daily, 10 AM to 10 PM.',
    proof: {
      quote: 'Cleanest menu I’ve used in New York. Pre-rolls were exactly what was on the page, prices matched. Easy.',
      author: 'Priya S.',
      location: 'Chelsea, Manhattan'
    },
    faqs: [
      {
        q: 'Do you deliver weed across all of Manhattan?',
        a: 'We deliver to most of Manhattan — roughly thirty ZIP codes across six zones, from the Financial District and Battery Park up through Midtown to the Upper East and Upper West Sides. Enter your ZIP in the checker on the delivery page to confirm your block is covered.'
      },
      {
        q: 'How fast is weed delivery in Manhattan?',
        a: 'Manhattan is our fastest coverage because there is no bridge crossing. Downtown orders in Greenwich Village, SoHo, Tribeca, and the East Village can arrive in as little as 35 minutes; uptown drops average about 50. We deliver daily from 10 AM to 10 PM.'
      },
      {
        q: 'Do you deliver to the Upper East Side and Upper West Side?',
        a: 'Yes. We cover the Upper East Side and Upper West Side along both sides of Central Park (including 10023, 10024, 10025, 10028, and 10128), with same-day delivery free on orders over $25.'
      },
      {
        q: 'Is Manhattan weed delivery free?',
        a: 'Delivery is free on every Manhattan order over $25, with no surge pricing or hidden fees, and pricing is tax-free.'
      }
    ],
    relatedPosts: ['nyc-delivery-menu-guide', 'flower-prerolls-edibles-guide', 'how-checkout-works']
  },
  {
    slug: 'upper-east-side',
    name: 'Upper East Side',
    fullName: 'the Upper East Side, Manhattan',
    borough: 'Manhattan',
    parent: 'manhattan',
    clusterId: 'ues-uws',
    zips: ['10021', '10028', '10065', '10075', '10128'],
    etaMinutes: clusterEta('ues-uws'),
    etaLabel: '~50 min',
    title: 'Weed Delivery on the Upper East Side, NYC',
    metaDescription:
      'Same-day, tax-free weed delivery to the Upper East Side (10021, 10028, 10065, 10075, 10128) — Lenox Hill, Yorkville & Carnegie Hill. Free over $25, daily 10 AM–10 PM. 21+.',
    eyebrow: 'Manhattan · UES · 21+',
    heroLede:
      'Tax-free, same-day cannabis delivery across the Upper East Side — Lenox Hill, Yorkville, and Carnegie Hill. Free on orders over $25, with a free pre-roll in every bag.',
    intro:
      'Raindrops Greenery delivers weed across the Upper East Side every day from 10 AM to 10 PM, covering ZIP codes 10021, 10028, 10065, 10075, and 10128. We are a Tribally licensed dispensary with tax-free pricing — what you see on the menu is what you pay, and delivery is free on orders over $25.',
    zones: [
      { name: 'Lenox Hill', blurb: 'The East 60s and 70s around Park and Lexington, down through the hospital corridor (10065, 10021).' },
      { name: 'Yorkville', blurb: 'The East 80s out toward the river and Carl Schurz Park (10028, 10128).' },
      { name: 'Carnegie Hill', blurb: 'The quieter blocks above Museum Mile near Upper Fifth Avenue (10128).' },
      { name: 'Museum Mile & the avenues', blurb: 'Along Central Park’s east edge — Fifth, Madison, Park, Lexington, and Third.' }
    ],
    landmarks: ['Central Park', 'the Met and Museum Mile', 'Lenox Hill', 'Carl Schurz Park', 'the Second Avenue subway'],
    routing:
      'The Upper East Side is pure in-borough delivery — no bridge crossing — so our driver runs straight up the East Side. Average drop-off is around 50 minutes, free on orders over $25, every day from 10 AM to 10 PM.',
    faqs: [
      {
        q: 'Is weed delivery legal on the Upper East Side?',
        a: 'Raindrops Greenery is a Tribally licensed dispensary serving adults 21 and older only. A valid government photo ID is verified at the door before every handoff.'
      },
      {
        q: 'How fast is weed delivery to the Upper East Side?',
        a: 'Most Upper East Side orders arrive in around 50 minutes. Delivery is in-borough with no bridge crossing, every day from 10 AM to 10 PM.'
      },
      {
        q: 'Which Upper East Side ZIP codes do you cover?',
        a: 'We deliver to 10021, 10028, 10065, 10075, and 10128 — Lenox Hill, Yorkville, and Carnegie Hill. Enter your exact address in the ZIP checker on the delivery page to confirm your block.'
      },
      {
        q: 'Is delivery free on the Upper East Side?',
        a: 'Yes — delivery is free on every Upper East Side order over $25, with no hidden fees and a complimentary pre-roll in every order while supplies last.'
      }
    ],
    relatedPosts: ['nyc-delivery-menu-guide', 'flower-prerolls-edibles-guide', 'how-checkout-works']
  },
  {
    slug: 'upper-west-side',
    name: 'Upper West Side',
    fullName: 'the Upper West Side, Manhattan',
    borough: 'Manhattan',
    parent: 'manhattan',
    clusterId: 'ues-uws',
    zips: ['10023', '10024', '10025'],
    etaMinutes: clusterEta('ues-uws'),
    etaLabel: '~50 min',
    title: 'Weed Delivery on the Upper West Side, NYC',
    metaDescription:
      'Same-day, tax-free weed delivery to the Upper West Side (10023, 10024, 10025) — Lincoln Square, the museum blocks & Manhattan Valley. Free over $25, daily 10 AM–10 PM. 21+.',
    eyebrow: 'Manhattan · UWS · 21+',
    heroLede:
      'Tax-free, same-day cannabis delivery across the Upper West Side — from Lincoln Square up through Manhattan Valley. Free on orders over $25, with a free pre-roll in every bag.',
    intro:
      'Raindrops Greenery delivers weed across the Upper West Side every day from 10 AM to 10 PM, covering ZIP codes 10023, 10024, and 10025. We are a Tribally licensed dispensary with tax-free pricing, and delivery is free on orders over $25.',
    zones: [
      { name: 'Lincoln Square', blurb: 'The blocks around Lincoln Center and Columbus Circle’s northern edge (10023).' },
      { name: 'The 70s & 80s', blurb: 'The heart of the Upper West Side between the park and Riverside (10024).' },
      { name: 'Manhattan Valley', blurb: 'The 90s and 100s up toward Morningside (10025).' },
      { name: 'Columbus, Amsterdam & Broadway', blurb: 'The north–south avenues connecting the whole West Side.' }
    ],
    landmarks: ['Central Park', 'Lincoln Center', 'the American Museum of Natural History', 'Riverside Park', 'Zabar’s'],
    routing:
      'The Upper West Side is in-borough delivery with no bridge crossing, so our driver runs straight up the West Side. Average drop-off is around 50 minutes, free on orders over $25, every day from 10 AM to 10 PM.',
    faqs: [
      {
        q: 'Is weed delivery legal on the Upper West Side?',
        a: 'Raindrops Greenery is a Tribally licensed dispensary serving adults 21 and older only. A valid government photo ID is checked at the door on every delivery.'
      },
      {
        q: 'How fast is weed delivery to the Upper West Side?',
        a: 'Most Upper West Side orders arrive in around 50 minutes — in-borough, no bridge crossing — every day from 10 AM to 10 PM.'
      },
      {
        q: 'Which Upper West Side ZIP codes do you cover?',
        a: 'We deliver to 10023, 10024, and 10025 — from Lincoln Square through Manhattan Valley. Use the ZIP checker on the delivery page to confirm your exact address.'
      },
      {
        q: 'Is delivery free on the Upper West Side?',
        a: 'Yes — delivery is free on every Upper West Side order over $25, with no hidden fees and a complimentary pre-roll in every order while supplies last.'
      }
    ],
    relatedPosts: ['nyc-delivery-menu-guide', 'flower-prerolls-edibles-guide', 'how-checkout-works']
  },
  {
    slug: 'east-village',
    name: 'East Village',
    fullName: 'the East Village, Manhattan',
    borough: 'Manhattan',
    parent: 'manhattan',
    clusterId: 'chelsea-flatiron-ev',
    zips: ['10003', '10009'],
    etaMinutes: clusterEta('chelsea-flatiron-ev'),
    etaLabel: '~35 min',
    title: 'Weed Delivery in the East Village, NYC',
    metaDescription:
      'Same-day, tax-free weed delivery to the East Village (10003, 10009) — Alphabet City, Tompkins Square & St. Marks. One of our fastest drops. Free over $25, daily 10 AM–10 PM. 21+.',
    eyebrow: 'Manhattan · East Village · 21+',
    heroLede:
      'Tax-free, same-day cannabis delivery across the East Village — Alphabet City, Tompkins Square, and St. Marks. One of our fastest drops, free on orders over $25, with a free pre-roll in every bag.',
    intro:
      'Raindrops Greenery delivers weed across the East Village every day from 10 AM to 10 PM, covering ZIP codes 10003 and 10009. It is one of our fastest downtown zones, with drops often arriving in around 35 minutes. We are a Tribally licensed dispensary with tax-free pricing, and delivery is free on orders over $25.',
    zones: [
      { name: 'Alphabet City', blurb: 'Avenues A through D and the blocks around Tompkins Square Park (10009).' },
      { name: 'Tompkins Square', blurb: 'The park and the streets that ring it, the heart of the East Village (10009).' },
      { name: 'St. Marks & Astor Place', blurb: 'From St. Marks Place west toward Astor Place and NoHo (10003).' },
      { name: 'Union Square edge', blurb: 'The western East Village toward Union Square and the East 14th Street corridor.' }
    ],
    landmarks: ['Tompkins Square Park', 'St. Marks Place', 'Astor Place', 'the Public Theater', 'Union Square'],
    routing:
      'The East Village is one of our quickest zones — it sits in the fast downtown cluster with no bridge crossing — so drops often land in about 35 minutes. Free on orders over $25, every day from 10 AM to 10 PM.',
    faqs: [
      {
        q: 'Is weed delivery legal in the East Village?',
        a: 'Raindrops Greenery is a Tribally licensed dispensary serving adults 21 and older only. A valid government photo ID is verified at the door before handoff.'
      },
      {
        q: 'How fast is weed delivery to the East Village?',
        a: 'The East Village is one of our fastest zones — drops often arrive in around 35 minutes, with no bridge crossing — every day from 10 AM to 10 PM.'
      },
      {
        q: 'Which East Village ZIP codes do you cover?',
        a: 'We deliver to 10003 and 10009, covering Alphabet City, Tompkins Square, St. Marks, and Astor Place. Confirm your exact address with the ZIP checker on the delivery page.'
      },
      {
        q: 'Is delivery free in the East Village?',
        a: 'Yes — delivery is free on every East Village order over $25, with no hidden fees and a complimentary pre-roll in every order while supplies last.'
      }
    ],
    relatedPosts: ['nyc-delivery-menu-guide', 'what-sticky-icky-means', 'how-checkout-works']
  },
  {
    slug: 'midtown',
    name: 'Midtown',
    fullName: 'Midtown Manhattan',
    borough: 'Manhattan',
    parent: 'manhattan',
    clusterId: 'midtown',
    zips: ['10001', '10016', '10017', '10018', '10019', '10022', '10036'],
    etaMinutes: clusterEta('midtown'),
    etaLabel: '~40 min',
    title: 'Weed Delivery in Midtown Manhattan, NYC',
    metaDescription:
      'Same-day, tax-free weed delivery across Midtown Manhattan — Hell’s Kitchen, Murray Hill, Grand Central & the Theater District. Free over $25, daily 10 AM–10 PM. 21+.',
    eyebrow: 'Manhattan · Midtown · 21+',
    heroLede:
      'Tax-free, same-day cannabis delivery across Midtown — Hell’s Kitchen, the Theater District, Grand Central, and Murray Hill. Free on orders over $25, with a free pre-roll in every bag.',
    intro:
      'Raindrops Greenery delivers weed across Midtown Manhattan every day from 10 AM to 10 PM, covering ZIP codes 10001, 10016, 10017, 10018, 10019, 10022, and 10036. Midtown is central in-borough delivery with no bridge crossing. We are a Tribally licensed dispensary with tax-free pricing, and delivery is free on orders over $25.',
    zones: [
      { name: 'Hell’s Kitchen & Columbus Circle', blurb: 'The far West Side from the 40s through the 50s (10019).' },
      { name: 'Times Square & the Theater District', blurb: 'The Broadway core and the surrounding hotels and offices (10036).' },
      { name: 'Garment District & NoMad', blurb: 'From Penn Station east toward Madison Square (10001, 10018).' },
      { name: 'Murray Hill, Grand Central & Midtown East', blurb: 'The East 30s through the 50s around Grand Central and Sutton (10016, 10017, 10022).' }
    ],
    landmarks: ['Times Square', 'Grand Central Terminal', 'Bryant Park', 'Rockefeller Center', 'Hudson Yards'],
    routing:
      'Midtown is central in-borough delivery with no bridge crossing, so drops average about 40 minutes. Free on orders over $25, every day from 10 AM to 10 PM.',
    faqs: [
      {
        q: 'Is weed delivery legal in Midtown Manhattan?',
        a: 'Raindrops Greenery is a Tribally licensed dispensary serving adults 21 and older only. A valid government photo ID is verified at the door before handoff.'
      },
      {
        q: 'How fast is weed delivery to Midtown?',
        a: 'Most Midtown orders arrive in about 40 minutes — central, in-borough, no bridge crossing — every day from 10 AM to 10 PM.'
      },
      {
        q: 'Which Midtown ZIP codes do you cover?',
        a: 'We deliver to 10001, 10016, 10017, 10018, 10019, 10022, and 10036 — from Hell’s Kitchen and the Theater District across to Murray Hill, Grand Central, and Midtown East. Confirm your block with the ZIP checker on the delivery page.'
      },
      {
        q: 'Is delivery free in Midtown?',
        a: 'Yes — delivery is free on every Midtown order over $25, with no hidden fees and a complimentary pre-roll in every order while supplies last.'
      }
    ],
    relatedPosts: ['nyc-delivery-menu-guide', 'flower-prerolls-edibles-guide', 'how-checkout-works']
  }
];

export function getNeighborhood(slug: string): Neighborhood | undefined {
  return NEIGHBORHOODS.find((n) => n.slug === slug);
}

export const NEIGHBORHOOD_SLUGS = NEIGHBORHOODS.map((n) => n.slug);
