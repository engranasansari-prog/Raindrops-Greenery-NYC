'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, MapPin, Search, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import HookPills from '@/components/HookPills';
import { COVERAGE } from '@/lib/coverage';
import { checkZip, normalizeZip, UNSUPPORTED_MESSAGE } from '@/lib/zip-utils';

const easeOut = [0.22, 1, 0.36, 1] as const;

const PILLARS = [
  { icon: Truck, title: 'Free delivery', body: 'Unconditional. Every order, every covered ZIP. No minimum, no hidden fees.' },
  { icon: Sparkles, title: 'Tax-free', body: 'Sovereign Shinnecock authority — no NY State cannabis excise or sales tax.' },
  { icon: Clock, title: 'Same-day', body: 'Open 10 AM – 10 PM. Average drop-off window: 35–55 minutes depending on zone.' },
  { icon: ShieldCheck, title: 'Discreet', body: 'Unbranded packaging. 21+ ID verified at the door. Short, professional hand-offs.' }
];

export default function DeliveryPage() {
  const [zip, setZip] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => (submitted ? checkZip(zip) : checkZip('')), [submitted, zip]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const onChange = (value: string) => {
    setZip(normalizeZip(value));
    setSubmitted(false);
  };

  const onPickZip = (z: string) => {
    setZip(z);
    setSubmitted(true);
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <SiteChrome>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <Image src="/assets/storefront.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-[0.28]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,20,16,0.94),rgba(10,20,16,0.62),rgba(10,20,16,0.78))]" />
        <div className="luxury-shell relative grid gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <Breadcrumbs items={[{ label: 'Delivery' }]} tone="dark" />
            <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">Same-day NYC delivery</p>
            <h1 className="mt-4 text-[color:var(--rd-text)]">
              Manhattan. <span className="italic">East River.</span> Same-day.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
              31 ZIPs across 7 neighborhoods. Free, tax-free, no minimum. Average drop-off in under an hour.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu" className="btn-luxe btn-luxe-gold">
                Browse menu
                <ArrowRight />
              </Link>
              <OrderButton />
            </div>
          </div>

          {/* ZIP input */}
          <form onSubmit={onSubmit} className="rounded-2xl border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 p-5 backdrop-blur sm:p-6">
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">Check coverage</p>
            <p className="mt-2 text-base text-[color:var(--rd-text)]">Drop your ZIP — we’ll confirm in a second.</p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 px-4 py-3 transition focus-within:border-[color:var(--rd-glow)] focus-within:shadow-[0_0_0_4px_rgba(200,230,110,0.18)]">
                <Search className="h-4 w-4 text-[color:var(--rd-text-mute)]" />
                <input
                  ref={inputRef}
                  value={zip}
                  onChange={(event) => onChange(event.target.value)}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  placeholder="e.g. 10013"
                  aria-label="ZIP code"
                  className="w-full bg-transparent text-base font-medium tracking-wider text-[color:var(--rd-text)] outline-none placeholder:text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]"
                />
              </div>
              <button type="submit" className="btn-luxe btn-luxe-gold">
                Check
                <ArrowRight />
              </button>
            </div>

            <div className="mt-5 min-h-[72px]">
              {result.status === 'supported' && result.cluster && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: easeOut }}
                  className="rounded-xl border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-glow)]/10 p-4"
                >
                  <p className="inline-flex items-center gap-2 rd-eyebrow text-[color:var(--rd-glow)]">
                    <Check className="h-3.5 w-3.5" />
                    You’re in
                  </p>
                  <p className="mt-1 text-base font-medium text-[color:var(--rd-text)]">
                    {result.cluster.shortName} — ~{result.cluster.etaMinutes} min average ETA.
                  </p>
                </motion.div>
              )}
              {result.status === 'unsupported' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: easeOut }}
                  className="rounded-xl border border-[color:var(--rd-amber)]/30 bg-[color:var(--rd-amber)]/10 p-4"
                >
                  <p className="inline-flex items-center gap-2 rd-eyebrow text-[color:var(--rd-amber)]">
                    <MapPin className="h-3.5 w-3.5" />
                    Not yet
                  </p>
                  <p className="mt-1 text-base font-medium text-[color:var(--rd-text)]">{UNSUPPORTED_MESSAGE}</p>
                </motion.div>
              )}
              {result.status === 'incomplete' && (
                <p className="text-sm text-[color:var(--rd-text-mute)]">Enter a 5-digit ZIP and tap check.</p>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Hook pills */}
      <section className="bg-[color:var(--rd-paper)] py-8 sm:py-10">
        <div className="luxury-shell">
          <HookPills tone="light" />
        </div>
      </section>

      {/* 7 cluster cards */}
      <section className="bg-[color:var(--rd-paper)] py-16 sm:py-20">
        <div className="luxury-shell">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="max-w-2xl"
          >
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">Where we go</p>
            <h2 className="mt-3 text-[color:var(--rd-ink)]">
              7 neighborhoods. <span className="italic">31 ZIPs.</span>
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {COVERAGE.clusters.map((cluster, index) => (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.4), ease: easeOut }}
                className="group flex h-full flex-col rounded-3xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/70 p-6 transition-[transform,border-color] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:border-[color:var(--rd-moss)]/30 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="rd-eyebrow text-[color:var(--rd-moss)]">{cluster.shortName}</p>
                    <h3
                      className="mt-2 text-xl leading-tight text-[color:var(--rd-ink)] sm:text-2xl"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
                    >
                      {cluster.name}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[color:var(--rd-moss)] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rd-paper)] [font-family:var(--font-mono)]">
                    ~{cluster.etaMinutes} min
                  </span>
                </div>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-[color:var(--rd-moss)] [font-family:var(--font-mono)]">{cluster.zips.length}</span>
                  <span className="rd-eyebrow text-[color:var(--rd-on-paper-dim)]">ZIPs</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cluster.zips.map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => onPickZip(z)}
                      className="inline-flex items-center rounded-md border border-[color:var(--rd-ink)]/10 bg-white px-2.5 py-1 text-[11px] tracking-wider text-[color:var(--rd-ink)] transition hover:border-[color:var(--rd-moss)] hover:bg-[color:var(--rd-mint)] [font-family:var(--font-mono)]"
                    >
                      {z}
                    </button>
                  ))}
                </div>

                <Link
                  href="/menu"
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-[color:var(--rd-moss)] transition-colors group-hover:text-[color:var(--rd-ink)]"
                >
                  <span className="border-b border-[color:var(--rd-glow)] pb-0.5">Order in this area</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
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
                <div key={p.title} className="rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)]/55 p-6">
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
    </SiteChrome>
  );
}
