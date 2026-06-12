/**
 * Client-safe formatting helpers shared by the dashboard components.
 * Everything date-related is computed in America/New_York — Vercel runs in
 * UTC and the owners' "today" is the store's today, not the server's.
 */

const ET_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' });
const ET_DATE_LABEL = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

/** YYYY-MM-DD (ET) for an ISO timestamp; '' when unparseable. */
export function etDayKey(iso: string | Date): string {
  const d = iso instanceof Date ? iso : new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : ET_DAY.format(d);
}

export function todayET(): string {
  return ET_DAY.format(new Date());
}

/** "Jun 12, 2026" (ET) for an ISO timestamp or a YYYY-MM-DD gift date. */
export function formatDay(value: string): string {
  if (!value) return '—';
  // GIFTDATE is a plain YYYY-MM-DD — parse as a date, not a UTC instant,
  // otherwise it renders one day early in the evening ET.
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const d = ymd
    ? new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]), 12)
    : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return ymd
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
    : ET_DATE_LABEL.format(d);
}

/** Last 10 digits — makes "(212) 555-0100" match "1-212-555-0100". */
export function phoneKey(raw: string): string {
  const digits = raw.replace(/\D+/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function displayName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}
