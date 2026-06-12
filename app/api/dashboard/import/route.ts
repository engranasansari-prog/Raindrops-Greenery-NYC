import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/dashboard-auth';
import { batchAddMembers, SafeError, type NewSubscriberInput } from '@/lib/mailchimp';

/**
 * POST { rows: [{email, firstName?, lastName?, phone?}], source } → bulk
 * import (CSV upload). Rows are validated and de-duplicated within the file
 * first, then sent to Mailchimp's batch endpoint. Existing members are
 * reported, not updated. Consent is confirmed in the UI before upload.
 */

export const runtime = 'nodejs';
export const maxDuration = 60;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ROWS = 5000;

type RawRow = {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
};

export async function POST(request: Request) {
  try {
    if (!(await requireSession(request))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { rows?: unknown; source?: unknown };
    if (!Array.isArray(body.rows) || body.rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'No rows to import.' }, { status: 400 });
    }
    if (body.rows.length > MAX_ROWS) {
      return NextResponse.json(
        { ok: false, error: `Too many rows — the limit is ${MAX_ROWS} per import. Split the file.` },
        { status: 400 }
      );
    }

    const source =
      typeof body.source === 'string' && body.source.trim() ? body.source.trim() : 'gmail-import';

    const seen = new Set<string>();
    const rows: NewSubscriberInput[] = [];
    const errors: { email: string; reason: string }[] = [];

    for (const raw of body.rows as RawRow[]) {
      const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
      if (!EMAIL_REGEX.test(email)) {
        errors.push({ email: email || '(empty)', reason: 'Invalid email address' });
        continue;
      }
      if (seen.has(email)) {
        errors.push({ email, reason: 'Duplicate row in this file (only sent once)' });
        continue;
      }
      seen.add(email);
      rows.push({
        email,
        firstName: typeof raw.firstName === 'string' ? raw.firstName : undefined,
        lastName: typeof raw.lastName === 'string' ? raw.lastName : undefined,
        phone: typeof raw.phone === 'string' ? raw.phone : undefined
      });
    }

    if (rows.length === 0) {
      return NextResponse.json({ ok: true, added: [], existed: [], errors });
    }

    const result = await batchAddMembers(rows, source);
    return NextResponse.json({
      ok: true,
      added: result.added,
      existed: result.existed,
      errors: [...errors, ...result.errors]
    });
  } catch (err) {
    if (err instanceof SafeError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 502 });
    }
    console.error('[dashboard] import route error:', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
