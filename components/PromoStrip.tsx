'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BadgePercent, X } from 'lucide-react';
import { promoStrip } from '@/lib/site-data';

const STORAGE_KEY = 'rd_promo_dismissed_v1';

export default function PromoStrip() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(window.sessionStorage.getItem(STORAGE_KEY) === 'yes');
  }, []);

  if (!promoStrip.message || hidden) return null;

  const dismiss = () => {
    window.sessionStorage.setItem(STORAGE_KEY, 'yes');
    setHidden(true);
  };

  return (
    <div className="relative z-[60] bg-[var(--emerald-deep)] text-white">
      <div className="luxury-shell flex items-center gap-3 py-2 text-xs font-bold sm:text-sm">
        <BadgePercent className="hidden h-4 w-4 shrink-0 text-[var(--champagne)] sm:block" />
        <p className="flex-1 leading-relaxed">{promoStrip.message}</p>
        {promoStrip.cta && (
          <Link
            href={promoStrip.cta.href}
            className="hidden items-center gap-1 rounded-full bg-white/12 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-white/22 sm:inline-flex"
          >
            {promoStrip.cta.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss promotion"
          className="-mr-1 rounded-full p-1 text-white/70 transition hover:bg-white/12 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
