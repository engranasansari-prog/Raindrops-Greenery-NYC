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
  // Close-at-midnight is encoded as 24 in site-data.
  const closeMinutes = business.closeHour === 24 ? 24 * 60 : business.closeHour * 60;

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  if (isOpen) {
    const closesInMinutes = closeMinutes - currentMinutes;
    if (closesInMinutes <= 60) {
      return { open: true, label: `Open · closes in ${closesInMinutes} min` };
    }
    return { open: true, label: 'Open now · delivering' };
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

export default function OpenStatus({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(computeStatus());
    const interval = window.setInterval(() => setStatus(computeStatus()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] ${tone === 'dark' ? 'border-white/14 text-white/70' : 'border-[var(--line)] text-[var(--muted)] bg-white/70'}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)]/40" />
        Loading
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] ${tone === 'dark' ? (status.open ? 'border-emerald-300/40 bg-emerald-400/12 text-emerald-100' : 'border-white/14 bg-white/8 text-white/70') : (status.open ? 'border-[var(--emerald)] bg-[var(--emerald)]/8 text-[var(--emerald-deep)]' : 'border-[var(--line)] bg-white/70 text-[var(--muted)]')}`} aria-live="polite">
      <span className={`relative inline-flex h-2 w-2`}>
        <span className={`absolute inset-0 rounded-full ${status.open ? 'bg-[var(--emerald)] motion-safe:animate-ping opacity-60' : 'bg-[var(--muted)]/40'}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${status.open ? 'bg-[var(--emerald)]' : 'bg-[var(--muted)]/60'}`} />
      </span>
      {status.label}
    </span>
  );
}
