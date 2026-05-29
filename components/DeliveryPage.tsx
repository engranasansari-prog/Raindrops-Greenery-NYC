'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useState } from 'react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import HookPills from '@/components/HookPills';
// LiveOrderToasts only appears 3.5s after mount — lazy-load to keep it off
// the critical-path JS.
const LiveOrderToasts = dynamic(() => import('@/components/LiveOrderToasts'), {
  ssr: false
});
import { COVERAGE, ALL_ZIPS } from '@/lib/coverage';

const easeOut = [0.22, 1, 0.36, 1] as const;

// Lazy-load CoverageMap — same heavy SVG component used on the home page.
const CoverageMap = dynamic(() => import('@/components/CoverageMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[520px] w-full rounded-3xl bg-[color:var(--rd-ink-soft)]/40" />
  )
});

const PILLARS = [
  { icon: Truck, title: 'Free delivery', body: 'Free on every order over $25, every covered ZIP. No surge, no hidden fees.' },
  { icon: Sparkles, title: 'Tax-free', body: 'Sovereign Shinnecock authority — no NY State cannabis excise or sales tax.' },
  { icon: Clock, title: 'Same-day', body: 'Open 10 AM – 10 PM. Average drop-off window: 35–55 minutes depending on zone.' },
  { icon: ShieldCheck, title: 'Discreet', body: '21+ ID verified at the door. Short, professional hand-offs.' }
];

export default function DeliveryPage() {
  // Single source of truth for the active cluster — shared between the
  // map (highlight) and the cluster cards (lifted state for hover sync).
  const [activeCluster, setActiveCluster] = useState<string | null>(null);

  return (
    <SiteChrome>
      {/* Hero — full-width pill with backdrop image + headline */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <Image src="/assets/DISPENSARYIMAGE.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-[0.22]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,36,29,0.94),rgba(19,36,29,0.62),rgba(19,36,29,0.78))]" />
        <div className="luxury-shell relative py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <Breadcrumbs items={[{ label: 'Delivery' }]} tone="dark" />
            <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">Same-day NYC delivery</p>
            <h1 className="mt-4 text-[color:var(--rd-text)]">
              Manhattan. <span className="italic">Brooklyn + Queens.</span> Same-day.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
              Same-day weed delivery across Manhattan plus Williamsburg, Greenpoint, and Long Island City — {ALL_ZIPS.length} ZIPs in {COVERAGE.clusters.length} neighborhoods. Tax-free under Shinnecock authority, free on orders over $25, with average drop-off in under an hour.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu" className="btn-luxe btn-luxe-gold">
                Browse menu
                <ArrowRight />
              </Link>
              <OrderButton />
            </div>
          </div>
        </div>
      </section>

      {/* Hook pills */}
      <section className="bg-[color:var(--rd-paper)] py-8 sm:py-10">
        <div className="luxury-shell">
          <HookPills tone="light" />
        </div>
      </section>

      {/* Coverage map — compact so the inner heading + 7-tile summary
          don't duplicate the page hero (above) or the cluster card grid
          (below). Two-way synced with the cards via lifted activeCluster. */}
      <CoverageMap
        compact
        externalActiveCluster={activeCluster}
        onClusterChange={setActiveCluster}
      />

      {/* 7 cluster cards — synced with map */}
      <section className="bg-[color:var(--rd-paper)] py-12 sm:py-16 lg:py-20">
        <div className="luxury-shell">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="max-w-2xl">
              <p className="rd-eyebrow text-[color:var(--rd-moss)]">Where we go</p>
              <h2 className="mt-3 text-[color:var(--rd-ink)]">
                {COVERAGE.clusters.length} neighborhoods. <span className="italic">{ALL_ZIPS.length} ZIPs.</span>
              </h2>
              <p className="mt-3 text-sm text-[color:var(--rd-on-paper-dim)] sm:text-base">
                Hover a card to highlight its zone on the map above. Tap to focus.
              </p>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {COVERAGE.clusters.map((cluster, index) => {
              const isActive = activeCluster === cluster.id;
              return (
                <motion.div
                  key={cluster.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.4), ease: easeOut }}
                  onMouseEnter={() => setActiveCluster(cluster.id)}
                  onMouseLeave={() => setActiveCluster(null)}
                  onFocus={() => setActiveCluster(cluster.id)}
                  onBlur={() => setActiveCluster(null)}
                  tabIndex={0}
                  onClick={() => {
                    setActiveCluster(cluster.id);
                    // Scroll the map back into view so the customer sees the highlight
                    if (typeof window !== 'undefined') {
                      const el = document.querySelector('[aria-label*="delivery coverage"]');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  onKeyDown={(e) => {
                    // role="button" must be operable by keyboard (WCAG 2.1.1).
                    // Enter/Space activate the card the same as a click; the
                    // inner "Order in this area" link keeps its own Enter via
                    // stopPropagation so the two don't collide.
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (e.target !== e.currentTarget) return;
                      e.preventDefault();
                      setActiveCluster(cluster.id);
                      if (typeof window !== 'undefined') {
                        const el = document.querySelector('[aria-label*="delivery coverage"]');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }
                  }}
                  className={`group flex h-full cursor-pointer flex-col rounded-3xl border p-5 transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 sm:p-6 lg:p-7 ${
                    isActive
                      ? 'border-[color:var(--rd-moss)] bg-[color:var(--rd-paper-bright)] shadow-[0_24px_60px_rgba(46,82,64,0.18)]'
                      : 'border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/70 hover:border-[color:var(--rd-moss)]/30'
                  }`}
                  role="button"
                  aria-pressed={isActive}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="rd-eyebrow truncate text-[color:var(--rd-moss)]">{cluster.shortName}</p>
                      <h3
                        className="mt-2 break-words text-[color:var(--rd-ink)]"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 400,
                          fontSize: 'clamp(1.05rem, 2.4vw, 1.4rem)',
                          letterSpacing: '-0.015em',
                          lineHeight: 1.2,
                          wordBreak: 'break-word'
                        }}
                      >
                        {cluster.name}
                      </h3>
                    </div>
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-[color:var(--rd-moss)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rd-paper)] [font-family:var(--font-mono)]">
                      ~{cluster.etaMinutes} min
                    </span>
                  </div>

                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-[color:var(--rd-moss)] [font-family:var(--font-mono)]">{cluster.zips.length}</span>
                    <span className="rd-eyebrow text-[color:var(--rd-on-paper-dim)]">ZIPs</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {cluster.zips.map((z) => (
                      <span
                        key={z}
                        className="inline-flex items-center rounded-md border border-[color:var(--rd-ink)]/10 bg-[color:var(--rd-paper-bright)] px-2.5 py-1 text-[11px] tracking-wider text-[color:var(--rd-ink)] [font-family:var(--font-mono)]"
                      >
                        {z}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/menu"
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-[color:var(--rd-moss)] transition-colors group-hover:text-[color:var(--rd-ink)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="border-b border-[color:var(--rd-glow)] pb-0.5">Order in this area</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-[color:var(--rd-ink)] py-16 text-[color:var(--rd-text)] sm:py-20">
        <div className="luxury-shell">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="max-w-2xl"
          >
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">What every order gets</p>
            <h2 className="mt-3 text-[color:var(--rd-text)]">
              The same rules <span className="italic">across every ZIP.</span>
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)]/55 p-5 sm:p-6">
                  <Icon className="h-7 w-7 text-[color:var(--rd-glow)]" />
                  <h3 className="mt-4 text-xl text-[color:var(--rd-text)]" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.02em' }}>
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--rd-text-dim)]">{p.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[color:var(--rd-paper)] pb-20 pt-16 sm:pb-24 sm:pt-20">
        <div className="luxury-shell">
          <div className="relative overflow-hidden rounded-3xl bg-[color:var(--rd-ink)] p-8 text-[color:var(--rd-text)] sm:p-12 lg:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,230,110,0.18),transparent_55%)]" aria-hidden />
            <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div>
                <p className="rd-eyebrow text-[color:var(--rd-glow)]">Ready when you are</p>
                <h2 className="mt-3 text-[color:var(--rd-text)]">
                  Free weed gift, <span className="italic">free delivery.</span>
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
                  Open 10 AM – 10 PM, every day. Browse the menu, drop your ZIP, and the bag is on the way.
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
        </div>
      </section>

      <LiveOrderToasts />

      {/* Out-of-area landmark for the map's scrollIntoView selector */}
      <div className="sr-only">Coverage map above</div>
    </SiteChrome>
  );
}
