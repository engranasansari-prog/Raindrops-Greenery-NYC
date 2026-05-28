import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Raindrops Greenery — premium NYC cannabis delivery';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Branded OG card. Rendered at the edge by Next.js into a static PNG used as
 * the default social preview for every page on the site (overridable by
 * per-page openGraph.images).
 *
 * Design notes:
 *  - Ink background with a radial moss/glow vignette to add depth
 *  - Fraunces-style mixed-weight headline (loaded from a Google Fonts data URL
 *    fetch is supported by next/og; we approximate via inline weights here)
 *  - Mono-styled eyebrow and compliance footer
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background:
            'radial-gradient(ellipse at top right, rgba(200,230,110,0.18), transparent 55%), radial-gradient(ellipse at bottom left, rgba(91,140,110,0.22), transparent 60%), #0A1410',
          color: '#F5F1E8',
          fontFamily: 'serif'
        }}
      >
        {/* Top row — eyebrow + glow dot */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontSize: 18,
            color: 'rgba(245,241,232,0.65)',
            fontFamily: 'monospace'
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: '#C8E66E',
              boxShadow: '0 0 0 6px rgba(200,230,110,0.18)',
              display: 'flex'
            }}
          />
          NYC · 21+ · Same-day
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <h1
            style={{
              fontSize: 110,
              lineHeight: 1,
              letterSpacing: -3,
              margin: 0,
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#F5F1E8'
            }}
          >
            Premium drops.
          </h1>
          <h1
            style={{
              fontSize: 110,
              lineHeight: 1,
              letterSpacing: -3,
              margin: 0,
              fontWeight: 600,
              color: '#C8E66E'
            }}
          >
            NYC only.
          </h1>
          <p
            style={{
              marginTop: 16,
              maxWidth: 820,
              fontSize: 26,
              lineHeight: 1.4,
              color: 'rgba(245,241,232,0.72)',
              fontFamily: 'sans-serif'
            }}
          >
            Flower, Pre-Rolls, and Edibles delivered across Manhattan, Brooklyn, and Queens.
          </p>
        </div>

        {/* Bottom row — wordmark + compliance */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontSize: 38,
                letterSpacing: -1.5,
                fontWeight: 500,
                color: '#F5F1E8'
              }}
            >
              Raindrops Greenery
            </span>
            <span
              style={{
                fontSize: 16,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: 'rgba(212,165,116,0.85)',
                fontFamily: 'monospace'
              }}
            >
              New York delivery
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 18px',
              borderRadius: 999,
              border: '1px solid rgba(245,241,232,0.18)',
              fontSize: 16,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: 'rgba(245,241,232,0.65)',
              fontFamily: 'monospace'
            }}
          >
            Shinnecock-licensed
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
