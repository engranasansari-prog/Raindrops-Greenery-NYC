'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import SmokeLayer from '@/components/SmokeLayer';

export type HeroSlide = {
  id: string;
  image: string;
  imageAlt: string;
  /** Object-position tuned per-slide so the subject stays visible on phones */
  imagePosition?: string;
  eyebrow: string;
  headline: string;
  headlineAccent?: string;
  subtext: string;
  primary?: { label: string; href?: string; onClick?: () => void };
  secondary?: { label: string; href?: string; onClick?: () => void };
};

type Props = {
  slides: HeroSlide[];
  autoplayMs?: number;
  onClaim?: () => void;
};

const AUTOPLAY_MS_DEFAULT = 7000;

export default function HeroSlider({ slides, autoplayMs = AUTOPLAY_MS_DEFAULT }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay with hover-pause and reduced-motion respect.
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timerRef.current = setTimeout(next, autoplayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoplayMs, index, next, paused, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') prev();
      if (event.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  // Basic touch swipe support
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
      className="relative isolate w-full overflow-hidden bg-[#03100b] text-white"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide images, cross-faded */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ opacity: { duration: 1.1, ease: 'easeInOut' }, scale: { duration: 6, ease: 'easeOut' } }}
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
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,16,11,0.92)_0%,rgba(3,16,11,0.72)_40%,rgba(3,16,11,0.32)_75%,rgba(3,16,11,0.55)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#03100b] to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cinematic smoke layer */}
      <SmokeLayer />

      {/* Slide content */}
      <div className="luxury-shell relative z-10 grid min-h-[620px] items-center py-16 sm:min-h-[680px] sm:py-20 lg:min-h-[88vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-[var(--champagne)]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/86 sm:text-xs sm:tracking-[0.22em]">{slide.eyebrow}</span>
            </span>

            <h1 className="mt-5 font-[var(--font-display)] text-[2.6rem] font-extrabold leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-8xl">
              {slide.headlineAccent ? (
                <>
                  {slide.headline.split(slide.headlineAccent)[0]}
                  <span className="text-[var(--emerald)]">{slide.headlineAccent}</span>
                  {slide.headline.split(slide.headlineAccent)[1]}
                </>
              ) : (
                slide.headline
              )}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/76 sm:text-lg sm:leading-8 md:text-xl">
              {slide.subtext}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {slide.primary && (
                <SlideCta {...slide.primary} variant="gold" />
              )}
              {slide.secondary && (
                <SlideCta {...slide.secondary} variant="ghost" />
              )}
            </div>

            <div className="mt-9 flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/56 sm:text-xs">
              <MapPin className="h-3.5 w-3.5 text-[var(--champagne)]" />
              <span>21+ • NYC only • While supplies last</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-4 sm:bottom-8">
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-9 bg-[var(--champagne)]' : 'w-3 bg-white/30 hover:bg-white/55'}`}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 items-center justify-between px-4 sm:flex">
            <button
              aria-label="Previous slide"
              onClick={prev}
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-black/24 text-white/80 backdrop-blur-md transition hover:border-[var(--champagne)] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next slide"
              onClick={next}
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-black/24 text-white/80 backdrop-blur-md transition hover:border-[var(--champagne)] hover:text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
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
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {label}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}
