'use client';

import { useEffect, useState } from 'react';
import { business } from '@/lib/site-data';

type Status = { open: boolean; label: string };

function computeStatus(): Status {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;

  const openMinutes = business.openHour * 60;
  // Close-at-midnight is encoded as 24 in site-data; any other hour is the
  // literal 24h value (e.g. 22 = 10 PM).
  const closeMinutes = business.closeHour === 24 ? 24 * 60 : business.closeHour * 60;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (isOpen) {
    const closesInMinutes = closeMinutes - currentMinutes;
    if (closesInMinutes <= 60) {
      return { open: true, label: `Open · closes in ${closesInMinutes} min` };
    }
    return { open: true, label: 'Open · delivering' };
  }

  const minutesToOpen = currentMinutes < openMinutes
    ? openMinutes - currentMinutes
    : 24 * 60 - currentMinutes + openMinutes;

  if (minutesToOpen <= 60) {
    return { open: false, label: `Opens in ${minutesToOpen} min` };
  }

  const hoursToOpen = Math.round(minutesToOpen / 60);
  return { open: false, label: `Opens in ${hoursToOpen}h` };
}

/**
 * Live open/closed indicator.
 *
 * IMPORTANT: This was previously rendering a "Loading" placeholder during SSR
 * which would briefly appear in the nav before client hydration computed the
 * real status. We now return null until hydrated so nothing flashes in.
 */
export default function OpenStatus({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(computeStatus());
    const interval = window.setInterval(() => setStatus(computeStatus()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!status) return null;

  const baseClasses =
    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] [font-family:var(--font-mono)]';

  const toneClasses = tone === 'dark'
    ? status.open
      ? 'border-[color:var(--rd-glow)]/40 bg-[color:var(--rd-glow)]/10 text-[color:var(--rd-glow)]'
      : 'border-white/14 bg-white/8 text-white/70'
    : status.open
      ? 'border-[color:var(--rd-fern)] bg-[color:var(--rd-fern)]/8 text-[color:var(--rd-moss)]'
      : 'border-[color:var(--line)] bg-white/70 text-[color:var(--muted)]';

  return (
    <span className={`${baseClasses} ${toneClasses}`} aria-live="polite">
      <span className="relative inline-flex h-2 w-2">
        {status.open && (
          <span className="motion-safe:animate-ping absolute inset-0 rounded-full bg-[color:var(--rd-glow)] opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${status.open ? 'bg-[color:var(--rd-glow)]' : 'bg-[color:var(--muted)]/60'}`}
        />
      </span>
      {status.label}
    </span>
  );
}
