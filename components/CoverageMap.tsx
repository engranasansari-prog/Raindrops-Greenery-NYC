'use client';

import Link from 'next/link';
import { ArrowRight, Check, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { checkZip, normalizeZip, UNSUPPORTED_MESSAGE } from '@/lib/zip-utils';
import { serviceAreaDetails } from '@/lib/site-data';

// Stylized NYC borough shapes (480x320 viewBox)
const BOROUGHS: Array<{ name: 'Manhattan' | 'Brooklyn' | 'Queens'; path: string; label: { x: number; y: number } }> = [
  {
    name: 'Manhattan',
    path: 'M156 38 L182 30 L196 60 L208 92 L214 132 L210 172 L198 208 L186 232 L172 248 L162 240 L156 218 L148 188 L146 160 L148 122 L150 90 L154 60 Z',
    label: { x: 178, y: 150 }
  },
  {
    name: 'Brooklyn',
    path: 'M230 220 L268 208 L304 212 L336 224 L360 244 L368 266 L356 286 L324 296 L286 296 L250 286 L222 272 L208 254 L214 232 Z',
    label: { x: 290, y: 258 }
  },
  {
    name: 'Queens',
    path: 'M242 110 L284 96 L334 92 L388 102 L426 124 L442 152 L432 188 L408 208 L370 212 L334 208 L294 200 L260 188 L240 168 L228 146 Z',
    label: { x: 340, y: 156 }
  }
];

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function CoverageMap() {
  const [zip, setZip] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const result = useMemo(() => (submitted ? checkZip(zip) : checkZip('')), [submitted, zip]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const onChange = (value: string) => {
    setZip(normalizeZip(value));
    setSubmitted(false);
  };

  // Highlight the borough on the map that matches a successful ZIP lookup
  const matchedBorough = result.status === 'supported' ? result.borough : null;
  const highlight = hover ?? matchedBorough;

  return (
    <section className="rd-grain relative overflow-hidden bg-[color:var(--rd-ink)] py-20 text-[color:var(--rd-text)] sm:py-24 lg:py-28">
      {/* Soft glow vignette to anchor attention */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,230,110,0.06),transparent_60%)]" aria-hidden />

      <div className="luxury-shell relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: easeOut }}
        >
          <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
            <MapPin className="h-3.5 w-3.5" />
            NYC coverage
          </p>
          <h2 className="mt-4 text-[color:var(--rd-text)]">
            Manhattan. Brooklyn. <span className="italic">Queens.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
            Check your ZIP in two seconds. Inside our coverage map, you’re eligible for same-day delivery and the current free-gift offer.
          </p>

          <form onSubmit={onSubmit} className="mt-9 max-w-md">
            <label className="rd-eyebrow text-[color:var(--rd-text-dim)]">Your ZIP code</label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 px-4 py-3 transition focus-within:border-[color:var(--rd-glow)] focus-within:bg-[color:var(--rd-ink-soft)]/85 focus-within:shadow-[0_0_0_4px_rgba(200,230,110,0.18)]">
                <Search className="h-4 w-4 text-[color:var(--rd-text-mute)]" />
                <input
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
                Check availability
                <ArrowRight />
              </button>
            </div>

            <div className="mt-5 min-h-[80px]">
              {result.status === 'supported' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                  className="rounded-2xl border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-glow)]/8 p-4"
                >
                  <p className="inline-flex items-center gap-2 rd-eyebrow text-[color:var(--rd-glow)]">
                    <Check className="h-3.5 w-3.5" />
                    You’re in
                  </p>
                  <p className="mt-2 text-base font-medium text-[color:var(--rd-text)]">
                    Same-day delivery available in {result.borough}.
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--rd-text-dim)]">
                    Typical delivery window: 45–90 min within our service hours.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link href="/menu" className="btn-luxe btn-luxe-gold">
                      Continue to menu
                      <ArrowRight />
                    </Link>
                    <Link href="/deals" className="btn-luxe btn-luxe-ghost">
                      See deals
                    </Link>
                  </div>
                </motion.div>
              )}
              {result.status === 'unsupported' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                  className="rounded-2xl border border-[color:var(--rd-amber)]/30 bg-[color:var(--rd-amber)]/8 p-4"
                >
                  <p className="inline-flex items-center gap-2 rd-eyebrow text-[color:var(--rd-amber)]">
                    <MapPin className="h-3.5 w-3.5" />
                    Not yet
                  </p>
                  <p className="mt-2 text-base font-medium text-[color:var(--rd-text)]">{UNSUPPORTED_MESSAGE}</p>
                  <p className="mt-1 text-sm text-[color:var(--rd-text-dim)]">
                    We’re expanding fast. Drop your email in the footer and we’ll notify you the day we hit your area.
                  </p>
                </motion.div>
              )}
              {result.status === 'incomplete' && (
                <p className="text-sm text-[color:var(--rd-text-mute)]">Enter a 5-digit ZIP and tap check.</p>
              )}
            </div>
          </form>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {serviceAreaDetails.map((area) => (
              <div
                key={area.name}
                onMouseEnter={() => setHover(area.name)}
                onMouseLeave={() => setHover(null)}
                className="rounded-xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)]/50 p-4 transition hover:border-[color:var(--rd-glow)]/40"
              >
                <p className="rd-eyebrow text-[color:var(--rd-text-dim)]">{area.name}</p>
                <p className="mt-1 text-2xl text-[color:var(--rd-text)] [font-family:var(--font-mono)] font-semibold">
                  {area.zips.length}+
                </p>
                <p className="rd-eyebrow text-[color:var(--rd-text-mute)]">ZIPs</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Map card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="relative"
        >
          <div className="relative rounded-3xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/70 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:p-6">
            <svg
              viewBox="0 0 480 320"
              role="img"
              aria-label="Map of Raindrops Greenery NYC delivery coverage"
              className="block h-auto w-full"
            >
              <defs>
                <radialGradient id="map-glow-bg" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#5B8C6E" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0A1410" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="borough-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2D4A3A" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#11201A" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="borough-fill-hover" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#5B8C6E" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#2D4A3A" stopOpacity="1" />
                </linearGradient>
              </defs>

              <rect x="0" y="0" width="480" height="320" fill="url(#map-glow-bg)" />

              {/* Subtle grid */}
              <g stroke="rgba(245,241,232,0.05)">
                {Array.from({ length: 12 }).map((_, i) => (
                  <line key={`v-${i}`} x1={(i + 1) * 40} y1="0" x2={(i + 1) * 40} y2="320" />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={(i + 1) * 40} x2="480" y2={(i + 1) * 40} />
                ))}
              </g>

              {/* Surrounding water labels — well separated */}
              <g
                fontFamily="ui-monospace, SFMono-Regular, JetBrains Mono, monospace"
                fontSize="9"
                letterSpacing="0.22em"
                fill="rgba(245,241,232,0.18)"
              >
                <text x="22" y="34">HUDSON</text>
                <text x="380" y="56">LONG ISLAND</text>
                <text x="190" y="310">ATLANTIC</text>
              </g>

              {BOROUGHS.map((b) => {
                const active = highlight === b.name;
                return (
                  <g
                    key={b.name}
                    onMouseEnter={() => setHover(b.name)}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <path
                      d={b.path}
                      fill={`url(#${active ? 'borough-fill-hover' : 'borough-fill'})`}
                      stroke={active ? '#C8E66E' : 'rgba(91,140,110,0.55)'}
                      strokeWidth={active ? 2 : 1.4}
                      style={{ transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)' }}
                    />
                    <text
                      x={b.label.x}
                      y={b.label.y}
                      textAnchor="middle"
                      fontFamily="var(--font-display, serif)"
                      fontWeight="500"
                      fontSize={active ? 19 : 16}
                      fill={active ? '#C8E66E' : '#F5F1E8'}
                      style={{ transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)' }}
                    >
                      {b.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[color:var(--rd-glow)]" />
                Active coverage
              </span>
              <span>21+ · While supplies last</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
