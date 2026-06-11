'use client';

import { useEffect, useRef } from 'react';

/**
 * Journal reading progress bar — a 3px line pinned under the fixed chrome
 * that fills as the reader moves through the article body.
 * - Progress is written as a scaleX transform DIRECTLY to the fill node on
 *   scroll/resize (no React state), so scrolling never triggers re-renders.
 * - Decorative only: aria-hidden + pointer-events-none.
 */
export default function ReadingProgress({ targetId }: { targetId?: string }) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const fill = fillRef.current;
      if (!fill) return;

      // Re-resolve each pass (O(1) lookup) so we survive late-mounting bodies.
      const target = targetId ? document.getElementById(targetId) : null;
      let progress = 0;

      if (target) {
        // How much of the article has passed the bottom of the viewport:
        // hits 1 exactly when the reader reaches the end of the body.
        const rect = target.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const read = window.scrollY + window.innerHeight - top;
        progress = rect.height > 0 ? read / rect.height : 0;
      } else {
        // No target found — fall back to whole-document progress.
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress = max > 0 ? window.scrollY / max : 0;
      }

      fill.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };

    update(); // paint the initial position on mount
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [targetId]);

  return (
    // Track is transparent; only the gradient fill reads against the page.
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 z-40 h-[3px]"
      style={{ top: 'var(--rd-chrome-h)' }}
    >
      <div
        ref={fillRef}
        className="h-full w-full origin-left"
        style={{ transform: 'scaleX(0)', background: 'linear-gradient(90deg, var(--rd-glow), var(--rd-amber))' }}
      />
    </div>
  );
}
