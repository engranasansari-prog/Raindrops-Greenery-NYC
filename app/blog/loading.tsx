/**
 * /blog loading state — title shell + 3-column post-card grid skeleton
 * (cover image block + 2 text lines each). No prose copy. Animations
 * respect prefers-reduced-motion via the global rule in globals.css.
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

        {/* Post card grid skeleton */}
        <div aria-hidden className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/55"
            >
              <div className="aspect-[5/3] animate-pulse bg-[color:var(--rd-paper)]/8" />
              <div className="space-y-3 p-6">
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-[color:var(--rd-paper)]/10" />
                <div className="h-3 w-1/2 animate-pulse rounded-md bg-[color:var(--rd-paper)]/8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
