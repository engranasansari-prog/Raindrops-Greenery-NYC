'use client';

import { ArrowRight, MapPin, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { checkZip, normalizeZip, SUPPORTED_MESSAGE, UNSUPPORTED_MESSAGE } from '@/lib/zip-utils';
import { serviceAreaDetails } from '@/lib/site-data';

// Stylized NYC borough shapes (not topographic — just instantly readable).
// Coordinates are in a 480x320 viewBox.
const BOROUGHS: Array<{ name: 'Manhattan' | 'Brooklyn' | 'Queens'; path: string; label: { x: number; y: number } }> = [
  {
    name: 'Manhattan',
    // Slim vertical island
    path: 'M156 38 L182 30 L196 60 L208 92 L214 132 L210 172 L198 208 L186 232 L172 248 L162 240 L156 218 L148 188 L146 160 L148 122 L150 90 L154 60 Z',
    label: { x: 178, y: 150 }
  },
  {
    name: 'Brooklyn',
    // Bottom-right wide shape
    path: 'M230 220 L268 208 L304 212 L336 224 L360 244 L368 266 L356 286 L324 296 L286 296 L250 286 L222 272 L208 254 L214 232 Z',
    label: { x: 290, y: 258 }
  },
  {
    name: 'Queens',
    // Upper right large area
    path: 'M242 110 L284 96 L334 92 L388 102 L426 124 L442 152 L432 188 L408 208 L370 212 L334 208 L294 200 L260 188 L240 168 L228 146 Z',
    label: { x: 340, y: 156 }
  }
];

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

  return (
    <section className="luxe-dark relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="luxury-shell relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--champagne)] sm:text-xs">
            <MapPin className="h-3.5 w-3.5" />
            NYC coverage
          </p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
            Manhattan · Brooklyn · Queens.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">
            Check your ZIP in two seconds. If you’re inside our coverage map, you’re eligible for same-day delivery and the current free-gift offer.
          </p>

          <form onSubmit={onSubmit} className="mt-8 max-w-md">
            <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--champagne)] sm:text-xs">
              Your ZIP code
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/14 bg-white/4 px-4 py-3 transition focus-within:border-[var(--champagne)] focus-within:bg-white/8">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={zip}
                  onChange={(event) => onChange(event.target.value)}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  placeholder="Enter NYC ZIP"
                  aria-label="ZIP code"
                  className="w-full bg-transparent text-base font-bold text-white outline-none placeholder:text-white/40"
                />
              </div>
              <button type="submit" className="btn-luxe btn-luxe-gold">
                Check availability
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 min-h-[56px]">
              {result.status === 'supported' && (
                <p className="inline-flex items-start gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  {SUPPORTED_MESSAGE} {result.borough && <span className="font-extrabold text-white">({result.borough})</span>}
                </p>
              )}
              {result.status === 'unsupported' && (
                <p className="inline-flex items-start gap-2 rounded-xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm font-bold text-rose-100">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                  {UNSUPPORTED_MESSAGE}
                </p>
              )}
              {result.status === 'incomplete' && (
                <p className="text-sm text-white/56">Enter a 5-digit ZIP and tap check.</p>
              )}
            </div>
          </form>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {serviceAreaDetails.map((area) => (
              <div key={area.name} className="rounded-xl border border-white/10 bg-white/4 p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--champagne)] sm:text-xs">{area.name}</p>
                <p className="mt-1 text-sm font-bold text-white">{area.zips.length}+ ZIPs</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-3xl border border-white/8 bg-[#02100b]/80 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-6">
            <svg
              viewBox="0 0 480 320"
              role="img"
              aria-label="Map of Raindrops Greenery NYC delivery coverage"
              className="block h-auto w-full"
            >
              <defs>
                <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0f5b3f" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f5b3f" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="borough-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0f5b3f" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#073326" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="borough-fill-hover" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1a875c" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0f5b3f" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Subtle grid + glow */}
              <rect x="0" y="0" width="480" height="320" fill="url(#map-glow)" />
              <g stroke="rgba(255,255,255,0.05)">
                {Array.from({ length: 12 }).map((_, i) => (
                  <line key={`v-${i}`} x1={(i + 1) * 40} y1="0" x2={(i + 1) * 40} y2="320" />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={(i + 1) * 40} x2="480" y2={(i + 1) * 40} />
                ))}
              </g>

              {/* Water / surrounds (already uppercase strings, no CSS transform needed) */}
              <text x="20" y="32" fill="rgba(255,255,255,0.18)" fontSize="10" letterSpacing="0.18em">HUDSON</text>
              <text x="380" y="60" fill="rgba(255,255,255,0.18)" fontSize="10" letterSpacing="0.18em">LONG ISLAND</text>
              <text x="200" y="310" fill="rgba(255,255,255,0.18)" fontSize="10" letterSpacing="0.18em">ATLANTIC</text>

              {BOROUGHS.map((b) => {
                const active = hover === b.name;
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
                      stroke={active ? '#d9b76f' : 'rgba(217,183,111,0.55)'}
                      strokeWidth={active ? 2 : 1.4}
                      style={{ transition: 'all 0.25s ease' }}
                    />
                    <text
                      x={b.label.x}
                      y={b.label.y}
                      textAnchor="middle"
                      fontFamily="var(--font-display, serif)"
                      fontWeight="700"
                      fontSize={active ? 18 : 16}
                      fill="#ffffff"
                      style={{ transition: 'all 0.25s ease' }}
                    >
                      {b.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/56 sm:text-xs">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--champagne)]" />
                Active coverage
              </span>
              <span className="text-white/40">21+ only · While supplies last</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
