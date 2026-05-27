'use client';

import Link from 'next/link';
import { ArrowRight, Check, MapPin, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { COVERAGE, type CoverageCluster } from '@/lib/coverage';
import { checkZip, normalizeZip, UNSUPPORTED_MESSAGE } from '@/lib/zip-utils';

/* =====================================================================
   Raindrops over Manhattan — V4 §4
   Stylized SVG of Manhattan + the East River, with:
     - 7 cluster polygons (subtle green family, breathing animation)
     - 4 bridges connecting Manhattan to outer-borough clusters
     - Falling raindrops procedurally placed over covered zones
     - Cluster labels in Fraunces italic, MANHATTAN wordmark
     - Landmark anchors (Central Park, Statue of Liberty)
     - ZIP cloud below the map grouped by cluster
   ===================================================================== */

const VB_W = 1200;
const VB_H = 900;
const easeOut = [0.22, 1, 0.36, 1] as const;

type ClusterVisual = {
  id: CoverageCluster['id'];
  name: string;
  shortName: string;
  etaMinutes: number;
  zips: readonly string[];
  /** Polygon path in the 1200×900 viewBox. */
  path: string;
  /** Centroid for the label. */
  label: { x: number; y: number };
  /** Cluster tint (close green family). */
  fill: string;
  fillHover: string;
};

// Polygon coordinates — stylized, NOT geographically accurate. Vertical
// Manhattan island runs from y≈60 (Central Park South) to y≈830 (Battery).
// East River around x≈600. Brooklyn/Queens land mass to the right.
const CLUSTERS: ClusterVisual[] = [
  {
    id: 'ues-uws',
    name: COVERAGE.clusters[0].name,
    shortName: COVERAGE.clusters[0].shortName,
    etaMinutes: COVERAGE.clusters[0].etaMinutes,
    zips: COVERAGE.clusters[0].zips,
    path: 'M 410 70 L 580 75 L 590 130 L 545 200 L 530 250 L 530 295 L 470 295 L 460 240 L 430 200 L 408 145 Z',
    label: { x: 490, y: 175 },
    fill: '#4A7A5C',
    fillHover: '#5A9070'
  },
  {
    id: 'midtown',
    name: COVERAGE.clusters[1].name,
    shortName: COVERAGE.clusters[1].shortName,
    etaMinutes: COVERAGE.clusters[1].etaMinutes,
    zips: COVERAGE.clusters[1].zips,
    path: 'M 400 305 L 595 305 L 600 405 L 580 470 L 405 470 L 395 380 Z',
    label: { x: 498, y: 395 },
    fill: '#5B8C6E',
    fillHover: '#6FA384'
  },
  {
    id: 'chelsea-flatiron-ev',
    name: COVERAGE.clusters[2].name,
    shortName: COVERAGE.clusters[2].shortName,
    etaMinutes: COVERAGE.clusters[2].etaMinutes,
    zips: COVERAGE.clusters[2].zips,
    path: 'M 405 480 L 585 480 L 595 565 L 415 575 L 400 525 Z',
    label: { x: 498, y: 530 },
    fill: '#6BA180',
    fillHover: '#7FB694'
  },
  {
    id: 'gv-soho-tribeca',
    name: COVERAGE.clusters[3].name,
    shortName: COVERAGE.clusters[3].shortName,
    etaMinutes: COVERAGE.clusters[3].etaMinutes,
    zips: COVERAGE.clusters[3].zips,
    path: 'M 415 585 L 595 585 L 600 670 L 425 680 L 410 625 Z',
    label: { x: 502, y: 635 },
    fill: '#7DB591',
    fillHover: '#92C8A6'
  },
  {
    id: 'fidi-battery',
    name: COVERAGE.clusters[4].name,
    shortName: COVERAGE.clusters[4].shortName,
    etaMinutes: COVERAGE.clusters[4].etaMinutes,
    zips: COVERAGE.clusters[4].zips,
    path: 'M 425 690 L 590 690 L 540 800 L 480 830 L 430 760 Z',
    label: { x: 498, y: 745 },
    fill: '#8FC8A3',
    fillHover: '#A4DBB8'
  },
  {
    id: 'south-street',
    name: COVERAGE.clusters[5].name,
    shortName: COVERAGE.clusters[5].shortName,
    etaMinutes: COVERAGE.clusters[5].etaMinutes,
    zips: COVERAGE.clusters[5].zips,
    path: 'M 600 605 L 645 612 L 648 670 L 600 678 Z',
    label: { x: 622, y: 645 },
    fill: '#A0DBB5',
    fillHover: '#B4EDC7'
  },
  // East River extensions: LIC, Williamsburg, Greenpoint — across the water
  {
    id: 'east-river',
    name: COVERAGE.clusters[6].name,
    shortName: COVERAGE.clusters[6].shortName,
    etaMinutes: COVERAGE.clusters[6].etaMinutes,
    zips: COVERAGE.clusters[6].zips,
    path: 'M 700 320 L 870 305 L 905 380 L 880 460 L 905 540 L 870 620 L 745 635 L 715 555 L 720 470 L 695 395 Z',
    label: { x: 800, y: 475 },
    fill: '#7FA8B0',
    fillHover: '#94BBC4'
  }
];

// Bridges: thin paths from Manhattan side to outer-borough cluster.
const BRIDGES: Array<{ id: string; d: string; label: string; labelPos: { x: number; y: number } }> = [
  { id: 'queensboro', d: 'M 600 360 Q 660 360 700 355', label: 'Queensboro', labelPos: { x: 650, y: 348 } },
  { id: 'pulaski', d: 'M 595 460 Q 660 470 710 478', label: 'Pulaski', labelPos: { x: 650, y: 452 } },
  { id: 'williamsburg', d: 'M 595 535 Q 660 540 720 550', label: 'Williamsburg', labelPos: { x: 658, y: 525 } },
  { id: 'manhattan', d: 'M 600 655 Q 670 645 750 638', label: 'Manhattan', labelPos: { x: 668, y: 630 } }
];

// Procedurally generated raindrops over the covered Manhattan zones.
type Drop = { id: number; x: number; startY: number; endY: number; duration: number; delay: number };

function buildDrops(count: number): Drop[] {
  // Drop start positions clustered over Manhattan only (x:400-595)
  // East-River extensions get a few drops too (x:700-900)
  const drops: Drop[] = [];
  for (let i = 0; i < count; i += 1) {
    const overEastRiver = i % 4 === 0;
    const x = overEastRiver ? rand(710, 880) : rand(410, 590);
    const startY = rand(40, 110);
    const endY = overEastRiver ? rand(610, 660) : rand(770, 820);
    drops.push({
      id: i,
      x,
      startY,
      endY,
      duration: rand(2.4, 3.4),
      delay: -rand(0, 3)
    });
  }
  return drops;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function CoverageMap() {
  const [zip, setZip] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const maskId = useId();

  // Build raindrops on the client only so SSR markup matches initial render.
  useEffect(() => {
    setDrops(buildDrops(14));
  }, []);

  const result = useMemo(() => (submitted ? checkZip(zip) : checkZip('')), [submitted, zip]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const onChange = (value: string) => {
    setZip(normalizeZip(value));
    setSubmitted(false);
  };

  const matchedClusterId = result.status === 'supported' ? result.cluster?.id ?? null : null;
  const highlight = activeCluster ?? matchedClusterId;

  const handleClusterClick = (cluster: ClusterVisual) => {
    setZip(cluster.zips[0]);
    setSubmitted(true);
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section className="rd-grain relative overflow-hidden bg-[color:var(--rd-ink)] py-20 text-[color:var(--rd-text)] sm:py-24 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,230,110,0.06),transparent_60%)]" aria-hidden />

      <div className="luxury-shell relative">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="max-w-3xl"
        >
          <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
            <MapPin className="h-3.5 w-3.5" />
            Raindrops over Manhattan
          </p>
          <h2 className="mt-4 text-[color:var(--rd-text)]">
            Manhattan + <span className="italic">East River.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
            31 ZIPs across 7 neighborhoods. Tax-free, free same-day delivery on every order.
            Tap a zone, drop a ZIP, ride the bridge.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          {/* ZIP form + result + cluster cards */}
          <div className="order-2 lg:order-1">
            <form onSubmit={onSubmit} className="max-w-md">
              <label className="rd-eyebrow text-[color:var(--rd-text-dim)]">Your ZIP code</label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 px-4 py-3 transition focus-within:border-[color:var(--rd-glow)] focus-within:bg-[color:var(--rd-ink-soft)]/85 focus-within:shadow-[0_0_0_4px_rgba(200,230,110,0.18)]">
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
                  Check availability
                  <ArrowRight />
                </button>
              </div>

              <div className="mt-5 min-h-[80px]">
                {result.status === 'supported' && result.cluster && (
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
                      Same-day delivery available in {result.cluster.shortName}.
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--rd-text-dim)]">
                      Average delivery window: ~{result.cluster.etaMinutes} min. Free + tax-free.
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

            {/* Cluster cards summary */}
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {CLUSTERS.map((cluster) => {
                const isActive = highlight === cluster.id;
                return (
                  <button
                    key={cluster.id}
                    type="button"
                    onMouseEnter={() => setActiveCluster(cluster.id)}
                    onMouseLeave={() => setActiveCluster(null)}
                    onFocus={() => setActiveCluster(cluster.id)}
                    onBlur={() => setActiveCluster(null)}
                    onClick={() => handleClusterClick(cluster)}
                    className={`group rounded-xl border p-3.5 text-left transition-[border-color,background,transform] duration-300 [transition-timing-function:var(--ease-out)] ${
                      isActive
                        ? 'border-[color:var(--rd-glow)]/50 bg-[color:var(--rd-ink-soft)]/85'
                        : 'border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)]/45 hover:border-[color:var(--rd-glow)]/30'
                    }`}
                  >
                    <p className="rd-eyebrow truncate text-[color:var(--rd-text-dim)]">{cluster.shortName}</p>
                    <p className="mt-1 inline-flex items-baseline gap-1.5 text-[color:var(--rd-text)]">
                      <span className="text-xl font-semibold [font-family:var(--font-mono)]">~{cluster.etaMinutes}</span>
                      <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">min</span>
                      <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
                        {cluster.zips.length} ZIP{cluster.zips.length === 1 ? '' : 's'}
                      </span>
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* The map */}
          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-3xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/70 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:p-4 lg:p-5">
              <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                role="img"
                aria-label="Map of Raindrops Greenery NYC delivery coverage — Manhattan, LIC, Williamsburg, Greenpoint"
                className="block h-auto w-full"
                style={{ touchAction: 'pan-y' }}
              >
                <defs>
                  <radialGradient id="map-glow-bg" cx="50%" cy="55%" r="70%">
                    <stop offset="0%" stopColor="#5B8C6E" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0A1410" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="hudson-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0B1A1F" />
                    <stop offset="100%" stopColor="#080F13" />
                  </linearGradient>
                  <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(245,241,232,0.04)" strokeWidth="1" />
                  </pattern>
                  <mask id={`covered-${maskId}`}>
                    <rect x="0" y="0" width={VB_W} height={VB_H} fill="black" />
                    {CLUSTERS.map((cluster) => (
                      <path key={cluster.id} d={cluster.path} fill="white" />
                    ))}
                  </mask>
                </defs>

                {/* Background ink glow */}
                <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#map-glow-bg)" />

                {/* Water — Hudson left + East River channel */}
                <rect x="0" y="0" width="380" height={VB_H} fill="url(#hudson-fill)" />
                <rect x="600" y="280" width="100" height="520" fill="url(#hudson-fill)" />
                <rect x="600" y="800" width="600" height="100" fill="url(#hudson-fill)" />

                {/* Out-of-coverage land base — Brooklyn/Queens / NJ silhouettes */}
                <path d="M 700 250 L 1180 280 L 1200 900 L 600 900 L 600 800 L 660 700 L 660 280 Z" fill="#0F1E18" />

                {/* Manhattan island base */}
                <path
                  d="M 405 60 L 600 65 L 605 280 L 600 800 L 480 830 L 425 800 L 410 700 L 380 540 L 385 360 L 400 200 Z"
                  fill="#2D4A3A"
                />
                <path
                  d="M 405 60 L 600 65 L 605 280 L 600 800 L 480 830 L 425 800 L 410 700 L 380 540 L 385 360 L 400 200 Z"
                  fill="url(#hatch)"
                />

                {/* Brooklyn / Queens land cluster surface */}
                <path d="M 690 290 L 1100 320 L 1150 760 L 700 800 L 670 600 L 680 420 Z" fill="#1E332A" />

                {/* Central Park rectangle (decorative anchor) */}
                <rect
                  x="455"
                  y="115"
                  width="80"
                  height="160"
                  rx="6"
                  fill="#3F6A52"
                  stroke="rgba(200,230,110,0.18)"
                  strokeWidth="1"
                />
                <text x="495" y="200" textAnchor="middle" fontSize="9" letterSpacing="0.22em" fill="rgba(245,241,232,0.45)" fontFamily="ui-monospace, monospace">
                  CENTRAL
                </text>
                <text x="495" y="215" textAnchor="middle" fontSize="9" letterSpacing="0.22em" fill="rgba(245,241,232,0.45)" fontFamily="ui-monospace, monospace">
                  PARK
                </text>

                {/* Cluster polygons — breathing + hover */}
                <g className="rd-clusters">
                  {CLUSTERS.map((cluster, index) => {
                    const isActive = highlight === cluster.id;
                    return (
                      <g
                        key={cluster.id}
                        onMouseEnter={() => setActiveCluster(cluster.id)}
                        onMouseLeave={() => setActiveCluster(null)}
                        onClick={() => handleClusterClick(cluster)}
                        style={{ cursor: 'pointer' }}
                      >
                        <path
                          d={cluster.path}
                          fill={isActive ? cluster.fillHover : cluster.fill}
                          stroke={isActive ? '#C8E66E' : 'rgba(200,230,110,0.35)'}
                          strokeWidth={isActive ? 2 : 1}
                          className="rd-cluster"
                          style={{
                            animationDelay: `${index * 0.6}s`,
                            transition: 'fill 0.35s cubic-bezier(0.22,1,0.36,1), stroke 0.35s'
                          }}
                        />
                      </g>
                    );
                  })}
                </g>

                {/* Bridges */}
                <g>
                  {BRIDGES.map((bridge) => {
                    const eastRiverHot = highlight === 'east-river';
                    return (
                      <g key={bridge.id}>
                        <path
                          d={bridge.d}
                          stroke="rgba(91,140,110,0.55)"
                          strokeWidth={eastRiverHot ? 2.4 : 1.6}
                          fill="none"
                          strokeLinecap="round"
                          style={{ transition: 'stroke 0.35s, stroke-width 0.35s' }}
                        />
                        {eastRiverHot && (
                          <path
                            d={bridge.d}
                            stroke="#C8E66E"
                            strokeWidth="2.6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray="14 80"
                            className="rd-bridge-flow"
                          />
                        )}
                        {eastRiverHot && (
                          <text
                            x={bridge.labelPos.x}
                            y={bridge.labelPos.y}
                            textAnchor="middle"
                            fontSize="9"
                            letterSpacing="0.2em"
                            fill="rgba(245,241,232,0.6)"
                            fontFamily="ui-monospace, monospace"
                          >
                            {bridge.label.toUpperCase()}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* Raindrops over covered zones (masked) */}
                <g mask={`url(#covered-${maskId})`}>
                  {drops.map((drop) => (
                    <ellipse
                      key={drop.id}
                      cx={drop.x}
                      cy={drop.startY}
                      rx="1.4"
                      ry="3"
                      fill="#C8E66E"
                      style={{
                        animation: `rd-rainfall ${drop.duration}s linear ${drop.delay}s infinite`,
                        // CSS variable for the animation to read final Y
                        ['--rd-rain-end' as never]: `${drop.endY - drop.startY}px`
                      }}
                    />
                  ))}
                </g>

                {/* Landmarks */}
                <g>
                  {/* Statue of Liberty */}
                  <circle cx="380" cy="850" r="3" fill="#C8E66E" />
                  <text x="365" y="870" textAnchor="end" fontSize="8" letterSpacing="0.2em" fill="rgba(245,241,232,0.45)" fontFamily="ui-monospace, monospace">
                    LIBERTY
                  </text>
                </g>

                {/* Wordmarks */}
                <text
                  x="495"
                  y="500"
                  textAnchor="middle"
                  fontFamily="var(--font-display, serif)"
                  fontSize="34"
                  fontStyle="italic"
                  fontWeight="500"
                  letterSpacing="0.18em"
                  fill="rgba(245,241,232,0.06)"
                  transform="rotate(-90 495 500)"
                >
                  MANHATTAN
                </text>
                <text
                  x="900"
                  y="700"
                  textAnchor="middle"
                  fontFamily="var(--font-display, serif)"
                  fontSize="24"
                  fontStyle="italic"
                  fontWeight="500"
                  letterSpacing="0.18em"
                  fill="rgba(245,241,232,0.08)"
                >
                  BROOKLYN · QUEENS
                </text>

                {/* Water labels */}
                <g fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="0.24em" fill="rgba(245,241,232,0.22)">
                  <text x="40" y="120" transform="rotate(-90 40 120)">HUDSON</text>
                  <text x="1100" y="120">LONG ISLAND</text>
                  <text x="800" y="860">ATLANTIC</text>
                </g>

                {/* Cluster name labels */}
                {CLUSTERS.map((cluster) => {
                  const isActive = highlight === cluster.id;
                  return (
                    <text
                      key={`label-${cluster.id}`}
                      x={cluster.label.x}
                      y={cluster.label.y}
                      textAnchor="middle"
                      fontFamily="var(--font-display, serif)"
                      fontStyle="italic"
                      fontWeight={isActive ? 600 : 400}
                      fontSize={isActive ? 16 : 13}
                      fill={isActive ? '#C8E66E' : 'rgba(245,241,232,0.78)'}
                      style={{
                        textShadow: '0 1px 6px rgba(10,20,16,0.6)',
                        transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
                        pointerEvents: 'none'
                      }}
                    >
                      {cluster.shortName}
                    </text>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
                <span className="inline-flex items-center gap-2">
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-[color:var(--rd-glow)] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--rd-glow)]" />
                  </span>
                  Active coverage
                </span>
                <span>Tap a zone to drop its ZIP</span>
              </div>
            </div>

            {/* Tooltip card for hovered cluster (desktop) */}
            {activeCluster && (
              <motion.div
                key={activeCluster}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="mt-3 rounded-2xl border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-ink-soft)]/80 p-4 backdrop-blur"
              >
                {(() => {
                  const c = CLUSTERS.find((x) => x.id === activeCluster);
                  if (!c) return null;
                  return (
                    <>
                      <p className="rd-eyebrow text-[color:var(--rd-glow)]">{c.shortName}</p>
                      <p className="mt-1 text-base font-medium text-[color:var(--rd-text)]">{c.name}</p>
                      <p className="mt-1 text-sm text-[color:var(--rd-text-dim)]">
                        ~{c.etaMinutes} min · {c.zips.length} ZIPs · Free delivery
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.zips.map((z) => (
                          <span key={z} className="inline-flex rounded-md border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 px-2 py-0.5 text-[10px] tracking-wider text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)]">
                            {z}
                          </span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </div>
        </div>

        {/* ZIP cloud */}
        <div className="mt-14">
          <p className="rd-eyebrow text-[color:var(--rd-glow)]">Every covered ZIP</p>
          <h3 className="mt-3 text-2xl text-[color:var(--rd-text)] sm:text-3xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}>
            31 ZIPs. <span className="italic">7 neighborhoods.</span>
          </h3>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {CLUSTERS.map((cluster) => (
              <div key={cluster.id}>
                <p
                  className="text-sm italic text-[color:var(--rd-text-dim)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {cluster.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {cluster.zips.map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => {
                        setZip(z);
                        setSubmitted(true);
                        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] tracking-wider transition [font-family:var(--font-mono)]"
                      style={{
                        borderColor: `${cluster.fill}55`,
                        background: `${cluster.fill}1A`,
                        color: '#F5F1E8'
                      }}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
