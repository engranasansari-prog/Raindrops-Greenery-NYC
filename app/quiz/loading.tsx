/**
 * /quiz loading state — title shell + centered question-card shell with
 * 4 option-row shells. No prose copy. Animations respect
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

        {/* Question card shell */}
        <div
          aria-hidden
          className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/55 p-6 sm:p-8"
        >
          <div className="h-3 w-24 animate-pulse rounded-full bg-[color:var(--rd-paper)]/8" />
          <div className="mt-4 h-8 w-3/4 animate-pulse rounded-md bg-[color:var(--rd-paper)]/10" />

          {/* Option row shells */}
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-2xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-paper)]/8"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
