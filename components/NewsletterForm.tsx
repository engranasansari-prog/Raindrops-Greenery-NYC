'use client';

import { useState } from 'react';
import { Check, Mail } from 'lucide-react';

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
    // Production wiring: POST to /api/subscribe or a Mailchimp/Klaviyo endpoint.
    setSubmitted(true);
    setEmail('');
  };

  if (submitted) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-white">
        <Check className="h-4 w-4 text-[var(--champagne)]" />
        Thanks — we’ll be in touch.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`grid gap-2 ${compact ? '' : 'sm:grid-cols-[1fr_auto]'}`} aria-label="Email signup">
      <label className="flex min-w-0 items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-sm text-white">
        <Mail className="h-4 w-4 text-[var(--champagne)]" />
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email for deal drops"
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/52"
          aria-label="Email address"
        />
      </label>
      <button
        type="submit"
        className="rounded-full bg-[var(--champagne)] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--emerald-deep)] transition hover:bg-white"
      >
        Subscribe
      </button>
      {error && <p className="text-xs font-bold text-[var(--champagne)]">{error}</p>}
    </form>
  );
}
