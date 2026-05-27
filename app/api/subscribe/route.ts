import { NextResponse } from 'next/server';

/**
 * Mailchimp subscribe endpoint — V6 §9.3 (extended V8 round 4).
 *
 * POST { email: string, phone?: string, source?: string }
 *   → { ok, message? } | { ok: false, error }
 *
 * Reads creds from Vercel env vars only (MAILCHIMP_API_KEY,
 * MAILCHIMP_AUDIENCE_ID, MAILCHIMP_SERVER_PREFIX). Returns a friendly
 * message when the email is already on the list, so the UI can show a
 * non-error state. Phone is optional — when present it's normalized to
 * the Mailchimp E.164 format and stored on the PHONE merge field.
 */

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(raw: string): string | null {
  // Mailchimp's PHONE merge field accepts US numbers as "(NNN) NNN-NNNN" or
  // E.164. We strip non-digits and re-pretty as US format if 10 or 11 digits.
  const digits = raw.replace(/\D+/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  // Other formats — return the digits raw so Mailchimp can decide.
  if (digits.length >= 7) return digits;
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      phone?: unknown;
      source?: unknown;
    };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phoneRaw = typeof body.phone === 'string' ? body.phone.trim() : '';
    const source = typeof body.source === 'string' ? body.source : 'website-footer';

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email is required.' }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const phone = phoneRaw ? normalizePhone(phoneRaw) : null;

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

    // Merge field PHONE is on the Mailchimp default audience; only send it
    // when we actually have a number so we don't overwrite stored data with
    // an empty string.
    const mergeFields: Record<string, string> = {};
    if (phone) mergeFields.PHONE = phone;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        tags: source ? [source] : ['website-footer'],
        ...(Object.keys(mergeFields).length > 0 ? { merge_fields: mergeFields } : {})
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
