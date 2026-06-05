'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { OrderButton } from '@/components/SiteChrome';

/**
 * Mobile-only sticky "Order now" bar that slides up once the hero's own CTAs
 * scroll out of view.
 *
 * PERF: extracted out of SiteChrome and loaded via `next/dynamic` with
 * `{ ssr: false }` so framer-motion is not part of SiteChrome's static shared
 * bundle. Behaviour is unchanged — the bar still appears after 160px of scroll
 * and animates in/out exactly as before.
 *
 * `OrderButton` is imported from SiteChrome (it carries no framer dependency),
 * so the canonical CTA stays the single source of truth.
 */
export default function StickyOrderBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Appear after a short scroll (was 520px ≈ a full screen, so mobile
    // buyers had no persistent CTA through the entire hero). 160px = just past
    // the chrome, once the hero's own CTAs start leaving the viewport.
    const handleScroll = () => setVisible(window.scrollY > 160);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 24, x: '-50%' }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-1/2 z-40 w-[min(720px,calc(100%-16px))] rounded-full border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink)]/90 p-2 shadow-[0_20px_70px_rgba(27,51,40,0.45)] backdrop-blur-2xl md:hidden"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Value cue now visible on ALL sizes (was sm:block → hidden on the
                smallest phones, leaving a bare button). Reinforces the offer
                everywhere the omnipresent bar shows. */}
            <div className="min-w-0 pl-4">
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">Free gift every order</p>
              <p className="mt-0.5 truncate text-sm text-[color:var(--rd-text)]">Free delivery over $25</p>
            </div>
            <OrderButton className="shrink-0" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
