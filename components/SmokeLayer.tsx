// Pure-CSS smoke effect — three slow-drifting blurred radial gradients.
// Lightweight (~0 JS) and disabled on small viewports via media query.
// Sits absolutely above the hero photo but below content. `pointer-events-none`
// so it never blocks clicks. `aria-hidden` because it's purely decorative.

export default function SmokeLayer({ className = '' }: { className?: string }) {
  return (
    <div className={`smoke-layer pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <span className="smoke-blob smoke-blob-1" />
      <span className="smoke-blob smoke-blob-2" />
      <span className="smoke-blob smoke-blob-3" />
    </div>
  );
}
