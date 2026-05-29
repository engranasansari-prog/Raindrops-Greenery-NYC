import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'exports');

const keywords = [
  'tax free weed nyc',
  'tax free weed delivery nyc',
  'shinnecock cannabis',
  'shinnecock cannabis dispensary',
  'free weed delivery nyc',
  'weed delivery nyc',
  'cannabis delivery nyc',
  'same day weed delivery nyc',
  'same day cannabis delivery nyc',
  'weed delivery manhattan',
  'best weed delivery nyc',
  'best weed delivery manhattan',
  'cheap weed delivery nyc',
  'cheapest weed delivery nyc',
  'weed delivery app nyc',
  'online weed delivery nyc',
  'weed delivery service nyc',
  'weed delivery midtown manhattan',
  'weed delivery nyc east village',
  'weed delivery nyc upper east side',
  'weed delivery nyc upper west side',
  'weed delivery fidi nyc',
  'weed delivery williamsburg',
  'weed delivery greenpoint',
  'weed delivery long island city',
  'edibles delivery nyc',
  'weed edibles delivery nyc',
  'thc gummies nyc',
  'thc gummies nyc delivery',
  'pre rolls nyc',
  'pre rolls online delivery nyc',
  'weed strains nyc',
  'weed delivery nyc 24/7',
  '24 hour weed delivery manhattan',
  'late night weed delivery nyc',
  'weed delivery near me'
];

const publishedVolumes = new Map([
  ['weed delivery near me', 12100],
  ['weed delivery nyc', 2400],
  ['cannabis delivery nyc', 210]
]);

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function intent(keyword) {
  if (/near me|delivery|online|app|same day|24|late night|free|cheap|cheapest|best/i.test(keyword)) return 'Transactional / local';
  if (/shinnecock|tax free/i.test(keyword)) return 'Differentiator / trust';
  if (/strains|gummies|pre rolls|edibles/i.test(keyword)) return 'Product intent';
  return 'General';
}

function demandTier(keyword, suggestionCount, publishedVolume) {
  if (publishedVolume >= 10000) return 'Very high';
  if (publishedVolume >= 1000) return 'High';
  if (publishedVolume >= 200) return 'Medium';
  if (suggestionCount >= 7) return 'Medium';
  if (suggestionCount >= 3) return /manhattan|same day|online|app|edibles|thc gummies/i.test(keyword) ? 'Medium' : 'Low-medium';
  if (suggestionCount >= 1) return 'Low-medium';
  return suggestionCount ? 'Low-medium' : 'Low';
}

async function getSuggestions(keyword) {
  const url = new URL('https://suggestqueries.google.com/complete/search');
  url.searchParams.set('client', 'firefox');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('gl', 'us');
  url.searchParams.set('q', keyword);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0'
      }
    });

    if (response.ok) {
      const payload = await response.json();
      return payload[1] ?? [];
    }

    await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
  }

  return [];
}

await fs.mkdir(OUT_DIR, { recursive: true });

const rows = [];
for (const keyword of keywords) {
  const suggestions = await getSuggestions(keyword);
  const publishedVolume = publishedVolumes.get(keyword) ?? null;
  rows.push({
    keyword,
    intent: intent(keyword),
    publishedVolume,
    demandTier: demandTier(keyword, suggestions.length, publishedVolume ?? 0),
    autocompleteSuggestionCount: suggestions.length,
    topSuggestions: suggestions.slice(0, 10),
    exactAutocomplete: suggestions.some((suggestion) => suggestion.toLowerCase() === keyword.toLowerCase())
  });

  await new Promise((resolve) => setTimeout(resolve, 350));
}

const columns = [
  'keyword',
  'intent',
  'publishedVolume',
  'demandTier',
  'autocompleteSuggestionCount',
  'exactAutocomplete',
  'topSuggestions'
];

await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-keyword-autocomplete-insights.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2)}\n`
);

await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-keyword-autocomplete-insights.csv'),
  [
    columns.map(csvEscape).join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(','))
  ].join('\n') + '\n'
);

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2));
