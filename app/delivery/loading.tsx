/**
 * /delivery loading state — title shell + coverage-map block placeholder
 * + row of 3 cluster-card shells. No prose copy. Animations respect
 * prefers-reduced-motion via the global rule in globals.css.
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

        {/* Coverage map placeholder */}
        <div
          aria-hidden
          className="mt-10 aspect-[16/10] w-full animate-pulse rounded-2xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-paper)]/8"
        />

        {/* Cluster card row skeleton */}
        <div aria-hidden className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-2xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/55 p-5"
            >
              <div className="h-2.5 w-20 animate-pulse rounded-full bg-[color:var(--rd-paper)]/8" />
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-[color:var(--rd-paper)]/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
