'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Check, MapPin, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { COVERAGE } from '@/lib/coverage';
import { checkZip } from '@/lib/zip-utils';
import ZipSearch from '@/components/ZipSearch';

/* =====================================================================
   Raindrops coverage — V9 simplification (per client review).

   ONE clean live map. Removed:
     • Illustrated SVG / Live toggle (caused confusion)
     • Day / Night toggle
     • Bridges, raindrops, driver heartbeat, cluster polygons in SVG

   Kept:
     • ZIP search + autocomplete + geolocation (ZipSearch)
     • Cluster summary cards (left column, 2-way synced)
     • Cluster detail modal on click / card-tap
     • MapLibre live map showing full Manhattan + LIC + Williamsburg
       + Greenpoint via fitBounds — no more cropped Manhattan-only view.
   ===================================================================== */

const easeOut = [0.22, 1, 0.36, 1] as const;

// Lazy-load MapLibre so its ~250KB bundle only ships when the coverage
// section is actually viewed.
const CoverageLiveMap = dynamic(() => import('@/components/CoverageLiveMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] w-full items-center justify-center rounded-2xl border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink-soft)] sm:h-[560px] lg:h-[620px]">
      <div className="text-center">
        <span className="relative inline-flex h-3 w-3">
          <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-[color:var(--rd-glow)] opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[color:var(--rd-glow)]" />
        </span>
        <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
          Loading coverage map…
        </p>
      </div>
    </div>
  )
});

type Props = {
  /** Compact = the variant used on /delivery (no heading, single column) */
  compact?: boolean;
  /** Parent-controlled active cluster (used for 2-way sync on /delivery) */
  externalActiveCluster?: string | null;
  /** Notify parent when the user selects a cluster on the map */
  onClusterChange?: (clusterId: string | null) => void;
};

export default function CoverageMap({ compact = false, externalActiveCluster, onClusterChange }: Props) {
  const [zip, setZip] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [internalActiveCluster, setInternalActiveCluster] = useState<string | null>(null);
  const [openCluster, setOpenCluster] = useState<string | null>(null);

  const activeCluster = externalActiveCluster !== undefined ? externalActiveCluster : internalActiveCluster;

  const setActive = (id: string | null) => {
    if (externalActiveCluster === undefined) {
      setInternalActiveCluster(id);
    }
    onClusterChange?.(id);
  };

  const result = useMemo(() => (submitted ? checkZip(zip) : checkZip('')), [submitted, zip]);

  const onSubmit = () => setSubmitted(true);
  const onChange = (value: string) => {
    setZip(value);
    setSubmitted(false);
  };

  const matchedClusterId = result.status === 'supported' ? result.cluster?.id ?? null : null;
  const highlight = activeCluster ?? matchedClusterId;

  const pickZipFromCluster = (clusterId: string) => {
    const cluster = COVERAGE.clusters.find((c) => c.id === clusterId);
    if (!cluster) return;
    setZip(cluster.zips[0]);
    setSubmitted(true);
  };

  return (
    <section className={`relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)] ${compact ? 'py-12 sm:py-16' : 'py-20 sm:py-24 lg:py-28'}`}>
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(200,230,110,0.06), transparent 60%)'
        }}
      />

      <div className="luxury-shell relative">
        {/* Heading (hidden in compact /delivery use) */}
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
              Where we deliver
            </p>
            <h2 className="mt-4 text-[color:var(--rd-text)]">
              Manhattan + <span className="italic">East River.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
              32 ZIPs across 7 neighborhoods. Tax-free, free same-day delivery on orders over $25.
              Drop your ZIP — or tap any zone on the map.
            </p>
          </motion.div>
        )}

        <div className={`grid gap-10 ${compact ? 'mt-0' : 'mt-10'} ${
          compact ? 'lg:grid-cols-1' : 'lg:grid-cols-[1.05fr_0.95fr] lg:items-start'
        }`}>
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
                      Average drop-off: ~{result.cluster.etaMinutes} min. Free on orders over $25 · tax-free.
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

            {/* Cluster summary cards — only on the home variant */}
            {!compact && (
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {COVERAGE.clusters.map((cluster) => {
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
                        pickZipFromCluster(cluster.id);
                        setOpenCluster(cluster.id);
                      }}
                      className={`group rounded-xl border p-3.5 text-left transition-[border-color,background,transform] duration-300 [transition-timing-function:var(--ease-out)] ${
                        isActive
                          ? 'border-[color:var(--rd-glow)]/55 bg-[color:var(--rd-ink-soft)]/85'
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

          {/* The map */}
          <div className={compact ? 'order-1' : 'order-1 lg:order-2'}>
            <div className="relative overflow-hidden rounded-3xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/70 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur sm:p-4 lg:p-5">
              <CoverageLiveMap
                activeCluster={highlight}
                onSelect={(id) => {
                  setActive(id);
                  if (id) setOpenCluster(id);
                }}
              />

              {/* Legend / hint */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
                <span className="inline-flex items-center gap-2">
                  <span className="relative inline-flex h-2 w-2">
                    <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-[color:var(--rd-glow)] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--rd-glow)]" />
                  </span>
                  Active coverage · 7 zones
                </span>
                <span>Tap a zone for details · ⌘+scroll to zoom</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cluster detail modal */}
        <AnimatePresence>
          {openCluster && (() => {
            const c = COVERAGE.clusters.find((x) => x.id === openCluster);
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
                      <p className="text-2xl font-semibold text-[color:var(--rd-amber)]">$25+</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rd-text-mute)]">free delivery</p>
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
                        pickZipFromCluster(c.id);
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
