'use client';

import { CheckCircle2, Droplet, Lock, Sparkles, Star, Truck } from 'lucide-react';

// V4 §7 — no "Lab tested", no "$80+", no "Manhattan only"
const items = [
  { icon: Droplet, label: 'Tax free' },
  { icon: Truck, label: 'Free delivery' },
  { icon: Lock, label: 'Same-day NYC' },
  { icon: CheckCircle2, label: 'Shinnecock-licensed' },
  { icon: Sparkles, label: 'Sticky · icky · delivered' },
  { icon: Star, label: '5.0★ from NYC' }
];

/**
 * Slim scrolling marquee under the nav (brief §4.6).
 * Two copies of the strip side by side so the loop is seamless.
 * Pauses on hover; the animation is disabled by the global
 * prefers-reduced-motion rule.
 */
export default function TrustMarquee() {
  return (
    <div className="group relative z-[55] overflow-hidden border-b border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/82 backdrop-blur">
      <div className="luxury-shell relative">
        <div className="flex w-max gap-0 py-2 [animation:rd-marquee_38s_linear_infinite] group-hover:[animation-play-state:paused]">
          <Strip />
          <Strip aria-hidden />
        </div>

        {/* Edge fades so the strip melts into the background instead of cutting off */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[color:var(--rd-ink-soft)] to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[color:var(--rd-ink-soft)] to-transparent" aria-hidden />
      </div>
    </div>
  );
}

function Strip(props: { 'aria-hidden'?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 px-6 text-[10px] uppercase tracking-[0.22em] text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)] sm:text-[11px]"
      {...props}
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <li key={`${item.label}-${i}`} className="inline-flex items-center gap-2 whitespace-nowrap">
            <Icon className="h-3.5 w-3.5 text-[color:var(--rd-glow)]" />
            <span>{item.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
