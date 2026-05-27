import fs from 'node:fs/promises';
import path from 'node:path';

const SCRAPER_API_KEY = process.env.SCRAPERAPI_KEY;
const STORE_SLUG = 'raindrops-greenery-retail';
const STORE_URL = `https://dutchie.com/stores/${STORE_SLUG}`;
const OUT_DIR = path.join(process.cwd(), 'exports');
const CACHE_DIR = path.join(OUT_DIR, 'dutchie-render-cache');
const CONCURRENCY = 4;

const CATEGORIES = [
  { slug: 'flower', label: 'Flower' },
  { slug: 'edibles', label: 'Edibles' },
  { slug: 'pre-rolls', label: 'Pre-Rolls' }
];

if (!SCRAPER_API_KEY) {
  throw new Error('Missing SCRAPERAPI_KEY environment variable.');
}

function scraperApiUrl(targetUrl) {
  const url = new URL('https://api.scraperapi.com/');
  url.searchParams.set('api_key', SCRAPER_API_KEY);
  url.searchParams.set('url', targetUrl);
  url.searchParams.set('country_code', 'us');
  url.searchParams.set('render', 'true');
  url.searchParams.set('wait', '10000');
  return url.toString();
}

function decodeHtml(value = '') {
  const entities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"'
  };

  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (_, entity) => entities[entity] ?? `&${entity};`);
}

function stripTags(value = '') {
  return decodeHtml(String(value).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanDescription(value = '') {
  return decodeHtml(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(String(value).replace(/[$,]/g, ''));
  if (Number.isNaN(number)) return '';
  return number.toFixed(2);
}

function priceNumber(value) {
  const formatted = formatMoney(value);
  return formatted ? Number(formatted) : null;
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows, columns) {
  return [
    columns.map(csvEscape).join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(','))
  ].join('\n');
}

function slugFromUrl(url) {
  return url.split('/').filter(Boolean).at(-1) ?? '';
}

function cacheName(url) {
  return `${url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/-+$/g, '')}.html`;
}

async function fetchRendered(url, options = {}) {
  const cachePath = path.join(CACHE_DIR, cacheName(url));
  if (options.useCache) {
    try {
      return await fs.readFile(cachePath, 'utf8');
    } catch {
      // Fall through and fetch when the cache has no page yet.
    }
  }

  const response = await fetch(scraperApiUrl(url), {
    headers: {
      accept: 'text/html,application/xhtml+xml'
    }
  });

  if (!response.ok) {
    throw new Error(`ScraperAPI fetch failed ${response.status} for ${url}`);
  }

  const html = await response.text();
  if (html.includes('Just a moment') || html.includes('cf-mitigated')) {
    throw new Error(`Dutchie returned a challenge page for ${url}`);
  }

  await fs.writeFile(cachePath, html);
  return html;
}

function parseTitle(html) {
  return stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
}

function parseMeta(html, name) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
  return decodeHtml(html.match(pattern)?.[1] ?? '');
}

function parseCanonical(html) {
  return decodeHtml(html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? '');
}

function parseJsonLdProduct(html) {
  const scripts = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(decodeHtml(script[1]));
      if (parsed?.['@type'] === 'Product') return parsed;
      if (Array.isArray(parsed?.['@graph'])) {
        const product = parsed['@graph'].find((item) => item?.['@type'] === 'Product');
        if (product) return product;
      }
    } catch {
      // Ignore non-product JSON-LD blocks.
    }
  }
  return null;
}

function parseOptions(html) {
  const optionsSection = html.match(/data-testid=["']options-list["'][\s\S]*?<\/div><\/div><\/div>/i)?.[0] ?? html;
  const buttons = [...optionsSection.matchAll(/<button[^>]+data-testid=["']option-tile["'][^>]*>([\s\S]*?)<\/button>/gi)];

  return buttons
    .map((button) => {
      const raw = button[1];
      const price = raw.match(/<b[^>]*>([\s\S]*?)<\/b>/i)?.[1] ?? '';
      const label = stripTags(raw.replace(/<b[^>]*>[\s\S]*?<\/b>/i, ''));
      return {
        label,
        price: formatMoney(price),
        currency: 'USD'
      };
    })
    .filter((option) => option.label || option.price);
}

function parseInfoChips(html) {
  const chips = [...html.matchAll(/<span[^>]+data-testid=["']info-chip["'][^>]*>([\s\S]*?)<\/span>/gi)]
    .map((match) => stripTags(match[1]))
    .filter(Boolean);

  return Array.from(new Set(chips));
}

function parseCannabinoids(chips) {
  const cannabinoids = {};

  for (const chip of chips) {
    const match = chip.match(/\b(THC|CBD|CBG|CBN):\s*([\d.]+)\s*(%|mg)?/i);
    if (!match) continue;
    cannabinoids[match[1].toLowerCase()] = {
      value: match[2],
      unit: match[3] ?? ''
    };
  }

  return cannabinoids;
}

function parseRichDescription(html) {
  const wrapper = html.match(/data-testid=["']rich-text-wrapper["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)?.[1] ?? '';
  return cleanDescription(wrapper);
}

function parseDetailPage(html, discovered) {
  const jsonLd = parseJsonLdProduct(html);
  const chips = parseInfoChips(html);
  const cannabinoids = parseCannabinoids(chips);
  const offerPrice = priceNumber(jsonLd?.offers?.price);
  const parsedOptions = parseOptions(html);
  const options = parsedOptions.length
    ? parsedOptions
    : offerPrice !== null
      ? [{ label: 'Default', price: formatMoney(offerPrice), currency: jsonLd?.offers?.priceCurrency ?? 'USD' }]
      : [];
  const prices = options.map((option) => priceNumber(option.price)).filter((value) => typeof value === 'number');
  const allPrices = [...prices, offerPrice].filter((value) => typeof value === 'number');
  const minPrice = allPrices.length ? Math.min(...allPrices) : null;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : null;
  const productUrl = `${STORE_URL}/product/${discovered.slug}`;
  const canonical = parseCanonical(html);
  const description = cleanDescription(jsonLd?.description ?? '') || parseRichDescription(html);

  return {
    id: discovered.slug,
    slug: discovered.slug,
    name: jsonLd?.name ?? discovered.name ?? '',
    category: discovered.category,
    categorySlug: discovered.categorySlug,
    brand: jsonLd?.brand?.name ?? discovered.brand ?? '',
    strainType: chips.find((chip) => !chip.includes(':')) ?? discovered.strainType ?? '',
    description,
    image: jsonLd?.image ?? discovered.image ?? parseMeta(html, 'image'),
    productUrl,
    canonicalUrl: canonical,
    source: 'Dutchie public storefront',
    dutchieStoreUrl: STORE_URL,
    availability: jsonLd?.offers?.availability ?? '',
    basePrice: formatMoney(minPrice),
    minPrice: formatMoney(minPrice),
    maxPrice: formatMoney(maxPrice),
    offerPrice: formatMoney(jsonLd?.offers?.price),
    currency: jsonLd?.offers?.priceCurrency ?? 'USD',
    priceLabel: options[0]?.label ?? '',
    variants: options,
    tags: chips,
    thcValue: cannabinoids.thc?.value ?? '',
    thcUnit: cannabinoids.thc?.unit ?? '',
    cbdValue: cannabinoids.cbd?.value ?? '',
    cbdUnit: cannabinoids.cbd?.unit ?? '',
    cbgValue: cannabinoids.cbg?.value ?? '',
    cbgUnit: cannabinoids.cbg?.unit ?? '',
    cbnValue: cannabinoids.cbn?.value ?? '',
    cbnUnit: cannabinoids.cbn?.unit ?? '',
    metaTitle: parseTitle(html),
    metaDescription: parseMeta(html, 'description') || parseMeta(html, 'og:description'),
    storeAddress: jsonLd?.offers?.availableAtOrFrom?.address ?? null
  };
}

function parseCategoryPage(html, category) {
  const hrefs = Array.from(new Set(
    [...html.matchAll(/href=["'](\/stores\/raindrops-greenery-retail\/product\/[^"']+)["']/gi)]
      .map((match) => match[1])
  ));

  return hrefs.map((href) => {
    const slug = slugFromUrl(href);
    const hrefIndex = html.indexOf(href);
    const section = hrefIndex >= 0 ? html.slice(Math.max(0, hrefIndex - 1500), hrefIndex + 5000) : '';
    const image = decodeHtml(section.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? '');
    const name =
      stripTags(section.match(/full-card-view__Name[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? '') ||
      decodeHtml(section.match(/alt=["']Image of ([^"']+) product["']/i)?.[1] ?? '');
    const brand = stripTags(section.match(/full-card-view__Brand[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? '');
    const strainType = stripTags(section.match(/full-card-view__Strain[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? '');
    const potencyBlock = stripTags(section.match(/full-card-view__Potency[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)?.[1] ?? '');
    const variants = [...section.matchAll(/<button[^>]+data-testid=["']option-tile["'][^>]*>([\s\S]*?)<\/button>/gi)]
      .map((match) => {
        const raw = match[1];
        const price = raw.match(/<b[^>]*>([\s\S]*?)<\/b>/i)?.[1] ?? '';
        const label = stripTags(raw.replace(/<b[^>]*>[\s\S]*?<\/b>/i, ''));
        return {
          label,
          price: formatMoney(price),
          currency: 'USD'
        };
      })
      .filter((variant) => variant.label || variant.price);

    return {
      slug,
      name,
      category: category.label,
      categorySlug: category.slug,
      brand,
      strainType,
      potencyBlock,
      image,
      productUrl: href ? new URL(href, 'https://dutchie.com').toString() : '',
      variants
    };
  }).filter((product) => product.slug && product.productUrl);
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

function toShopifyCsv(products) {
  const columns = [
    'Handle',
    'Title',
    'Body (HTML)',
    'Vendor',
    'Product Category',
    'Type',
    'Tags',
    'Published',
    'Option1 Name',
    'Option1 Value',
    'Variant Price',
    'Image Src',
    'Image Alt Text',
    'Status'
  ];

  const rows = [];
  for (const product of products) {
    const variants = product.variants.length ? product.variants : [{ label: product.priceLabel, price: product.basePrice }];
    variants.forEach((variant, index) => {
      rows.push({
        'Handle': product.slug,
        'Title': index === 0 ? product.name : '',
        'Body (HTML)': index === 0 ? product.description : '',
        'Vendor': product.brand || 'Raindrops Greenery',
        'Product Category': '',
        'Type': product.category,
        'Tags': [product.category, product.strainType, product.thcValue ? `THC ${product.thcValue}${product.thcUnit}` : ''].filter(Boolean).join(', '),
        'Published': 'TRUE',
        'Option1 Name': 'Size',
        'Option1 Value': variant.label || product.priceLabel || 'Default',
        'Variant Price': formatMoney(variant.price ?? product.basePrice),
        'Image Src': index === 0 ? product.image : '',
        'Image Alt Text': index === 0 ? product.name : '',
        'Status': 'active'
      });
    });
  }

  return toCsv(rows, columns);
}

function countCategories(products) {
  return products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] ?? 0) + 1;
    return acc;
  }, {});
}

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.mkdir(CACHE_DIR, { recursive: true });

const categoryProducts = [];
for (const category of CATEGORIES) {
  const url = `${STORE_URL}/products/${category.slug}`;
  const html = await fetchRendered(url);
  const products = parseCategoryPage(html, category);
  console.log(`Fetched ${products.length} ${category.label} products`);
  categoryProducts.push(...products);
}

const discoveredProducts = Array.from(
  categoryProducts.reduce((map, product) => {
    const existing = map.get(product.slug);
    if (!existing) {
      map.set(product.slug, product);
      return map;
    }

    existing.category = Array.from(new Set([existing.category, product.category])).join(', ');
    return map;
  }, new Map()).values()
);

console.log(`Fetching ${discoveredProducts.length} Dutchie product detail pages...`);
const detailProducts = await mapWithConcurrency(discoveredProducts, CONCURRENCY, async (product, index) => {
  const html = await fetchRendered(product.productUrl, { useCache: true });
  const parsed = parseDetailPage(html, product);
  console.log(`Fetched detail ${index + 1}/${discoveredProducts.length}: ${parsed.name}`);
  return parsed;
});

const scrapedAt = new Date().toISOString();
const meta = {
  source: 'Dutchie public storefront',
  sourceUrl: STORE_URL,
  scrapedAt,
  exportedCount: detailProducts.length,
  categories: countCategories(detailProducts),
  notes: [
    'Fetched from Dutchie storefront category and product pages using ScraperAPI rendering.',
    'Only public Dutchie product details visible on the storefront are included.',
    'No ScraperAPI key is saved in this export or script.'
  ]
};

const columns = [
  'id',
  'name',
  'category',
  'categorySlug',
  'brand',
  'strainType',
  'description',
  'image',
  'productUrl',
  'canonicalUrl',
  'availability',
  'basePrice',
  'minPrice',
  'maxPrice',
  'offerPrice',
  'currency',
  'priceLabel',
  'variants',
  'tags',
  'thcValue',
  'thcUnit',
  'cbdValue',
  'cbdUnit',
  'cbgValue',
  'cbgUnit',
  'cbnValue',
  'cbnUnit',
  'metaTitle',
  'metaDescription',
  'storeAddress',
  'source'
];

await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-dutchie-products-full.json'),
  `${JSON.stringify({ meta, products: detailProducts }, null, 2)}\n`
);
await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-dutchie-products.csv'),
  `${toCsv(detailProducts, columns)}\n`
);
await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-dutchie-products-shopify.csv'),
  `${toShopifyCsv(detailProducts)}\n`
);
await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-dutchie-products-summary.json'),
  `${JSON.stringify(meta, null, 2)}\n`
);

console.log(JSON.stringify(meta, null, 2));
