import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/dashboard-auth';
import { getAllMembers, SafeError } from '@/lib/mailchimp';

/**
 * GET → the full audience (all statuses) for the dashboard. The client holds
 * the list in state and does search/filter locally, so this is the one
 * heavyweight call — paginated fetches can take a few seconds on big lists.
 */

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    if (!(await requireSession(request))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const members = await getAllMembers();
    return NextResponse.json({
      ok: true,
      members,
      total: members.length,
      fetchedAt: new Date().toISOString()
    });
  } catch (err) {
    if (err instanceof SafeError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 502 });
    }
    console.error('[dashboard] members route error:', err);
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
