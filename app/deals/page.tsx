import type { Metadata } from 'next';
import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgePercent } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import HookPills from '@/components/HookPills';
import { ProductCard } from '@/components/ProductCard';
import { menuProducts, type LiveMenuProduct } from '@/lib/menu';
import { getBrandLabel, getPrimaryPotency, inferProfile } from '@/lib/menu-utils';
import { business } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Cheap Weed Delivery NYC',
  description:
    'Cheap, tax-free weed delivery in NYC — affordable value picks from under $25, free delivery over $25, and a free gift with every order. 21+.',
  alternates: { canonical: '/deals' },
  openGraph: {
    title: 'Cheap, Tax-Free Weed Delivery NYC — Raindrops Deals',
    description: 'Affordable, tax-free cannabis picks for NYC delivery — from under $25 to the premium $40+ ✦ STICKY tier. Free delivery over $25.',
    url: '/deals',
    images: [{ url: '/assets/flower.avif', width: 1200, height: 800, alt: 'Cheap tax-free weed delivery deals in NYC' }]
  }
};

// ProductCard now lives in components/ProductCard.tsx — shared with the
// /menu/[category] landing pages so both render identical crawlable cards.

function Section({
  eyebrow,
  title,
  italic,
  body,
  products
}: {
  eyebrow: string;
  title: string;
  italic: string;
  body: string;
  products: LiveMenuProduct[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="border-t border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink)] py-16 text-[color:var(--rd-text)] sm:py-20">
      <div className="luxury-shell">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">{eyebrow}</p>
            <h2 className="mt-3 text-[color:var(--rd-text)]">
              {title} <span className="italic">{italic}</span>
            </h2>
            <p className="mt-3 text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">{body}</p>
          </div>
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 text-sm text-[color:var(--rd-text-dim)] transition hover:text-[color:var(--rd-glow)]"
          >
            <span className="border-b border-[color:var(--rd-glow)] pb-0.5">Open full menu</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, idx) => (
            /* First 4 cards above the fold in each section render eager */
            <ProductCard key={p.id} product={p} eager={idx < 4} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Pre-compute the curated lists + ItemList JSON-LD ONCE at module init
// rather than inside DealsPage()'s render. menuProducts is static, so
// this is a pure derivation; SSG only evaluates it at build time and the
// page becomes a single deterministic prerender. Also hoists the
// priceValidUntil out of an inline `new Date()` per product (the prior
// shape called Date.now() ~20 times per build), which the Next 16 React
// compiler flagged as an impure render.
const PRICE_VALID_UNTIL = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

// --- Curated "Featured picks" buckets ----------------------------------
// Mutually exclusive by PRICE BAND so a product never repeats across
// sections (the old Heavy-Hitters-vs-Top-Shelf overlap — every sticky $40+
// flower showed in both — is gone), and the page reads low → high the way
// customers shop a curated shelf:
//   1. Under $25   — entry-priced picks  (shown first)
//   2. $25–$40     — everyday sweet spot
//   3. $40+        — the premium ✦ STICKY tier (shown last)
// Each band is capped + sorted "best first" (STICKY, then THC potency) so
// the page stays a curated highlight reel — NOT a second copy of the full
// menu, which is what made /deals feel redundant with /menu.
const SECTION_CAP = 8;

function curate(list: LiveMenuProduct[]): LiveMenuProduct[] {
  return [...list]
    .sort((a, b) => {
      const stickyDelta = Number(b.isSticky) - Number(a.isSticky);
      if (stickyDelta !== 0) return stickyDelta;
      return getPrimaryPotency(b) - getPrimaryPotency(a);
    })
    .slice(0, SECTION_CAP);
}

const underTwentyFiveInit = curate(menuProducts.filter((p) => p.salePrice <= 2500));
const everydayInit = curate(menuProducts.filter((p) => p.salePrice > 2500 && p.salePrice < 4000));
const heavyHittersInit = curate(menuProducts.filter((p) => p.salePrice >= 4000));
// Feed reads low → high, deduped by construction.
const curatedFeed = [...underTwentyFiveInit, ...everydayInit, ...heavyHittersInit].slice(0, 20);

const dealsListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${business.baseUrl}/deals#deals-list`,
    name: 'Featured cannabis picks — Raindrops Greenery NY',
    description:
      'Curated NYC weed picks from Under $25 to the premium $40+ ✦ STICKY tier — tax-free, with a free weed gift on every order and free delivery over $25.',
    numberOfItems: curatedFeed.length,
    itemListElement: curatedFeed.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        '@id': `${business.baseUrl}/menu?product=${encodeURIComponent(product.id)}#product`,
        name: product.name,
        image: product.image ?? undefined,
        brand: { '@type': 'Brand', name: getBrandLabel(product) },
        category: product.category,
        productID: product.id,
        sku: product.id,
        description:
          product.description?.trim() ||
          `${inferProfile(product)} ${product.category.toLowerCase()} from ${getBrandLabel(product)}.`,
        offers: {
          '@type': 'Offer',
          price: (product.salePrice / 100).toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${business.baseUrl}/menu?product=${encodeURIComponent(product.id)}`,
          seller: { '@id': `${business.baseUrl}#business` },
          priceValidUntil: PRICE_VALID_UNTIL
        }
      }
    }))
};

// Answer-first FAQ targeting "cheap / cheapest / affordable weed delivery NYC".
// Rendered visibly below + mirrored in FAQPage JSON-LD so Google + AI engines
// can quote it. Kept on-brand: the deals page is the right place for value
// intent (the home page stays premium).
const DEALS_FAQ = [
  {
    q: 'Is there cheap weed delivery in NYC?',
    a: 'Yes. Raindrops Greenery offers affordable, tax-free weed delivery across NYC, with curated value picks starting under $25. We are a Tribally licensed dispensary with tax-free pricing, and delivery is free on every order over $25 — so the total stays low.'
  },
  {
    q: 'What is the cheapest weed delivery in NYC?',
    a: 'Our "Under $25" picks are the most affordable on the menu, and every order ships free over $25 with a complimentary pre-roll. Pricing is tax-free, so the price you see is the price you pay.'
  },
  {
    q: 'Do you offer weed deals or discount codes?',
    a: 'No codes needed. Our deals are curated value picks that refresh as inventory rotates — lowest-priced first — plus a free weed gift on every order and free delivery over $25, all tax-free.'
  },
  {
    q: 'Is delivery really free?',
    a: 'Delivery is free on every order over $25 across Manhattan plus Williamsburg, Greenpoint, and Long Island City. No surge pricing and no hidden fees.'
  }
];

const dealsFaqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${business.baseUrl}/deals#faq`,
  mainEntity: DEALS_FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a }
  }))
};

export default function DealsPage() {
  // Pure render — all data derivation happens at module init above.
  const underTwentyFive = underTwentyFiveInit;
  const everyday = everydayInit;
  const heavyHitters = heavyHittersInit;
  const totalCurated = underTwentyFive.length + everyday.length + heavyHitters.length;

  return (
    <SiteChrome>
      {/* Plain <script> so the curated deals list ships in the initial
          SSR HTML. Lets Google + Perplexity / ChatGPT Search answer
          "best NYC cannabis deals" with our actual product cards. */}
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealsListLd) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dealsFaqLd) }} />
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <Image src="/assets/flower.avif" alt="" fill priority sizes="100vw" className="object-cover opacity-22" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,51,40,0.94),rgba(27,51,40,0.55))]" />
        <div className="luxury-shell relative grid gap-8 py-12 sm:py-16 lg:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Breadcrumbs items={[{ label: 'Deals' }]} tone="dark" />
            <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">Deals · value picks</p>
            <h1 className="mt-4 text-[color:var(--rd-text)]">
              Cheap weed delivery in NYC. <span className="italic">No codes needed.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
              The most affordable way to order weed in NYC — a curated shortlist, lowest-priced first, starting under $25. No discount codes, no gimmicks: a free weed gift with every order, free delivery over $25, and tax-free pricing. Tap any pick to head to secure checkout.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/menu"
                className="btn-luxe btn-luxe-paper"
              >
                Open full menu
                <ArrowRight />
              </Link>
              <OrderButton />
            </div>
          </div>
        </div>
      </section>

      {/* Hooks pill row */}
      <section className="bg-[color:var(--rd-paper)] py-8 sm:py-10">
        <div className="luxury-shell">
          <HookPills tone="light" />
        </div>
      </section>

      {totalCurated === 0 ? (
        <section className="bg-[color:var(--rd-ink)] py-20 text-[color:var(--rd-text)] sm:py-24">
          <div className="luxury-shell">
            <div className="mx-auto max-w-2xl rounded-3xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-10 text-center">
              <BadgePercent className="mx-auto h-10 w-10 text-[color:var(--rd-glow)]" />
              <h2 className="mt-5 text-[color:var(--rd-text)]">
                No curated drops <span className="italic">right now.</span>
              </h2>
              <p className="mt-3 text-[color:var(--rd-text-dim)]">
                The full 44-product menu is open. Free weed gift still applies.
              </p>
              <div className="mt-6 inline-flex">
                <Link href="/menu" className="btn-luxe btn-luxe-gold">
                  Browse menu
                  <ArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Under $25 — entry-priced, shown FIRST (client request: lower
              price bracket leads the page) */}
          <Section
            eyebrow="Under $25"
            title="Easy entries"
            italic="to start with."
            body="Lower-priced picks for first-time customers and budget rounds — same quality bar, gentler on the wallet."
            products={underTwentyFive}
          />

          {/* $25–$40 — the everyday sweet spot */}
          <Section
            eyebrow="Crowd favorites"
            title="The everyday"
            italic="sweet spot."
            body="The $25–$40 range New Yorkers reorder most — dependable flower, pre-rolls, and edibles."
            products={everyday}
          />

          {/* $40+ — the premium ✦ STICKY tier, shown LAST */}
          <Section
            eyebrow="Heavy hitters"
            title="The ✦ STICKY tier"
            italic="top of the shop."
            body="Our premium $40-and-up tier — the strongest, most-wanted flower and high-dose edibles. Every ✦ STICKY pick lives here."
            products={heavyHitters}
          />
        </>
      )}

      {/* Cheap / value FAQ — answer-first, mirrored in FAQPage JSON-LD.
          Targets "cheap / cheapest / affordable weed delivery NYC". */}
      <section className="bg-[color:var(--rd-paper)] pb-2 pt-16 sm:pt-20">
        <div className="luxury-shell">
          <div className="blog-prose max-w-3xl">
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">Cheap weed delivery in NYC</p>
            <h2>Affordable, tax-free weed delivery — answered</h2>
            {DEALS_FAQ.map((f) => (
              <Fragment key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative footer band */}
      <section className="bg-[color:var(--rd-paper)] py-16">
        <div className="luxury-shell">
          <div className="relative overflow-hidden rounded-3xl bg-[color:var(--rd-ink)] p-8 text-[color:var(--rd-text)] sm:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,230,110,0.18),transparent_55%)]" aria-hidden />
            <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div>
                <p className="rd-eyebrow text-[color:var(--rd-glow)]">Every order</p>
                <h2 className="mt-3 text-[color:var(--rd-text)]">
                  Free weed gift, <span className="italic">free delivery.</span>
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
                  Tax-free. Every order ships with a complimentary pre-roll. 21+ only. Open daily 10 AM – 10 PM.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link href="/menu" className="btn-luxe btn-luxe-paper">
                  Open menu
                  <ArrowRight />
                </Link>
                <OrderButton />
              </div>
            </div>
          </div>

          {/*
            Fine-print card.

            Previous treatment: bg-paper-soft with the eyebrow in rd-moss
            (#2E5240) at 11px — technically passed WCAG AA but felt
            washed-out on phones with auto-dimming. Client correctly
            flagged the eyebrow as "mixing with the background."

            Refresh: card now sits on the brand's ink color (deep forest)
            with a soft inner gold-ring frame, which gives the legal copy
            its own visual moment instead of blending into the surrounding
            cream wash. Body copy uses --rd-text-dim (74% alpha on ink =
            ~8.5:1 contrast) and the "Fine print" eyebrow gets the lime
            glow accent — same treatment used on every other dark-section
            eyebrow across the site for consistency.
          */}
          <div className="mt-10 rounded-2xl border border-[color:var(--rd-glow)]/22 bg-[color:var(--rd-ink-soft)] p-6 text-sm leading-7 text-[color:var(--rd-text-dim)] shadow-[0_8px_30px_rgba(27,51,40,0.18)] sm:p-7 sm:text-[15px]">
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">Fine print</p>
            <p className="mt-3 text-[color:var(--rd-text)]">
              Curated sections refresh as inventory rotates. Free weed gift = one complimentary pre-roll with every order while supplies last. Must be 21+ to order. Raindrops Greenery is a Tribally licensed dispensary; all products are produced, packaged, and sold on Native Sovereign Land.
            </p>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
