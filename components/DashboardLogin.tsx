'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock } from 'lucide-react';

type Status = 'idle' | 'loading' | 'error';

/**
 * Shared-password login for the owners' subscribers dashboard. On success the
 * API sets the httpOnly session cookie and we hop straight to /dashboard.
 */
export default function DashboardLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/dashboard/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (data.ok) {
        router.replace('/dashboard');
        router.refresh();
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Incorrect password.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error — try again.');
    }
  };

  return (
    <main className="rd-luxe-dark flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink-soft)]/70 p-8 rd-shadow-luxe">
        <p className="rd-eyebrow mb-3 flex items-center gap-2 text-[color:var(--rd-glow)]">
          <Lock className="h-3.5 w-3.5" />
          Owners only
        </p>
        <h1 className="[font-family:var(--font-display)] text-3xl font-semibold text-[color:var(--rd-text)]">
          Subscribers Dashboard
        </h1>
        <p className="mt-2 text-sm text-[color:var(--rd-text-mute)]">
          Enter the team password to manage your subscriber list and giveaways.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-3" aria-label="Dashboard login">
          <input
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            disabled={status === 'loading'}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder="Password"
            aria-label="Dashboard password"
            className="w-full rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/60 px-5 py-3 text-base text-[color:var(--rd-text)] outline-none transition placeholder:text-[color:var(--rd-text-mute)] focus:border-[color:var(--rd-glow)] focus:shadow-[0_0_0_4px_rgba(200,230,110,0.18)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-luxe btn-luxe-gold w-full justify-center"
          >
            {status === 'loading' ? 'Checking…' : 'Open dashboard'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {message && (
          <p role="alert" className="mt-4 text-sm text-[color:var(--rd-amber)]">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
