'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SiteChrome from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { menuProducts, type LiveMenuProduct } from '@/lib/menu';
import {
  formatPrice,
  getBrandLabel,
  getPotencyLabel,
  getPrimaryPotency,
  getStrainTag,
  inferProfile,
  isSticky,
  type StrainTag
} from '@/lib/menu-utils';

type FeelTag = 'Energized' | 'Calm' | 'Sleepy' | 'Social';
type WindowTag = 'Daytime' | 'Evening' | 'Bedtime' | 'Anytime';
type FormatTag = 'Flower' | 'Pre-Rolls' | 'Edibles' | 'Any';
type LevelTag = 'New' | 'Casual' | 'Regular' | 'Frequent';

type Answers = {
  feel?: FeelTag;
  window?: WindowTag;
  format?: FormatTag;
  level?: LevelTag;
};

type AnswerKey = keyof Answers;

type Question = {
  key: AnswerKey;
  label: string;
  italic: string;
  options: Array<{ value: string; body: string }>;
};

const QUESTIONS: Question[] = [
  {
    key: 'feel',
    label: 'How do you want',
    italic: 'to feel?',
    options: [
      { value: 'Energized', body: 'Focused, productive, ready to go.' },
      { value: 'Calm', body: 'Even-keeled, low-stress, present.' },
      { value: 'Sleepy', body: 'Wind down. Get good sleep.' },
      { value: 'Social', body: 'Loose, chatty, fun with friends.' }
    ]
  },
  {
    key: 'window',
    label: 'When are you',
    italic: 'using it?',
    options: [
      { value: 'Daytime', body: 'Morning or mid-day.' },
      { value: 'Evening', body: 'After work, dinner, hanging.' },
      { value: 'Bedtime', body: 'Right before sleep.' },
      { value: 'Anytime', body: 'Flexible — whenever fits.' }
    ]
  },
  {
    key: 'format',
    label: 'Preferred',
    italic: 'format?',
    options: [
      { value: 'Flower', body: 'Classic, customizable, fast onset.' },
      { value: 'Pre-Rolls', body: 'No setup. Ready to go.' },
      { value: 'Edibles', body: 'Discreet, longer-lasting.' },
      { value: 'Any', body: 'Surprise me.' }
    ]
  },
  {
    key: 'level',
    label: 'Experience',
    italic: 'level?',
    options: [
      { value: 'New', body: 'First time or close to it.' },
      { value: 'Casual', body: 'Maybe once or twice a month.' },
      { value: 'Regular', body: 'Weekly-ish.' },
      { value: 'Frequent', body: 'Daily.' }
    ]
  }
];

const STRAIN_BADGE: Record<StrainTag, string> = {
  INDICA: 'border-[color:var(--rd-rain)]/40 text-[color:var(--rd-rain)] bg-[color:var(--rd-rain)]/12',
  SATIVA: 'border-[color:var(--rd-glow)]/40 text-[color:var(--rd-glow)] bg-[color:var(--rd-glow)]/10',
  HYBRID: 'border-[color:var(--rd-amber)]/40 text-[color:var(--rd-amber)] bg-[color:var(--rd-amber)]/12',
  BALANCED: 'border-[color:var(--rd-mint)]/40 text-[color:var(--rd-mint)] bg-[color:var(--rd-mint)]/12'
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const THC_CEILING: Record<LevelTag, number> = {
  New: 18,
  Casual: 24,
  Regular: 30,
  Frequent: 100
};

/**
 * V8.2 — Map the four quiz answers to a scored shortlist of three real
 * products from the live menu.
 *
 * Hard constraints:
 *   - If format !== 'Any', only products in that category are eligible.
 *     (The customer explicitly said "Edibles" — don't hand them Flower.)
 *
 * Soft scoring (within the eligible pool):
 *   - Strain target (sativa/indica/hybrid) from feel + window
 *   - THC sweet-spot against the experience-level ceiling
 *   - ✦ STICKY bonus / penalty depending on experience
 *
 * Works against the 44-product V8 dataset.
 */
function recommend(answers: Answers): LiveMenuProduct[] {
  if (!answers.feel || !answers.window || !answers.format || !answers.level) return [];

  // Map feel + window to a target strain profile.
  let target: 'sativa' | 'indica' | 'hybrid' = 'hybrid';
  if (answers.feel === 'Energized' || answers.window === 'Daytime') target = 'sativa';
  if (answers.feel === 'Sleepy' || answers.window === 'Bedtime') target = 'indica';
  if (answers.feel === 'Calm' && (answers.window === 'Evening' || answers.window === 'Bedtime')) target = 'indica';
  if (answers.feel === 'Social') target = 'hybrid';

  const ceiling = THC_CEILING[answers.level];

  // Hard format filter — never violate the customer's explicit pick.
  const pool =
    answers.format === 'Any'
      ? menuProducts
      : menuProducts.filter((product) => product.category === answers.format);

  // Safety: if the pool is empty (shouldn't happen with the V8 catalog,
  // but be defensive), fall back to the full menu so we still show three.
  const eligible = pool.length > 0 ? pool : menuProducts;

  const score = (product: LiveMenuProduct): number => {
    let s = 0;
    const profile = inferProfile(product).toLowerCase();
    const tag = getStrainTag(product).toLowerCase();

    // Strain profile fit (0–5)
    if (tag.includes(target)) s += 5;
    else if (profile.includes(target)) s += 4;
    else if (profile.includes('hybrid')) s += 2;

    // THC fit vs. experience level
    const thc = getPrimaryPotency(product);
    if (thc > 0) {
      if (thc <= ceiling) s += 2;
      // sweet-spot bonus around 85% of ceiling
      if (Math.abs(thc - ceiling * 0.85) < 5) s += 1;
    }

    // ✦ STICKY bonus for frequent users; penalty for new users
    if (isSticky(product)) {
      if (answers.level === 'Frequent' || answers.level === 'Regular') s += 1;
      if (answers.level === 'New') s -= 2;
    }

    return s;
  };

  return eligible
    .map((product) => ({ product, s: score(product) }))
    .sort((a, b) => b.s - a.s || a.product.name.localeCompare(b.product.name))
    .slice(0, 3)
    .map(({ product }) => product);
}

export default function StrainQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const total = QUESTIONS.length;
  const finished = step >= total;
  const progress = Math.min((step / total) * 100, 100);
  const current = !finished ? QUESTIONS[step] : null;
  const selectedValue = current ? (answers[current.key] as string | undefined) : undefined;

  const results = useMemo(() => (finished ? recommend(answers) : []), [answers, finished]);

  // Scroll-to-top on step change so each question lands at the same visual position.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const select = (value: string) => {
    if (!current) return;
    const nextAnswers: Answers = { ...answers, [current.key]: value };
    setAnswers(nextAnswers);
    // Auto-advance the moment they pick. No timer race — go immediately.
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  return (
    <SiteChrome>
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

        <div className="luxury-shell relative py-16 sm:py-20 lg:py-24">
          <Breadcrumbs items={[{ label: 'Strain finder' }]} tone="dark" />
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
                <Sparkles className="h-3.5 w-3.5" />
                4 questions · 30 seconds
              </p>
              <h1 className="mt-4 text-[color:var(--rd-text)]">
                Find your <span className="italic">strain.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg">
                Tell us how you want to feel — we’ll pull three drops from the live menu that fit. Not medical advice, just a smart starting point.
              </p>
            </div>
            {!finished && (
              <span className="inline-flex items-center gap-2 self-start rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/70 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)] sm:self-auto">
                Step <span className="text-[color:var(--rd-glow)]">{Math.min(step + 1, total)}</span> / {total}
              </span>
            )}
          </div>

          {/* Progress rail */}
          {!finished && (
            <div className="mt-8 h-px w-full bg-[color:var(--rd-paper)]/8">
              <motion.div
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: easeOut }}
                className="h-px bg-[color:var(--rd-glow)]"
              />
            </div>
          )}
        </div>
      </section>

      {/* Quiz body */}
      <section className="overflow-hidden bg-[color:var(--rd-ink)] pb-20 text-[color:var(--rd-text)] sm:pb-24">
        <div className="luxury-shell">
          <AnimatePresence mode="wait">
            {!finished && current ? (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: easeOut }}
              >
                <p className="rd-eyebrow text-[color:var(--rd-text-mute)]">Question {step + 1} of {total}</p>
                <h2 className="mt-3 text-[color:var(--rd-text)]">
                  {current.label} <span className="italic">{current.italic}</span>
                </h2>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {current.options.map((option) => {
                    const isSelected = selectedValue === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => select(option.value)}
                        aria-pressed={isSelected}
                        className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-[transform,border-color,background-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-[color:var(--rd-glow)] bg-[color:var(--rd-glow)]/12 shadow-[0_20px_60px_rgba(200,230,110,0.18)]'
                            : 'border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] hover:border-[color:var(--rd-glow)]/40 hover:shadow-[0_24px_70px_rgba(0,0,0,0.24)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3
                            className="text-2xl text-[color:var(--rd-text)] sm:text-3xl"
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
                          >
                            {option.value}
                          </h3>
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition ${
                              isSelected
                                ? 'border-[color:var(--rd-glow)] bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)]'
                                : 'border-[color:var(--rd-paper)]/22 text-transparent group-hover:border-[color:var(--rd-glow)]/40'
                            }`}
                            aria-hidden
                          >
                            <Check className="h-4 w-4" />
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[color:var(--rd-text-dim)] sm:text-base">{option.body}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={back}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 text-sm text-[color:var(--rd-text-dim)] transition hover:text-[color:var(--rd-text)] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">Tap an option to continue</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.6, ease: easeOut }}
              >
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div className="min-w-0">
                    <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
                      <Check className="h-3.5 w-3.5" />
                      Matched
                    </p>
                    <h2 className="mt-3 break-words text-[color:var(--rd-text)]">
                      Three drops <span className="italic">picked for you.</span>
                    </h2>
                    {/* Chip row instead of inline sentence — wraps cleanly on mobile */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {[answers.feel, answers.window, answers.format, answers.level]
                        .filter(Boolean)
                        .map((value) => (
                          <span
                            key={value as string}
                            className="inline-flex items-center rounded-full border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-glow)]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-glow)] [font-family:var(--font-mono)]"
                          >
                            {value}
                          </span>
                        ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-2 self-start rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-glow)] sm:self-auto [font-family:var(--font-mono)]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Retake
                  </button>
                </div>

                {results.length === 0 ? (
                  <div className="mt-10 rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-8 text-[color:var(--rd-text-dim)]">
                    No exact matches in stock right now — open the full menu to keep browsing.
                  </div>
                ) : (
                  <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((product, i) => {
                      const strain = getStrainTag(product);
                      const tint = STRAIN_BADGE[strain];
                      const potency = getPotencyLabel(product);
                      const thcMatch = potency.match(/THC\s+([\d.]+)/i);
                      const thc = thcMatch ? thcMatch[1] : null;
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.08 + i * 0.06, ease: easeOut }}
                        >
                          <Link
                            href={`/menu?product=${encodeURIComponent(product.id)}`}
                            className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] shadow-[0_20px_60px_rgba(0,0,0,0.20)] transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:border-[color:var(--rd-glow)]/40 hover:shadow-[0_30px_70px_rgba(200,230,110,0.14)]"
                          >
                            <div className="relative aspect-square w-full overflow-hidden bg-[color:var(--rd-paper-soft)]">
                              {product.image && (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  unoptimized
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  className="object-contain p-6 transition-transform duration-[1400ms] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.05]"
                                />
                              )}
                              {/* Badges stacked in one column to avoid mobile collision */}
                              <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--rd-ink)] shadow-sm [font-family:var(--font-mono)]">
                                  #{i + 1} match
                                </span>
                                <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur [font-family:var(--font-mono)] ${tint}`}>
                                  {strain}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-1 flex-col p-5">
                              <p className="rd-eyebrow truncate text-[color:var(--rd-text-mute)]">{getBrandLabel(product)}</p>
                              <h3 className="mt-2 truncate text-lg text-[color:var(--rd-text)] sm:text-xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.015em' }}>
                                {product.name}
                              </h3>
                              <p className="mt-2 text-xs text-[color:var(--rd-text-dim)]">{inferProfile(product)}</p>
                              <div className="mt-auto flex items-end justify-between pt-5">
                                <div className="[font-family:var(--font-mono)]">
                                  <span className="block text-xl font-semibold text-[color:var(--rd-amber)]">{formatPrice(product.salePrice)}</span>
                                </div>
                                {thc && (
                                  <span className="text-right [font-family:var(--font-mono)]">
                                    <span className="block text-base font-semibold text-[color:var(--rd-glow)]">{thc}%</span>
                                    <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">THC</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/menu" className="btn-luxe btn-luxe-gold">
                    Open full menu
                    <ArrowRight />
                  </Link>
                  <Link href="/deals" className="btn-luxe btn-luxe-ghost">
                    See live deals
                  </Link>
                </div>

                <p className="mt-10 rd-eyebrow text-[color:var(--rd-text-mute)]">
                  Recommendations are educational, not medical advice. Cannabis affects each person differently. Start low, go slow — especially with edibles.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </SiteChrome>
  );
}
