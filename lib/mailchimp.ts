import { createHash } from 'node:crypto';

/**
 * Server-only Mailchimp client for the owners' dashboard.
 *
 * Mailchimp IS the database here — no separate store. Gift tracking lives on
 * the contact itself so it's also visible inside Mailchimp:
 *   - tag `gift-given`        → the boolean (returned in the list payload)
 *   - merge field GIFTDATE    → when (tags carry no timestamp)
 *   - member note             → append-only audit trail (write-only for us)
 *
 * Uses the same raw-fetch + basic-auth approach as app/api/subscribe/route.ts
 * and the same env vars (MAILCHIMP_API_KEY / _SERVER_PREFIX / _AUDIENCE_ID).
 * PII rule: never log emails or phone numbers — status + title only.
 */

export const GIFT_TAG = 'gift-given';
const GIFTDATE_TAG = 'GIFTDATE';

export type SubscriberStatus =
  | 'subscribed'
  | 'unsubscribed'
  | 'cleaned'
  | 'pending'
  | 'transactional';

export type Subscriber = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: SubscriberStatus;
  /** Source tags ("website-footer", "age-gate-welcome", …) minus the gift tag. */
  tags: string[];
  giftGiven: boolean;
  /** YYYY-MM-DD (ET) when the gift was marked, from the GIFTDATE merge field. */
  giftDate: string | null;
  /** Best-known signup time (ISO) — opt-in time, falling back for admin adds. */
  signupAt: string;
};

/** Error whose message is safe to show to the (authenticated) dashboard user. */
export class SafeError extends Error {}

type RawMember = {
  id: string;
  email_address: string;
  status: SubscriberStatus;
  merge_fields?: Record<string, unknown>;
  tags?: { id: number; name: string }[];
  timestamp_opt?: string;
  timestamp_signup?: string;
  last_changed?: string;
};

const MEMBER_FIELDS = [
  'id',
  'email_address',
  'status',
  'merge_fields',
  'tags',
  'timestamp_opt',
  'timestamp_signup',
  'last_changed'
];

function getConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  if (!apiKey || !serverPrefix || !audienceId) {
    console.error('[dashboard] Mailchimp env vars missing — check Vercel Project Settings.');
    throw new SafeError('Mailchimp is not configured. Check the environment variables.');
  }
  return { apiKey, serverPrefix, audienceId };
}

async function mcFetch(path: string, init?: RequestInit): Promise<Response> {
  const { apiKey, serverPrefix } = getConfig();
  const auth = `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`;
  return fetch(`https://${serverPrefix}.api.mailchimp.com/3.0${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });
}

export function subscriberHash(email: string): string {
  return createHash('md5').update(email.trim().toLowerCase()).digest('hex');
}

export function normalizePhone(raw: string): string | null {
  // Same normalization as app/api/subscribe/route.ts so dashboard-added
  // numbers match the format already stored on the PHONE merge field.
  const digits = raw.replace(/\D+/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length >= 7) return digits;
  return null;
}

/** YYYY-MM-DD in America/New_York — "today" must mean the store's today. */
function todayET(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
}

function nowETLabel(): string {
  const stamp = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date());
  return `${stamp} ET`;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function mapMember(raw: RawMember): Subscriber {
  const merge = raw.merge_fields ?? {};
  const tagNames = (raw.tags ?? []).map((t) => t.name);
  return {
    id: raw.id,
    email: raw.email_address,
    firstName: asString(merge.FNAME),
    lastName: asString(merge.LNAME),
    phone: asString(merge.PHONE),
    status: raw.status,
    tags: tagNames.filter((name) => name !== GIFT_TAG),
    giftGiven: tagNames.includes(GIFT_TAG),
    giftDate: asString(merge[GIFTDATE_TAG]) || null,
    // Admin/import-added members often have no opt-in timestamp.
    signupAt: raw.timestamp_opt || raw.timestamp_signup || raw.last_changed || ''
  };
}

async function readError(res: Response): Promise<{ title: string; detail: string }> {
  try {
    const data = (await res.json()) as { title?: string; detail?: string };
    return { title: data.title ?? '', detail: data.detail ?? '' };
  } catch {
    return { title: '', detail: '' };
  }
}

/**
 * Fetch the ENTIRE audience, all statuses. Unsubscribed/cleaned members are
 * included on purpose: the fraud check must catch someone who received a
 * gift, unsubscribed, and re-subscribed later. (Mailchimp *archived* contacts
 * are not returned by this API — owners shouldn't archive contacts.)
 */
export async function getAllMembers(): Promise<Subscriber[]> {
  const { audienceId } = getConfig();
  const pageSize = 1000;
  const maxPages = 30; // 30k members — far beyond a local list, guards runaway loops
  const members: Subscriber[] = [];

  for (let page = 0; page < maxPages; page += 1) {
    const fields = ['total_items', ...MEMBER_FIELDS.map((f) => `members.${f}`)].join(',');
    const res = await mcFetch(
      `/lists/${audienceId}/members?count=${pageSize}&offset=${page * pageSize}&fields=${fields}`
    );
    if (!res.ok) {
      const { title } = await readError(res);
      console.error('[dashboard] Mailchimp members fetch failed', res.status, title);
      throw new SafeError('Could not load subscribers from Mailchimp. Try refreshing.');
    }
    const data = (await res.json()) as { total_items: number; members: RawMember[] };
    members.push(...data.members.map(mapMember));
    if (members.length >= data.total_items || data.members.length === 0) break;
  }

  return members;
}

// ---------------------------------------------------------------------------
// Gift marking
// ---------------------------------------------------------------------------

// The GIFTDATE merge field is created lazily so the owners never have to
// touch Mailchimp settings. Cached per server instance; reset on failure so a
// transient error doesn't poison every later request.
let giftFieldReady: Promise<void> | null = null;

export function ensureGiftDateField(): Promise<void> {
  if (!giftFieldReady) {
    giftFieldReady = (async () => {
      const { audienceId } = getConfig();
      const res = await mcFetch(
        `/lists/${audienceId}/merge-fields?count=60&fields=merge_fields.tag`
      );
      if (!res.ok) {
        const { title } = await readError(res);
        console.error('[dashboard] merge-fields fetch failed', res.status, title);
        throw new SafeError('Could not reach Mailchimp. Try again.');
      }
      const data = (await res.json()) as { merge_fields: { tag: string }[] };
      if (data.merge_fields.some((f) => f.tag === GIFTDATE_TAG)) return;

      const create = await mcFetch(`/lists/${audienceId}/merge-fields`, {
        method: 'POST',
        body: JSON.stringify({
          name: 'Gift Given Date',
          type: 'text',
          tag: GIFTDATE_TAG,
          required: false,
          public: false
        })
      });
      // A concurrent request may have created it first — that's success too.
      if (!create.ok && create.status !== 400) {
        const { title } = await readError(create);
        console.error('[dashboard] GIFTDATE field create failed', create.status, title);
        throw new SafeError('Could not prepare the gift-date field in Mailchimp.');
      }
    })().catch((err) => {
      giftFieldReady = null;
      throw err;
    });
  }
  return giftFieldReady;
}

export async function setGiftStatus(
  email: string,
  given: boolean
): Promise<{ giftGiven: boolean; giftDate: string | null }> {
  const { audienceId } = getConfig();
  const hash = subscriberHash(email);
  const date = given ? todayET() : '';

  await ensureGiftDateField();

  const tagRes = await mcFetch(`/lists/${audienceId}/members/${hash}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tags: [{ name: GIFT_TAG, status: given ? 'active' : 'inactive' }] })
  });
  if (!tagRes.ok) {
    const { title } = await readError(tagRes);
    console.error('[dashboard] gift tag update failed', tagRes.status, title);
    throw new SafeError(
      tagRes.status === 404
        ? 'That subscriber no longer exists in Mailchimp. Refresh the list.'
        : 'Could not update the gift status in Mailchimp. Try again.'
    );
  }

  const patchRes = await mcFetch(`/lists/${audienceId}/members/${hash}`, {
    method: 'PATCH',
    body: JSON.stringify({ merge_fields: { [GIFTDATE_TAG]: date } })
  });
  if (!patchRes.ok) {
    const { title } = await readError(patchRes);
    // Tag (the source of truth) already updated — log, keep going.
    console.error('[dashboard] GIFTDATE update failed', patchRes.status, title);
  }

  // Audit note on the contact profile — nice to have, never fails the request.
  const noteRes = await mcFetch(`/lists/${audienceId}/members/${hash}/notes`, {
    method: 'POST',
    body: JSON.stringify({
      note: `Free gift marked ${given ? 'GIVEN' : 'REMOVED'} via dashboard — ${nowETLabel()}`
    })
  });
  if (!noteRes.ok) {
    console.error('[dashboard] gift audit note failed', noteRes.status);
  }

  return { giftGiven: given, giftDate: given ? date : null };
}

// ---------------------------------------------------------------------------
// Adding subscribers
// ---------------------------------------------------------------------------

export type NewSubscriberInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

function buildMergeFields(input: NewSubscriberInput): Record<string, string> {
  // Only send fields we actually have so we never overwrite stored data
  // with empty strings (same rule as the public subscribe endpoint).
  const merge: Record<string, string> = {};
  if (input.firstName?.trim()) merge.FNAME = input.firstName.trim();
  if (input.lastName?.trim()) merge.LNAME = input.lastName.trim();
  const phone = input.phone?.trim() ? normalizePhone(input.phone) : null;
  if (phone) merge.PHONE = phone;
  return merge;
}

/**
 * Add one subscriber. Unlike the public endpoint, an existing member is
 * REPORTED (with their gift status) instead of masked — behind auth this is
 * exactly the duplicate check the owners need.
 */
export async function addMember(
  input: NewSubscriberInput & { source: string }
): Promise<{ existed: boolean; member: Subscriber }> {
  const { audienceId } = getConfig();
  const email = input.email.trim().toLowerCase();
  const merge = buildMergeFields(input);

  const res = await mcFetch(`/lists/${audienceId}/members`, {
    method: 'POST',
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
      tags: [input.source],
      ...(Object.keys(merge).length > 0 ? { merge_fields: merge } : {})
    })
  });

  if (res.ok) {
    return { existed: false, member: mapMember((await res.json()) as RawMember) };
  }

  const { title, detail } = await readError(res);

  if (title === 'Member Exists') {
    const hash = subscriberHash(email);
    const lookup = await mcFetch(
      `/lists/${audienceId}/members/${hash}?fields=${MEMBER_FIELDS.join(',')}`
    );
    if (!lookup.ok) {
      console.error('[dashboard] existing-member lookup failed', lookup.status);
      throw new SafeError('That email is already on the list, but loading it failed. Refresh.');
    }
    return { existed: true, member: mapMember((await lookup.json()) as RawMember) };
  }

  if (title === 'Forgotten Email Not Subscribed') {
    throw new SafeError(
      'This contact was permanently deleted from Mailchimp and can only re-join through the website signup form.'
    );
  }

  if (title === 'Invalid Resource' && /look(s)? fake or invalid/i.test(detail)) {
    throw new SafeError('Mailchimp rejected that email address as fake or invalid.');
  }

  console.error('[dashboard] add member failed', res.status, title);
  throw new SafeError('Mailchimp could not add that subscriber. Try again.');
}

// ---------------------------------------------------------------------------
// Bulk import
// ---------------------------------------------------------------------------

export type ImportResult = {
  added: string[];
  existed: string[];
  errors: { email: string; reason: string }[];
};

type BatchResponse = {
  new_members: { email_address: string }[];
  updated_members: { email_address: string }[];
  errors: { email_address: string; error: string; error_code?: string }[];
};

/**
 * Bulk-add via Mailchimp's batch list endpoint (max 500/call). With
 * `update_existing: false`, already-on-the-list emails come back as
 * ERROR_CONTACT_EXISTS — exactly the duplicate report the import UI shows.
 */
export async function batchAddMembers(
  rows: NewSubscriberInput[],
  source: string
): Promise<ImportResult> {
  const { audienceId } = getConfig();
  const result: ImportResult = { added: [], existed: [], errors: [] };

  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const res = await mcFetch(`/lists/${audienceId}`, {
      method: 'POST',
      body: JSON.stringify({
        members: chunk.map((row) => {
          const merge = buildMergeFields(row);
          return {
            email_address: row.email.trim().toLowerCase(),
            status: 'subscribed',
            tags: [source],
            ...(Object.keys(merge).length > 0 ? { merge_fields: merge } : {})
          };
        }),
        update_existing: false
      })
    });

    if (!res.ok) {
      const { title } = await readError(res);
      console.error('[dashboard] batch import chunk failed', res.status, title);
      throw new SafeError(
        i === 0
          ? 'Mailchimp rejected the import. Check the file and try again.'
          : `Import stopped partway: ${result.added.length} added before Mailchimp errored. Refresh and re-import the rest.`
      );
    }

    const data = (await res.json()) as BatchResponse;
    result.added.push(...data.new_members.map((m) => m.email_address));
    result.existed.push(...data.updated_members.map((m) => m.email_address));
    for (const err of data.errors) {
      if (err.error_code === 'ERROR_CONTACT_EXISTS') {
        result.existed.push(err.email_address);
      } else {
        result.errors.push({ email: err.email_address, reason: err.error });
      }
    }
  }

  return result;
}
