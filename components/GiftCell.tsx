'use client';

import { useEffect, useState } from 'react';
import { Check, Gift, Undo2 } from 'lucide-react';
import { formatDay } from '@/lib/dashboard-format';

export type GiftToggle = (email: string, given: boolean) => void;

/**
 * Gift status + action for one subscriber. Used in the quick-check results,
 * the "new today" list, and the main table. Marking (and undoing) uses a
 * two-step inline confirm — the second click must land within 4 seconds —
 * so a stray tap can never hand out or erase a gift.
 */
export default function GiftCell({
  email,
  giftGiven,
  giftDate,
  pending,
  onToggle
}: {
  email: string;
  giftGiven: boolean;
  giftDate: string | null;
  pending: boolean;
  onToggle: GiftToggle;
}) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(t);
  }, [confirming]);

  const act = (given: boolean) => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onToggle(email, given);
  };

  if (giftGiven) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--rd-moss)]/30 bg-[color:var(--rd-mint)]/40 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--rd-moss)] [font-family:var(--font-mono)]">
          <Check className="h-3 w-3" />
          Gift · {giftDate ? formatDay(giftDate) : 'date unknown'}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => act(false)}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] [font-family:var(--font-mono)] transition disabled:opacity-50 ${
            confirming
              ? 'bg-[color:var(--rd-amber)]/25 font-semibold text-[color:var(--rd-ink)]'
              : 'text-[color:var(--rd-on-paper-dim)] hover:text-[color:var(--rd-ink)]'
          }`}
        >
          <Undo2 className="h-3 w-3" />
          {pending ? 'Saving…' : confirming ? 'Confirm undo?' : 'Undo'}
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => act(true)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition [font-family:var(--font-mono)] disabled:opacity-50 ${
        confirming
          ? 'border-[color:var(--rd-ink)] bg-[color:var(--rd-ink)] text-[color:var(--rd-glow)]'
          : 'border-[color:var(--rd-ink)]/25 bg-[color:var(--rd-glow)]/60 text-[color:var(--rd-ink)] hover:bg-[color:var(--rd-glow)]'
      }`}
    >
      <Gift className="h-3.5 w-3.5" />
      {pending ? 'Saving…' : confirming ? 'Confirm gift?' : 'Mark gift given'}
    </button>
  );
}
