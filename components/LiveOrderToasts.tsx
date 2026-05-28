'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, MapPin, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { buildSampleFeed, type LiveOrderEvent } from '@/lib/sample-orders';

/**
 * V9 §1.3 — Live order toast widget.
 *
 * Bottom-left dark pill that fades in every ~12 seconds with a sample
 * delivery event ("Just delivered to UES · 47 min"). Creates an instant
 * sense of momentum on coverage-heavy pages (home + /delivery).
 *
 * Pure client component, no network calls. Sample data is deterministic
 * and rotates through every cluster so visitors see the breadth of
 * coverage. Dismissable per session via close button.
 */

const ROTATE_MS = 12_000;
const FIRST_SHOW_DELAY_MS = 3_500;

export default function LiveOrderToasts() {
  const events = useMemo(() => buildSampleFeed(), []);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    // Respect prefers-reduced-motion + skip if user is on small screens
    // already saturated with the marquee + sticky CTA
    if (typeof window !== 'undefined') {
      const stored = window.sessionStorage.getItem('rd_toasts_dismissed');
      if (stored === 'yes') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDismissed(true);
        return;
      }
    }
    const show = window.setTimeout(() => setVisible(true), FIRST_SHOW_DELAY_MS);
    // The nested "advance" timeout (waits out the exit animation before
    // swapping the event) is tracked so cleanup can clear it too — otherwise
    // an unmount during that 420ms window fires setState on a dead component.
    let swap: number | undefined;
    const rotate = window.setInterval(() => {
      setVisible(false);
      swap = window.setTimeout(() => {
        setIndex((i) => (i + 1) % events.length);
        setVisible(true);
      }, 420); // wait for exit animation
    }, ROTATE_MS);
    return () => {
      window.clearTimeout(show);
      window.clearInterval(rotate);
      if (swap) window.clearTimeout(swap);
    };
  }, [dismissed, events.length]);

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('rd_toasts_dismissed', 'yes');
    }
  };

  if (dismissed) return null;

  const event: LiveOrderEvent | undefined = events[index];
  if (!event) return null;

  const isOnTheWay = event.headline.startsWith('On the way');

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-40 hidden max-w-[280px] sm:bottom-6 sm:left-6 sm:block"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`${event.neighborhood}-${index}`}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-[color:var(--rd-glow)]/25 bg-[color:var(--rd-ink-soft)] px-4 py-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur"
          >
            <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--rd-glow)]/15">
              {isOnTheWay ? (
                <MapPin className="h-4 w-4 text-[color:var(--rd-glow)]" />
              ) : (
                <Check className="h-4 w-4 text-[color:var(--rd-glow)]" />
              )}
              {/* breathing pulse */}
              <span
                className="motion-safe:animate-ping absolute inset-0 rounded-full bg-[color:var(--rd-glow)]/40"
                aria-hidden
              />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--rd-glow)] [font-family:var(--font-mono)]"
              >
                {isOnTheWay ? 'On the way' : 'Just delivered'}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-[color:var(--rd-text)]">
                {event.neighborhood}
              </p>
              <p className="mt-0.5 text-[11px] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
                {isOnTheWay ? `~${event.deliveredInMin} min ETA` : `${event.deliveredInMin} min · free`}
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss notifications"
              className="-mr-1 -mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[color:var(--rd-text-mute)] transition hover:bg-[color:var(--rd-paper)]/8 hover:text-[color:var(--rd-text-dim)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
