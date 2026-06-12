'use client';

import { useEffect, useState } from 'react';
import { business } from '@/lib/site-data';

/**
 * Live "we're open" chip rendered inside Nav.
 *
 * Shows the storefront hours window (10 AM – 10 PM) with a pulsing lime
 * dot during open hours, or a dim "Reopens 10 AM" line when closed.
 *
 * Returns null until hydrated so nothing flashes in during SSR.
 */

type Status = { open: boolean; eyebrow: string; line: string };

function formatHour(hour24: number): string {
  if (hour24 === 0 || hour24 === 24) return '12 AM';
  if (hour24 === 12) return '12 PM';
  if (hour24 > 12) return `${hour24 - 12} PM`;
  return `${hour24} AM`;
}

function computeStatus(): Status {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const openMin = business.openHour * 60;
  const closeMin = (business.closeHour === 24 ? 24 : business.closeHour) * 60;
  const isOpen = minutes >= openMin && minutes < closeMin;

  const openLabel = formatHour(business.openHour);
  const closeLabel = formatHour(business.closeHour === 24 ? 24 : business.closeHour);

  if (isOpen) {
    return {
      open: true,
      eyebrow: 'Open today',
      line: `${openLabel} – ${closeLabel}`
    };
  }

  return {
    open: false,
    eyebrow: 'Closed',
    line: `Reopens ${openLabel}`
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

      {/* Two-line stack: eyebrow + hours */}
      <span className="flex flex-col leading-none">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
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
