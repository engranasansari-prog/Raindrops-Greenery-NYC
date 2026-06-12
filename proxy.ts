import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/dashboard-auth';

/**
 * Auth wall for the owners' subscribers dashboard. Everything under
 * /dashboard and /api/dashboard requires a valid signed session cookie —
 * pages redirect to the login screen, API calls get a 401. The only
 * pass-through is /api/dashboard/login itself (it checks the password and
 * issues/clears the cookie).
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/api/dashboard/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value ?? '';
  const authed = token ? await verifySessionToken(token) : false;

  if (pathname === '/dashboard/login') {
    return authed
      ? NextResponse.redirect(new URL('/dashboard', request.url))
      : withNoindex(NextResponse.next());
  }

  if (!authed) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/dashboard/login', request.url));
  }

  return withNoindex(NextResponse.next());
}

// Belt-and-braces noindex: pages also set robots metadata, and robots.txt
// disallows /dashboard — but the header covers any response shape.
function withNoindex(response: NextResponse) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/dashboard/:path*']
};
