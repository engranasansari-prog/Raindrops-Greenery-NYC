import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_MS } from '@/lib/dashboard-auth';

/**
 * Dashboard login/logout.
 *
 * POST { password } → sets the rd_dash session cookie (30 days) on success.
 * DELETE            → clears the cookie (logout).
 *
 * The shared password lives in DASHBOARD_PASSWORD (Vercel env var). Stricter
 * rate limit than the public endpoints (5/min/IP) since this guards the full
 * subscriber list.
 */

export const runtime = 'nodejs';

const RL_WINDOW_MS = 60_000;
const RL_MAX = 5;
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

// Hash both sides so the comparison is constant-time regardless of length.
function passwordsMatch(input: string, expected: string): boolean {
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Too many attempts. Wait a minute and try again.' },
        { status: 429 }
      );
    }

    const expected = process.env.DASHBOARD_PASSWORD;
    if (!expected) {
      console.error('[dashboard] DASHBOARD_PASSWORD env var is not set.');
      return NextResponse.json(
        { ok: false, error: 'Dashboard login is not configured yet.' },
        { status: 503 }
      );
    }

    const body = (await request.json()) as { password?: unknown };
    const password = typeof body.password === 'string' ? body.password : '';

    if (!password || !passwordsMatch(password, expected)) {
      console.error('[dashboard] Failed login attempt from', ip);
      return NextResponse.json({ ok: false, error: 'Incorrect password.' }, { status: 401 });
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000)
    });
    return response;
  } catch (err) {
    console.error('[dashboard] Login error:', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });
  return response;
}
