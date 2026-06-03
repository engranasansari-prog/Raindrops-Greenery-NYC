import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { faqs, business } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Weed Delivery FAQ — NYC',
  description: 'Common questions about NYC weed delivery — tax-free pricing, coverage areas, free delivery, the free gift, and 21+ ID requirements.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Raindrops Greenery FAQ',
    description: 'Answers about delivery, ordering, checkout, and product browsing.',
    url: '/faq',
    images: [{ url: `${business.baseUrl}/assets/DISPENSARYIMAGE.jpg`, width: 1200, height: 800, alt: 'Raindrops Greenery NYC' }]
  }
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a }
  }))
};

export default function FaqPage() {
  return (
    <SiteChrome>
      {/* Plain <script> tag (not next/script) so the FAQPage schema is in
          the initial SSR HTML where Googlebot + AI engines can pick it up
          on first crawl. Powers FAQ rich results in Google + answer
          snippets in Perplexity / ChatGPT Search. */}
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(200,230,110,0.10), transparent 55%), radial-gradient(ellipse at bottom right, rgba(46,82,64,0.45), transparent 60%)'
          }}
        />
        <div className="luxury-shell relative max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ label: 'FAQ' }]} tone="dark" />
          <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">Frequently asked</p>
          <h1 className="mt-4 text-[color:var(--rd-text)]">
            Quick answers <span className="italic">before you order.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
            Clear details about delivery areas, age requirements, product browsing, and checkout.
          </p>
        </div>
      </section>

      {/* Accordion + sidebar */}
      <section className="rd-luxe-paper border-t border-[color:var(--rd-ink)]/8 py-14 sm:py-20">
        <div className="luxury-shell grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={faq.q}
                open={index === 0}
                className="rd-shadow-luxe group rounded-2xl border border-[color:var(--rd-ink)]/10 bg-[color:var(--rd-paper-bright)] p-5 transition hover:border-[color:var(--rd-moss)]/35 sm:p-6"
              >
                <summary
                  className="cursor-pointer list-none text-[color:var(--rd-on-paper)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.15rem, 1.8vw, 1.5rem)', letterSpacing: '-0.01em' }}
                >
                  <span className="inline-flex w-full items-center justify-between gap-4">
                    {faq.q}
                    <span className="shrink-0 text-xl font-light text-[color:var(--rd-moss)] transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-4 text-base leading-8 text-[color:var(--rd-on-paper-dim)]">{faq.a}</p>
              </details>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-[color:var(--rd-glow)]/25 bg-[color:var(--rd-ink-soft)] p-5 shadow-[0_24px_72px_rgba(0,0,0,0.28)] sm:p-6">
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">Need the menu?</p>
            <h2
              className="rd-head-aside mt-3 text-[color:var(--rd-text)]"
            >
              Browse Flower, Pre-Rolls, <span className="italic">and Edibles.</span>
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--rd-text-dim)]">
              Filter by strain, profile, price, and potency. Free weed gift on every order.
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
