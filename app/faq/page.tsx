import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { faqs } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers about Raindrops Greenery NYC delivery, tax-free Shinnecock authority, free delivery, free gift, and 21+ requirements.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Raindrops Greenery FAQ',
    description: 'Answers about delivery, ordering, checkout, and product browsing.',
    url: '/faq'
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
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

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
      <section className="border-t border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink)] py-14 text-[color:var(--rd-text)] sm:py-20">
        <div className="luxury-shell grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={faq.q}
                open={index === 0}
                className="group rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-5 shadow-[0_18px_54px_rgba(0,0,0,0.22)] transition hover:border-[color:var(--rd-glow)]/30 sm:p-6"
              >
                <summary
                  className="cursor-pointer list-none text-[color:var(--rd-text)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.15rem, 1.8vw, 1.5rem)', letterSpacing: '-0.01em' }}
                >
                  <span className="inline-flex w-full items-center justify-between gap-4">
                    {faq.q}
                    <span className="shrink-0 text-xl font-light text-[color:var(--rd-glow)] transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-4 text-base leading-8 text-[color:var(--rd-text-dim)]">{faq.a}</p>
              </details>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-[color:var(--rd-glow)]/25 bg-[color:var(--rd-ink-soft)] p-5 shadow-[0_24px_72px_rgba(0,0,0,0.28)] sm:p-6">
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">Need the menu?</p>
            <h2
              className="mt-3 text-[color:var(--rd-text)]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.4rem, 2vw, 1.75rem)', letterSpacing: '-0.015em' }}
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
