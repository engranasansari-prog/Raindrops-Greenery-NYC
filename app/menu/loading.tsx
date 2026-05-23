export default function Loading() {
  return (
    <div className="luxury-shell flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="relative inline-flex h-10 w-10">
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--champagne)] opacity-50" />
        <span className="relative inline-flex h-10 w-10 rounded-full border-2 border-[var(--emerald-deep)] border-t-transparent" />
      </span>
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--champagne-dark)]">Loading menu</p>
      <p className="max-w-md text-sm leading-7 text-[var(--muted)]">Pulling the latest Flower, Pre-Rolls, and Edibles from the live Raindrops menu.</p>
    </div>
  );
}
