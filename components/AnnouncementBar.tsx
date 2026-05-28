/**
 * V8 §1 — luxury 36px marquee strip pinned to the very top of the page,
 * above the main nav.
 *
 * Final polish: Fraunces italic accent words mid-sentence, faceted diamond
 * separators (✦) with lime + amber alternation, deep moss-to-ink gradient
 * with subtle glow well, fine hairline border-bottom in low-opacity lime.
 * Slower 48s cadence for a more sophisticated, less-frantic feel.
 *
 * Pauses on hover. Disabled by prefers-reduced-motion (global rule).
 * Server component — zero client JS.
 */

type Item = { lead: string; accent: string; tail: string };

// Item order interleaves the three boroughs with the value props so the
// bar never has three consecutive "Free delivery in X" pips reading
// like a single repeating phrase. Each pip now reads as its own line.
const ITEMS: Item[] = [
  { lead: 'Free weed', accent: 'gift', tail: 'with every order' },
  { lead: 'Free delivery across', accent: 'Manhattan', tail: '' },
  { lead: 'Guaranteed best', accent: 'flowers', tail: 'on the market' },
  // Borough pips are qualified with the served neighborhoods so the bar never
  // implies full-borough coverage (we only cover Williamsburg + Greenpoint in
  // Brooklyn and Long Island City in Queens).
  { lead: 'Free delivery in', accent: 'Brooklyn', tail: '— Williamsburg + Greenpoint' },
  { lead: 'Tax-free under', accent: 'Shinnecock', tail: 'authority' },
  { lead: 'Free delivery in', accent: 'Queens', tail: '— Long Island City' }
];

/** Faceted diamond — alternates lime / amber to feel hand-set */
function Diamond({ tone }: { tone: 'lime' | 'amber' }) {
  const color = tone === 'lime' ? 'var(--rd-glow)' : 'var(--rd-amber)';
  return (
    <span
      // Tighter margin on phones so the diamond doesn't eat into pip
      // breathing room — `mx-4` mobile, `mx-6` tablet+ for the original
      // generous luxury cadence.
      className="mx-4 inline-flex shrink-0 items-center justify-center sm:mx-6"
      aria-hidden
    >
      <span
        className="text-[10px] leading-none opacity-70"
        style={{ color, textShadow: `0 0 8px ${tone === 'lime' ? 'rgba(200,230,110,0.45)' : 'rgba(212,165,116,0.45)'}` }}
      >
        ✦
      </span>
    </span>
  );
}

function Pip({ children }: { children: Item }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] text-[color:var(--rd-text)] sm:text-[13px]">
      <span
        className="font-medium tracking-[-0.005em]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {children.lead}
      </span>{' '}
      <span
        className="italic"
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          letterSpacing: '-0.012em',
          color: 'var(--rd-glow)',
          textShadow: '0 0 14px rgba(200,230,110,0.28)'
        }}
      >
        {children.accent}
      </span>{' '}
      <span
        // Full --rd-text (not --rd-text-dim): the dim token dropped to ~4.3:1
        // over the brightest moss gradient band — an AA miss at this size.
        className="font-medium tracking-[-0.005em] text-[color:var(--rd-text)]"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {children.tail}
      </span>
    </span>
  );
}

export default function AnnouncementBar() {
  // Render exactly TWO identical copies. The CSS keyframe translates by
  // -50% over one cycle, so the second copy lands precisely where the
  // first started — the loop seam is invisible. (Previously we used
  // three copies + -33.333% which left a sub-pixel rounding gap on some
  // screens.)
  const repeated = [...ITEMS, ...ITEMS];

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-9 overflow-hidden"
      role="region"
      aria-label="Site announcements"
      style={{
        background:
          'linear-gradient(90deg, #13241D 0%, #1A2D24 18%, #2E5240 50%, #1A2D24 82%, #13241D 100%)',
        borderBottom: '1px solid rgba(200,230,110,0.22)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.45), inset 0 -1px 0 rgba(200,230,110,0.05)'
      }}
    >
      {/* Soft warm well behind text — the strip glows from the middle */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(200,230,110,0.10), transparent 70%)'
        }}
      />
      {/* Top hairline highlight for crispness */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden
        style={{ background: 'linear-gradient(90deg, transparent, rgba(240,232,210,0.08) 18%, rgba(240,232,210,0.14) 50%, rgba(240,232,210,0.08) 82%, transparent)' }}
      />
      <div className="relative flex h-full items-center whitespace-nowrap animate-marquee will-change-transform">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <Diamond tone={i % 2 === 0 ? 'lime' : 'amber'} />
            <Pip>{item}</Pip>
          </span>
        ))}
      </div>
      {/* Edge fades — content melts into the gradient instead of cutting off.
          On mobile the fades were 96px each side = ~190px of a 375px viewport,
          leaving < 50% of the bar readable. Slimmed to 32px on phones, 64px
          on tablets+, 96px on desktop so the readable window scales with
          screen width and a full pip ("Free delivery in Manhattan") is visible
          at once on every viewport. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 lg:w-24"
        aria-hidden
        style={{ background: 'linear-gradient(90deg, #13241D 0%, rgba(19,36,29,0.9) 40%, transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 lg:w-24"
        aria-hidden
        style={{ background: 'linear-gradient(270deg, #13241D 0%, rgba(19,36,29,0.9) 40%, transparent)' }}
      />
    </div>
  );
}
