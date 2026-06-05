import { NextResponse } from 'next/server';

/**
 * Mailchimp subscribe endpoint — V6 §9.3 (extended V8 round 4).
 *
 * POST { email: string, phone?: string, source?: string }
 *   → { ok, message? } | { ok: false, error }
 *
 * Reads creds from Vercel env vars only (MAILCHIMP_API_KEY,
 * MAILCHIMP_AUDIENCE_ID, MAILCHIMP_SERVER_PREFIX). Returns a UNIFORM success
 * response whether the email is new or already subscribed, so the endpoint
 * never leaks list membership (no enumeration oracle). Phone is optional — when
 * present it's normalized to the Mailchimp E.164 format and stored on the PHONE
 * merge field. Abuse protection: per-IP rate limit (mirrors /api/chat) plus a
 * hidden honeypot field that silently no-ops bot submissions.
 */

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lightweight in-memory rate limit (per IP, per minute) — mirrors the limiter
// in app/api/chat/route.ts so a single abuser can't hammer the Mailchimp API or
// use this endpoint as an email-enumeration / spam-signup oracle. NOTE:
// in-memory state is per-serverless instance and resets on cold start — a first
// line of defense, not a global limiter. Move to Vercel KV / Upstash for a
// global limit if traffic ever warrants it.
const RL_WINDOW_MS = 60_000;
const RL_MAX = 8;
const rlHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rlHits.get(ip) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  recent.push(now);
  rlHits.set(ip, recent);
  if (rlHits.size > 5000) {
    for (const [key, times] of rlHits) {
      if (times.every((t) => now - t >= RL_WINDOW_MS)) rlHits.delete(key);
    }
  }
  return recent.length > RL_MAX;
}

// Uniform success message — returned whether the email is newly subscribed OR
// already on the list, so the endpoint never leaks list membership.
const SUCCESS_MESSAGE = "You’re in. Drops incoming.";

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
    // Throttle per IP so this endpoint can't be hammered for spam signups or
    // used as an enumeration oracle. Same approach as app/api/chat/route.ts.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      email?: unknown;
      phone?: unknown;
      source?: unknown;
      company?: unknown;
      website?: unknown;
    };

    // Honeypot: real users never fill these hidden fields. If a bot does, we
    // silently return success without subscribing — no signal that it was caught.
    const honeypot =
      (typeof body.company === 'string' && body.company.trim()) ||
      (typeof body.website === 'string' && body.website.trim());
    if (honeypot) {
      return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
    }

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
      // Already subscribed → return the SAME success response as a new signup so
      // the endpoint can't be used to enumerate which emails are on the list.
      if (data.title === 'Member Exists') {
        return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
      }
      // Never surface Mailchimp's raw `detail` to the client (it can leak
      // internal/PII context). Log it server-side; return a generic message.
      console.error('[subscribe] Mailchimp returned', res.status, data);
      return NextResponse.json(
        { ok: false, error: 'Something went wrong. Please try again.' },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
  } catch (err) {
    console.error('[subscribe] Unhandled error:', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
