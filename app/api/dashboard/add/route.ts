import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/dashboard-auth';
import { addMember, SafeError } from '@/lib/mailchimp';

/**
 * POST { email, firstName?, lastName?, phone?, source } → add one subscriber.
 * If the email is already on the list this returns { existed: true } with the
 * existing member (incl. gift status) — that's the duplicate/fraud check, and
 * it's safe to reveal here because the route is behind the owner login.
 */

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    if (!(await requireSession(request))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      email?: unknown;
      firstName?: unknown;
      lastName?: unknown;
      phone?: unknown;
      source?: unknown;
    };

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const source =
      typeof body.source === 'string' && body.source.trim() ? body.source.trim() : 'dashboard-add';

    const { existed, member } = await addMember({
      email,
      firstName: typeof body.firstName === 'string' ? body.firstName : undefined,
      lastName: typeof body.lastName === 'string' ? body.lastName : undefined,
      phone: typeof body.phone === 'string' ? body.phone : undefined,
      source
    });

    return NextResponse.json({ ok: true, existed, member });
  } catch (err) {
    if (err instanceof SafeError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 502 });
    }
    console.error('[dashboard] add route error:', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
