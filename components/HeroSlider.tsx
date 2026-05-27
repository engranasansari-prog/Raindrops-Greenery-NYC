'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import SmokeLayer from '@/components/SmokeLayer';

export type HeroSlide = {
  id: string;
  image: string;
  imageAlt: string;
  /** Object-position tuned per-slide so the subject stays visible on phones */
  imagePosition?: string;
  eyebrow: string;
  /** Plain headline text; if `headlineAccent` is set, that substring is styled in --rd-glow */
  headline: string;
  /** Optional substring of `headline` to emphasize with the glow accent + heavier weight */
  headlineAccent?: string;
  subtext: string;
  primary?: { label: string; href?: string; onClick?: () => void };
  secondary?: { label: string; href?: string; onClick?: () => void };
};

type Props = {
  slides: HeroSlide[];
  autoplayMs?: number;
};

const AUTOPLAY_MS_DEFAULT = 7000;
const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * Hero banner slider — see /raindrops-design-brief.md §3.2 for spec.
 *
 * Visual stack (back to front):
 *   1. Per-slide image (cross-faded with subtle Ken Burns zoom)
 *   2. Cinematic gradient overlay so headline + buttons stay readable
 *   3. Film-grain texture (.rd-grain)
 *   4. Radial vignette (.rd-vignette)
 *   5. Drifting smoke layer (SmokeLayer)
 *   6. Slide content with staggered fade-up on change
 *
 * Behaviour:
 *   - 7s autoplay with hover/touch pause
 *   - Keyboard ← → navigation
 *   - Touch swipe (40px threshold)
 *   - Respects prefers-reduced-motion (no autoplay, no zoom)
 */
export default function HeroSlider({ slides, autoplayMs = AUTOPLAY_MS_DEFAULT }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timerRef.current = setTimeout(next, autoplayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoplayMs, index, next, paused, slides.length]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') prev();
      if (event.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const touchRef = useRef<{ startX: number } | null>(null);
  const onTouchStart = (event: React.TouchEvent) => {
    touchRef.current = { startX: event.touches[0].clientX };
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = event.changedTouches[0].clientX - touchRef.current.startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
    touchRef.current = null;
  };

  const slide = slides[index];

  return (
    <section
      className="rd-grain rd-vignette relative isolate -mt-[72px] w-full overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Layer 1: slide image (cross-faded with slow zoom) */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ opacity: { duration: 1.1, ease: easeOut }, scale: { duration: 7, ease: 'easeOut' } }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.imageAlt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.imagePosition ?? 'center' }}
            />
            {/* Cinematic side gradient — keeps text on left readable */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,20,16,0.94)_0%,rgba(10,20,16,0.78)_38%,rgba(10,20,16,0.32)_72%,rgba(10,20,16,0.58)_100%)]" />
            {/* Bottom fade for nav-content seam */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[color:var(--rd-ink)] to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Layer 2: drifting smoke (lightweight, respects reduced motion) */}
      <SmokeLayer />

      {/* Layer 3: slide content */}
      <div className="luxury-shell relative z-10 grid min-h-[640px] items-center pt-[112px] pb-20 sm:min-h-[720px] sm:pt-[140px] sm:pb-24 lg:min-h-[92vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.65, ease: easeOut }}
            className="max-w-3xl"
          >
            {/* Eyebrow with live pulse */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
              className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 px-3.5 py-1.5 backdrop-blur-sm"
            >
              <span className="rd-pulse motion-safe:[animation-play-state:running]" aria-hidden />
              <span className="rd-eyebrow text-[color:var(--rd-text)]">{slide.eyebrow}</span>
            </motion.div>

            {/* Headline — Fraunces with mixed weight per brief */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.13, ease: easeOut }}
              className="mt-6 text-[2.75rem] leading-[1] text-[color:var(--rd-text)] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
            >
              {renderHeadline(slide.headline, slide.headlineAccent)}
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.21, ease: easeOut }}
              className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8 md:text-xl"
            >
              {slide.subtext}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.29, ease: easeOut }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              {slide.primary && <SlideCta {...slide.primary} variant="gold" />}
              {slide.secondary && <SlideCta {...slide.secondary} variant="ghost" />}
            </motion.div>

            {/* Compliance footer line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: easeOut }}
              className="mt-10 flex items-center gap-3"
            >
              <span className="h-px w-12 bg-[color:var(--rd-paper)]/24" />
              <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">21+ · NYC only · While supplies last</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Layer 4: controls */}
      {slides.length > 1 && (
        <>
          {/* Dots */}
          <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2 sm:bottom-10">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-500 [transition-timing-function:var(--ease-out)] ${
                  i === index ? 'w-10 bg-[color:var(--rd-glow)]' : 'w-3 bg-[color:var(--rd-paper)]/28 hover:bg-[color:var(--rd-paper)]/55'
                }`}
              />
            ))}
          </div>

          {/* Arrows (desktop) */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-between px-6 sm:flex">
            <button
              aria-label="Previous slide"
              onClick={prev}
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--rd-paper)]/18 bg-[color:var(--rd-ink)]/55 text-[color:var(--rd-text-dim)] backdrop-blur-md transition hover:border-[color:var(--rd-glow)] hover:text-[color:var(--rd-glow)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next slide"
              onClick={next}
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--rd-paper)]/18 bg-[color:var(--rd-ink)]/55 text-[color:var(--rd-text-dim)] backdrop-blur-md transition hover:border-[color:var(--rd-glow)] hover:text-[color:var(--rd-glow)]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {/* Layer 5: scroll cue */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center pb-[max(env(safe-area-inset-bottom,0px),8px)] sm:bottom-4">
        <ChevronDown className="rd-scroll-cue h-5 w-5 text-[color:var(--rd-text-mute)]" aria-hidden />
      </div>
    </section>
  );
}

function renderHeadline(headline: string, accent?: string) {
  if (!accent) return <span style={{ fontWeight: 500 }}>{headline}</span>;
  const parts = headline.split(accent);
  if (parts.length === 1) return <span style={{ fontWeight: 500 }}>{headline}</span>;
  return (
    <>
      <span style={{ fontWeight: 300, fontStyle: 'italic' }}>{parts[0]}</span>
      <span style={{ fontWeight: 600, color: 'var(--rd-glow)', fontStyle: 'normal' }}>{accent}</span>
      <span style={{ fontWeight: 300, fontStyle: 'italic' }}>{parts[1]}</span>
    </>
  );
}

function SlideCta({
  label,
  href,
  onClick,
  variant
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  variant: 'gold' | 'ghost';
}) {
  const cls = `btn-luxe ${variant === 'gold' ? 'btn-luxe-gold' : 'btn-luxe-ghost'}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {label}
        <ArrowRight />
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {label}
      <ArrowRight />
    </button>
  );
}
