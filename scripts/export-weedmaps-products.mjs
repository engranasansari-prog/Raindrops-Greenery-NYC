import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'https://weedmaps.com/dispensaries/rain-drops-greenery-dispensary-cultivation';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';
const OUT_DIR = path.join(process.cwd(), 'exports');
const PAGE_SIZE = 24;
const DETAIL_CONCURRENCY = 5;
const WEBSITE_CATEGORIES = new Set(['Flower', 'Pre Roll', 'Infused Pre Roll', 'Edibles']);

function extractNextData(html) {
  const match = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error('Could not find __NEXT_DATA__ payload.');
  return JSON.parse(match[1]);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'text/html,application/xhtml+xml'
    }
  });

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} for ${url}`);
  }

  return response.text();
}

function findMenuQuery(nextData) {
  const queries = nextData.props?.dehydratedState?.queries ?? [];

  return queries.find((query) => {
    const key = JSON.stringify(query.queryKey);
    return key.includes('menu_items') && query.state?.data?.data?.menuItems?.length > 0;
  });
}

function findDetailQuery(nextData) {
  const queries = nextData.props?.dehydratedState?.queries ?? [];

  return queries.find((query) => {
    const key = JSON.stringify(query.queryKey);
    return key.includes('menu_items_core') && query.state?.data?.data?.length > 0;
  });
}

function cleanText(value) {
  if (!value) return '';
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  if (Number.isNaN(number)) return '';
  return number.toFixed(2);
}

function getMetric(item, code) {
  const cannabinoid = item.metrics?.cannabinoids?.find((metric) => metric.code?.toLowerCase() === code);
  const aggregateValue = item.metrics?.aggregates?.[code];
  const aggregateUnit = item.metrics?.aggregates?.[`${code}Unit`];

  if (cannabinoid) {
    return {
      value: cannabinoid.value,
      unit: cannabinoid.unit
    };
  }

  if (aggregateValue) {
    return {
      value: aggregateValue,
      unit: aggregateUnit ?? ''
    };
  }

  return {
    value: '',
    unit: ''
  };
}

function flattenPrices(item, detail) {
  const variants = detail?.attributes?.variants;
  if (Array.isArray(variants) && variants.length > 0) {
    return variants.map((variant) => ({
      label: variant.label ?? variant.name ?? '',
      price: variant.price?.amount ? Number(variant.price.amount) : null,
      currency: variant.price?.currency ?? 'USD',
      weightValue: variant.weight?.value ?? '',
      weightUnit: variant.weight?.unit ?? '',
      sku: variant.sku ?? '',
      inventoryQuantity: variant.inventoryQuantity ?? '',
      complianceNetMg: variant.complianceNetMg ?? ''
    }));
  }

  const groupedPrices = [];
  for (const [unit, prices] of Object.entries(item.prices ?? {})) {
    if (!Array.isArray(prices)) continue;
    for (const price of prices) {
      groupedPrices.push({
        label: price.label ?? unit,
        price: price.price ?? null,
        currency: 'USD',
        weightValue: price.weight?.value ?? '',
        weightUnit: price.weight?.unit ?? '',
        sku: '',
        inventoryQuantity: '',
        complianceNetMg: ''
      });
    }
  }

  if (groupedPrices.length > 0) return groupedPrices;

  return [
    {
      label: item.price?.label ?? '',
      price: item.price?.price ?? null,
      currency: 'USD',
      weightValue: '',
      weightUnit: '',
      sku: '',
      inventoryQuantity: '',
      complianceNetMg: ''
    }
  ];
}

function normalizeProduct(item, detail) {
  const attributes = detail?.attributes ?? {};
  const thc = getMetric(item, 'thc');
  const cbd = getMetric(item, 'cbd');
  const cbn = getMetric(item, 'cbn');
  const cbg = getMetric(item, 'cbg');
  const variants = flattenPrices(item, detail);
  const prices = variants.map((variant) => variant.price).filter((price) => typeof price === 'number');
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const primaryVariant = variants[0] ?? {};
  const image =
    attributes.originalPictureUrl ??
    attributes.pictureUrl ??
    item.avatarImage?.originalUrl ??
    item.avatarImage?.largeUrl ??
    '';
  const productPath = detail?.links?.self ?? `/dispensaries/rain-drops-greenery-dispensary-cultivation/menu/${item.slug}`;

  return {
    id: String(item.id),
    name: attributes.name ?? item.name ?? '',
    slug: attributes.slug ?? item.slug ?? '',
    category: attributes.categoryName ?? item.edgeCategory?.name ?? '',
    categorySlug: item.edgeCategory?.slug ?? attributes.parentCategory?.slug ?? '',
    strainType: item.category?.name ?? '',
    brand: attributes.brandName ?? '',
    description: cleanText(attributes.body),
    image,
    productUrl: new URL(productPath, 'https://weedmaps.com').toString(),
    source: 'Weedmaps public live menu',
    licenseType: attributes.licenseType ?? item.licenseType ?? '',
    onlineOrderable: attributes.onlineOrderable ?? item.isOnlineOrderable ?? '',
    basePrice: formatMoney(item.price?.price ?? minPrice),
    originalPrice: formatMoney(item.price?.originalPrice),
    minPrice: formatMoney(minPrice),
    maxPrice: formatMoney(maxPrice),
    priceLabel: item.price?.label ?? primaryVariant.label ?? '',
    onSale: item.price?.onSale ?? Boolean(attributes.sale),
    saleLabel: item.price?.discountLabel ?? item.currentDealTitle ?? attributes.sale?.title ?? '',
    thcValue: thc.value,
    thcUnit: thc.unit,
    cbdValue: cbd.value,
    cbdUnit: cbd.unit,
    cbnValue: cbn.value,
    cbnUnit: cbn.unit,
    cbgValue: cbg.value,
    cbgUnit: cbg.unit,
    measurements: attributes.measurements ?? item.metrics?.cannabinoids ?? [],
    variants,
    externalIds: item.externalIds ?? {},
    sku: attributes.sku ?? primaryVariant.sku ?? '',
    inventoryQuantity: attributes.inventoryQuantity ?? primaryVariant.inventoryQuantity ?? '',
    createdAt: attributes.createdAt ?? item.createdAt ?? '',
    updatedAt: attributes.updatedAt ?? item.updatedAt ?? '',
    rawListItem: item,
    rawDetailItem: detail ?? null
  };
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
    'Variant SKU',
    'Variant Price',
    'Variant Inventory Qty',
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
        'Variant SKU': variant.sku || product.sku || '',
        'Variant Price': formatMoney(variant.price ?? product.basePrice),
        'Variant Inventory Qty': variant.inventoryQuantity ?? product.inventoryQuantity ?? '',
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

async function fetchMenuPage(page) {
  const url = page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`;
  const html = await fetchText(url);
  const nextData = extractNextData(html);
  const query = findMenuQuery(nextData);
  if (!query) throw new Error(`Could not find menu query on page ${page}`);

  return {
    page,
    url,
    meta: query.state.data.meta,
    items: query.state.data.data.menuItems
  };
}

async function fetchDetail(item) {
  const url = `${BASE_URL}/menu/${item.slug}`;

  try {
    const html = await fetchText(url);
    const nextData = extractNextData(html);
    const query = findDetailQuery(nextData);
    return query?.state?.data?.data?.[0] ?? null;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error)
    };
  }
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

await fs.mkdir(OUT_DIR, { recursive: true });

const firstPage = await fetchMenuPage(1);
const total = firstPage.meta.totalMenuItems;
const pageCount = Math.ceil(total / PAGE_SIZE);
const pages = [firstPage];

for (let page = 2; page <= pageCount; page += 1) {
  pages.push(await fetchMenuPage(page));
  console.log(`Fetched menu page ${page}/${pageCount}`);
}

const allItems = pages.flatMap((page) => page.items);
const uniqueItems = Array.from(new Map(allItems.map((item) => [item.id, item])).values());

console.log(`Fetching detail pages for ${uniqueItems.length} products...`);
const details = await mapWithConcurrency(uniqueItems, DETAIL_CONCURRENCY, async (item, index) => {
  const detail = await fetchDetail(item);
  if ((index + 1) % 25 === 0 || index + 1 === uniqueItems.length) {
    console.log(`Fetched details ${index + 1}/${uniqueItems.length}`);
  }
  return detail;
});

const products = uniqueItems.map((item, index) => normalizeProduct(item, details[index]));
const websiteProducts = products.filter((product) => WEBSITE_CATEGORIES.has(product.category));
const scrapedAt = new Date().toISOString();
const sourceMeta = {
  source: 'Weedmaps public live menu fallback',
  requestedDutchieUrl: 'https://dutchie.com/stores/raindrops-greenery-retail',
  sourceUrl: BASE_URL,
  scrapedAt,
  menuUpdatedAt: firstPage.meta.updatedAt,
  totalFromSource: total,
  exportedCount: products.length,
  categories: countCategories(products)
};
const websiteMeta = {
  ...sourceMeta,
  exportPurpose: 'Website menu subset: Flower, Pre Roll, Infused Pre Roll, and Edibles only',
  exportedCount: websiteProducts.length,
  categories: countCategories(websiteProducts)
};

const columns = [
  'id',
  'name',
  'category',
  'categorySlug',
  'strainType',
  'brand',
  'description',
  'image',
  'productUrl',
  'licenseType',
  'onlineOrderable',
  'basePrice',
  'originalPrice',
  'minPrice',
  'maxPrice',
  'priceLabel',
  'onSale',
  'saleLabel',
  'thcValue',
  'thcUnit',
  'cbdValue',
  'cbdUnit',
  'cbnValue',
  'cbnUnit',
  'cbgValue',
  'cbgUnit',
  'measurements',
  'variants',
  'externalIds',
  'sku',
  'inventoryQuantity',
  'createdAt',
  'updatedAt',
  'source'
];

await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-products-public-menu-full.json'),
  `${JSON.stringify({ meta: sourceMeta, products }, null, 2)}\n`
);
await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-products-public-menu.csv'),
  `${toCsv(products, columns)}\n`
);
await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-products-public-menu-shopify.csv'),
  `${toShopifyCsv(products)}\n`
);
await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-products-public-menu-summary.json'),
  `${JSON.stringify(sourceMeta, null, 2)}\n`
);
await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-products-website-menu-full.json'),
  `${JSON.stringify({ meta: websiteMeta, products: websiteProducts }, null, 2)}\n`
);
await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-products-website-menu.csv'),
  `${toCsv(websiteProducts, columns)}\n`
);
await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-products-website-menu-shopify.csv'),
  `${toShopifyCsv(websiteProducts)}\n`
);
await fs.writeFile(
  path.join(OUT_DIR, 'raindrops-products-website-menu-summary.json'),
  `${JSON.stringify(websiteMeta, null, 2)}\n`
);

console.log(JSON.stringify(sourceMeta, null, 2));
console.log(JSON.stringify(websiteMeta, null, 2));
