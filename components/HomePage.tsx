'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgePercent,
  Box,
  ChevronDown,
  Droplet,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SiteChrome, { OrderButton, TextLink } from '@/components/SiteChrome';
import HeroSlider, { type HeroSlide } from '@/components/HeroSlider';
import ClaimOfferModal from '@/components/ClaimOfferModal';
import CoverageMap from '@/components/CoverageMap';
import HookPills from '@/components/HookPills';
import type { BlogPostMeta } from '@/lib/blog-posts';
import { menuCounts, menuProducts } from '@/lib/menu';
import {
  formatPrice,
  getBrandLabel,
  getDealLabel,
  getPotencyLabel,
  hasSale,
  inferProfile
} from '@/lib/menu-utils';
import { faqs, steps, testimonials, valueProps } from '@/lib/site-data';

const easeOut = [0.22, 1, 0.36, 1] as const;

// =====================================================================
// Reusable scroll-reveal wrapper (brief §5)
// =====================================================================
function Reveal({
  children,
  delay = 0,
  className = ''
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// =====================================================================
// Claim section (between hero and coverage)
// =====================================================================
function ClaimSection({ onClaim }: { onClaim: () => void }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--rd-paper-soft)] py-16 sm:py-20">
      <div className="luxury-shell relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-moss)]">
            <Sparkles className="h-3.5 w-3.5" />
            Free gift drop
          </p>
          <h2 className="mt-4 text-[color:var(--rd-ink)]">
            Scan, claim, <span className="italic">delivered.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--rd-on-paper-dim)] sm:text-lg sm:leading-8">
            Spot a Raindrops sticker around NYC? Drop your details — adults 21+ in Manhattan, Brooklyn, or Queens are eligible for a complimentary gift with their next order.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
            <button onClick={onClaim} className="btn-luxe btn-luxe-gold">
              Claim this offer
              <ArrowRight />
            </button>
            <Link href="#coverage" className="btn-luxe btn-luxe-dark">
              Check coverage
              <ArrowRight />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// =====================================================================
// 3.4 Shop by category — asymmetric editorial layout
// =====================================================================
const categories = [
  {
    title: 'Flower',
    href: '/menu?category=Flower',
    image: '/assets/flower.avif',
    count: menuCounts.Flower,
    note: 'Top-shelf nugs. Sticky as it gets.',
    tone: 'moss' as const
  },
  {
    title: 'Pre-Rolls',
    href: '/menu?category=Pre-Rolls',
    image: '/assets/preroll.avif',
    count: menuCounts['Pre-Rolls'],
    note: 'Ready to spark.',
    tone: 'ink' as const
  },
  {
    title: 'Edibles',
    href: '/menu?category=Edibles',
    image: '/assets/edible.avif',
    count: menuCounts.Edibles,
    note: 'Eat your high. All balanced.',
    tone: 'amber' as const
  }
];

function CategoryCard({
  category,
  size
}: {
  category: (typeof categories)[number];
  size: 'lg' | 'sm';
}) {
  const isLarge = size === 'lg';
  return (
    <Link
      href={category.href}
      className="group relative block h-full overflow-hidden rounded-3xl bg-[color:var(--rd-ink)] text-[color:var(--rd-text)] transition-transform duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1"
    >
      <div className={`relative ${isLarge ? 'aspect-[5/6] md:aspect-[5/7]' : 'aspect-[5/4] md:aspect-[5/3]'} overflow-hidden`}>
        <Image
          src={category.image}
          alt={`${category.title} products`}
          fill
          sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
          className="object-cover transition-transform duration-[1400ms] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,20,16,0)_45%,rgba(10,20,16,0.78)_100%)]" />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 sm:p-7">
        <div className="flex items-end justify-between gap-4">
          <h3 className={`leading-none text-[color:var(--rd-text)] [font-family:var(--font-display)] ${isLarge ? 'text-5xl sm:text-6xl' : 'text-4xl'}`} style={{ fontWeight: 400, letterSpacing: '-0.02em' }}>
            {category.title}
          </h3>
          <span className="text-right [font-family:var(--font-mono)]">
            <span className={`block leading-none text-[color:var(--rd-glow)] ${isLarge ? 'text-5xl sm:text-6xl' : 'text-4xl'}`} style={{ fontWeight: 500 }}>
              {category.count}
            </span>
            <span className="mt-1 block rd-eyebrow text-[color:var(--rd-text-mute)]">items</span>
          </span>
        </div>
        <p className="mt-2 max-w-sm text-sm text-[color:var(--rd-text-dim)] sm:text-base">{category.note}</p>
        <span className="mt-3 inline-flex items-center gap-2 rd-eyebrow text-[color:var(--rd-glow)]">
          Shop {category.title}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function Categories() {
  const [flower, preRolls, edibles] = categories;
  return (
    <section className="bg-[color:var(--rd-paper)] py-20 sm:py-24">
      <div className="luxury-shell">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="rd-eyebrow text-[color:var(--rd-moss)]">Shop by category</p>
              <h2 className="mt-4 text-[color:var(--rd-ink)]">
                Three categories. <span className="italic">No friction.</span>
              </h2>
            </div>
            <TextLink href="/menu">Open full filtered menu</TextLink>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <Reveal>
            <CategoryCard category={flower} size="lg" />
          </Reveal>
          <div className="grid gap-5">
            <Reveal delay={0.08}>
              <CategoryCard category={preRolls} size="sm" />
            </Reveal>
            <Reveal delay={0.14}>
              <CategoryCard category={edibles} size="sm" />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// 3.5 Deals — product cards with strain badges, % off, hover Add
// =====================================================================
type Strain = 'INDICA' | 'SATIVA' | 'HYBRID' | 'BALANCED';
function getStrain(profile: string): Strain {
  const p = profile.toLowerCase();
  if (p.includes('indica')) return 'INDICA';
  if (p.includes('sativa')) return 'SATIVA';
  if (p.includes('hybrid')) return 'HYBRID';
  return 'BALANCED';
}
const strainTone: Record<Strain, string> = {
  INDICA: 'bg-[color:var(--rd-rain)]/15 text-[color:var(--rd-rain)] border-[color:var(--rd-rain)]/30',
  SATIVA: 'bg-[color:var(--rd-glow)]/15 text-[color:var(--rd-glow)] border-[color:var(--rd-glow)]/30',
  HYBRID: 'bg-[color:var(--rd-amber)]/15 text-[color:var(--rd-amber)] border-[color:var(--rd-amber)]/30',
  BALANCED: 'bg-[color:var(--rd-mint)]/15 text-[color:var(--rd-mint)] border-[color:var(--rd-mint)]/30'
};

const STRAIN_FILTERS: Array<{ label: string; value: 'ALL' | Strain }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Sativa', value: 'SATIVA' },
  { label: 'Indica', value: 'INDICA' },
  { label: 'Hybrid', value: 'HYBRID' }
];

function calculatePercentOff(price: number, salePrice: number) {
  if (price <= 0 || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

function DealsSection() {
  const [strain, setStrain] = useState<'ALL' | Strain>('ALL');

  const deals = useMemo(() => {
    const onSale = menuProducts.filter(hasSale);
    if (strain === 'ALL') return onSale.slice(0, 8);
    return onSale.filter((p) => getStrain(inferProfile(p)) === strain).slice(0, 8);
  }, [strain]);

  if (deals.length === 0 && strain === 'ALL') return null;

  return (
    <section className="bg-[color:var(--rd-ink)] py-20 text-[color:var(--rd-text)] sm:py-24">
      <div className="luxury-shell">
        <Reveal>
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
                <BadgePercent className="h-3.5 w-3.5" />
                Tonight’s drops
              </p>
              <h2 className="mt-4 text-[color:var(--rd-text)]">
                Sale picks <span className="italic">moving fast.</span>
              </h2>
            </div>
            <Link
              href="/deals"
              className="group inline-flex items-center gap-2 text-sm text-[color:var(--rd-text-dim)] transition hover:text-[color:var(--rd-glow)]"
            >
              <span className="border-b border-[color:var(--rd-glow)] pb-0.5">See all deals</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        {/* Strain filter chips */}
        <Reveal delay={0.05}>
          <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
            {STRAIN_FILTERS.map((chip) => {
              const active = strain === chip.value;
              return (
                <button
                  key={chip.value}
                  onClick={() => setStrain(chip.value)}
                  aria-pressed={active}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition [font-family:var(--font-mono)] ${
                    active
                      ? 'border-[color:var(--rd-glow)] bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)]'
                      : 'border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 text-[color:var(--rd-text-dim)] hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-text)]'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {deals.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)]/40 p-10 text-center text-[color:var(--rd-text-dim)]">
            No {strain.toLowerCase()} deals right now — try another strain.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((product, i) => {
              const profile = inferProfile(product);
              const strainTag = getStrain(profile);
              const pctOff = calculatePercentOff(product.price, product.salePrice);
              const potency = getPotencyLabel(product);
              const thcMatch = potency.match(/THC\s+([\d.]+)/i);
              const thc = thcMatch ? thcMatch[1] : null;
              return (
                <Reveal key={product.id} delay={Math.min(i * 0.04, 0.24)}>
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
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-6 transition-transform duration-[4000ms] [transition-timing-function:linear] group-hover:scale-[1.07]"
                        />
                      )}
                      {/* Strain badge */}
                      <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] [font-family:var(--font-mono)] ${strainTone[strainTag]}`}>
                        {strainTag}
                      </span>
                      {/* % off badge */}
                      {pctOff > 0 && (
                        <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
                          {pctOff}% off
                        </span>
                      )}
                      {/* Hover Add CTA */}
                      <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="pointer-events-auto inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[color:var(--rd-glow)] py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
                          <Plus className="h-3.5 w-3.5" /> Add
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="rd-eyebrow truncate text-[color:var(--rd-text-mute)]">{getBrandLabel(product)}</p>
                      <h3 className="mt-1 truncate text-base font-medium text-[color:var(--rd-text)]" style={{ fontFamily: 'var(--font-sans)' }}>
                        {product.name}
                      </h3>
                      <div className="mt-auto flex items-end justify-between pt-3">
                        <div className="[font-family:var(--font-mono)]">
                          {product.salePrice < product.price && (
                            <span className="block text-[11px] text-[color:var(--rd-text-mute)] line-through">{formatPrice(product.price)}</span>
                          )}
                          <span className="block text-lg font-semibold text-[color:var(--rd-amber)]">{formatPrice(product.salePrice)}</span>
                        </div>
                        {thc && (
                          <span className="text-right [font-family:var(--font-mono)]">
                            <span className="block text-base font-semibold text-[color:var(--rd-glow)]">{thc}%</span>
                            <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">THC</span>
                          </span>
                        )}
                      </div>
                      {getDealLabel(product) && (
                        <p className="mt-2 truncate text-[11px] text-[color:var(--rd-text-mute)]">{getDealLabel(product)}</p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// =====================================================================
// 3.6 Value props — 2x2 numbered editorial cards
// =====================================================================
const VALUE_ICONS = [Droplet, ShieldCheck, Box, RotateCcw];

function ValueProps() {
  return (
    <section className="bg-[color:var(--rd-paper)] py-20 sm:py-24">
      <div className="luxury-shell">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">Why Raindrops</p>
            <h2 className="mt-4 text-[color:var(--rd-ink)]">
              Four reasons New Yorkers <span className="italic">come back.</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2">
          {valueProps.map((item, index) => {
            const Icon = VALUE_ICONS[index] ?? Droplet;
            return (
              <Reveal key={item.title} delay={index * 0.06}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/80 p-7 transition-[transform,border-color] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:border-[color:var(--rd-moss)]/30 sm:p-9">
                  <div className="flex items-start justify-between gap-5">
                    <Icon className="h-10 w-10 text-[color:var(--rd-moss)] transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:rotate-[-6deg] sm:h-12 sm:w-12" />
                    <span
                      className="text-5xl text-[color:var(--rd-moss)]/22 sm:text-6xl"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.05em' }}
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <h3
                    className="mt-7 text-2xl text-[color:var(--rd-ink)] sm:text-3xl"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[color:var(--rd-on-paper-dim)]">{item.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// 3.7 Steps — horizontal stepper with connected line, scroll-triggered
// =====================================================================
function Steps() {
  return (
    <section className="bg-[color:var(--rd-paper-soft)] py-20 sm:py-24">
      <div className="luxury-shell">
        <Reveal>
          <div className="mb-12 max-w-2xl">
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">How ordering works</p>
            <h2 className="mt-4 text-[color:var(--rd-ink)]">
              Browse, compare, <span className="italic">checkout securely.</span>
            </h2>
          </div>
        </Reveal>
        <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
          {/* Connecting horizontal line (desktop) */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, ease: easeOut }}
            className="absolute left-[7%] right-[7%] top-[28px] hidden h-px origin-left bg-gradient-to-r from-[color:var(--rd-moss)]/0 via-[color:var(--rd-moss)] to-[color:var(--rd-moss)]/0 md:block"
            aria-hidden
          />
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.15}>
              <div className="relative pl-0 md:pt-16">
                <div className="absolute left-0 top-0 hidden h-14 w-14 -translate-y-1 items-center justify-center md:flex">
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.18, ease: easeOut }}
                    className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-[color:var(--rd-moss)] bg-[color:var(--rd-paper)] text-[color:var(--rd-moss)] [font-family:var(--font-mono)]"
                  >
                    <span className="absolute inset-0 rounded-full bg-[color:var(--rd-glow)] opacity-0 transition-opacity duration-700" style={{ animation: `rd-fade-in 0.7s ${0.5 + index * 0.18}s forwards` }} />
                    <span className="relative text-sm font-semibold">{step.eyebrow}</span>
                  </motion.span>
                </div>
                <p className="rd-eyebrow text-[color:var(--rd-moss)] md:hidden">Step {step.eyebrow}</p>
                <h3
                  className="mt-3 text-2xl text-[color:var(--rd-ink)] sm:text-3xl"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
                >
                  {step.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-[color:var(--rd-on-paper-dim)]">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// 3.8 Testimonials — 3-card carousel with auto-advance + verified badge
// =====================================================================
function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section className="bg-[color:var(--rd-ink)] py-20 text-[color:var(--rd-text)] sm:py-24">
      <div className="luxury-shell">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">From New York</p>
              <h2 className="mt-4 text-[color:var(--rd-text)]">
                Real orders. <span className="italic">Real reviews.</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[color:var(--rd-glow)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-[color:var(--rd-text-dim)]">
                <span className="font-semibold text-[color:var(--rd-text)]">4.9</span> from 1,200+ NYC orders
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((t, i) => {
                const active = i === index;
                return (
                  <motion.figure
                    key={t.author}
                    animate={{ opacity: active ? 1 : 0.55, scale: active ? 1 : 0.985 }}
                    transition={{ duration: 0.7, ease: easeOut }}
                    className={`relative rounded-3xl border p-7 transition-colors duration-500 [transition-timing-function:var(--ease-out)] ${
                      active
                        ? 'border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-ink-soft)]'
                        : 'border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/55'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[color:var(--rd-glow)]">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-glow)]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rd-glow)] [font-family:var(--font-mono)]">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                    <blockquote
                      className="mt-5 text-xl leading-snug text-[color:var(--rd-text)] sm:text-2xl"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.015em' }}
                    >
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--rd-moss)] text-base font-semibold text-[color:var(--rd-glow)] [font-family:var(--font-mono)]">
                        {t.author.charAt(0)}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-[color:var(--rd-text)]">{t.author}</span>
                        <span className="block rd-eyebrow text-[color:var(--rd-text-mute)]">{t.location}</span>
                      </span>
                    </figcaption>
                  </motion.figure>
                );
              })}
            </div>

            {/* Dots */}
            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.author}
                  aria-label={`Show review ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 [transition-timing-function:var(--ease-out)] ${
                    i === index ? 'w-9 bg-[color:var(--rd-glow)]' : 'w-3 bg-[color:var(--rd-paper)]/24 hover:bg-[color:var(--rd-paper)]/55'
                  }`}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// =====================================================================
// 3.9 Journal — editorial magazine layout (1 feature + 2 stacked)
// =====================================================================
function Journal({ posts }: { posts: BlogPostMeta[] }) {
  if (posts.length === 0) return null;
  const [feature, ...rest] = posts.slice(0, 3);

  return (
    <section className="bg-[color:var(--rd-paper)] py-20 sm:py-24">
      <div className="luxury-shell">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="rd-eyebrow text-[color:var(--rd-moss)]">Journal</p>
              <h2 className="mt-4 text-[color:var(--rd-ink)]">
                Read up <span className="italic">before you order.</span>
              </h2>
            </div>
            <TextLink href="/blog">All articles</TextLink>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          {/* Feature */}
          <Reveal>
            <Link
              href={`/blog/${feature.slug}`}
              className="group block overflow-hidden rounded-3xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/70 transition-transform duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1"
            >
              <div className="relative aspect-[5/3] overflow-hidden">
                <Image
                  src={feature.coverImage}
                  alt={feature.coverAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-[1400ms] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.05]"
                />
              </div>
              <div className="p-7 sm:p-9">
                <p className="rd-eyebrow text-[color:var(--rd-moss)]">
                  {feature.category} · {feature.readTime}
                </p>
                <h3
                  className="mt-4 text-3xl leading-tight text-[color:var(--rd-ink)] sm:text-4xl"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.025em' }}
                >
                  <span className="bg-[length:100%_2px] bg-[linear-gradient(currentColor,currentColor)] bg-[position:0_100%] bg-no-repeat pb-1 [background-size:0%_2px] transition-[background-size] duration-500 [transition-timing-function:var(--ease-out)] group-hover:[background-size:100%_2px]">
                    {feature.title}
                  </span>
                </h3>
                <p className="mt-4 text-base leading-7 text-[color:var(--rd-on-paper-dim)]">{feature.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 rd-eyebrow text-[color:var(--rd-moss)]">
                  Read article
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>

          {/* Two stacked */}
          <div className="grid gap-6">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={0.08 + i * 0.08}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/70 transition-transform duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 md:flex-row"
                >
                  <div className="relative aspect-[5/3] overflow-hidden md:aspect-auto md:w-[40%]">
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover transition-transform duration-[1400ms] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="rd-eyebrow text-[color:var(--rd-moss)]">
                      {post.category} · {post.readTime}
                    </p>
                    <h3
                      className="mt-2 text-lg text-[color:var(--rd-ink)] sm:text-xl"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
                    >
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[color:var(--rd-on-paper-dim)]">{post.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// 3.10 FAQ — search bar, grouped categories, smooth accordion
// =====================================================================
type FaqCategory = 'Ordering' | 'Delivery' | 'Products' | 'Legal';

function categorizeFaq(q: string): FaqCategory {
  const s = q.toLowerCase();
  if (/(deliver|zip|coverage|borough|manhattan|brooklyn|queens|fee|minimum|discreet)/.test(s)) return 'Delivery';
  if (/(21|age|legal|license|return|policy)/.test(s)) return 'Legal';
  if (/(lab|test|product|menu|edible|flower|pre-?roll|category|strain)/.test(s)) return 'Products';
  return 'Ordering';
}

const FAQ_CATEGORIES: FaqCategory[] = ['Ordering', 'Delivery', 'Products', 'Legal'];

function FAQ() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FaqCategory | 'All'>('All');
  const [active, setActive] = useState<string | null>(faqs[0]?.q ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      const matchesText = !q || `${f.q} ${f.a}`.toLowerCase().includes(q);
      const matchesCat = category === 'All' || categorizeFaq(f.q) === category;
      return matchesText && matchesCat;
    });
  }, [category, query]);

  return (
    <section id="faq" className="bg-[color:var(--rd-paper-soft)] py-20 sm:py-24">
      <div className="luxury-shell">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">FAQ</p>
            <h2 className="mt-4 text-[color:var(--rd-ink)]">
              Quick answers <span className="italic">before checkout.</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-full border border-[color:var(--rd-ink)]/8 bg-white px-4 py-3 transition focus-within:border-[color:var(--rd-moss)] focus-within:shadow-[0_0_0_4px_rgba(45,74,58,0.08)]">
                <Search className="h-4 w-4 text-[color:var(--rd-on-paper-mute)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search questions…"
                  aria-label="Search questions"
                  className="w-full bg-transparent text-base text-[color:var(--rd-ink)] outline-none placeholder:text-[color:var(--rd-on-paper-mute)]"
                />
                {query && (
                  <button onClick={() => setQuery('')} aria-label="Clear search" className="text-[color:var(--rd-on-paper-mute)] hover:text-[color:var(--rd-ink)]">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('All')}
                  aria-pressed={category === 'All'}
                  className={`rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.16em] transition [font-family:var(--font-mono)] ${
                    category === 'All'
                      ? 'border-[color:var(--rd-moss)] bg-[color:var(--rd-moss)] text-[color:var(--rd-paper)]'
                      : 'border-[color:var(--rd-ink)]/12 bg-white text-[color:var(--rd-on-paper-dim)] hover:border-[color:var(--rd-moss)]'
                  }`}
                >
                  All
                </button>
                {FAQ_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                    className={`rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.16em] transition [font-family:var(--font-mono)] ${
                      category === c
                        ? 'border-[color:var(--rd-moss)] bg-[color:var(--rd-moss)] text-[color:var(--rd-paper)]'
                        : 'border-[color:var(--rd-ink)]/12 bg-white text-[color:var(--rd-on-paper-dim)] hover:border-[color:var(--rd-moss)]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <p className="rounded-2xl border border-[color:var(--rd-ink)]/8 bg-white p-6 text-[color:var(--rd-on-paper-dim)]">
                  No questions match — try a different search or category.
                </p>
              ) : (
                filtered.map((faq) => {
                  const open = active === faq.q;
                  return (
                    <div
                      key={faq.q}
                      className="overflow-hidden rounded-2xl border border-[color:var(--rd-ink)]/8 bg-white transition-colors duration-300 [transition-timing-function:var(--ease-out)] hover:border-[color:var(--rd-moss)]/30"
                    >
                      <button
                        onClick={() => setActive(open ? null : faq.q)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[color:var(--rd-ink)]"
                        aria-expanded={open}
                      >
                        <span className="text-base font-medium sm:text-lg">{faq.q}</span>
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[color:var(--rd-ink)]/14 text-[color:var(--rd-moss)] transition-transform duration-500 [transition-timing-function:var(--ease-out)] ${open ? 'rotate-45 border-[color:var(--rd-glow)] bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)]' : ''}`}
                          aria-hidden
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.45, ease: easeOut }}
                          >
                            <p className="px-5 pb-5 text-sm leading-7 text-[color:var(--rd-on-paper-dim)] sm:text-base">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// =====================================================================
// Bottom CTA + menu note
// =====================================================================
function BottomCta() {
  return (
    <section className="bg-[color:var(--rd-paper)] pb-24">
      <div className="luxury-shell">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-[color:var(--rd-ink)] p-8 text-[color:var(--rd-text)] sm:p-12 lg:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,230,110,0.18),transparent_55%)]" aria-hidden />
            <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div>
                <p className="rd-eyebrow text-[color:var(--rd-glow)]">Ready when you are</p>
                <h2 className="mt-4 text-[color:var(--rd-text)]">
                  Same-day. <span className="italic">21+ only.</span>
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
                  Browse {menuProducts.length} curated Flower, Pre-Roll, and Edible drops. Final pricing, availability, and delivery details confirmed at checkout.
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
        </Reveal>
      </div>
    </section>
  );
}

// =====================================================================
// Page
// =====================================================================
export default function HomePage({ posts }: { posts: BlogPostMeta[] }) {
  const [claimOpen, setClaimOpen] = useState(false);
  const openClaim = () => setClaimOpen(true);
  const closeClaim = () => setClaimOpen(false);

  // V4 §8 — mixed-weight Fraunces headline
  const slides: HeroSlide[] = [
    {
      id: 'best-flower',
      image: '/assets/banner-gift1.jpg',
      imageAlt: 'Raindrops Greenery premium NYC cannabis delivery',
      imagePosition: 'right center',
      eyebrow: 'NYC · 21+ · Tax-free',
      headline: 'Guaranteed best flower on the market.',
      headlineAccent: 'best flower',
      subtext: 'Free weed gift with every order. Tax-free under Shinnecock authority. Same-day delivery.',
      primary: { label: 'Claim free weed gift', href: '/menu' },
      secondary: { label: 'Check coverage', href: '#coverage' }
    },
    {
      id: 'manhattan-east-river',
      image: '/assets/banner-drops.png',
      imageAlt: 'Premium Raindrops Greenery deliveries across Manhattan and the East River',
      imagePosition: 'center',
      eyebrow: 'Members only · 21+',
      headline: 'Manhattan + East River. Same-day.',
      headlineAccent: 'East River',
      subtext: 'Curated drops across Manhattan plus Long Island City, Williamsburg, and Greenpoint. Free delivery. No minimum.',
      primary: { label: 'Check coverage', href: '#coverage' },
      secondary: { label: 'Shop deals', href: '/deals' }
    }
  ];

  return (
    <SiteChrome>
      <HeroSlider slides={slides} />
      {/* Hook pills row (V4 §7) immediately below hero on cream */}
      <section className="bg-[color:var(--rd-paper)] py-8 sm:py-10">
        <div className="luxury-shell">
          <HookPills tone="light" />
        </div>
      </section>
      <ClaimSection onClaim={openClaim} />
      <div id="coverage">
        <CoverageMap />
      </div>
      <Categories />
      <DealsSection />
      <ValueProps />
      <Steps />
      <Testimonials />
      <Journal posts={posts} />
      <FAQ />
      <BottomCta />

      <ClaimOfferModal open={claimOpen} onClose={closeClaim} />
    </SiteChrome>
  );
}
