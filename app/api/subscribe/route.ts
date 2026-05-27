import { NextResponse } from 'next/server';

/**
 * Mailchimp subscribe endpoint — V6 §9.3.
 *
 * POST { email: string, source?: string } → { ok, message? } | { ok: false, error }
 *
 * Reads creds from Vercel env vars only (MAILCHIMP_API_KEY,
 * MAILCHIMP_AUDIENCE_ID, MAILCHIMP_SERVER_PREFIX). Returns a friendly
 * message when the email is already on the list, so the UI can show a
 * non-error state.
 */

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; source?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const source = typeof body.source === 'string' ? body.source : 'website-footer';

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email is required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

    if (!apiKey || !audienceId || !serverPrefix) {
      console.error('[subscribe] Mailchimp env vars missing — check Vercel Project Settings.');
      return NextResponse.json(
        { ok: false, error: 'Subscription temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    const endpoint = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`;
    const auth = `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        tags: source ? [source] : ['website-footer']
      })
    });

    const data = (await res.json()) as { title?: string; detail?: string };

    if (!res.ok) {
      if (data.title === 'Member Exists') {
        return NextResponse.json({ ok: true, message: "You’re already on the list — see you in the inbox." });
      }
      console.error('[subscribe] Mailchimp returned', res.status, data);
      return NextResponse.json(
        { ok: false, error: data.detail ?? 'Something went wrong. Please try again.' },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true, message: "You’re in. Drops incoming." });
  } catch (err) {
    console.error('[subscribe] Unhandled error:', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
