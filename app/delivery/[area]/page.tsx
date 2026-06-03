import type { Metadata } from 'next';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight, BadgeCheck, Clock, MapPin, Truck } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { business } from '@/lib/site-data';
import { getNeighborhood, NEIGHBORHOODS, type Neighborhood } from '@/lib/neighborhoods';
import { getBlogPosts } from '@/lib/blog-posts';

/**
 * Neighborhood delivery landing pages — /delivery/[area].
 *
 * One data-driven, fully static (SSG) route renders a unique page per
 * neighborhood (Williamsburg, Greenpoint, Long Island City, Manhattan).
 * Each captures local search intent ("weed delivery williamsburg") and is
 * structured as clean, answer-first prose with FAQPage + Service JSON-LD so
 * AI answer engines (ChatGPT, Perplexity, Google AI Overviews) can cite it.
 *
 * dynamicParams=false → only the four real neighborhoods render; any other
 * /delivery/* path 404s instead of generating a thin page.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return NEIGHBORHOODS.map((n) => ({ area: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area } = await params;
  const n = getNeighborhood(area);
  if (!n) return {};
  const url = `/delivery/${n.slug}`;
  return {
    title: n.title,
    description: n.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${n.title} | Raindrops Greenery`,
      description: n.metaDescription,
      url,
      images: [{ url: `${business.baseUrl}/assets/DISPENSARYIMAGE.jpg`, width: 1200, height: 800, alt: `Weed delivery in ${n.fullName}` }]
    }
  };
}

export default async function NeighborhoodPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const n = getNeighborhood(area);
  if (!n) notFound();

  const PAGE_URL = `${business.baseUrl}/delivery/${n.slug}`;
  const zipLabel = n.zips.length === 1 ? `ZIP ${n.zips[0]}` : `${n.zips.length} ZIPs`;

  // Resolve related blog posts to real, existing posts (slug → title).
  const posts = getBlogPosts();
  const related = n.relatedPosts
    .map((slug) => posts.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // Cross-link cluster (hub→spoke): a hub page (Manhattan) links to its
  // sub-areas first; a sub-area links to its siblings + parent; then fill
  // with the other primary areas. Deduped, capped at 6.
  const relatedAreas = new Map<string, Neighborhood>();
  const addRel = (arr: Neighborhood[]) =>
    arr.forEach((o) => {
      if (o.slug !== n.slug && !relatedAreas.has(o.slug)) relatedAreas.set(o.slug, o);
    });
  addRel(NEIGHBORHOODS.filter((o) => o.parent === n.slug)); // children (hub → sub-areas)
  if (n.parent) {
    addRel(NEIGHBORHOODS.filter((o) => o.parent === n.parent)); // siblings
    const parentN = getNeighborhood(n.parent);
    if (parentN) addRel([parentN]); // parent hub
  }
  addRel(NEIGHBORHOODS.filter((o) => !o.parent)); // the primary areas
  const others = Array.from(relatedAreas.values()).slice(0, 6);

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${PAGE_URL}#faq`,
    mainEntity: n.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${PAGE_URL}#service`,
    serviceType: 'Cannabis delivery',
    name: `Weed delivery in ${n.name}`,
    description: n.metaDescription,
    url: PAGE_URL,
    provider: { '@id': `${business.baseUrl}#business` },
    areaServed: { '@type': 'Place', name: n.fullName },
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '22:00'
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      description: 'Free delivery on orders over $25; Tribally licensed, tax-free pricing.'
    }
  };

  const highlights = [
    { icon: BadgeCheck, label: 'Tax-free', body: 'Tribally licensed — the price you see is the price you pay.' },
    { icon: Truck, label: 'Free over $25', body: 'Free delivery on every order over $25. No hidden fees.' },
    { icon: Clock, label: 'Same-day', body: `${n.etaLabel} average · open daily 10 AM–10 PM.` },
    { icon: MapPin, label: 'Coverage', body: `${n.borough} · ${zipLabel} we serve here.` }
  ];

  return (
    <SiteChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <Image src="/assets/DISPENSARYIMAGE.jpg" alt="" fill priority sizes="100vw" quality={50} className="object-cover opacity-[0.16] sm:opacity-[0.20]" />
        {/* Mobile: heavier uniform wash so the full-width headline never sits
            over the bleed-through backdrop image (text-on-image legibility). */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,51,40,0.93),rgba(27,51,40,0.86),rgba(27,51,40,0.96))] sm:hidden" aria-hidden />
        <div className="absolute inset-0 hidden sm:block sm:bg-[linear-gradient(90deg,rgba(27,51,40,0.95),rgba(27,51,40,0.80),rgba(27,51,40,0.9))]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(200,230,110,0.16), transparent 55%), radial-gradient(ellipse at bottom right, rgba(46,82,64,0.45), transparent 60%)'
          }}
        />
        <div className="luxury-shell relative max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ label: 'Delivery', href: '/delivery' }, { label: n.name }]} tone="dark" />
          <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">{n.eyebrow}</p>
          <h1 className="mt-4 text-[color:var(--rd-text)]">
            Weed Delivery in <span className="italic">{n.name}.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
            {n.heroLede}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/menu" className="btn-luxe btn-luxe-gold">
              View the menu
              <ArrowRight />
            </Link>
            <Link href="/delivery" className="btn-luxe btn-luxe-ghost">
              Check your ZIP
              <ArrowRight />
            </Link>
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

      {/* Body — cream/paper so .blog-prose (dark text, ink headings, moss links) reads clearly. */}
      <section className="bg-[color:var(--rd-paper)] py-14 sm:py-20">
        <div className="luxury-shell grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="blog-prose max-w-2xl">
            <h2>Same-day weed delivery in {n.fullName}</h2>
            <p>{n.intro}</p>

            <h2>Where we deliver in {n.name}</h2>
            <p>
              {n.zips.length === 1 ? (
                <>We serve ZIP <strong>{n.zips[0]}</strong> here, including:</>
              ) : (
                <>We cover most of {n.name} across six zones, including:</>
              )}
            </p>
            <ul>
              {n.zones.map((z) => (
                <li key={z.name}>
                  <strong>{z.name}.</strong> {z.blurb}
                </li>
              ))}
            </ul>
            <p>
              Not sure if your block is covered? Drop your address into the ZIP checker on the{' '}
              <Link href="/delivery">delivery page</Link> to confirm in a second. Delivery is free on every order over $25.
            </p>

            <h2>How fast is delivery to {n.name}?</h2>
            <p>{n.routing}</p>
            <p>
              Landmarks we deliver near include {n.landmarks.slice(0, -1).join(', ')}, and {n.landmarks[n.landmarks.length - 1]}.
            </p>

            <h2>What you can order</h2>
            <p>
              Our {n.name} menu is a focused, curated catalog of three categories — <strong>Flower Strains</strong>,{' '}
              <strong>Pre-Rolls</strong>, and <strong>Edibles</strong> — filterable by price, potency, size, brand, and
              effect. Browse the full <Link href="/menu">weed delivery menu</Link>, check{' '}
              <Link href="/deals">today’s deals</Link>, or take the 2-minute{' '}
              <Link href="/quiz">strain finder quiz</Link> for a recommendation. Every order is{' '}
              <Link href="/tax-free-weed-delivery-nyc">tax-free</Link> and includes a complimentary pre-roll
              while supplies last.
            </p>

            {n.proof && (
              <blockquote>
                “{n.proof.quote}”
                <br />
                <strong>— {n.proof.author}, {n.proof.location}</strong>
              </blockquote>
            )}

            <h2>{n.name} weed delivery — FAQ</h2>
            {n.faqs.map((f) => (
              <Fragment key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </Fragment>
            ))}

            {related.length > 0 && (
              <>
                <h2>Related reading</h2>
                <ul>
                  {related.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* CTA sidebar */}
          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-3xl border border-[color:var(--rd-glow)]/25 bg-[color:var(--rd-ink-soft)] p-5 shadow-[0_24px_72px_rgba(0,0,0,0.28)] sm:p-6">
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">Order in {n.name}</p>
              <h2
                className="rd-head-aside mt-3 text-[color:var(--rd-text)]"
              >
                Tax-free, same-day, <span className="italic">to your door.</span>
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--rd-text-dim)]">
                Free delivery over $25 and a free pre-roll with every {n.name} order. 21+ only.
              </p>
              <div className="mt-5 grid gap-3">
                <Link href="/menu" className="btn-luxe btn-luxe-paper w-full">
                  View menu
                  <ArrowRight />
                </Link>
                <OrderButton className="w-full" />
              </div>
            </div>

            {/* Cross-link cluster — other neighborhoods we serve */}
            <div className="mt-5 rounded-3xl border border-[color:var(--rd-ink)]/10 bg-[color:var(--rd-paper-bright)] p-5 sm:p-6">
              <p className="rd-eyebrow text-[color:var(--rd-moss)]">We also deliver to</p>
              <ul className="mt-3 grid gap-2">
                {others.map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={`/delivery/${o.slug}`}
                      className="group inline-flex items-center gap-2 text-sm font-medium text-[color:var(--rd-ink)] transition-colors hover:text-[color:var(--rd-moss)]"
                    >
                      <MapPin className="h-4 w-4 text-[color:var(--rd-moss)]" />
                      <span className="border-b border-transparent transition-colors group-hover:border-[color:var(--rd-glow)]">
                        Weed delivery in {o.name}
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/delivery"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-[color:var(--rd-ink)] transition-colors hover:text-[color:var(--rd-moss)]"
                  >
                    <ArrowRight className="h-4 w-4 text-[color:var(--rd-moss)]" />
                    <span className="border-b border-transparent transition-colors group-hover:border-[color:var(--rd-glow)]">
                      All delivery areas
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
