/**
 * Dashboard session tokens — shared by proxy.ts (edge-safe) and the
 * /api/dashboard/* routes (node). Everything here uses Web Crypto
 * (globalThis.crypto.subtle) so the same module runs in both runtimes.
 *
 * Token format: "{expiryEpochMs}.{hmacSha256Hex}" where the HMAC is computed
 * over "rd-dash-v1:{expiryEpochMs}" with a secret from DASHBOARD_SESSION_SECRET,
 * falling back to a hash derived from DASHBOARD_PASSWORD — so rotating the
 * password also invalidates every existing session.
 */

export const SESSION_COOKIE = 'rd_dash';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const TOKEN_PREFIX = 'rd-dash-v1:';

const encoder = new TextEncoder();

// Module-level cache — the key material never changes within a deployment.
let keyPromise: Promise<CryptoKey | null> | null = null;

async function getKey(): Promise<CryptoKey | null> {
  if (!keyPromise) {
    keyPromise = (async () => {
      const explicit = process.env.DASHBOARD_SESSION_SECRET;
      const password = process.env.DASHBOARD_PASSWORD;
      if (!explicit && !password) return null;

      // Without an explicit secret, derive one from the password so there is
      // exactly one env var the owners must set.
      const material = explicit
        ? encoder.encode(explicit)
        : await crypto.subtle.digest('SHA-256', encoder.encode(`rd-dash-secret-v1:${password}`));

      return crypto.subtle.importKey('raw', material, { name: 'HMAC', hash: 'SHA-256' }, false, [
        'sign'
      ]);
    })();
  }
  return keyPromise;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Constant-time comparison — String#=== short-circuits on the first mismatch.
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function signExpiry(exp: number): Promise<string | null> {
  const key = await getKey();
  if (!key) return null;
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(`${TOKEN_PREFIX}${exp}`));
  return toHex(sig);
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = await signExpiry(exp);
  if (!sig) throw new Error('Dashboard auth is not configured (DASHBOARD_PASSWORD missing).');
  return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const expRaw = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d{10,16}$/.test(expRaw) || !/^[0-9a-f]{64}$/.test(sig)) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;
  const expected = await signExpiry(exp);
  if (!expected) return false;
  return timingSafeEqualHex(sig, expected);
}

/**
 * Defense-in-depth session check for the API routes — the proxy already gates
 * /api/dashboard/*, but every route re-verifies so a matcher mistake can never
 * silently expose the subscriber list.
 */
export async function requireSession(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const pair = cookieHeader.split(/;\s*/).find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  const token = pair ? pair.slice(SESSION_COOKIE.length + 1) : '';
  return token ? verifySessionToken(token) : false;
}
