'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Check, FileUp, X } from 'lucide-react';
import { autoMapColumns, parseCsv, splitFullName, type ColumnMap } from '@/lib/csv';

type Step = 'file' | 'map' | 'preview' | 'importing' | 'done';

type ImportSummary = {
  added: string[];
  existed: string[];
  errors: { email: string; reason: string }[];
};

const MAX_ROWS = 5000;

const SOURCE_OPTIONS: [string, string][] = [
  ['gmail-import', 'Gmail signups'],
  ['dashboard-add', 'Added by owner'],
  ['in-person', 'In person'],
  ['instagram', 'Instagram']
];

/**
 * CSV import wizard: pick file → confirm column mapping → preview + consent →
 * results. Nothing is sent to Mailchimp until the preview step is explicitly
 * confirmed, so a mis-parsed file is caught by eye first. Existing members are
 * reported as duplicates, never modified.
 */
export default function DashboardImport({ onClose }: { onClose: (didImport: boolean) => void }) {
  const [step, setStep] = useState<Step>('file');
  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [map, setMap] = useState<ColumnMap>({ email: -1, firstName: -1, lastName: -1, fullName: -1, phone: -1 });
  const [source, setSource] = useState('gmail-import');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportSummary | null>(null);

  const columnLabels = useMemo(() => {
    if (rawRows.length === 0) return [];
    const width = rawRows[0].length;
    return Array.from({ length: width }, (_, i) =>
      hasHeader && rawRows[0][i].trim() ? rawRows[0][i].trim() : `Column ${i + 1}`
    );
  }, [rawRows, hasHeader]);

  const dataRows = useMemo(
    () => (hasHeader ? rawRows.slice(1) : rawRows),
    [rawRows, hasHeader]
  );

  const mappedRows = useMemo(() => {
    const at = (row: string[], i: number) => (i >= 0 && i < row.length ? row[i].trim() : '');
    return dataRows
      .map((row) => {
        let firstName = at(row, map.firstName);
        let lastName = at(row, map.lastName);
        if (!firstName && !lastName && map.fullName >= 0) {
          const split = splitFullName(at(row, map.fullName));
          firstName = split.firstName;
          lastName = split.lastName;
        }
        return { email: at(row, map.email), firstName, lastName, phone: at(row, map.phone) };
      })
      .filter((row) => row.email !== '' || row.firstName !== '' || row.phone !== '');
  }, [dataRows, map]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onerror = () => setError('Could not read that file.');
    reader.onload = () => {
      const rows = parseCsv(String(reader.result ?? ''));
      if (rows.length === 0) {
        setError('That file looks empty.');
        return;
      }
      // If the first row contains an @ it's data, not headers.
      const headerLikely = !rows[0].some((cell) => cell.includes('@'));
      setFileName(file.name);
      setRawRows(rows);
      setHasHeader(headerLikely);
      setMap(autoMapColumns(headerLikely ? rows[0] : []));
      setStep('map');
    };
    reader.readAsText(file);
  };

  const runImport = async () => {
    setStep('importing');
    setError('');
    try {
      const res = await fetch('/api/dashboard/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mappedRows, source })
      });
      const data = (await res.json()) as Partial<ImportSummary> & { ok: boolean; error?: string };
      if (!data.ok) {
        setStep('preview');
        setError(data.error ?? 'Import failed. Try again.');
        return;
      }
      setResult({ added: data.added ?? [], existed: data.existed ?? [], errors: data.errors ?? [] });
      setStep('done');
    } catch {
      setStep('preview');
      setError('Network error — nothing may have been imported. Try again.');
    }
  };

  const selectClass =
    'w-full rounded-xl border border-[color:var(--rd-ink)]/18 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[color:var(--rd-moss)] [font-family:var(--font-mono)]';

  const mapSelect = (label: string, key: keyof ColumnMap, required = false) => (
    <label className="grid gap-1 text-xs text-[color:var(--rd-on-paper-dim)]">
      {label}
      {required ? ' *' : ''}
      <select
        value={map[key]}
        onChange={(e) => setMap((m) => ({ ...m, [key]: Number(e.target.value) }))}
        className={selectClass}
      >
        <option value={-1}>— not in file —</option>
        {columnLabels.map((col, i) => (
          <option key={i} value={i}>
            {col}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[color:var(--rd-ink)]/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Import subscribers from CSV"
      onClick={() => step !== 'importing' && onClose(step === 'done')}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[color:var(--rd-paper-bright)] p-6 text-[color:var(--rd-ink)] rd-shadow-luxe sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="rd-eyebrow !text-[color:var(--rd-moss)]">Subscribers</p>
            <h2 className="[font-family:var(--font-display)] text-2xl font-semibold">Import CSV</h2>
          </div>
          {step !== 'importing' && (
            <button
              type="button"
              onClick={() => onClose(step === 'done')}
              aria-label="Close"
              className="rounded-full p-2 transition hover:bg-[color:var(--rd-ink)]/8"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-[#7a2e1d]/10 px-3 py-2 text-sm text-[#7a2e1d]">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {step === 'file' && (
          <div className="mt-5">
            <p className="text-sm text-[color:var(--rd-on-paper-dim)]">
              Upload a CSV with at least an email column — a Google Contacts or Gmail export works
              as-is. You&rsquo;ll confirm everything before anything is imported.
            </p>
            <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[color:var(--rd-ink)]/25 bg-white/60 px-4 py-10 text-sm transition hover:border-[color:var(--rd-moss)]">
              <FileUp className="h-6 w-6 text-[color:var(--rd-moss)]" />
              <span className="font-semibold">Choose a .csv file</span>
              <span className="text-xs text-[color:var(--rd-on-paper-dim)]">up to {MAX_ROWS} rows</span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          </div>
        )}

        {step === 'map' && (
          <div className="mt-5">
            <p className="text-sm">
              <span className="font-semibold">{fileName}</span>{' '}
              <span className="text-[color:var(--rd-on-paper-dim)]">
                · {dataRows.length} rows. Match the columns:
              </span>
            </p>
            <div className="mt-4 grid gap-3">
              {mapSelect('Email column', 'email', true)}
              <div className="grid grid-cols-2 gap-3">
                {mapSelect('First name', 'firstName')}
                {mapSelect('Last name', 'lastName')}
              </div>
              {map.firstName === -1 && map.lastName === -1 && mapSelect('Full name (will be split)', 'fullName')}
              {mapSelect('Phone', 'phone')}
              <label className="flex items-center gap-2 text-xs text-[color:var(--rd-on-paper-dim)]">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="h-4 w-4 accent-[color:var(--rd-moss)]"
                />
                First row is column names (don&rsquo;t import it)
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setStep('file')} className="btn-luxe btn-luxe-outline btn-luxe-sm">
                Back
              </button>
              <button
                type="button"
                disabled={map.email === -1}
                onClick={() => {
                  if (mappedRows.length === 0) {
                    setError('No usable rows found with that mapping.');
                    return;
                  }
                  if (mappedRows.length > MAX_ROWS) {
                    setError(`That file has ${mappedRows.length} rows — the limit is ${MAX_ROWS} per import. Split it.`);
                    return;
                  }
                  setError('');
                  setStep('preview');
                }}
                className="btn-luxe btn-luxe-gold btn-luxe-sm disabled:opacity-50"
              >
                Preview import
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="mt-5">
            <p className="text-sm">
              Ready to import <span className="font-semibold">{mappedRows.length}</span> rows. First{' '}
              {Math.min(5, mappedRows.length)} shown:
            </p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-[color:var(--rd-ink)]/12 bg-white">
              <table className="w-full text-left text-xs [font-family:var(--font-mono)]">
                <thead>
                  <tr className="border-b border-[color:var(--rd-ink)]/10 bg-[color:var(--rd-paper)]/60 uppercase text-[color:var(--rd-on-paper-dim)]">
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">First</th>
                    <th className="px-3 py-2 font-medium">Last</th>
                    <th className="px-3 py-2 font-medium">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-[color:var(--rd-ink)]/6 last:border-0">
                      <td className="max-w-[180px] truncate px-3 py-2">{row.email || '—'}</td>
                      <td className="px-3 py-2">{row.firstName || '—'}</td>
                      <td className="px-3 py-2">{row.lastName || '—'}</td>
                      <td className="whitespace-nowrap px-3 py-2">{row.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <label className="mt-4 grid gap-1 text-xs text-[color:var(--rd-on-paper-dim)]">
              Tag these subscribers as
              <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
                {SOURCE_OPTIONS.map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 flex items-start gap-2 rounded-xl border border-[color:var(--rd-ink)]/15 bg-white/70 px-3 py-2.5 text-xs">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--rd-moss)]"
              />
              <span>
                These people gave Raindrops Greenery permission to email them. (Importing contacts
                without consent violates Mailchimp&rsquo;s terms and anti-spam law.)
              </span>
            </label>

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setStep('map')} className="btn-luxe btn-luxe-outline btn-luxe-sm">
                Back
              </button>
              <button
                type="button"
                disabled={!consent}
                onClick={() => void runImport()}
                className="btn-luxe btn-luxe-gold btn-luxe-sm disabled:opacity-50"
              >
                Import {mappedRows.length} subscribers
              </button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="mt-8 flex flex-col items-center gap-3 pb-6 text-sm text-[color:var(--rd-on-paper-dim)]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--rd-moss)] border-t-transparent" />
            Importing {mappedRows.length} rows into Mailchimp…
          </div>
        )}

        {step === 'done' && result && (
          <div className="mt-5">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl border border-[color:var(--rd-moss)]/30 bg-[color:var(--rd-mint)]/40 p-3">
                <p className="text-2xl font-semibold tabular-nums [font-family:var(--font-display)]">{result.added.length}</p>
                <p className="text-[11px] uppercase tracking-wide text-[color:var(--rd-moss)] [font-family:var(--font-mono)]">Added</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--rd-amber)]/40 bg-[color:var(--rd-amber)]/15 p-3">
                <p className="text-2xl font-semibold tabular-nums [font-family:var(--font-display)]">{result.existed.length}</p>
                <p className="text-[11px] uppercase tracking-wide text-[#7a4a14] [font-family:var(--font-mono)]">Already in</p>
              </div>
              <div className="rounded-2xl border border-[#7a2e1d]/25 bg-[#7a2e1d]/8 p-3">
                <p className="text-2xl font-semibold tabular-nums [font-family:var(--font-display)]">{result.errors.length}</p>
                <p className="text-[11px] uppercase tracking-wide text-[#7a2e1d] [font-family:var(--font-mono)]">Skipped</p>
              </div>
            </div>

            {result.existed.length > 0 && (
              <details className="mt-3 rounded-xl border border-[color:var(--rd-ink)]/12 bg-white/70 px-3 py-2 text-xs">
                <summary className="cursor-pointer font-semibold">
                  Already on the list ({result.existed.length}) — not changed
                </summary>
                <ul className="mt-2 max-h-36 overflow-y-auto [font-family:var(--font-mono)]">
                  {result.existed.map((email) => (
                    <li key={email} className="truncate py-0.5">
                      {email}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {result.errors.length > 0 && (
              <details className="mt-2 rounded-xl border border-[#7a2e1d]/20 bg-[#7a2e1d]/5 px-3 py-2 text-xs" open>
                <summary className="cursor-pointer font-semibold text-[#7a2e1d]">
                  Skipped rows ({result.errors.length})
                </summary>
                <ul className="mt-2 max-h-36 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <li key={`${e.email}-${i}`} className="py-0.5">
                      <span className="[font-family:var(--font-mono)]">{e.email}</span>{' '}
                      <span className="text-[color:var(--rd-on-paper-dim)]">— {e.reason}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <button type="button" onClick={() => onClose(true)} className="btn-luxe btn-luxe-gold mt-5 w-full justify-center">
              <Check className="h-4 w-4" />
              Done — refresh the list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
