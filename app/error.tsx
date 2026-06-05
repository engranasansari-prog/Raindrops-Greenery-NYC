'use client';

// Route-level error boundary. Next renders this (inside the root layout, so
// SiteChrome + design tokens are available) whenever a Server/Client Component
// in the segment throws during render. Must be a Client Component and accept
// the { error, reset } contract.

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RotateCcw, TriangleAlert } from 'lucide-react';
import SiteChrome from '@/components/SiteChrome';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to the console (and any attached monitoring) so it
    // isn't silently swallowed by the boundary.
    console.error(error);
  }, [error]);

  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(200,230,110,0.10), transparent 55%), radial-gradient(ellipse at bottom right, rgba(46,82,64,0.45), transparent 60%)'
          }}
        />
        <div className="luxury-shell relative grid min-h-[60vh] place-items-center py-14 sm:py-20 lg:py-24">
          <div className="max-w-2xl text-center">
            <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
              <TriangleAlert className="h-3.5 w-3.5" />
              Something went wrong
            </p>
            <h1 className="mt-4 text-[color:var(--rd-text)]">
              That didn’t go <span className="italic">as planned.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
              A hiccup on our end interrupted this page. Give it another try — or
              head home and pick up where you left off. Your free weed gift is
              still waiting.
            </p>
            {error?.digest && (
              <p className="mt-3 text-xs tracking-wider text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
                Ref: {error.digest}
              </p>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => reset()} className="btn-luxe btn-luxe-gold">
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
              <Link href="/" className="btn-luxe btn-luxe-ghost">
                <Home className="h-4 w-4" />
                Back home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
