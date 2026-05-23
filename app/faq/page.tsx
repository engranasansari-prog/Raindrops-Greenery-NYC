import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import { faqs } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers about Raindrops Greenery New York delivery, ordering, checkout, lab testing, and 21+ requirements.',
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
      <Script id="ld-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <section className="relative overflow-hidden bg-[#0b3025] text-white">
        <div className="absolute inset-0 mesh-bg opacity-15" />
        <div className="luxury-shell relative max-w-4xl py-14 md:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">FAQ</p>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl font-extrabold leading-tight md:text-7xl">Quick answers before you order.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
            Clear details about delivery areas, age requirements, product browsing, and checkout.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="luxury-shell grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0} className="group rounded-lg border border-white/70 bg-white/82 p-5 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
                <summary className="cursor-pointer list-none font-[var(--font-display)] text-2xl font-bold text-[var(--emerald-deep)]">
                  <span className="inline-flex w-full items-center justify-between gap-4">
                    {faq.q}
                    <span className="text-sm font-extrabold text-[var(--champagne-dark)] transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-4 leading-8 text-[var(--muted)]">{faq.a}</p>
              </details>
            ))}
          </div>

          <aside className="h-fit rounded-lg border border-[rgba(217,183,111,0.45)] bg-[rgba(217,183,111,0.12)] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne-dark)]">Need the menu?</p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">Browse Flower, Pre-Rolls, and Edibles.</h2>
            <div className="mt-5 grid gap-3">
              <Link href="/menu" className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--emerald-deep)] transition hover:border-[var(--champagne)]">
                View menu
                <ArrowRight className="h-4 w-4" />
              </Link>
              <OrderButton className="w-full" />
            </div>
          </aside>
        </div>
      </section>
    </SiteChrome>
  );
}
