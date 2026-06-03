'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Lightweight scroll-reveal — IntersectionObserver, no framer-motion (~zero JS
 * per instance). Fades + lifts children in once on first view; respects
 * prefers-reduced-motion (shows immediately, no transition).
 *
 * Extracted from HomePage into its own client module so SERVER components
 * (e.g. components/home/ValueProps) can use it as a small client island while
 * rendering their own static markup on the server (no hydration for the markup).
 */
export default function Reveal({
  children,
  delay = 0,
  className = ''
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;
    // Respect reduced motion — show immediately, no transition needed.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rd-reveal ${shown ? 'rd-reveal--in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
