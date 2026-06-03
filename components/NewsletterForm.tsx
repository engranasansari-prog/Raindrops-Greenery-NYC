'use client';

import { useState } from 'react';
import { ArrowRight, Check, Mail } from 'lucide-react';
import { trackSignup } from '@/lib/analytics';

type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * Footer / inline newsletter form — V6 §9.4.
 *
 * Submits to /api/subscribe which forwards to Mailchimp. Handles:
 *   - loading state
 *   - success ("You're in.")
 *   - duplicate ("You're already on the list.")
 *   - validation errors
 *   - network errors
 */
export default function NewsletterForm({ source = 'website-footer' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'loading' || status === 'success') return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source })
      });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string };

      if (data.ok) {
        setStatus('success');
        setMessage(data.message ?? "You're in.");
        setEmail('');
        trackSignup(source);
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error — try again.');
    }
  };

  const isDone = status === 'success';

  return (
    <form onSubmit={submit} className="grid w-full max-w-md gap-3" aria-label="Email signup">
      <div className="flex items-stretch overflow-hidden rounded-full border border-[color:var(--rd-paper)]/16 bg-[color:var(--rd-ink-soft)]/55 transition focus-within:border-[color:var(--rd-glow)] focus-within:shadow-[0_0_0_4px_rgba(200,230,110,0.18)]">
        <span className="flex items-center pl-4 text-[color:var(--rd-text-mute)]">
          <Mail className="h-4 w-4" />
        </span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          disabled={status === 'loading' || isDone}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-[color:var(--rd-text)] outline-none placeholder:text-[color:var(--rd-text-mute)] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading' || isDone}
          className="group inline-flex shrink-0 items-center gap-1.5 bg-[color:var(--rd-glow)] px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-ink)] transition hover:brightness-105 disabled:opacity-70 [font-family:var(--font-mono)]"
        >
          {status === 'loading' ? 'Sending…' : isDone ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Done
            </>
          ) : (
            <>
              Subscribe
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      {message && (
        <p
          role={status === 'error' ? 'alert' : 'status'}
          className={`text-sm ${status === 'success' ? 'text-[color:var(--rd-glow)]' : 'text-[color:var(--rd-amber)]'}`}
        >
          {message}
        </p>
      )}

      <p className="text-[11px] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
        Unsubscribe anytime · 21+ only
      </p>
    </form>
  );
}
