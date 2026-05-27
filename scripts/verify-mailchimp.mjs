#!/usr/bin/env node
// Mailchimp credentials sanity check.
//
// Usage:
//   node --env-file=.env.local scripts/verify-mailchimp.mjs
// or with Vercel CLI:
//   vercel env pull .env.local
//   node --env-file=.env.local scripts/verify-mailchimp.mjs
//
// Exits 0 on ✅, 1 on ❌. Logs the list name + current member count so the
// owner can confirm they hit the right audience.

const apiKey = process.env.MAILCHIMP_API_KEY;
const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

if (!apiKey || !audienceId || !serverPrefix) {
  console.error('❌ Missing env vars. Need MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID, MAILCHIMP_SERVER_PREFIX.');
  console.error('   Check Vercel → Project Settings → Environment Variables, or your .env.local.');
  process.exit(1);
}

const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}`;
const auth = `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`;

try {
  const res = await fetch(url, { headers: { Authorization: auth } });
  const body = await res.json();
  if (res.ok) {
    console.log(`✅ Mailchimp connected.`);
    console.log(`   List name:    ${body.name}`);
    console.log(`   Audience ID:  ${body.id}`);
    console.log(`   Members:      ${body.stats?.member_count ?? '?'}`);
    process.exit(0);
  } else {
    console.error('❌ Mailchimp auth failed.');
    console.error('   Status:', res.status);
    console.error('   Detail:', body.detail || body.title || JSON.stringify(body));
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Network error reaching Mailchimp:', err.message || err);
  process.exit(1);
}
