/**
 * Category landing-page data — single source of truth for /menu/[category].
 *
 * SEO: captures product-type search intent ("edibles delivery nyc",
 * "pre rolls nyc", "weed flower nyc") with dedicated, crawlable pages that
 * the query-param menu views (/menu?category=Edibles) cannot rank for on
 * their own. Each page has unique intro + FAQ content (answer-first, mirrored
 * in FAQPage schema) and a server-rendered product grid.
 *
 * Compliance: no medical/dosing/health claims — copy stays experiential and
 * factual, 21+ framing preserved.
 */

import type { LiveMenuProduct } from './menu';

export type MenuCategoryFAQ = { q: string; a: string };

export type MenuCategory = {
  slug: string;
  /** Matches LiveMenuProduct.category exactly, for filtering. */
  category: LiveMenuProduct['category'];
  /** Display name. */
  name: string;
  title: string;
  metaDescription: string;
  eyebrow: string;
  heroLede: string;
  intro: string;
  buyingNote: string;
  faqs: MenuCategoryFAQ[];
};

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    slug: 'flower',
    category: 'Flower',
    name: 'Flower Strains',
    title: 'Weed Flower Strains Delivery NYC',
    metaDescription:
      'Same-day, tax-free flower delivery in NYC. Browse curated cannabis strains — indica, sativa & hybrid — by potency, size and price. Free over $25. 21+.',
    eyebrow: 'Flower Strains · 21+',
    heroLede:
      'Curated cannabis flower delivered same-day across NYC — indica, sativa, and hybrid strains, filterable by potency, size, brand, and effect. Tax-free, free on orders over $25.',
    intro:
      'Raindrops Greenery delivers cannabis flower across NYC the same day, every day from 10 AM to 10 PM. Our flower menu is a focused, curated selection — indica, sativa, and hybrid strains in 3.5g and 7g sizes — rather than an overwhelming wall of SKUs. We are a Tribally licensed dispensary with tax-free pricing, and delivery is free on every order over $25.',
    buyingNote:
      'Filter the flower menu by potency, size, brand, and effect to find your match, or take the 2-minute strain finder quiz for a recommendation. Every order also includes a complimentary pre-roll while supplies last.',
    faqs: [
      {
        q: 'What cannabis flower strains can I get delivered in NYC?',
        a: 'Raindrops Greenery delivers a curated selection of indica, sativa, and hybrid flower strains across NYC, same-day. You can browse the full list by potency, size (3.5g or 7g), brand, and effect on the menu.'
      },
      {
        q: 'How much does flower cost, and is it tax-free?',
        a: 'Flower is priced per size — typically 3.5g and 7g — shown on each product. Pricing is tax-free, and delivery is free on orders over $25.'
      },
      {
        q: 'Do you deliver flower the same day?',
        a: 'Yes — same-day flower delivery across Manhattan plus Williamsburg, Greenpoint, and Long Island City, every day from 10 AM to 10 PM, with an average drop-off in under an hour.'
      }
    ]
  },
  {
    slug: 'pre-rolls',
    category: 'Pre-Rolls',
    name: 'Pre-Rolls',
    title: 'Pre-Rolls Delivery NYC — Tax-Free',
    metaDescription:
      'Same-day, tax-free pre-roll delivery in NYC. Browse curated cannabis pre-rolls by strain and price. Free over $25, plus a free pre-roll on every order. 21+.',
    eyebrow: 'Pre-Rolls · 21+',
    heroLede:
      'Ready-to-go cannabis pre-rolls delivered same-day across NYC — by strain, potency, and price. Tax-free, free on orders over $25, with a complimentary pre-roll in every order.',
    intro:
      'Raindrops Greenery delivers cannabis pre-rolls across NYC the same day, every day from 10 AM to 10 PM. Our pre-roll selection is curated by strain and potency so you can order something ready to go in seconds. We are a Tribally licensed dispensary with tax-free pricing, and delivery is free on every order over $25.',
    buyingNote:
      'Browse pre-rolls by strain and price on the menu, or take the strain finder quiz for a recommendation. And every order — pre-rolls or otherwise — ships with a free pre-roll on top, while supplies last.',
    faqs: [
      {
        q: 'Where can I get pre-rolls delivered in NYC?',
        a: 'Raindrops Greenery delivers cannabis pre-rolls same-day across Manhattan plus Williamsburg, Greenpoint, and Long Island City, every day from 10 AM to 10 PM.'
      },
      {
        q: 'Do I get a free pre-roll with my order?',
        a: 'Yes — every Raindrops Greenery order includes a complimentary pre-roll while supplies last, in addition to whatever you order.'
      },
      {
        q: 'Are your pre-rolls tax-free, and is delivery free?',
        a: 'Pre-rolls are tax-free, and delivery is free on every order over $25.'
      }
    ]
  },
  {
    slug: 'edibles',
    category: 'Edibles',
    name: 'Edibles',
    title: 'Weed Edibles Delivery NYC',
    metaDescription:
      'Same-day, tax-free edibles delivery in NYC. Browse cannabis edibles by THC content and price. Free delivery over $25. 21+.',
    eyebrow: 'Edibles · 21+',
    heroLede:
      'Cannabis edibles delivered same-day across NYC — browse by THC content and price. Tax-free, free on orders over $25, daily 10 AM–10 PM.',
    intro:
      'Raindrops Greenery delivers weed edibles across NYC the same day, every day from 10 AM to 10 PM. Each edible lists its total THC in milligrams on the product so you can choose what suits you. We are a Tribally licensed dispensary with tax-free pricing, and delivery is free on every order over $25.',
    buyingNote:
      'Browse the edibles menu by THC content and price, or take the strain finder quiz for a recommendation. For your safety, keep all cannabis products away from children and pets — these products are for adults 21 and older only.',
    faqs: [
      {
        q: 'Where can I order edibles for delivery in NYC?',
        a: 'Raindrops Greenery delivers cannabis edibles same-day across Manhattan plus Williamsburg, Greenpoint, and Long Island City, every day from 10 AM to 10 PM.'
      },
      {
        q: 'How are your edibles measured?',
        a: 'Each edible lists its total THC in milligrams on the product page so you can choose what suits you. These products are for adults 21 and older only.'
      },
      {
        q: 'Are edibles tax-free and included in free delivery?',
        a: 'Yes — edibles are tax-free, and delivery is free on every order over $25.'
      }
    ]
  }
];

export function getMenuCategory(slug: string): MenuCategory | undefined {
  return MENU_CATEGORIES.find((c) => c.slug === slug);
}

export const MENU_CATEGORY_SLUGS = MENU_CATEGORIES.map((c) => c.slug);
