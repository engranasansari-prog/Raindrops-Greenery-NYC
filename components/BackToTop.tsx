'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Floating "back to top" button. V4 §10.2.
 * - Hidden until window.scrollY > 600
 * - Fixed bottom-LEFT (the bottom-right corner is the chat concierge launcher),
 *   raised on mobile to clear the sticky order bar, with safe-area awareness
 * - Smooth scroll on click (auto if prefers-reduced-motion)
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handle = () => setVisible(window.scrollY > 600);
    handle();
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const handleClick = () => {
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed left-4 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)] shadow-[0_12px_36px_rgba(200,230,110,0.4)] transition-[opacity,transform] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 bottom-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] md:bottom-[calc(env(safe-area-inset-bottom,0px)+6rem)] ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0 translate-y-2'
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
