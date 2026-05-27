'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Check, ImageIcon, Layers, MapPin, Moon, Sparkles, Sun, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { COVERAGE, type CoverageCluster } from '@/lib/coverage';
import { checkZip } from '@/lib/zip-utils';
import ZipSearch from '@/components/ZipSearch';

/* =====================================================================
   Raindrops over Manhattan — V9
   Stylized SVG of Manhattan + East River with full interaction surface:
     - 7 cluster polygons (breathing, pulse, two-way sync)
     - 4 bridges with live "delivery flow" pings
     - Cinematic raindrop reveal when the section enters the viewport
     - Driver heartbeat dots traveling between Manhattan + East River
     - Time-of-day theme (auto-darkens after 8 PM with cluster lights)
     - Cluster detail panel on click
     - "Illustrated | Live" toggle — lazy-loads MapLibre for a real map
   ===================================================================== */

const VB_W = 1200;
const VB_H = 900;
const easeOut = [0.22, 1, 0.36, 1] as const;

// Lazy-load the MapLibre map only when the user toggles to it.
const CoverageLiveMap = dynamic(() => import('@/components/CoverageLiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] w-full items-center justify-center rounded-2xl border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink-soft)] sm:h-[540px] lg:h-[600px]">
      <div className="text-center">
        <span className="relative inline-flex h-3 w-3">
          <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-[color:var(--rd-glow)] opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[color:var(--rd-glow)]" />
        </span>
        <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
          Loading live map…
        </p>
      </div>
    </div>
  )
});

type ClusterVisual = {
  id: CoverageCluster['id'];
  name: string;
  shortName: string;
  etaMinutes: number;
  zips: readonly string[];
  /** Polygon path in the 1200×900 viewBox. */
  path: string;
  /** Centroid for label + the "splash" target during the reveal. */
  label: { x: number; y: number };
  /** Cluster tint (close green family). */
  fill: string;
  fillHover: string;
};

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

const BRIDGES: Array<{ id: string; d: string; label: string; labelPos: { x: number; y: number } }> = [
  { id: 'queensboro', d: 'M 600 360 Q 660 360 700 355', label: 'Queensboro', labelPos: { x: 650, y: 348 } },
  { id: 'pulaski', d: 'M 595 460 Q 660 470 710 478', label: 'Pulaski', labelPos: { x: 650, y: 452 } },
  { id: 'williamsburg', d: 'M 595 535 Q 660 540 720 550', label: 'Williamsburg', labelPos: { x: 658, y: 525 } },
  { id: 'manhattan', d: 'M 600 655 Q 670 645 750 638', label: 'Manhattan', labelPos: { x: 668, y: 630 } }
];

// Driver "heartbeat" dots — small lime tracers cycling between Manhattan
// and East River along bridge paths. Subtle, suggests live deliveries.
const DRIVER_PATHS = [
  { d: 'M 600 360 Q 660 360 700 355', dur: 6.4, delay: 0 },
  { d: 'M 595 535 Q 660 540 720 550', dur: 8.2, delay: 2.5 },
  { d: 'M 600 655 Q 670 645 750 638', dur: 7.6, delay: 5.0 }
];

type Drop = { id: number; x: number; startY: number; endY: number; duration: number; delay: number };

function buildDrops(count: number): Drop[] {
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

type MapMode = 'illustrated' | 'live';

type Props = {
  /** Compact = the smaller variant used on /delivery hero */
  compact?: boolean;
  /** Override the controlled cluster from a parent (used for 2-way sync on /delivery) */
  externalActiveCluster?: string | null;
  /** Notify parent when the user selects a cluster on the map */
  onClusterChange?: (clusterId: string | null) => void;
};

export default function CoverageMap({ compact = false, externalActiveCluster, onClusterChange }: Props) {
  const [zip, setZip] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [internalActiveCluster, setInternalActiveCluster] = useState<string | null>(null);
  const [openCluster, setOpenCluster] = useState<string | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [mapMode, setMapMode] = useState<MapMode>('illustrated');
  const [nightMode, setNightMode] = useState(false);
  const [pulseMatch, setPulseMatch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.3 });
  const maskId = useId();

  const activeCluster = externalActiveCluster !== undefined ? externalActiveCluster : internalActiveCluster;

  const setActive = (id: string | null) => {
    if (externalActiveCluster === undefined) {
      setInternalActiveCluster(id);
    }
    onClusterChange?.(id);
  };

  // Build raindrops on the client only so SSR markup matches initial render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrops(buildDrops(14));
  }, []);

  // Time-of-day default — auto night-mode after 8 PM, day-mode otherwise.
  useEffect(() => {
    const hour = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNightMode(hour >= 20 || hour < 6);
  }, []);

  const result = useMemo(() => (submitted ? checkZip(zip) : checkZip('')), [submitted, zip]);

  const onSubmit = () => setSubmitted(true);
  const onChange = (value: string) => {
    setZip(value);
    setSubmitted(false);
  };

  const matchedClusterId = result.status === 'supported' ? result.cluster?.id ?? null : null;
  const highlight = activeCluster ?? matchedClusterId;

  // When the user matches a covered ZIP, trigger a one-shot pulse on the
  // matched polygon.
  useEffect(() => {
    if (!matchedClusterId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPulseMatch(true);
    const id = window.setTimeout(() => setPulseMatch(false), 2400);
    return () => window.clearTimeout(id);
  }, [matchedClusterId]);

  const handleClusterClick = (cluster: ClusterVisual) => {
    setActive(cluster.id);
    setOpenCluster(cluster.id);
  };

  const pickZipFromCluster = (cluster: ClusterVisual) => {
    setZip(cluster.zips[0]);
    setSubmitted(true);
  };

  return (
    <section
      ref={containerRef}
      className={`rd-grain relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)] ${
        compact ? 'py-12 sm:py-16' : 'py-20 sm:py-24 lg:py-28'
      } ${nightMode ? 'rd-map-night' : 'rd-map-day'}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: nightMode
            ? 'radial-gradient(ellipse at center, rgba(200,230,110,0.10), transparent 60%)'
            : 'radial-gradient(ellipse at center, rgba(200,230,110,0.06), transparent 60%)'
        }}
      />

      <div className="luxury-shell relative">
        {/* Heading */}
        {!compact && (
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
        )}

        <div
          className={`grid gap-10 ${compact ? 'mt-0' : 'mt-10'} ${
            compact
              ? 'lg:grid-cols-1'
              : 'lg:grid-cols-[1.05fr_0.95fr] lg:items-start'
          }`}
        >
          {/* ZIP form + result + cluster cards */}
          <div className={compact ? 'order-2 mx-auto w-full max-w-2xl' : 'order-2 lg:order-1'}>
            <ZipSearch
              value={zip}
              onChange={onChange}
              onSubmit={onSubmit}
              onPickSuggestion={(s) => {
                setZip(s.zip);
                setSubmitted(true);
                setActive(s.cluster.id);
              }}
              onGeolocated={(z) => {
                setZip(z);
                setSubmitted(true);
                const r = checkZip(z);
                if (r.status === 'supported' && r.cluster) setActive(r.cluster.id);
              }}
              label="Your ZIP code"
              submitLabel="Check availability"
              size={compact ? 'md' : 'lg'}
            />

            <div className="mt-5 min-h-[80px]">
              <AnimatePresence mode="wait">
                {result.status === 'supported' && result.cluster && (
                  <motion.div
                    key="supported"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
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
                    key="unsupported"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, ease: easeOut }}
                    className="rounded-2xl border border-[color:var(--rd-amber)]/30 bg-[color:var(--rd-amber)]/8 p-4"
                  >
                    <p className="inline-flex items-center gap-2 rd-eyebrow text-[color:var(--rd-amber)]">
                      <MapPin className="h-3.5 w-3.5" />
                      Not yet
                    </p>
                    <p className="mt-2 text-base font-medium text-[color:var(--rd-text)]">
                      We don’t cover {zip} yet — we’re expanding fast.
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--rd-text-dim)]">
                      Drop your email in the footer and we’ll notify you the day we hit your area.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cluster cards summary */}
            {!compact && (
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {CLUSTERS.map((cluster) => {
                  const isActive = highlight === cluster.id;
                  return (
                    <button
                      key={cluster.id}
                      type="button"
                      onMouseEnter={() => setActive(cluster.id)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(cluster.id)}
                      onBlur={() => setActive(null)}
                      onClick={() => {
                        pickZipFromCluster(cluster);
                        setOpenCluster(cluster.id);
                      }}
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
            )}
          </div>

          {/* The map column */}
          <div className={compact ? 'order-1' : 'order-1 lg:order-2'}>
            {/* Map mode toggle + theme toggle */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="inline-flex items-center gap-1 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 p-1 [font-family:var(--font-mono)]">
                <button
                  type="button"
                  onClick={() => setMapMode('illustrated')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                    mapMode === 'illustrated'
                      ? 'bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)] shadow-[0_4px_14px_-4px_rgba(200,230,110,0.4)]'
                      : 'text-[color:var(--rd-text-dim)] hover:text-[color:var(--rd-text)]'
                  }`}
                  aria-pressed={mapMode === 'illustrated'}
                >
                  <ImageIcon className="h-3 w-3" /> Illustrated
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode('live')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                    mapMode === 'live'
                      ? 'bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)] shadow-[0_4px_14px_-4px_rgba(200,230,110,0.4)]'
                      : 'text-[color:var(--rd-text-dim)] hover:text-[color:var(--rd-text)]'
                  }`}
                  aria-pressed={mapMode === 'live'}
                >
                  <Layers className="h-3 w-3" /> Live
                </button>
              </div>
              <button
                type="button"
                onClick={() => setNightMode((n) => !n)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-text)] [font-family:var(--font-mono)]"
                aria-label={nightMode ? 'Switch to day theme' : 'Switch to night theme'}
              >
                {nightMode ? <Moon className="h-3 w-3 text-[color:var(--rd-glow)]" /> : <Sun className="h-3 w-3 text-[color:var(--rd-amber)]" />}
                {nightMode ? 'Night' : 'Day'}
              </button>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/70 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:p-4 lg:p-5">
              {mapMode === 'live' ? (
                <CoverageLiveMap
                  activeCluster={highlight}
                  onSelect={(id) => {
                    setActive(id);
                    if (id) setOpenCluster(id);
                  }}
                />
              ) : (
                <svg
                  viewBox={`0 0 ${VB_W} ${VB_H}`}
                  role="img"
                  aria-label="Map of Raindrops Greenery NYC delivery coverage — Manhattan, LIC, Williamsburg, Greenpoint"
                  className="block h-auto w-full"
                  style={{ touchAction: 'pan-y' }}
                >
                  <defs>
                    <radialGradient id="map-glow-bg" cx="50%" cy="55%" r="70%">
                      <stop offset="0%" stopColor={nightMode ? '#7BB593' : '#5B8C6E'} stopOpacity={nightMode ? '0.25' : '0.18'} />
                      <stop offset="100%" stopColor="#0A1410" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="hudson-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={nightMode ? '#050D11' : '#0B1A1F'} />
                      <stop offset="100%" stopColor={nightMode ? '#020608' : '#080F13'} />
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
                    <filter id="cluster-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Background ink glow */}
                  <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#map-glow-bg)" />

                  {/* Water */}
                  <rect x="0" y="0" width="380" height={VB_H} fill="url(#hudson-fill)" />
                  <rect x="600" y="280" width="100" height="520" fill="url(#hudson-fill)" />
                  <rect x="600" y="800" width="600" height="100" fill="url(#hudson-fill)" />

                  {/* Out-of-coverage land base */}
                  <path d="M 700 250 L 1180 280 L 1200 900 L 600 900 L 600 800 L 660 700 L 660 280 Z" fill="#0F1E18" />

                  {/* Manhattan island base */}
                  <path
                    d="M 405 60 L 600 65 L 605 280 L 600 800 L 480 830 L 425 800 L 410 700 L 380 540 L 385 360 L 400 200 Z"
                    fill={nightMode ? '#1E332A' : '#2D4A3A'}
                  />
                  <path
                    d="M 405 60 L 600 65 L 605 280 L 600 800 L 480 830 L 425 800 L 410 700 L 380 540 L 385 360 L 400 200 Z"
                    fill="url(#hatch)"
                  />

                  {/* Brooklyn / Queens land cluster surface */}
                  <path d="M 690 290 L 1100 320 L 1150 760 L 700 800 L 670 600 L 680 420 Z" fill={nightMode ? '#13241D' : '#1E332A'} />

                  {/* Central Park */}
                  <rect x="455" y="115" width="80" height="160" rx="6" fill={nightMode ? '#2E5040' : '#3F6A52'} stroke="rgba(200,230,110,0.18)" strokeWidth="1" />
                  <text x="495" y="200" textAnchor="middle" fontSize="9" letterSpacing="0.22em" fill="rgba(245,241,232,0.45)" fontFamily="ui-monospace, monospace">
                    CENTRAL
                  </text>
                  <text x="495" y="215" textAnchor="middle" fontSize="9" letterSpacing="0.22em" fill="rgba(245,241,232,0.45)" fontFamily="ui-monospace, monospace">
                    PARK
                  </text>

                  {/* Cluster polygons */}
                  <g className="rd-clusters">
                    {CLUSTERS.map((cluster, index) => {
                      const isActive = highlight === cluster.id;
                      const isMatch = matchedClusterId === cluster.id;
                      const initialDelay = inView ? 0.4 + index * 0.18 : 0;
                      return (
                        <motion.g
                          key={cluster.id}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
                          transition={{ duration: 0.7, delay: initialDelay, ease: easeOut }}
                          style={{ transformOrigin: `${cluster.label.x}px ${cluster.label.y}px` }}
                          onMouseEnter={() => setActive(cluster.id)}
                          onMouseLeave={() => setActive(null)}
                          onClick={() => handleClusterClick(cluster)}
                        >
                          <path
                            d={cluster.path}
                            fill={isActive ? cluster.fillHover : cluster.fill}
                            stroke={isActive ? '#C8E66E' : 'rgba(200,230,110,0.35)'}
                            strokeWidth={isActive ? 2 : 1}
                            className="rd-cluster"
                            style={{
                              cursor: 'pointer',
                              animationDelay: `${index * 0.6}s`,
                              transition: 'fill 0.35s cubic-bezier(0.22,1,0.36,1), stroke 0.35s'
                            }}
                          />
                          {/* Pulse ring on matched ZIP */}
                          {isMatch && pulseMatch && (
                            <path
                              d={cluster.path}
                              fill="none"
                              stroke="#C8E66E"
                              strokeWidth="3"
                              filter="url(#cluster-glow)"
                              style={{
                                animation: 'rd-cluster-pulse 1.2s ease-out 2',
                                pointerEvents: 'none'
                              }}
                            />
                          )}
                          {/* Night-mode "city light" — small lime dot at cluster center */}
                          {nightMode && (
                            <circle
                              cx={cluster.label.x}
                              cy={cluster.label.y - 18}
                              r={isActive ? 4 : 2.6}
                              fill="#C8E66E"
                              filter="url(#cluster-glow)"
                              style={{
                                animation: `rd-cluster-breathe 3.6s ${index * 0.4}s ease-in-out infinite`,
                                pointerEvents: 'none'
                              }}
                            />
                          )}
                        </motion.g>
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

                  {/* Driver heartbeat — lime tracers on bridge paths */}
                  <g>
                    {DRIVER_PATHS.map((dp, idx) => (
                      <g key={idx}>
                        <circle r="3.2" fill="#C8E66E" filter="url(#cluster-glow)">
                          <animateMotion dur={`${dp.dur}s`} repeatCount="indefinite" begin={`${dp.delay}s`} path={dp.d} />
                          <animate attributeName="opacity" dur={`${dp.dur}s`} repeatCount="indefinite" begin={`${dp.delay}s`} values="0;1;1;0" keyTimes="0;0.15;0.85;1" />
                        </circle>
                      </g>
                    ))}
                  </g>

                  {/* Raindrops over covered zones */}
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
                          ['--rd-rain-end' as never]: `${drop.endY - drop.startY}px`
                        }}
                      />
                    ))}
                  </g>

                  {/* Landmarks */}
                  <g>
                    <circle cx="380" cy="850" r="3" fill="#C8E66E" />
                    <text x="365" y="870" textAnchor="end" fontSize="8" letterSpacing="0.2em" fill="rgba(245,241,232,0.45)" fontFamily="ui-monospace, monospace">
                      LIBERTY
                    </text>
                  </g>

                  {/* Wordmarks */}
                  <text x="495" y="500" textAnchor="middle" fontFamily="var(--font-display, serif)" fontSize="34" fontStyle="italic" fontWeight="500" letterSpacing="0.18em" fill="rgba(245,241,232,0.06)" transform="rotate(-90 495 500)">
                    MANHATTAN
                  </text>
                  <text x="900" y="700" textAnchor="middle" fontFamily="var(--font-display, serif)" fontSize="24" fontStyle="italic" fontWeight="500" letterSpacing="0.18em" fill="rgba(245,241,232,0.08)">
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
              )}

              {/* Legend */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
                <span className="inline-flex items-center gap-2">
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-[color:var(--rd-glow)] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--rd-glow)]" />
                  </span>
                  Active coverage · 7 zones
                </span>
                <span>{mapMode === 'live' ? '⌘+scroll to zoom · drag to pan' : 'Tap a zone for details'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cluster detail panel (modal-ish) */}
        <AnimatePresence>
          {openCluster && (() => {
            const c = CLUSTERS.find((x) => x.id === openCluster);
            if (!c) return null;
            return (
              <motion.div
                key={`panel-${c.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: easeOut }}
                className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(6,19,15,0.78)] p-0 backdrop-blur-md sm:items-center sm:p-6"
                onClick={() => setOpenCluster(null)}
                role="dialog"
                aria-modal="true"
                aria-label={`${c.name} delivery details`}
              >
                <motion.div
                  initial={{ y: 40, opacity: 0, scale: 0.97 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 40, opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: easeOut }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-lg overflow-hidden rounded-t-3xl border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)] p-6 text-[color:var(--rd-text)] shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:rounded-3xl sm:p-8"
                >
                  <button
                    type="button"
                    onClick={() => setOpenCluster(null)}
                    aria-label="Close details"
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-text)]"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <p className="rd-eyebrow text-[color:var(--rd-glow)]">{c.shortName}</p>
                  <h3
                    className="mt-3 text-[color:var(--rd-text)]"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.5rem, 2.4vw, 2rem)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
                  >
                    {c.name}
                  </h3>

                  <div className="mt-5 grid grid-cols-3 gap-3 [font-family:var(--font-mono)]">
                    <div className="rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink)]/55 p-3 text-center">
                      <p className="text-2xl font-semibold text-[color:var(--rd-glow)]">~{c.etaMinutes}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rd-text-mute)]">min ETA</p>
                    </div>
                    <div className="rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink)]/55 p-3 text-center">
                      <p className="text-2xl font-semibold text-[color:var(--rd-text)]">{c.zips.length}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rd-text-mute)]">ZIPs</p>
                    </div>
                    <div className="rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink)]/55 p-3 text-center">
                      <p className="text-2xl font-semibold text-[color:var(--rd-amber)]">$0</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rd-text-mute)]">delivery</p>
                    </div>
                  </div>

                  <p className="mt-5 rd-eyebrow text-[color:var(--rd-text-mute)]">Covered ZIPs</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.zips.map((z) => (
                      <span key={z} className="inline-flex rounded-md border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 px-2.5 py-1 text-[11px] tracking-wider text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)]">
                        {z}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link href="/menu" className="btn-luxe btn-luxe-gold">
                      Order in {c.shortName}
                      <ArrowRight />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        pickZipFromCluster(c);
                        setOpenCluster(null);
                      }}
                      className="btn-luxe btn-luxe-ghost"
                    >
                      <Sparkles className="h-4 w-4" />
                      Use this ZIP
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </section>
  );
}
