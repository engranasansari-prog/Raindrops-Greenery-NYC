'use client';

import { useEffect, useState } from 'react';
import { business } from '@/lib/site-data';

/**
 * Premium delivery-ETA chip rendered inside Nav.
 *
 * - When the shop is open: pulsing lime dot + "Delivering now" eyebrow +
 *   live average ETA range from the coverage data (≈30–50 min across
 *   Manhattan + East River).
 * - When closed: dim dot + "Reopens at 10 AM" copy.
 *
 * Returns null until hydrated so nothing flashes in during SSR (mirrors
 * the existing OpenStatus pattern).
 */

type Status = { open: boolean; eyebrow: string; line: string };

function computeStatus(): Status {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const openMin = business.openHour * 60;
  const closeMin = (business.closeHour === 24 ? 24 : business.closeHour) * 60;
  const isOpen = minutes >= openMin && minutes < closeMin;

  if (isOpen) {
    return {
      open: true,
      eyebrow: 'Delivering now',
      line: '30–50 min'
    };
  }

  // Closed — show a friendly reopen line.
  const reopenHour = business.openHour;
  const reopenLabel = `${reopenHour > 12 ? reopenHour - 12 : reopenHour} ${reopenHour >= 12 ? 'PM' : 'AM'}`;
  return {
    open: false,
    eyebrow: 'Closed',
    line: `Reopens ${reopenLabel}`
  };
}

export default function DeliveryEta({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(computeStatus());
    const id = window.setInterval(() => setStatus(computeStatus()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!status) return null;

  const wrap =
    variant === 'desktop'
      ? 'hidden xl:inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 transition'
      : 'inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5';

  const tone = status.open
    ? 'border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-glow)]/8 hover:border-[color:var(--rd-glow)]/50'
    : 'border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink-soft)]';

  return (
    <span
      className={`${wrap} ${tone}`}
      aria-live="polite"
      aria-label={`${status.eyebrow} · ${status.line}`}
    >
      {/* Pulse dot */}
      <span className="relative inline-flex h-2 w-2 shrink-0" aria-hidden>
        {status.open && (
          <span className="motion-safe:animate-ping absolute inset-0 rounded-full bg-[color:var(--rd-glow)] opacity-60" />
        )}
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{
            background: status.open ? 'var(--rd-glow)' : 'var(--rd-text-mute)',
            boxShadow: status.open ? '0 0 10px rgba(200,230,110,0.55)' : 'none'
          }}
        />
      </span>

      {/* Two-line stack: eyebrow + time */}
      <span className="flex flex-col leading-none">
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]"
        >
          {status.eyebrow}
        </span>
        <span
          className={`mt-1 text-[12px] font-semibold tracking-[0.02em] [font-family:var(--font-mono)] ${
            status.open ? 'text-[color:var(--rd-glow)]' : 'text-[color:var(--rd-text-dim)]'
          }`}
        >
          {status.line}
        </span>
      </span>
    </span>
  );
}
