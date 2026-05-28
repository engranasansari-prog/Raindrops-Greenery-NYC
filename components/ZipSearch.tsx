'use client';

import { ArrowRight, Check, Loader2, LocateFixed, MapPin, Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COVERAGE } from '@/lib/coverage';
import { suggestZips, type ZipSuggestion } from '@/lib/zip-suggest';
import { checkZip, normalizeZip } from '@/lib/zip-utils';

/**
 * V9 §1.1 + §1.2 — Premium ZIP entry with autocomplete + geolocation.
 *
 * - Live suggestion dropdown matches both ZIP prefix and neighborhood
 *   substring ("midt" → Midtown ZIPs).
 * - "Use my location" requests browser geolocation, reverse-geocodes via
 *   the free zippopotam.us API (no key needed), then auto-fills the ZIP
 *   and submits.
 * - Fully accessible (combobox pattern, ARIA live region for status).
 */

const easeOut = [0.22, 1, 0.36, 1] as const;

export type ZipSearchSize = 'lg' | 'md';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onPickSuggestion?: (suggestion: ZipSuggestion) => void;
  /** Render size variant — `lg` for the home map, `md` for the compact /delivery hero */
  size?: ZipSearchSize;
  /** Label above the input */
  label?: string;
  /** Submit-button copy override */
  submitLabel?: string;
  /** Optional callback fired after successful geolocation */
  onGeolocated?: (zip: string) => void;
};

type GeoStatus = 'idle' | 'requesting' | 'looking-up' | 'error';

async function reverseGeocodeZip(lat: number, lng: number): Promise<string | null> {
  // Use the free zippopotam.us proxy — actually they don't do reverse;
  // use api.bigdatacloud.net's free reverse-geocode (no key, generous limits).
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { postcode?: string };
    return typeof data.postcode === 'string' ? data.postcode.slice(0, 5) : null;
  } catch {
    return null;
  }
}

export default function ZipSearch({
  value,
  onChange,
  onSubmit,
  onPickSuggestion,
  size = 'lg',
  label = 'Your ZIP code',
  submitLabel = 'Check availability',
  onGeolocated
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [geoMessage, setGeoMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const suggestions = suggestZips(value, 6);
  const showDropdown = open && suggestions.length > 0 && value.trim().length > 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const pick = (s: ZipSuggestion) => {
    onChange(s.zip);
    onPickSuggestion?.(s);
    setOpen(false);
    setActiveIdx(-1);
    // Refocus so the visual answer card appears next to the input
    inputRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && activeIdx >= 0) {
      event.preventDefault();
      pick(suggestions[activeIdx]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const useLocation = async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('error');
      setGeoMessage('Location not available on this device.');
      return;
    }
    setGeoStatus('requesting');
    setGeoMessage('Asking your browser…');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoStatus('looking-up');
        setGeoMessage('Pinging the postcode…');
        const zip = await reverseGeocodeZip(pos.coords.latitude, pos.coords.longitude);
        if (zip && /^\d{5}$/.test(zip)) {
          onChange(zip);
          onGeolocated?.(zip);
          onSubmit();
          setGeoStatus('idle');
          setGeoMessage('');
        } else {
          setGeoStatus('error');
          setGeoMessage("Couldn't read a US ZIP from your location.");
        }
      },
      () => {
        setGeoStatus('error');
        setGeoMessage('Permission denied or unavailable.');
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 8_000 }
    );
  };

  const result = checkZip(value);

  const inputPad = size === 'lg' ? 'px-4 py-3' : 'px-3.5 py-2.5';
  const btnClass = 'btn-luxe btn-luxe-gold';

  return (
    <div ref={wrapRef} className="relative w-full max-w-md">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`zip-${listId}`} className="rd-eyebrow text-[color:var(--rd-text-dim)]">
          {label}
        </label>
        <button
          type="button"
          onClick={useLocation}
          disabled={geoStatus === 'requesting' || geoStatus === 'looking-up'}
          className="group inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-text-mute)] transition hover:text-[color:var(--rd-glow)] disabled:opacity-60 [font-family:var(--font-mono)]"
          /* aria-label must START WITH the visible text "Use location" so
             voice-control + screen-reader users get a consistent name
             (WCAG 2.5.3). */
          aria-label="Use location to detect ZIP"
        >
          {geoStatus === 'requesting' || geoStatus === 'looking-up' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <LocateFixed className="h-3 w-3 transition-transform group-hover:scale-110" />
          )}
          <span>Use location</span>
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setOpen(false);
          onSubmit();
        }}
        className="mt-3 flex flex-col gap-3 sm:flex-row"
      >
        <div
          className={`flex flex-1 items-center gap-3 rounded-xl border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]/55 ${inputPad} transition focus-within:border-[color:var(--rd-glow)] focus-within:bg-[color:var(--rd-ink-soft)]/85 focus-within:shadow-[0_0_0_4px_rgba(200,230,110,0.18)]`}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-owns={listId}
        >
          <Search className="h-4 w-4 text-[color:var(--rd-text-mute)]" />
          <input
            ref={inputRef}
            id={`zip-${listId}`}
            value={value}
            onChange={(event) => {
              onChange(normalizeZip(event.target.value));
              setOpen(true);
              setActiveIdx(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder="e.g. 10013"
            aria-label="ZIP code"
            // aria-controls should only point at an element that exists
            // in the DOM — the listbox only renders when showDropdown is
            // true. Setting it unconditionally caused an aria-* validation
            // failure in Lighthouse.
            aria-controls={showDropdown ? listId : undefined}
            aria-activedescendant={activeIdx >= 0 ? `${listId}-opt-${activeIdx}` : undefined}
            className="w-full bg-transparent text-base font-medium tracking-wider text-[color:var(--rd-text)] outline-none placeholder:text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              aria-label="Clear ZIP"
              className="text-[color:var(--rd-text-mute)] transition hover:text-[color:var(--rd-text-dim)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button type="submit" className={btnClass}>
          {submitLabel}
          <ArrowRight />
        </button>
      </form>

      {/* Geolocation status line */}
      {(geoStatus === 'requesting' || geoStatus === 'looking-up' || geoStatus === 'error') && (
        <p
          className={`mt-2 text-[11px] [font-family:var(--font-mono)] ${
            geoStatus === 'error' ? 'text-[color:var(--rd-amber)]' : 'text-[color:var(--rd-text-mute)]'
          }`}
          role="status"
        >
          {geoMessage}
        </p>
      )}

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: easeOut }}
            className="absolute left-0 right-0 z-30 mt-2 max-h-[260px] overflow-auto rounded-2xl border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)] p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur sm:right-auto sm:w-[420px]"
          >
            {suggestions.map((s, idx) => {
              const active = idx === activeIdx;
              return (
                <li key={s.zip} role="option" id={`${listId}-opt-${idx}`} aria-selected={active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => pick(s)}
                    className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      active
                        ? 'bg-[color:var(--rd-glow)]/12'
                        : 'hover:bg-[color:var(--rd-paper)]/6'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--rd-glow)]/15 text-[10px] font-semibold text-[color:var(--rd-glow)] [font-family:var(--font-mono)]">
                        {s.zip.slice(0, 2)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-[color:var(--rd-text)]">
                          {s.zip} · {s.shortName}
                        </span>
                        <span className="block truncate text-[11px] text-[color:var(--rd-text-mute)]">
                          {s.neighborhood}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right [font-family:var(--font-mono)]">
                      <span className="block text-sm font-semibold text-[color:var(--rd-glow)]">
                        ~{s.etaMinutes}
                      </span>
                      <span className="block text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)]">
                        min
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="border-t border-[color:var(--rd-paper)]/8 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
              <span className="inline-flex items-center gap-2">
                <Check className="h-3 w-3 text-[color:var(--rd-glow)]" />
                {COVERAGE.area} · free same-day
              </span>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Inline confirmation chip — appears below the input when the
          user has typed a valid ZIP, before they submit. Gives instant
          "you're covered" feedback. */}
      {result.status === 'supported' && result.cluster && !showDropdown && (
        <p
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-glow)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-glow)] [font-family:var(--font-mono)]"
        >
          <MapPin className="h-3 w-3" />
          {result.cluster.shortName} · ~{result.cluster.etaMinutes} min
        </p>
      )}
    </div>
  );
}
