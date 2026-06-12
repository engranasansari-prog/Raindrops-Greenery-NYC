'use client';

import { useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import type { Subscriber } from '@/lib/mailchimp';
import { displayName, formatDay } from '@/lib/dashboard-format';

const SOURCE_OPTIONS: [string, string][] = [
  ['dashboard-add', 'Added by owner'],
  ['gmail-import', 'Gmail signup'],
  ['in-person', 'In person'],
  ['instagram', 'Instagram']
];

/**
 * Manually add one subscriber. If the email is already on the list, Mailchimp
 * is NOT modified — instead the existing member is shown with their gift
 * status, which is exactly the "are we gifting twice?" check.
 */
export default function DashboardAddForm({
  onClose,
  onAdded
}: {
  onClose: () => void;
  onAdded: (member: Subscriber) => void;
}) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('dashboard-add');
  const [status, setStatus] = useState<'idle' | 'loading' | 'added'>('idle');
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<Subscriber | null>(null);

  const reset = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setStatus('idle');
    setError('');
    setExisting(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setError('');
    setExisting(null);

    try {
      const res = await fetch('/api/dashboard/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, phone, source })
      });
      const data = (await res.json()) as {
        ok: boolean;
        existed?: boolean;
        member?: Subscriber;
        error?: string;
      };

      if (!data.ok || !data.member) {
        setStatus('idle');
        setError(data.error ?? 'Could not add the subscriber.');
        return;
      }
      if (data.existed) {
        setStatus('idle');
        setExisting(data.member);
        return;
      }
      setStatus('added');
      onAdded(data.member);
    } catch {
      setStatus('idle');
      setError('Network error — try again.');
    }
  };

  const inputClass =
    'w-full rounded-xl border border-[color:var(--rd-ink)]/18 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[color:var(--rd-moss)] placeholder:text-[color:var(--rd-on-paper-dim)]/60';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[color:var(--rd-ink)]/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Add subscriber"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[color:var(--rd-paper-bright)] p-6 text-[color:var(--rd-ink)] rd-shadow-luxe sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="rd-eyebrow !text-[color:var(--rd-moss)]">Subscribers</p>
            <h2 className="[font-family:var(--font-display)] text-2xl font-semibold">Add subscriber</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 transition hover:bg-[color:var(--rd-ink)]/8">
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === 'added' ? (
          <div className="mt-6">
            <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--rd-moss)]/30 bg-[color:var(--rd-mint)]/40 px-4 py-3 text-sm font-semibold text-[color:var(--rd-moss)]">
              <Check className="h-4 w-4" />
              Added to the list.
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={reset} className="btn-luxe btn-luxe-dark btn-luxe-sm">
                Add another
              </button>
              <button type="button" onClick={onClose} className="btn-luxe btn-luxe-outline btn-luxe-sm">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 grid gap-3">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setExisting(null);
              }}
              placeholder="Email (required)"
              aria-label="Email"
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                aria-label="First name"
                autoComplete="off"
                className={inputClass}
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                aria-label="Last name"
                autoComplete="off"
                className={inputClass}
              />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              aria-label="Phone"
              autoComplete="off"
              className={inputClass}
            />
            <label className="grid gap-1 text-xs text-[color:var(--rd-on-paper-dim)]">
              How did they sign up?
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className={`${inputClass} [font-family:var(--font-mono)]`}
              >
                {SOURCE_OPTIONS.map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            {existing && (
              <div className="rounded-2xl border border-[color:var(--rd-amber)]/60 bg-[color:var(--rd-amber)]/15 px-4 py-3 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-[#a05c1c]" />
                  Already on the list — nothing was changed.
                </p>
                <p className="mt-1 text-xs text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                  {displayName(existing.firstName, existing.lastName) || existing.email} · joined{' '}
                  {formatDay(existing.signupAt)} · {existing.status}
                </p>
                <p className={`mt-1.5 text-xs font-semibold ${existing.giftGiven ? 'text-[#a05c1c]' : 'text-[color:var(--rd-moss)]'}`}>
                  {existing.giftGiven
                    ? `⚠ Already received their free gift${existing.giftDate ? ` on ${formatDay(existing.giftDate)}` : ''}.`
                    : 'Has not received a free gift yet.'}
                </p>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-[#7a2e1d]">
                {error}
              </p>
            )}

            <button type="submit" disabled={status === 'loading'} className="btn-luxe btn-luxe-gold w-full justify-center">
              {status === 'loading' ? 'Adding…' : 'Add to list'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
