'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteChrome from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { menuProducts, type LiveMenuProduct } from '@/lib/menu';
import {
  formatPrice,
  getBrandLabel,
  getPotencyLabel,
  hasSale,
  inferProfile
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

const QUESTIONS = [
  {
    key: 'feel' as const,
    label: 'How do you want to feel?',
    options: [
      { value: 'Energized', body: 'Focused, productive, ready to go.' },
      { value: 'Calm', body: 'Even-keeled, low-stress, present.' },
      { value: 'Sleepy', body: 'Wind down. Get good sleep.' },
      { value: 'Social', body: 'Loose, chatty, fun with friends.' }
    ]
  },
  {
    key: 'window' as const,
    label: 'When are you using it?',
    options: [
      { value: 'Daytime', body: 'Morning or mid-day.' },
      { value: 'Evening', body: 'After work, dinner, hanging.' },
      { value: 'Bedtime', body: 'Right before sleep.' },
      { value: 'Anytime', body: 'Flexible — whenever fits.' }
    ]
  },
  {
    key: 'format' as const,
    label: 'Preferred format?',
    options: [
      { value: 'Flower', body: 'Classic, customizable, fast onset.' },
      { value: 'Pre-Rolls', body: 'No setup. Ready to go.' },
      { value: 'Edibles', body: 'Discreet, longer-lasting.' },
      { value: 'Any', body: 'Surprise me.' }
    ]
  },
  {
    key: 'level' as const,
    label: 'Experience level?',
    options: [
      { value: 'New', body: 'First time or close to it.' },
      { value: 'Casual', body: 'Maybe once or twice a month.' },
      { value: 'Regular', body: 'Weekly-ish.' },
      { value: 'Frequent', body: 'Daily.' }
    ]
  }
];

const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * Map answers to a target product profile, then score every menu product and
 * return the top N matches. Lightweight heuristic — not a clinical engine.
 */
function recommend(answers: Answers): LiveMenuProduct[] {
  if (!answers.feel || !answers.window || !answers.format || !answers.level) return [];

  // Determine preferred strain profile based on the feel + window
  let preferredProfile: 'sativa' | 'indica' | 'hybrid' = 'hybrid';
  if (answers.feel === 'Energized' || answers.window === 'Daytime') preferredProfile = 'sativa';
  if (answers.feel === 'Sleepy' || answers.window === 'Bedtime') preferredProfile = 'indica';
  if (answers.feel === 'Calm' && answers.window === 'Evening') preferredProfile = 'indica';
  if (answers.feel === 'Social') preferredProfile = 'hybrid';

  // THC ceiling based on experience level
  const thcCeiling: Record<LevelTag, number> = {
    New: 18,
    Casual: 24,
    Regular: 30,
    Frequent: 100
  };
  const ceiling = thcCeiling[answers.level];

  const score = (product: LiveMenuProduct): number => {
    let s = 0;
    const profile = inferProfile(product).toLowerCase();
    if (profile.includes(preferredProfile)) s += 4;
    if (profile.includes('hybrid')) s += 1;

    if (answers.format !== 'Any' && product.category === answers.format) s += 3;

    const thcMatch = getPotencyLabel(product).match(/THC\s+([\d.]+)/i);
    const thc = thcMatch ? parseFloat(thcMatch[1]) : 18;
    if (thc <= ceiling) s += 2;
    if (Math.abs(thc - ceiling * 0.85) < 4) s += 1;

    if (hasSale(product)) s += 1;
    return s;
  };

  return menuProducts
    .map((product) => ({ product, s: score(product) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(({ product }) => product);
}

export default function StrainQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const total = QUESTIONS.length;
  const finished = step >= total;
  const progress = Math.min((step / total) * 100, 100);

  const current = QUESTIONS[step];
  const selectedValue = current ? (answers[current.key] as string | undefined) : undefined;

  const results = useMemo(() => (finished ? recommend(answers) : []), [answers, finished]);

  const select = (value: string) => {
    if (!current) return;
    const nextAnswers: Answers = { ...answers, [current.key]: value };
    setAnswers(nextAnswers);
    // Auto-advance after a brief delight pause
    window.setTimeout(() => setStep((s) => s + 1), 280);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,230,110,0.10),transparent_55%)]" aria-hidden />

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
                Tell us how you want to feel and we’ll point you at three drops worth ordering. Not medical advice — just a smart starting point.
              </p>
            </div>
            {!finished && (
              <span className="inline-flex items-center gap-2 self-start rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)] sm:self-auto">
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
      <section className="bg-[color:var(--rd-ink)] pb-20 text-[color:var(--rd-text)] sm:pb-24">
        <div className="luxury-shell">
          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: easeOut }}
              >
                <p className="rd-eyebrow text-[color:var(--rd-text-dim)]">Question {step + 1}</p>
                <h2 className="mt-3 text-[color:var(--rd-text)]">{current?.label}</h2>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {current?.options.map((option) => {
                    const isSelected = selectedValue === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => select(option.value)}
                        aria-pressed={isSelected}
                        className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-[transform,border-color,background] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 sm:p-6 ${
                          isSelected
                            ? 'border-[color:var(--rd-glow)] bg-[color:var(--rd-glow)]/10'
                            : 'border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/55 hover:border-[color:var(--rd-glow)]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-xl text-[color:var(--rd-text)] sm:text-2xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.02em' }}>
                            {option.value}
                          </h3>
                          <span
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition ${
                              isSelected
                                ? 'border-[color:var(--rd-glow)] bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)]'
                                : 'border-[color:var(--rd-paper)]/22 text-transparent group-hover:border-[color:var(--rd-glow)]/40'
                            }`}
                            aria-hidden
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[color:var(--rd-text-dim)] sm:text-base">{option.body}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 text-sm text-[color:var(--rd-text-dim)] transition hover:text-[color:var(--rd-text)] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">Pick to continue</span>
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
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
                      <Check className="h-3.5 w-3.5" />
                      Matched
                    </p>
                    <h2 className="mt-3 text-[color:var(--rd-text)]">
                      Three drops <span className="italic">picked for you.</span>
                    </h2>
                    <p className="mt-3 max-w-xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg">
                      Based on{' '}
                      <span className="text-[color:var(--rd-glow)]">{answers.feel?.toLowerCase()}</span>
                      {' · '}
                      <span className="text-[color:var(--rd-glow)]">{answers.window?.toLowerCase()}</span>
                      {' · '}
                      <span className="text-[color:var(--rd-glow)]">{answers.format?.toLowerCase()}</span>
                      {' · '}
                      <span className="text-[color:var(--rd-glow)]">{answers.level?.toLowerCase()}</span>.
                    </p>
                  </div>
                  <button onClick={reset} className="inline-flex items-center gap-2 self-start rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 px-4 py-2 text-sm text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-glow)] sm:self-auto">
                    <RotateCcw className="h-4 w-4" />
                    Retake
                  </button>
                </div>

                {results.length === 0 ? (
                  <p className="mt-10 rounded-2xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/55 p-8 text-[color:var(--rd-text-dim)]">
                    No exact matches in stock right now — open the full menu to keep browsing.
                  </p>
                ) : (
                  <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {results.map((product, i) => {
                      const profile = inferProfile(product);
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
                            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:border-[color:var(--rd-glow)]/40 hover:shadow-[0_30px_70px_rgba(200,230,110,0.12)]"
                          >
                            <div className="relative aspect-square overflow-hidden bg-[color:var(--rd-paper-soft)]">
                              {product.image && (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  unoptimized
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  className="object-contain p-6 transition-transform duration-[1400ms] [transition-timing-function:var(--ease-out)] group-hover:scale-[1.05]"
                                />
                              )}
                              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
                                #{i + 1} match
                              </span>
                            </div>
                            <div className="flex flex-1 flex-col p-5">
                              <p className="rd-eyebrow text-[color:var(--rd-text-mute)]">{getBrandLabel(product)}</p>
                              <h3 className="mt-1 text-lg text-[color:var(--rd-text)]" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                {product.name}
                              </h3>
                              <p className="mt-2 rd-eyebrow text-[color:var(--rd-text-dim)]">{profile}</p>
                              <div className="mt-auto flex items-end justify-between pt-4">
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
