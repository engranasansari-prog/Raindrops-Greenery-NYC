'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import type { Subscriber } from '@/lib/mailchimp';
import { displayName, formatDay, phoneKey } from '@/lib/dashboard-format';
import { toCsv } from '@/lib/csv';
import GiftCell, { type GiftToggle } from '@/components/GiftCell';

type GiftFilter = 'all' | 'given' | 'pending';
type StatusFilter = 'all' | 'subscribed' | 'inactive';
type Sort = 'newest' | 'oldest' | 'name';

const PAGE_SIZE = 50;

const STATUS_BADGE: Record<Subscriber['status'], string> = {
  subscribed: 'bg-[color:var(--rd-mint)]/50 text-[color:var(--rd-moss)]',
  unsubscribed: 'bg-[color:var(--rd-amber)]/25 text-[#7a4a14]',
  cleaned: 'bg-[#7a2e1d]/15 text-[#7a2e1d]',
  pending: 'bg-[color:var(--rd-ink)]/10 text-[color:var(--rd-on-paper-dim)]',
  transactional: 'bg-[color:var(--rd-ink)]/10 text-[color:var(--rd-on-paper-dim)]'
};

/**
 * The complete subscriber list: search, gift/status filters, sort, 50-row
 * pagination. Renders a table on desktop and stacked cards on mobile (the
 * owners check this from their phones). Export downloads the CURRENTLY
 * FILTERED rows as CSV.
 */
export default function DashboardTable({
  members,
  pendingGifts,
  onToggleGift
}: {
  members: Subscriber[];
  pendingGifts: Set<string>;
  onToggleGift: GiftToggle;
}) {
  const [query, setQuery] = useState('');
  const [giftFilter, setGiftFilter] = useState<GiftFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<Sort>('newest');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qPhone = phoneKey(q);
    const rows = members.filter((m) => {
      if (giftFilter === 'given' && !m.giftGiven) return false;
      if (giftFilter === 'pending' && m.giftGiven) return false;
      if (statusFilter === 'subscribed' && m.status !== 'subscribed') return false;
      if (statusFilter === 'inactive' && m.status === 'subscribed') return false;
      if (!q) return true;
      const name = displayName(m.firstName, m.lastName).toLowerCase();
      return (
        m.email.toLowerCase().includes(q) ||
        name.includes(q) ||
        (qPhone.length >= 4 && m.phone !== '' && phoneKey(m.phone).includes(qPhone)) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      );
    });

    rows.sort((a, b) => {
      if (sort === 'name') {
        const an = (displayName(a.firstName, a.lastName) || a.email).toLowerCase();
        const bn = (displayName(b.firstName, b.lastName) || b.email).toLowerCase();
        return an.localeCompare(bn);
      }
      const cmp = a.signupAt < b.signupAt ? -1 : a.signupAt > b.signupAt ? 1 : 0;
      return sort === 'newest' ? -cmp : cmp;
    });

    return rows;
  }, [members, query, giftFilter, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const setFilter = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  const exportCsv = () => {
    const rows: string[][] = [
      ['Email', 'First name', 'Last name', 'Phone', 'Status', 'Source tags', 'Signed up', 'Gift given', 'Gift date'],
      ...filtered.map((m) => [
        m.email,
        m.firstName,
        m.lastName,
        m.phone,
        m.status,
        m.tags.join('; '),
        m.signupAt,
        m.giftGiven ? 'yes' : 'no',
        m.giftDate ?? ''
      ])
    ];
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 basis-64 items-center gap-2 rounded-full border border-[color:var(--rd-ink)]/18 bg-white px-3.5 transition focus-within:border-[color:var(--rd-moss)]">
          <Search className="h-4 w-4 shrink-0 text-[color:var(--rd-on-paper-dim)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search name, email, phone, tag…"
            aria-label="Search subscribers"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[color:var(--rd-on-paper-dim)]/70"
          />
        </div>
        <FilterSelect
          ariaLabel="Gift filter"
          value={giftFilter}
          onChange={setFilter(setGiftFilter)}
          options={[
            ['all', 'Gift: all'],
            ['pending', 'Gift: not given'],
            ['given', 'Gift: given']
          ]}
        />
        <FilterSelect
          ariaLabel="Status filter"
          value={statusFilter}
          onChange={setFilter(setStatusFilter)}
          options={[
            ['all', 'Status: all'],
            ['subscribed', 'Status: subscribed'],
            ['inactive', 'Status: inactive']
          ]}
        />
        <FilterSelect
          ariaLabel="Sort"
          value={sort}
          onChange={setFilter(setSort)}
          options={[
            ['newest', 'Newest first'],
            ['oldest', 'Oldest first'],
            ['name', 'By name']
          ]}
        />
        <button type="button" onClick={exportCsv} className="btn-luxe btn-luxe-outline btn-luxe-sm">
          <Download className="h-3.5 w-3.5" />
          Export ({filtered.length})
        </button>
      </div>

      <p className="mt-3 text-xs text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
        {filtered.length} of {members.length} subscribers
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-[color:var(--rd-ink)]/12 bg-white/70 px-4 py-8 text-center text-sm text-[color:var(--rd-on-paper-dim)]">
          {members.length === 0
            ? 'No subscribers yet — they will appear here as soon as someone joins via the website, or add them manually.'
            : 'Nothing matches that search or filter.'}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-[color:var(--rd-ink)]/12 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--rd-ink)]/10 bg-[color:var(--rd-paper)]/60 text-[11px] uppercase tracking-[0.1em] text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                  <th className="px-4 py-3 font-medium">Subscriber</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Free gift</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((m) => (
                  <tr key={m.id} className="border-b border-[color:var(--rd-ink)]/6 last:border-0 hover:bg-[color:var(--rd-paper)]/40">
                    <td className="max-w-[260px] px-4 py-3">
                      <p className="truncate font-semibold">
                        {displayName(m.firstName, m.lastName) || '—'}
                      </p>
                      <p className="truncate text-xs text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                        {m.email}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs [font-family:var(--font-mono)]">
                      {m.phone || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide [font-family:var(--font-mono)] ${STATUS_BADGE[m.status]}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="max-w-[160px] px-4 py-3">
                      <span className="block truncate text-xs text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                        {m.tags.join(', ') || '—'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs [font-family:var(--font-mono)]">
                      {formatDay(m.signupAt)}
                    </td>
                    <td className="px-4 py-3">
                      <GiftCell
                        email={m.email}
                        giftGiven={m.giftGiven}
                        giftDate={m.giftDate}
                        pending={pendingGifts.has(m.email)}
                        onToggle={onToggleGift}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="mt-4 grid gap-2 md:hidden">
            {pageRows.map((m) => (
              <li key={m.id} className="rounded-2xl border border-[color:var(--rd-ink)]/12 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {displayName(m.firstName, m.lastName) || m.email}
                    </p>
                    <p className="truncate text-xs text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                      {m.email}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide [font-family:var(--font-mono)] ${STATUS_BADGE[m.status]}`}>
                    {m.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                  {m.phone ? `${m.phone} · ` : ''}joined {formatDay(m.signupAt)}
                  {m.tags.length > 0 ? ` · ${m.tags.join(', ')}` : ''}
                </p>
                <div className="mt-3">
                  <GiftCell
                    email={m.email}
                    giftGiven={m.giftGiven}
                    giftDate={m.giftDate}
                    pending={pendingGifts.has(m.email)}
                    onToggle={onToggleGift}
                  />
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
                className="btn-luxe btn-luxe-outline btn-luxe-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </button>
              <span className="text-xs text-[color:var(--rd-on-paper-dim)] [font-family:var(--font-mono)]">
                Page {safePage + 1} of {pageCount}
              </span>
              <button
                type="button"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
                className="btn-luxe btn-luxe-outline btn-luxe-sm disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="rounded-full border border-[color:var(--rd-ink)]/18 bg-white px-3 py-2.5 text-xs font-medium outline-none transition focus:border-[color:var(--rd-moss)] [font-family:var(--font-mono)]"
    >
      {options.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}
