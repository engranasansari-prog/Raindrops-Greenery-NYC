'use client';

import { useState } from 'react';
import { ArrowRight, Check, Mail } from 'lucide-react';

/**
 * Footer / inline newsletter form.
 *
 * Production wiring TODO: POST to /api/subscribe or hand off to Mailchimp /
 * Klaviyo. Currently a client-side placeholder that validates email format
 * and shows a success state.
 */
export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setSubmitted(true);
    setEmail('');
  };

  if (submitted) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-glow)]/10 px-4 py-3 text-xs uppercase tracking-[0.16em] text-[color:var(--rd-glow)] [font-family:var(--font-mono)]">
        <Check className="h-4 w-4" />
        Thanks — we’ll be in touch.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-3" aria-label="Email signup">
      <div className={`flex items-stretch overflow-hidden rounded-full border border-[color:var(--rd-paper)]/16 bg-[color:var(--rd-ink-soft)]/55 transition focus-within:border-[color:var(--rd-glow)] focus-within:shadow-[0_0_0_4px_rgba(200,230,110,0.18)] ${compact ? '' : ''}`}>
        <span className="flex items-center pl-4 text-[color:var(--rd-text-mute)]">
          <Mail className="h-4 w-4" />
        </span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-[color:var(--rd-text)] outline-none placeholder:text-[color:var(--rd-text-mute)]"
        />
        <button
          type="submit"
          className="group inline-flex shrink-0 items-center gap-1.5 bg-[color:var(--rd-glow)] px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-ink)] transition hover:brightness-105 [font-family:var(--font-mono)]"
        >
          Subscribe
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-0.5" />
        </button>
      </div>
      <p className="text-[11px] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
        Unsubscribe anytime · 21+ only
      </p>
      {error && (
        <p className="rd-eyebrow text-[color:var(--rd-amber)]">{error}</p>
      )}
    </form>
  );
}
