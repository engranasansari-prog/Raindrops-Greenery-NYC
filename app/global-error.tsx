'use client';

// Global error boundary — the last line of defense. Unlike app/error.tsx, this
// catches errors thrown in the ROOT layout itself, which means it REPLACES that
// layout entirely. Next therefore requires it to render its own <html> and
// <body>. Because the root layout (and its next/font CSS variables + global
// stylesheet wiring) may have failed, every brand value here is inlined with
// literal hex tokens + system-safe font fallbacks so the page still renders
// on-brand with zero external dependencies.

import { useEffect } from 'react';

// Brand tokens (kept in sync with app/globals.css :root):
//   --rd-ink #1B3328 · --rd-text #F0E8D2 · --rd-glow #C8E66E
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#1B3328',
          color: '#F0E8D2',
          fontFamily:
            "'Fraunces', Georgia, ui-serif, serif",
          textAlign: 'center',
          backgroundImage:
            'radial-gradient(ellipse at top left, rgba(200,230,110,0.10), transparent 55%), radial-gradient(ellipse at bottom right, rgba(46,82,64,0.45), transparent 60%)'
        }}
      >
        <div style={{ maxWidth: '36rem' }}>
          <p
            style={{
              margin: 0,
              fontFamily:
                "'JetBrains Mono', ui-monospace, monospace",
              fontSize: '0.75rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#C8E66E'
            }}
          >
            Something went wrong
          </p>
          <h1
            style={{
              margin: '1rem 0 0',
              fontSize: 'clamp(1.9rem, 6vw, 3rem)',
              lineHeight: 1.1,
              fontWeight: 400
            }}
          >
            We hit an unexpected snag.
          </h1>
          <p
            style={{
              margin: '1.25rem auto 0',
              maxWidth: '28rem',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(240, 232, 210, 0.74)',
              fontFamily: "'DM Sans', system-ui, sans-serif"
            }}
          >
            Something broke loading Raindrops Greenery. Reload the page to try
            again — we’ll get you back to your free weed gift.
          </p>
          {error?.digest && (
            <p
              style={{
                margin: '0.75rem 0 0',
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                color: 'rgba(240, 232, 210, 0.55)'
              }}
            >
              Ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '48px',
              padding: '0.875rem 1.75rem',
              borderRadius: '999px',
              border: '1px solid #b5cf5a',
              background: '#C8E66E',
              color: '#1B3328',
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  );
}
