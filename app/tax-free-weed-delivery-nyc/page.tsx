import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Clock, MapPin, Truck } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { business } from '@/lib/site-data';

/**
 * GEO / answer-engine landing page for the head keyword
 * "tax-free weed delivery NYC". Written as clear, factual, citable prose
 * (the format ChatGPT / Perplexity / Google AI Overviews quote) with its
 * own FAQPage + BreadcrumbList structured data. Internally linked from the
 * footer + sitemap so crawlers find it.
 */

export const metadata: Metadata = {
  title: 'Tax-Free Weed Delivery in NYC',
  description:
    'Tax-free, same-day weed delivery in NYC from Raindrops Greenery — Shinnecock-licensed, so no NY State cannabis tax. Free delivery over $25 across Manhattan, Williamsburg, Greenpoint & LIC. 21+.',
  alternates: { canonical: '/tax-free-weed-delivery-nyc' },
  openGraph: {
    title: 'Tax-Free Weed Delivery in NYC | Raindrops Greenery',
    description:
      'Same-day, tax-free cannabis delivery across NYC — no NY State cannabis tax, free delivery over $25, free pre-roll with every order. 21+.',
    url: '/tax-free-weed-delivery-nyc',
    images: [{ url: `${business.baseUrl}/assets/DISPENSARYIMAGE.jpg`, width: 1200, height: 800, alt: 'Tax-free weed delivery in NYC' }]
  }
};

const PAGE_URL = `${business.baseUrl}/tax-free-weed-delivery-nyc`;

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${PAGE_URL}#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is weed delivery in NYC tax-free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It can be. Raindrops Greenery delivers under the sovereign cannabis license of the Shinnecock Indian Nation, so its orders are exempt from the New York State cannabis excise and sales taxes charged at OCM-licensed dispensaries. The listed price is the price at checkout.'
      }
    },
    {
      '@type': 'Question',
      name: 'Where does Raindrops deliver in NYC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Same-day across most of Manhattan, plus Williamsburg (11211), Greenpoint (11222), and Long Island City (11101). Free delivery on orders over $25.'
      }
    },
    {
      '@type': 'Question',
      name: 'How fast is same-day weed delivery in NYC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Raindrops Greenery delivers every day from 10 AM to 10 PM, with an average drop-off in under an hour within its coverage area.'
      }
    }
  ]
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: business.baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Tax-Free Weed Delivery in NYC', item: PAGE_URL }
  ]
};

const HIGHLIGHTS = [
  { icon: BadgeCheck, label: 'Tax-free', body: 'No NY State cannabis tax — Shinnecock authority.' },
  { icon: Truck, label: 'Free delivery', body: 'Free on every order over $25. No surge, no hidden fees.' },
  { icon: Clock, label: 'Same-day', body: 'Open daily 10 AM–10 PM. Avg drop-off under an hour.' },
  { icon: MapPin, label: 'NYC coverage', body: 'Manhattan + Williamsburg, Greenpoint & LIC.' }
];

export default function TaxFreeDeliveryPage() {
  return (
    <SiteChrome>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(200,230,110,0.10), transparent 55%), radial-gradient(ellipse at bottom right, rgba(45,74,58,0.45), transparent 60%)'
          }}
        />
        <div className="luxury-shell relative max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ label: 'Tax-Free Weed Delivery in NYC' }]} tone="dark" />
          <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">NYC · 21+ · Tax-free</p>
          <h1 className="mt-4 text-[color:var(--rd-text)]">
            Tax-Free Weed Delivery <span className="italic">in NYC.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
            Raindrops Greenery is a tax-free, same-day cannabis delivery service in New York City. Because we
            operate under the sovereign cannabis license of the Shinnecock Indian Nation, your order skips the
            New York State cannabis excise and sales taxes charged at state-licensed dispensaries — the price
            you see is the price you pay. Free delivery on orders over $25, and a complimentary pre-roll with
            every order.
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
            {HIGHLIGHTS.map((h) => {
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

      {/* Body */}
      <section className="border-t border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink)] py-14 text-[color:var(--rd-text)] sm:py-20">
        <div className="luxury-shell grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="blog-prose max-w-2xl">
            <h2>What makes it tax-free?</h2>
            <p>
              Raindrops Greenery sells through the sovereign cannabis authority of the{' '}
              {business.licensingAuthority}. Sales conducted under that license are exempt from the New York
              State cannabis excise tax and the state/city sales tax that OCM-licensed dispensaries must add.
              In practice that means no surprise line items at checkout — what is listed on the menu is the
              total you pay.
            </p>

            <h2>Where we deliver in NYC</h2>
            <p>
              We offer same-day delivery across most of <strong>Manhattan</strong>, plus three outer-borough
              neighborhoods: <strong>Williamsburg</strong> (11211) and <strong>Greenpoint</strong> (11222) in
              Brooklyn, and <strong>Long Island City</strong> (11101) in Queens. You can confirm your exact
              block with the ZIP checker on the <Link href="/delivery">delivery page</Link>. Delivery is free
              on every order over $25.
            </p>

            <h2>What you can order</h2>
            <p>
              The menu is a focused, curated catalog of three categories — <strong>Flower Strains</strong>,{' '}
              <strong>Pre-Rolls</strong>, and <strong>Edibles</strong> — filterable by price, potency, size,
              brand, and effect. Browse the full <Link href="/menu">weed delivery menu</Link> or take the
              2-minute <Link href="/quiz">strain finder quiz</Link> if you want a recommendation.
            </p>

            <h2>How to order</h2>
            <p>
              Browse the menu, add the products you want, and tap any order button to complete secure
              checkout — payment, ID verification, and delivery details. A valid government photo ID (21+) is
              verified at the door before every handoff, and a free pre-roll is added to every order while
              supplies last.
            </p>

            <h2>Hours &amp; same-day delivery</h2>
            <p>
              Raindrops Greenery is open <strong>every day, 10 AM–10 PM</strong>, with an average drop-off in
              under an hour inside the coverage area. For full details, see the{' '}
              <Link href="/faq">delivery FAQ</Link>.
            </p>
          </div>

          {/* CTA sidebar */}
          <aside className="h-fit rounded-3xl border border-[color:var(--rd-glow)]/25 bg-[color:var(--rd-ink-soft)] p-5 shadow-[0_24px_72px_rgba(0,0,0,0.28)] sm:p-6">
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
          </aside>
        </div>
      </section>
    </SiteChrome>
  );
}
