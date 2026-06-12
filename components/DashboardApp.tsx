'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Gift,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Upload,
  Users
} from 'lucide-react';
import type { Subscriber } from '@/lib/mailchimp';
import { displayName, etDayKey, formatDay, phoneKey, todayET } from '@/lib/dashboard-format';
import DashboardTable from '@/components/DashboardTable';
import DashboardAddForm from '@/components/DashboardAddForm';
import DashboardImport from '@/components/DashboardImport';
import GiftCell from '@/components/GiftCell';

type Toast = { kind: 'success' | 'error'; text: string };

/**
 * Owners' subscribers dashboard. Loads the entire audience once (Mailchimp is
 * the source of truth — see lib/mailchimp.ts), keeps it in client state, and
 * does every search/filter/stat locally. Gift marking is optimistic with
 * rollback on failure.
 */
export default function DashboardApp() {
  const router = useRouter();
  const [members, setMembers] = useState<Subscriber[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [quickQuery, setQuickQuery] = useState('');
  const [pendingGifts, setPendingGifts] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // No synchronous setState here — `loading` starts true and refresh() flips
  // it before calling, which keeps the mount effect cascade-free.
  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/members');
      if (res.status === 401) {
        router.replace('/dashboard/login');
        return;
      }
      const data = (await res.json()) as { ok: boolean; members?: Subscriber[]; error?: string };
      if (!data.ok || !data.members) {
        setError(data.error ?? 'Could not load subscribers.');
        return;
      }
      setMembers(data.members);
      setFetchedAt(new Date());
    } catch {
      setError('Network error — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    // Initial fetch — same justified disable as OpenStatus.tsx: syncing with
    // an external system (the members API) is exactly what effects are for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleGift = useCallback(
    async (email: string, given: boolean) => {
      const prev = members?.find((m) => m.email === email);
      if (!prev) return;
      const rollback = { giftGiven: prev.giftGiven, giftDate: prev.giftDate };

      setPendingGifts((s) => new Set(s).add(email));
      setMembers((ms) =>
        ms
          ? ms.map((m) =>
              m.email === email
                ? { ...m, giftGiven: given, giftDate: given ? todayET() : null }
                : m
            )
          : ms
      );

      try {
        const res = await fetch('/api/dashboard/gift', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, given })
        });
        const data = (await res.json()) as {
          ok: boolean;
          giftGiven?: boolean;
          giftDate?: string | null;
          error?: string;
        };
        if (!data.ok) throw new Error(data.error ?? 'Update failed.');
        setMembers((ms) =>
          ms
            ? ms.map((m) =>
                m.email === email
                  ? { ...m, giftGiven: data.giftGiven === true, giftDate: data.giftDate ?? null }
                  : m
              )
            : ms
        );
        setToast({
          kind: 'success',
          text: given ? 'Gift marked as given ✓' : 'Gift mark removed.'
        });
      } catch (err) {
        setMembers((ms) =>
          ms ? ms.map((m) => (m.email === email ? { ...m, ...rollback } : m)) : ms
        );
        setToast({
          kind: 'error',
          text: err instanceof Error ? err.message : 'Could not update gift status.'
        });
      } finally {
        setPendingGifts((s) => {
          const next = new Set(s);
          next.delete(email);
          return next;
        });
      }
    },
    [members]
  );

  const logout = async () => {
    try {
      await fetch('/api/dashboard/login', { method: 'DELETE' });
    } finally {
      router.replace('/dashboard/login');
    }
  };

  // "Now" is the fetch moment (state), not Date.now() — render stays pure and
  // the numbers update naturally on every refresh.
  const stats = useMemo(() => {
    if (!members || !fetchedAt) return null;
    const today = etDayKey(fetchedAt);
    const weekAgo = fetchedAt.getTime() - 7 * 24 * 3600 * 1000;
    let subscribed = 0;
    let inactive = 0;
    let newToday = 0;
    let newWeek = 0;
    let giftsGiven = 0;
    let giftsPending = 0;
    for (const m of members) {
      if (m.status === 'subscribed') subscribed += 1;
      else inactive += 1;
      if (etDayKey(m.signupAt) === today) newToday += 1;
      const t = new Date(m.signupAt).getTime();
      if (!Number.isNaN(t) && t >= weekAgo) newWeek += 1;
      if (m.giftGiven) giftsGiven += 1;
      else if (m.status === 'subscribed') giftsPending += 1;
    }
    return { subscribed, inactive, newToday, newWeek, giftsGiven, giftsPending };
  }, [members, fetchedAt]);

  const newToday = useMemo(() => {
    if (!members || !fetchedAt) return [];
    const today = etDayKey(fetchedAt);
    return members
      .filter((m) => etDayKey(m.signupAt) === today)
      .sort((a, b) => (a.signupAt < b.signupAt ? 1 : -1));
  }, [members, fetchedAt]);

  // Quick check: exact-ish match by email (or prefix while typing) or phone
  // digits. Phone matching is client-side because Mailchimp dedupes by email
  // only — last-10-digits comparison absorbs formatting differences.
  const quickResult = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (!q || !members) return null;
    const qPhone = phoneKey(q);
    const phoneSearch = qPhone.length >= 7 && /^[\d\s()+.\-]+$/.test(q);
    const matches = members.filter((m) => {
      if (phoneSearch) return m.phone !== '' && phoneKey(m.phone) === qPhone;
      const name = displayName(m.firstName, m.lastName).toLowerCase();
      return m.email.toLowerCase().includes(q) || (name !== '' && name.includes(q));
    });
    return matches.slice(0, 5);
  }, [quickQuery, members]);

  return (
    <main className="min-h-screen bg-[color:var(--rd-paper-bright)] px-4 pb-24 pt-6 text-[color:var(--rd-ink)] sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="rd-eyebrow !text-[color:var(--rd-moss)]">Raindrops Greenery · Owners</p>
            <h1 className="[font-family:var(--font-display)] text-3xl font-semibold sm:text-4xl">
              Subscribers
            </h1>
            {fetchedAt && (
              <p className="mt-1 text-xs text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                Updated{' '}
                {fetchedAt.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZone: 'America/New_York'
                })}{' '}
                ET
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="btn-luxe btn-luxe-outline btn-luxe-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="btn-luxe btn-luxe-dark btn-luxe-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add subscriber
            </button>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="btn-luxe btn-luxe-dark btn-luxe-sm"
            >
              <Upload className="h-3.5 w-3.5" />
              Import CSV
            </button>
            <button type="button" onClick={() => void logout()} className="btn-luxe btn-luxe-outline btn-luxe-sm">
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--rd-amber)]/50 bg-[color:var(--rd-amber)]/15 px-4 py-3 text-sm">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[color:var(--rd-amber)]" />
              {error}
            </span>
            <button type="button" onClick={refresh} className="btn-luxe btn-luxe-dark btn-luxe-sm">
              Retry
            </button>
          </div>
        )}

        {/* Stat cards */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Subscriber stats">
          <StatCard
            icon={<Users className="h-4 w-4" />}
            label="Subscribed"
            value={stats ? String(stats.subscribed) : '—'}
            hint={stats && stats.inactive > 0 ? `+${stats.inactive} inactive` : undefined}
            loading={loading && !stats}
          />
          <StatCard
            icon={<Sparkles className="h-4 w-4" />}
            label="New today"
            value={stats ? String(stats.newToday) : '—'}
            accent={stats ? stats.newToday > 0 : false}
            loading={loading && !stats}
          />
          <StatCard
            label="New this week"
            value={stats ? String(stats.newWeek) : '—'}
            loading={loading && !stats}
          />
          <StatCard
            icon={<Gift className="h-4 w-4" />}
            label="Gifts given"
            value={stats ? String(stats.giftsGiven) : '—'}
            loading={loading && !stats}
          />
          <StatCard
            label="Gifts pending"
            value={stats ? String(stats.giftsPending) : '—'}
            loading={loading && !stats}
          />
        </section>

        {/* Quick check */}
        <section className="mt-8 rounded-3xl border border-[color:var(--rd-ink)]/12 bg-white/70 p-5 rd-shadow-luxe sm:p-6">
          <h2 className="rd-eyebrow !text-[color:var(--rd-moss)]">Check before you gift</h2>
          <p className="mt-1 text-sm text-[color:var(--rd-on-paper-dim)]">
            Type an email, phone number, or name — instantly see if they&rsquo;re subscribed and
            whether they already received their free gift.
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-full border border-[color:var(--rd-ink)]/18 bg-white px-4 transition focus-within:border-[color:var(--rd-moss)] focus-within:shadow-[0_0_0_4px_rgba(46,82,64,0.12)]">
            <Search className="h-4 w-4 shrink-0 text-[color:var(--rd-on-paper-dim)]" />
            <input
              type="search"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="email@example.com · 212-555-0100 · Jane"
              aria-label="Check a subscriber"
              className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-[color:var(--rd-on-paper-dim)]/70"
            />
          </div>

          {quickResult !== null && (
            <div className="mt-4 grid gap-2" role="status">
              {quickResult.length === 0 ? (
                <div className="rounded-2xl border border-[color:var(--rd-ink)]/12 bg-[color:var(--rd-paper)]/60 px-4 py-3 text-sm">
                  <strong>Not on the list.</strong>{' '}
                  <span className="text-[color:var(--rd-on-paper-dim)]">
                    No subscriber matches — they need to subscribe before getting a gift.
                  </span>
                </div>
              ) : (
                quickResult.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-l-4 bg-white px-4 py-3 shadow-sm ${
                      m.giftGiven
                        ? 'border-[color:var(--rd-amber)]'
                        : 'border-[color:var(--rd-fern)]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {displayName(m.firstName, m.lastName) || m.email}
                        {m.status !== 'subscribed' && (
                          <span className="ml-2 rounded-full bg-[color:var(--rd-amber)]/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
                            {m.status}
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                        {m.email}
                        {m.phone ? ` · ${m.phone}` : ''} · joined {formatDay(m.signupAt)}
                      </p>
                      <p className={`mt-1 text-xs font-semibold ${m.giftGiven ? 'text-[#a05c1c]' : 'text-[color:var(--rd-moss)]'}`}>
                        {m.giftGiven
                          ? `⚠ Already received their gift${m.giftDate ? ` on ${formatDay(m.giftDate)}` : ''} — do not gift again.`
                          : 'No gift yet — good to go.'}
                      </p>
                    </div>
                    <GiftCell
                      email={m.email}
                      giftGiven={m.giftGiven}
                      giftDate={m.giftDate}
                      pending={pendingGifts.has(m.email)}
                      onToggle={(email, given) => void toggleGift(email, given)}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* New today */}
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="[font-family:var(--font-display)] text-xl font-semibold">
              New today {stats ? <span className="text-[color:var(--rd-on-paper-dim)]">({stats.newToday})</span> : null}
            </h2>
          </div>
          {loading && !members ? (
            <div className="mt-3 h-16 animate-pulse rounded-2xl bg-[color:var(--rd-paper)]/80" />
          ) : newToday.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--rd-on-paper-dim)]">
              No new subscribers yet today. New signups from the website appear here automatically.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {newToday.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--rd-ink)]/12 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {displayName(m.firstName, m.lastName) || m.email}
                    </p>
                    <p className="truncate text-xs text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                      {m.email}
                      {m.phone ? ` · ${m.phone}` : ''}
                      {m.tags.length > 0 ? ` · ${m.tags.join(', ')}` : ''}
                    </p>
                  </div>
                  <GiftCell
                    email={m.email}
                    giftGiven={m.giftGiven}
                    giftDate={m.giftDate}
                    pending={pendingGifts.has(m.email)}
                    onToggle={(email, given) => void toggleGift(email, given)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Full list */}
        <section className="mt-10">
          <h2 className="[font-family:var(--font-display)] text-xl font-semibold">All subscribers</h2>
          {loading && !members ? (
            <div className="mt-3 grid gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-[color:var(--rd-paper)]/80" />
              ))}
            </div>
          ) : members ? (
            <DashboardTable
              members={members}
              pendingGifts={pendingGifts}
              onToggleGift={(email, given) => void toggleGift(email, given)}
            />
          ) : null}
        </section>
      </div>

      {/* Modals */}
      {addOpen && (
        <DashboardAddForm
          onClose={() => setAddOpen(false)}
          onAdded={(member) => {
            setMembers((ms) => (ms ? [member, ...ms.filter((m) => m.email !== member.email)] : [member]));
            setToast({ kind: 'success', text: `${member.email} added to the list.` });
          }}
        />
      )}
      {importOpen && (
        <DashboardImport
          onClose={(didImport) => {
            setImportOpen(false);
            if (didImport) refresh();
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg ${
            toast.kind === 'success'
              ? 'bg-[color:var(--rd-ink)] text-[color:var(--rd-glow)]'
              : 'bg-[#7a2e1d] text-white'
          }`}
        >
          {toast.text}
        </div>
      )}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent = false,
  loading = false
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? 'border-[color:var(--rd-moss)]/40 bg-[color:var(--rd-mint)]/35'
          : 'border-[color:var(--rd-ink)]/12 bg-white/70'
      }`}
    >
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
        {icon}
        {label}
      </p>
      {loading ? (
        <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[color:var(--rd-paper)]" />
      ) : (
        <p className="mt-1 text-3xl font-semibold tabular-nums [font-family:var(--font-display)]">
          {value}
        </p>
      )}
      {hint && (
        <p className="mt-0.5 text-[11px] text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">{hint}</p>
      )}
    </div>
  );
}
