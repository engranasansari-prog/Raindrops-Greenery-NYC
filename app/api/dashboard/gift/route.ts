import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/dashboard-auth';
import { SafeError, setGiftStatus } from '@/lib/mailchimp';

/**
 * POST { email, given } → mark/unmark the one-time free gift for a subscriber.
 * Writes the `gift-given` tag + GIFTDATE merge field + an audit note in
 * Mailchimp (see lib/mailchimp.ts).
 */

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    if (!(await requireSession(request))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { email?: unknown; given?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const given = body.given === true;

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email.' }, { status: 400 });
    }

    const { giftGiven, giftDate } = await setGiftStatus(email, given);
    return NextResponse.json({ ok: true, giftGiven, giftDate });
  } catch (err) {
    if (err instanceof SafeError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 502 });
    }
    console.error('[dashboard] gift route error:', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
