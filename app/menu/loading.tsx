/**
 * /menu loading state — 6-card skeleton grid + filter shell.
 * No prose copy (V4 §10.5). Animations respect prefers-reduced-motion via
 * the global rule in globals.css.
 */
export default function Loading() {
  return (
    <div className="bg-[color:var(--rd-ink)] pb-20 text-[color:var(--rd-text)] pt-32 sm:pt-36">
      <div className="luxury-shell">
        {/* Title shell */}
        <div className="space-y-3">
          <div className="h-3 w-32 animate-pulse rounded-full bg-[color:var(--rd-paper)]/8" />
          <div className="h-12 w-72 animate-pulse rounded-md bg-[color:var(--rd-paper)]/10" />
        </div>

        {/* Filter shell */}
        <div className="mt-10 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="h-9 w-24 animate-pulse rounded-full bg-[color:var(--rd-paper)]/8" />
          ))}
        </div>

        {/* Card grid skeleton */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/55"
            >
              <div className="aspect-square animate-pulse bg-[color:var(--rd-paper)]/8" />
              <div className="space-y-3 p-5">
                <div className="h-2.5 w-20 animate-pulse rounded-full bg-[color:var(--rd-paper)]/8" />
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-[color:var(--rd-paper)]/10" />
                <div className="flex items-end justify-between pt-3">
                  <div className="h-5 w-20 animate-pulse rounded-md bg-[color:var(--rd-paper)]/8" />
                  <div className="h-5 w-12 animate-pulse rounded-md bg-[color:var(--rd-paper)]/8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
