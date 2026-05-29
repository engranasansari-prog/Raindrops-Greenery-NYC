/**
 * Real keyword finder — Google Autocomplete scraper.
 * --------------------------------------------------------------------------
 * Pulls the ACTUAL search suggestions Google shows as people type (the same
 * real-query data the paid tools resell). Free, no API key, no account.
 *
 * USAGE (from the project folder):
 *   node scripts/keyword-finder.mjs            # fast: seeds + modifiers
 *   node scripts/keyword-finder.mjs --deep     # thorough: also a–z expansion
 *
 * Output:
 *   • prints the deduped, filtered keyword list to the screen
 *   • writes keywords.csv (open in Excel/Sheets) next to where you run it
 *
 * What it GIVES you:   real keywords people actually search.
 * What it does NOT do:  exact monthly search volumes — for those, paste this
 *   list into Google Keyword Planner (free with any Google account).
 * --------------------------------------------------------------------------
 */

import { writeFileSync } from 'node:fs';

// ── Seed terms — edit these to match the business ────────────────────────
const SEEDS = [
  'weed delivery nyc',
  'cannabis delivery nyc',
  'weed delivery manhattan',
  'same day weed delivery nyc',
  'tax free weed nyc',
  'weed delivery near me',
  'weed delivery brooklyn',
  'weed delivery queens',
  'weed delivery williamsburg',
  'weed delivery greenpoint',
  'weed delivery long island city',
  'edibles delivery nyc',
  'pre rolls delivery nyc',
  'shinnecock cannabis',
  'best weed delivery nyc'
];

// Modifiers appended to every seed to surface more real variants.
const MODIFIERS = ['', ' near me', ' open now', ' cheap', ' best', ' legal', ' same day', ' tax free'];

// Only keep suggestions actually relevant to a cannabis-delivery business.
const RELEVANT = /(weed|cannabis|marijuana|dispensary|edible|gummies|gummy|pre[\s-]?roll|delivery|thc|flower|strain|sativa|indica)/i;
// Drop obvious noise (jobs, news, licensing-cost research, etc.).
const BLOCK = /(job|jobs|salary|hiring|stock|news|arrest|study|license cost|how to get a|medical card)/i;

const DEEP = process.argv.includes('--deep');
const LETTERS = DEEP ? ['', ...'abcdefghijklmnopqrstuvwxyz'.split('')] : [''];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function suggest(query) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = JSON.parse(await res.text());
    return Array.isArray(data?.[1]) ? data[1] : [];
  } catch {
    return []; // network blocked / rate-limited → skip this query
  }
}

const found = new Set();
let queries = 0;

for (const seed of SEEDS) {
  for (const mod of MODIFIERS) {
    for (const letter of LETTERS) {
      const q = `${seed}${mod}${letter ? ' ' + letter : ''}`.trim();
      for (const s of await suggest(q)) {
        const k = String(s).toLowerCase().trim();
        if (RELEVANT.test(k) && !BLOCK.test(k)) found.add(k);
      }
      queries++;
      await sleep(120); // be polite to the endpoint
    }
  }
  process.stderr.write(`  ✓ ${seed} — ${found.size} keywords so far\n`);
}

const list = [...found].sort();
console.log('\n=== REAL KEYWORD SUGGESTIONS (Google Autocomplete) ===\n');
console.log(list.join('\n'));
console.log(`\nTotal: ${list.length} real keywords from ${queries} queries.`);
console.log('Next step: paste these into Google Keyword Planner (free) for search volumes.');

writeFileSync('keywords.csv', 'keyword\n' + list.map((k) => `"${k.replace(/"/g, '""')}"`).join('\n'));
process.stderr.write('\nSaved → keywords.csv\n');
