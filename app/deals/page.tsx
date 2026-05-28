import type { Metadata } from 'next';
import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgePercent } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import HookPills from '@/components/HookPills';
import { menuProducts, type LiveMenuProduct } from '@/lib/menu';
import { formatPrice, getBrandLabel, getStrainTag, inferProfile } from '@/lib/menu-utils';
import { PRODUCT_BLUR_DATA_URL } from '@/lib/image-blur';
import { business } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Deals',
  description:
    'Tax-free Shinnecock-licensed cannabis picks — Heavy Hitters, Top Shelf, and Under $25. Free delivery across Manhattan, Brooklyn, and Queens.',
  alternates: { canonical: '/deals' },
  openGraph: {
    title: 'Raindrops Greenery NY Deals',
    description: 'Tax-free cannabis picks for NYC delivery. Heavy Hitters, Top Shelf, Under $25.',
    url: '/deals',
    images: [{ url: '/assets/flower.avif', width: 1200, height: 800, alt: 'Raindrops Greenery deals' }]
  }
};

// Solid dark ink chip + brand-accent text/border so the badge reads
// cleanly against the LIGHT cream product-image area.
const STRAIN_TINT: Record<string, string> = {
  INDICA: 'border-[color:var(--rd-rain)]/55 text-[color:var(--rd-rain)] bg-[color:var(--rd-ink)]/92',
  SATIVA: 'border-[color:var(--rd-glow)]/55 text-[color:var(--rd-glow)] bg-[color:var(--rd-ink)]/92',
  HYBRID: 'border-[color:var(--rd-amber)]/55 text-[color:var(--rd-amber)] bg-[color:var(--rd-ink)]/92',
  BALANCED: 'border-[color:var(--rd-mint)]/55 text-[color:var(--rd-mint)] bg-[color:var(--rd-ink)]/92'
};

function ProductCard({ product, eager = false }: { product: LiveMenuProduct; eager?: boolean }) {
  const strain = getStrainTag(product);
  const tint = STRAIN_TINT[strain] ?? STRAIN_TINT.BALANCED;
  return (
    <Link
      href={`/menu?product=${encodeURIComponent(product.id)}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:border-[color:var(--rd-glow)]/40 hover:shadow-[0_30px_70px_rgba(200,230,110,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[color:var(--rd-paper-soft)]">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            // Next.js Image Optimization — AVIF/WebP + edge-cached. The
            // Dutchie CDN host is whitelisted in next.config.mjs.
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            placeholder="blur"
            blurDataURL={PRODUCT_BLUR_DATA_URL}
            loading={eager ? 'eager' : 'lazy'}
            className="object-contain p-6"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] [font-family:var(--font-mono)] ${tint}`}>
            {strain}
          </span>
          {product.isSticky && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
              ✦ STICKY
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="rd-eyebrow truncate text-[color:var(--rd-text-mute)]">{getBrandLabel(product)}</p>
        <h3
          className="mt-1 line-clamp-2 break-words text-[color:var(--rd-text)]"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: 'clamp(0.95rem, 1.3vw, 1.05rem)',
            lineHeight: 1.3,
            minHeight: 'calc(1.3em * 2)'
          }}
          title={product.name}
        >
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          {/* Luxury bar-menu style — size labels left, prices right, like
              a curated wine list. Same pattern as the MenuExplorer cards
              for cross-page visual consistency. */}
          <div className="[font-family:var(--font-mono)]">
            {product.variants.length > 1 ? (
              <div className="grid grid-cols-[auto_auto] items-baseline gap-x-3 gap-y-0.5">
                {product.variants.map((variant, i) => (
                  <Fragment key={variant.label}>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] text-left">
                      {variant.label}
                    </span>
                    <span className={`font-semibold tabular-nums text-[color:var(--rd-amber)] text-right ${i === 0 ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg opacity-85'}`}>
                      {formatPrice(variant.price)}
                    </span>
                  </Fragment>
                ))}
              </div>
            ) : (
              <p className="text-xl font-semibold text-[color:var(--rd-amber)] sm:text-2xl">
                {formatPrice(product.salePrice)}
              </p>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rd-eyebrow text-[color:var(--rd-glow)]">
            View
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

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

const heavyHittersInit = menuProducts.filter((p) => p.isSticky);
const topShelfInit = menuProducts.filter((p) => p.category === 'Flower' && p.salePrice >= 4000); // $40+
const underTwentyFiveInit = menuProducts.filter((p) => p.salePrice <= 2500);
const curatedFeed = [...heavyHittersInit, ...topShelfInit, ...underTwentyFiveInit].slice(0, 20);

const dealsListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${business.baseUrl}/deals#deals-list`,
    name: 'Tonight’s curated cannabis picks — Raindrops Greenery NY',
    description:
      'Heavy Hitters (highest THC), Top Shelf ($40+ flower), and Under-$25 entry picks for tax-free NYC delivery. Free delivery on orders over $25.',
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

export default function DealsPage() {
  // Pure render — all data derivation happens at module init above.
  const heavyHitters = heavyHittersInit;
  const topShelf = topShelfInit;
  const underTwentyFive = underTwentyFiveInit;
  const totalCurated = heavyHitters.length + topShelf.length + underTwentyFive.length;

  return (
    <SiteChrome>
      {/* Plain <script> so the curated deals list ships in the initial
          SSR HTML. Lets Google + Perplexity / ChatGPT Search answer
          "best NYC cannabis deals" with our actual product cards. */}
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealsListLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <Image src="/assets/flower.avif" alt="" fill priority sizes="100vw" className="object-cover opacity-22" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,36,29,0.94),rgba(19,36,29,0.55))]" />
        <div className="luxury-shell relative grid gap-8 py-12 sm:py-16 lg:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Breadcrumbs items={[{ label: 'Deals' }]} tone="dark" />
            <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">Tonight’s drops</p>
            <h1 className="mt-4 text-[color:var(--rd-text)]">
              Curated picks. <span className="italic">No codes needed.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
              Free weed gift with every order. Browse the picks below and tap any product to head to secure checkout — every card links straight through.
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
          {/* Heavy Hitters — sticky / 30%+ flower + 1000mg gummies */}
          <Section
            eyebrow="Heavy hitters"
            title="Highest THC"
            italic="in the shop."
            body="The seven products that wear the ✦ STICKY badge — 30%+ flower and 1000mg gummies. Strong stuff."
            products={heavyHitters}
          />

          {/* Top Shelf — $40+ flower */}
          <Section
            eyebrow="Top shelf"
            title="Premium picks"
            italic="worth the splurge."
            body="The flower we'd order ourselves. $40 and up — top-grade nugs that justify the price tag."
            products={topShelf}
          />

          {/* Under $25 — entry-priced */}
          <Section
            eyebrow="Under $25"
            title="Easy entries"
            italic="without the splurge."
            body="Lower-priced picks for first-time customers or budget rounds. Same quality bar."
            products={underTwentyFive}
          />
        </>
      )}

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
                  Tax-free under Shinnecock authority. Every order ships with a complimentary pre-roll. 21+ only. Open daily 10 AM – 10 PM.
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
          <div className="mt-10 rounded-2xl border border-[color:var(--rd-glow)]/22 bg-[color:var(--rd-ink-soft)] p-6 text-sm leading-7 text-[color:var(--rd-text-dim)] shadow-[0_8px_30px_rgba(19,36,29,0.18)] sm:p-7 sm:text-[15px]">
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">Fine print</p>
            <p className="mt-3 text-[color:var(--rd-text)]">
              Curated sections refresh as inventory rotates. Free weed gift = one complimentary pre-roll per first-time order while supplies last. Must be 21+ to order. Sales operate under the Shinnecock Indian Nation Cannabis Regulatory Division — no NY State cannabis excise or sales tax applies.
            </p>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
