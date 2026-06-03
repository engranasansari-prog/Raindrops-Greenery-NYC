import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight, BadgeCheck, Clock, Leaf, Truck } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ProductCard } from '@/components/ProductCard';
import { menuProducts, type LiveMenuProduct } from '@/lib/menu';
import { getBrandLabel, inferProfile } from '@/lib/menu-utils';
import { business } from '@/lib/site-data';
import { getMenuCategory, MENU_CATEGORIES } from '@/lib/menu-categories';

/**
 * Category landing pages — /menu/[category] (flower, pre-rolls, edibles).
 *
 * Real, crawlable, fully static (SSG) pages that target product-type search
 * intent ("edibles delivery nyc", "pre rolls nyc") which the query-param menu
 * views can't rank for. Server-renders the category's product grid (so the
 * products are in the HTML crawlers read) plus unique intro + FAQ content and
 * ItemList + FAQPage JSON-LD. Self-canonical, so no duplicate-content clash
 * with /menu (whose ?category= views canonicalize to /menu).
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return MENU_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const c = getMenuCategory(category);
  if (!c) return {};
  const url = `/menu/${c.slug}`;
  return {
    title: c.title,
    description: c.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${c.title} | Raindrops Greenery`,
      description: c.metaDescription,
      url,
      images: [{ url: `${business.baseUrl}/assets/flower.avif`, width: 1200, height: 800, alt: c.title }]
    }
  };
}

// Module scope — avoids an impure Date.now() inside the component render
// (the Next 16 React compiler flags that), same pattern as /deals.
const PRICE_VALID_UNTIL = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

function buildItemListLd(slug: string, name: string, products: LiveMenuProduct[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${business.baseUrl}/menu/${slug}#list`,
    name: `${name} — Raindrops Greenery NY delivery menu`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((product, index) => ({
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
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getMenuCategory(category);
  if (!c) notFound();

  const products = menuProducts.filter((p) => p.category === c.category);
  const others = MENU_CATEGORIES.filter((o) => o.slug !== c.slug);
  const PAGE_URL = `${business.baseUrl}/menu/${c.slug}`;

  const itemListLd = buildItemListLd(c.slug, c.name, products);
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${PAGE_URL}#faq`,
    mainEntity: c.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };

  const highlights = [
    { icon: Leaf, label: `${products.length} ${c.name}`, body: 'Curated — not an overwhelming wall of SKUs.' },
    { icon: BadgeCheck, label: 'Tax-free', body: 'Tribally licensed — the price you see is the price you pay.' },
    { icon: Truck, label: 'Free over $25', body: 'Free delivery on every order over $25.' },
    { icon: Clock, label: 'Same-day', body: 'Open daily 10 AM–10 PM across NYC.' }
  ];

  return (
    <SiteChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <Image src="/assets/flower.avif" alt="" fill priority sizes="100vw" className="object-cover opacity-[0.20]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27, 51, 40,0.95),rgba(27, 51, 40,0.7),rgba(27, 51, 40,0.9))]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(200,230,110,0.16), transparent 55%), radial-gradient(ellipse at bottom right, rgba(46, 82, 64,0.45), transparent 60%)'
          }}
        />
        <div className="luxury-shell relative max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ label: 'Menu', href: '/menu' }, { label: c.name }]} tone="dark" />
          <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">{c.eyebrow}</p>
          <h1 className="mt-4 text-[color:var(--rd-text)]">
            Weed Delivery NYC — <span className="italic">{c.h1Accent}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
            {c.heroLede}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/menu" className="btn-luxe btn-luxe-gold">
              Open full menu
              <ArrowRight />
            </Link>
            <OrderButton />
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.label} className="rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-4">
                  <Icon className="h-6 w-6 text-[color:var(--rd-glow)]" strokeWidth={1.6} />
                  <p className="mt-3 text-sm font-semibold text-[color:var(--rd-text)]">{h.label}</p>
                  <p className="mt-1 text-[13px] leading-6 text-[color:var(--rd-text-dim)]">{h.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Intro prose — unique, crawlable copy high on the page. */}
      <section className="bg-[color:var(--rd-paper)] py-12 sm:py-16">
        <div className="luxury-shell">
          <div className="blog-prose max-w-3xl">
            <h2>{c.name} delivery in NYC</h2>
            <p>{c.intro}</p>
            <p>
              {c.buyingNote} <Link href="/menu">Open the full menu</Link> or take the{' '}
              <Link href="/quiz">strain finder quiz</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Product grid — server-rendered so the products are in the SSR HTML. */}
      {products.length > 0 ? (
        <section className="border-t border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink)] py-14 text-[color:var(--rd-text)] sm:py-20">
          <div className="luxury-shell">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="rd-eyebrow text-[color:var(--rd-glow)]">The {c.name} menu</p>
                <h2 className="mt-3 text-[color:var(--rd-text)]">
                  Browse our <span className="italic">{c.name.toLowerCase()}.</span>
                </h2>
              </div>
              <Link href="/menu" className="group inline-flex items-center gap-2 text-sm text-[color:var(--rd-text-dim)] transition hover:text-[color:var(--rd-glow)]">
                <span className="border-b border-[color:var(--rd-glow)] pb-0.5">Filter the full menu</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p, idx) => (
                <ProductCard key={p.id} product={p} eager={idx < 4} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-[color:var(--rd-ink)] py-16 text-[color:var(--rd-text)]">
          <div className="luxury-shell text-center">
            <p className="text-[color:var(--rd-text-dim)]">This category is restocking. </p>
            <Link href="/menu" className="btn-luxe btn-luxe-gold mt-4 inline-flex">Browse the full menu<ArrowRight /></Link>
          </div>
        </section>
      )}

      {/* FAQ + cross-links */}
      <section className="bg-[color:var(--rd-paper)] py-14 sm:py-20">
        <div className="luxury-shell grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="blog-prose max-w-2xl">
            <h2>{c.name} delivery — FAQ</h2>
            {c.faqs.map((f) => (
              <Fragment key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </Fragment>
            ))}
          </div>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-3xl border border-[color:var(--rd-glow)]/25 bg-[color:var(--rd-ink-soft)] p-5 shadow-[0_24px_72px_rgba(0,0,0,0.28)] sm:p-6">
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">Ready to order?</p>
              <h2
                className="mt-3 text-[color:var(--rd-text)]"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.4rem, 2vw, 1.75rem)', letterSpacing: '-0.015em' }}
              >
                Tax-free, same-day, <span className="italic">to your door.</span>
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--rd-text-dim)]">
                Free delivery over $25 and a free pre-roll with every order. 21+ only.
              </p>
              <div className="mt-5 grid gap-3">
                <Link href="/menu" className="btn-luxe btn-luxe-paper w-full">
                  View menu
                  <ArrowRight />
                </Link>
                <OrderButton className="w-full" />
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-[color:var(--rd-ink)]/10 bg-[color:var(--rd-paper-bright)] p-5 sm:p-6">
              <p className="rd-eyebrow text-[color:var(--rd-moss)]">Browse by category</p>
              <ul className="mt-3 grid gap-2">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={`/menu/${o.slug}`}
                      className="group inline-flex items-center gap-2 text-sm font-medium text-[color:var(--rd-ink)] transition-colors hover:text-[color:var(--rd-moss)]"
                    >
                      <Leaf className="h-4 w-4 text-[color:var(--rd-moss)]" />
                      <span className="border-b border-transparent transition-colors group-hover:border-[color:var(--rd-glow)]">
                        {o.name}
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/deals"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-[color:var(--rd-ink)] transition-colors hover:text-[color:var(--rd-moss)]"
                  >
                    <ArrowRight className="h-4 w-4 text-[color:var(--rd-moss)]" />
                    <span className="border-b border-transparent transition-colors group-hover:border-[color:var(--rd-glow)]">
                      Today’s deals
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </SiteChrome>
  );
}
