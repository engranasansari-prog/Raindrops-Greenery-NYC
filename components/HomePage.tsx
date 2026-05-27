'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Box,
  Droplet,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import SiteChrome, { TextLink } from '@/components/SiteChrome';
import HeroSlider, { type HeroSlide } from '@/components/HeroSlider';
import ClaimOfferModal from '@/components/ClaimOfferModal';
import CoverageMap from '@/components/CoverageMap';
import HookPills from '@/components/HookPills';
import { menuProducts } from '@/lib/menu';
import {
  formatPrice,
  getBrandLabel,
  getDealLabel,
  getPotencyLabel,
  getStrainTag,
  hasSale,
  isSticky,
  type StrainTag
} from '@/lib/menu-utils';
import { testimonials, valueProps } from '@/lib/site-data';

const easeOut = [0.22, 1, 0.36, 1] as const;

// =====================================================================
// Reusable scroll-reveal wrapper
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
// 3. Why Raindrops — 4 cards aligned to the hooks (V6 §6.3)
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
// 4. Featured deals — 3 products MAX (V6 §4.3)
// Mobile: horizontal scroll-snap carousel + position dots
// Desktop: 3-column grid
// =====================================================================
const strainTone: Record<StrainTag, string> = {
  INDICA: 'bg-[color:var(--rd-rain)]/15 text-[color:var(--rd-rain)] border-[color:var(--rd-rain)]/30',
  SATIVA: 'bg-[color:var(--rd-glow)]/15 text-[color:var(--rd-glow)] border-[color:var(--rd-glow)]/30',
  HYBRID: 'bg-[color:var(--rd-amber)]/15 text-[color:var(--rd-amber)] border-[color:var(--rd-amber)]/30',
  BALANCED: 'bg-[color:var(--rd-mint)]/15 text-[color:var(--rd-mint)] border-[color:var(--rd-mint)]/30'
};

function calculatePercentOff(price: number, salePrice: number) {
  if (price <= 0 || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

function FeaturedDeals() {
  // Pick the 3 best deals by % off (or hasSale fallback)
  const deals = menuProducts
    .filter(hasSale)
    .sort((a, b) => calculatePercentOff(b.price, b.salePrice) - calculatePercentOff(a.price, a.salePrice))
    .slice(0, 3);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Update active dot based on horizontal scroll position (mobile carousel)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.scrollWidth / Math.max(deals.length, 1);
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(idx, 0), deals.length - 1));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [deals.length]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const cardWidth = el.scrollWidth / Math.max(deals.length, 1);
      el.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
    },
    [deals.length]
  );

  if (deals.length === 0) return null;

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
                Three picks <span className="italic">moving fast.</span>
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

        {/* Carousel rail */}
        <div
          ref={scrollerRef}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:pb-0 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0"
        >
          {deals.map((product, i) => {
            const strainTag = getStrainTag(product);
            const pctOff = calculatePercentOff(product.price, product.salePrice);
            const potency = getPotencyLabel(product);
            const thcMatch = potency.match(/THC\s+([\d.]+)/i);
            const thc = thcMatch ? thcMatch[1] : null;
            const sticky = isSticky(product);
            return (
              <Reveal key={product.id} delay={Math.min(i * 0.05, 0.15)} className="snap-start min-w-[78vw] max-w-[78vw] flex-shrink-0 md:min-w-0 md:max-w-none">
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
                        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-contain p-6 transition-transform duration-[4000ms] [transition-timing-function:linear] group-hover:scale-[1.07]"
                      />
                    )}
                    <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] [font-family:var(--font-mono)] ${strainTone[strainTag]}`}>
                        {strainTag}
                      </span>
                      {sticky && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
                          ✦ STICKY
                        </span>
                      )}
                    </div>
                    {pctOff > 0 && (
                      <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
                        {pctOff}% off
                      </span>
                    )}
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

        {/* Position dots (mobile only) */}
        <div className="mt-6 flex justify-center gap-2 md:hidden" role="tablist" aria-label="Featured deals position">
          {deals.map((deal, i) => (
            <button
              key={deal.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Show deal ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 [transition-timing-function:var(--ease-out)] ${
                i === activeIndex ? 'w-10 bg-[color:var(--rd-glow)]' : 'w-3 bg-[color:var(--rd-paper)]/28 hover:bg-[color:var(--rd-paper)]/55'
              }`}
            />
          ))}
        </div>

        {/* Carousel arrows (mobile) */}
        <div className="mt-4 flex justify-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => scrollToIndex(Math.max(activeIndex - 1, 0))}
            disabled={activeIndex === 0}
            aria-label="Previous deal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--rd-paper)]/14 text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)]/40 disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(Math.min(activeIndex + 1, deals.length - 1))}
            disabled={activeIndex === deals.length - 1}
            aria-label="Next deal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--rd-paper)]/14 text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)]/40 disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// 5. One testimonial (V6 §4)
// =====================================================================
function TestimonialFeature() {
  const t = testimonials[0]; // strongest review goes here
  return (
    <section className="bg-[color:var(--rd-paper-soft)] py-20 sm:py-24">
      <div className="luxury-shell">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-1 text-[color:var(--rd-amber)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="rd-eyebrow mt-4 text-[color:var(--rd-moss)]">
              5.0★ from NYC · Verified order
            </p>

            <blockquote
              className="mt-6 text-2xl leading-tight text-[color:var(--rd-ink)] sm:text-3xl md:text-4xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.02em' }}
            >
              “{t.quote}”
            </blockquote>

            <figcaption className="mt-8 flex items-center justify-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--rd-moss)] text-base font-semibold text-[color:var(--rd-glow)] [font-family:var(--font-mono)]">
                {t.author.charAt(0)}
              </span>
              <span className="text-left">
                <span className="block text-sm font-medium text-[color:var(--rd-ink)]">{t.author}</span>
                <span className="block rd-eyebrow text-[color:var(--rd-on-paper-dim)]">{t.location}</span>
              </span>
            </figcaption>

            <div className="mt-8 inline-flex">
              <TextLink href="/about">Read more customer stories</TextLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// =====================================================================
// Page composition — exactly 6 sections per V6 §4
// =====================================================================
export default function HomePage() {
  const [claimOpen, setClaimOpen] = useState(false);
  const closeClaim = () => setClaimOpen(false);

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
      {/* 1. Hero */}
      <HeroSlider slides={slides} />

      {/* Hook pills row immediately below hero */}
      <section className="bg-[color:var(--rd-paper)] py-8 sm:py-10">
        <div className="luxury-shell">
          <HookPills tone="light" />
        </div>
      </section>

      {/* 2. Coverage map */}
      <div id="coverage">
        <CoverageMap />
      </div>

      {/* 3. Why Raindrops */}
      <ValueProps />

      {/* 4. Featured deals */}
      <FeaturedDeals />

      {/* 5. One testimonial */}
      <TestimonialFeature />

      {/* 6. Footer — rendered by SiteChrome */}

      <ClaimOfferModal open={claimOpen} onClose={closeClaim} />
    </SiteChrome>
  );
}
