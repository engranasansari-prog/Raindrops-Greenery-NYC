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
      'Raindrops Greenery delivers weed across Williamsburg (ZIP 11211) every day from 10 AM to 10 PM. Because we operate under the sovereign cannabis license of the Shinnecock Indian Nation, your Williamsburg order skips the New York State cannabis tax — the price on the menu is the price at your door. Delivery is free on orders over $25.',
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
        a: 'Raindrops Greenery delivers in Williamsburg under the sovereign cannabis license of the Shinnecock Indian Nation, and serves adults 21 and older only. A valid government photo ID is verified at the door before every handoff.'
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
      'Raindrops Greenery delivers weed across Greenpoint (ZIP 11222) every day from 10 AM to 10 PM. Operating under the sovereign cannabis license of the Shinnecock Indian Nation means no New York State cannabis tax is added to your Greenpoint order — the listed price is the price you pay, with free delivery over $25.',
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
        a: 'Raindrops Greenery delivers in Greenpoint under the sovereign cannabis license of the Shinnecock Indian Nation, for adults 21 and older only. A valid government photo ID is checked at the door on every delivery.'
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
      'Raindrops Greenery delivers weed across Long Island City (ZIP 11101) every day from 10 AM to 10 PM. Because we operate under the sovereign cannabis license of the Shinnecock Indian Nation, your LIC order carries no New York State cannabis tax — what you see on the menu is what you pay, and delivery is free over $25.',
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
        a: 'Raindrops Greenery delivers in Long Island City under the sovereign cannabis license of the Shinnecock Indian Nation, for adults 21 and older only. A valid government photo ID is verified at the door before handoff.'
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
      'Raindrops Greenery delivers weed across most of Manhattan every day from 10 AM to 10 PM, covering roughly thirty ZIP codes in six zones. Manhattan is our home turf, so there is no bridge crossing — it is our fastest coverage, with downtown drops in as little as 35 minutes. Operating under the sovereign cannabis license of the Shinnecock Indian Nation means no New York State cannabis tax is added, and delivery is free over $25.',
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
        a: 'Delivery is free on every Manhattan order over $25, with no surge pricing or hidden fees — and because we operate under Shinnecock authority, there is no New York State cannabis tax added at checkout either.'
      }
    ],
    relatedPosts: ['nyc-delivery-menu-guide', 'why-tax-free-shinnecock', 'how-checkout-works']
  }
];

export function getNeighborhood(slug: string): Neighborhood | undefined {
  return NEIGHBORHOODS.find((n) => n.slug === slug);
}

export const NEIGHBORHOOD_SLUGS = NEIGHBORHOODS.map((n) => n.slug);
