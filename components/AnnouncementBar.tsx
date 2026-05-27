/**
 * V8 §1 — fixed 36px marquee strip pinned to the very top of the page,
 * above the main nav. Four value props scroll right-to-left in a 30s loop.
 * Items repeated 3× so the loop is seamless.
 *
 * Pauses on hover and disables when prefers-reduced-motion is set
 * (handled by the global media query on .animate-marquee).
 *
 * Pure decorative server component — no client JS shipped.
 */

const ITEMS = [
  '🎁 Free weed gift with every order',
  '🌿 Guaranteed best flowers',
  '💰 Tax-free under Shinnecock authority',
  '🚚 Free delivery in Manhattan + East River'
] as const;

export default function AnnouncementBar() {
  // Render three copies so the marquee never shows empty space mid-loop.
  const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-9 overflow-hidden border-b border-[rgba(200,230,110,0.12)] bg-[color:var(--rd-moss)]"
      role="region"
      aria-label="Site announcements"
    >
      <div className="flex h-full items-center whitespace-nowrap animate-marquee will-change-transform">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center text-[12px] font-medium text-[color:var(--rd-text)] sm:text-[13px]"
          >
            <span className="mx-6">{item}</span>
            <span className="text-[color:var(--rd-glow)]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
