/**
 * V8 §1 — fixed 36px marquee strip pinned to the very top of the page,
 * above the main nav.
 *
 * Polish pass: Fraunces italic accent words mid-sentence, lime pulse-dot
 * ornament between items, subtle horizontal moss-to-ink gradient, lime
 * hairline border-bottom. Server component — no client JS shipped.
 *
 * Pauses on hover, disabled by prefers-reduced-motion (global rule).
 */

type Item = { lead: string; accent: string; tail: string };

const ITEMS: Item[] = [
  { lead: 'Free weed', accent: 'gift', tail: 'with every order' },
  { lead: 'Guaranteed best', accent: 'flowers', tail: 'on the market' },
  { lead: 'Tax-free under', accent: 'Shinnecock', tail: 'authority' },
  { lead: 'Free delivery in', accent: 'Manhattan', tail: '+ East River' }
];

function Pulse() {
  return (
    <span className="relative mx-5 inline-flex h-1.5 w-1.5 shrink-0 items-center justify-center" aria-hidden>
      <span className="absolute inset-0 rounded-full bg-[color:var(--rd-glow)] opacity-50 motion-safe:animate-ping" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--rd-glow)]" />
    </span>
  );
}

function Pip({ children }: { children: Item }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] text-[color:var(--rd-text)] sm:text-[13px]">
      <span className="font-medium tracking-[-0.005em]">{children.lead}</span>{' '}
      <span
        className="text-[color:var(--rd-glow)] italic"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 500, letterSpacing: '-0.01em' }}
      >
        {children.accent}
      </span>{' '}
      <span className="font-medium tracking-[-0.005em] text-[color:var(--rd-text-dim)]">{children.tail}</span>
    </span>
  );
}

export default function AnnouncementBar() {
  // Render three copies so the marquee never shows empty space mid-loop.
  const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-9 overflow-hidden border-b border-[rgba(200,230,110,0.18)]"
      role="region"
      aria-label="Site announcements"
      style={{
        background:
          'linear-gradient(90deg, #11201A 0%, #2D4A3A 25%, #2D4A3A 75%, #11201A 100%)'
      }}
    >
      {/* Soft glow accent overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(200,230,110,0.06), transparent 70%)'
        }}
      />
      <div className="relative flex h-full items-center whitespace-nowrap animate-marquee will-change-transform">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <Pulse />
            <Pip>{item}</Pip>
          </span>
        ))}
      </div>
      {/* Edge fades — content melts into the gradient instead of cutting off */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16"
        aria-hidden
        style={{ background: 'linear-gradient(90deg, #11201A, transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-16"
        aria-hidden
        style={{ background: 'linear-gradient(270deg, #11201A, transparent)' }}
      />
    </div>
  );
}
