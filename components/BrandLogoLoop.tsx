'use client';

import { useEffect, useRef } from 'react';

/**
 * Decorative looping brand mark for the menu hero.
 *
 * The source is a ~410KB MP4 shown at 112–128px. With a bare `autoPlay`
 * attribute the browser fetches + decodes the whole clip on mount, on the
 * site's #1 conversion page, competing with product-image decode. Here we keep
 * it OFF the mount/critical path:
 *   • preload="none" + NO autoplay attribute → nothing is fetched up front
 *   • we call play() only once it scrolls into view, and pause() when it
 *     leaves (IntersectionObserver) → no decode cost while the user browses
 *     the menu below it
 *   • prefers-reduced-motion → never auto-plays (shows the first frame)
 *
 * aria-hidden: purely decorative; the wordmark is conveyed in real text nearby.
 */
export default function BrandLogoLoop() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // play() can reject if the element isn't ready yet — harmless.
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      src="/assets/brand/raindrops-logo.mp4"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}
