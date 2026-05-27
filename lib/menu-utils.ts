import type { LiveMenuProduct } from './live-menu-products.generated';

export const productCategories = ['Flower', 'Pre-Rolls', 'Edibles'] as const;

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export function formatPrice(cents: number) {
  return currency.format(cents / 100);
}

export function getBrandLabel(product: LiveMenuProduct) {
  const brand = product.brand.trim();
  if (!brand) return 'Raindrops Greenery';
  if (/raindrops?/i.test(brand)) return 'Raindrops Greenery';
  return brand
    .split(/\s+/)
    .map((word) => (word.length <= 2 ? word.toUpperCase() : `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`))
    .join(' ');
}

export function hasSale(product: LiveMenuProduct) {
  return product.salePrice < product.price || product.deals.length > 0;
}

export function getPrimaryPotency(product: LiveMenuProduct) {
  const thc = product.potencies.find((potency) => /thc/i.test(potency.name));
  return thc ? Number.parseFloat(thc.value) : 0;
}

export function getPotencyLabel(product: LiveMenuProduct) {
  return product.potencies
    .map((potency) => {
      const rawName = potency.name.trim();
      const compound = rawName.replace(/%|mg/gi, '').trim() || rawName;
      const label = compound.toUpperCase();
      const unit = /mg/i.test(rawName) ? 'mg' : '%';
      return unit === 'mg' ? `${label} ${potency.value} mg` : `${label} ${potency.value}%`;
    })
    .join(' / ');
}

export function inferProfile(product: LiveMenuProduct) {
  const value = `${product.species ?? ''} ${product.type ?? ''} ${product.name}`.toLowerCase();

  if (value.includes('sativa dom')) return 'Sativa dominant hybrid';
  if (value.includes('indica dom')) return 'Indica dominant hybrid';
  if (value.includes('hybrid')) return 'Hybrid';
  if (value.includes('sativa')) return 'Sativa';
  if (value.includes('indica')) return 'Indica';
  return 'Balanced';
}

const EFFECT_TAGS: Array<{ effect: string; profiles: string[]; categories?: string[] }> = [
  { effect: 'Energize', profiles: ['Sativa', 'Sativa dominant hybrid'] },
  { effect: 'Focus', profiles: ['Sativa', 'Sativa dominant hybrid', 'Hybrid'] },
  { effect: 'Uplift', profiles: ['Sativa', 'Hybrid', 'Sativa dominant hybrid'] },
  { effect: 'Relax', profiles: ['Indica', 'Indica dominant hybrid', 'Balanced'] },
  { effect: 'Sleep', profiles: ['Indica', 'Indica dominant hybrid'] },
  { effect: 'Social', profiles: ['Hybrid', 'Sativa dominant hybrid', 'Indica dominant hybrid'] }
];

export const effectOptions = EFFECT_TAGS.map((tag) => tag.effect);

export function inferEffects(product: LiveMenuProduct): string[] {
  const profile = inferProfile(product);
  const haystack = `${product.name} ${product.description} ${product.type ?? ''}`.toLowerCase();
  const matched = EFFECT_TAGS.filter((tag) => tag.profiles.includes(profile)).map((tag) => tag.effect);

  if (haystack.includes('sleep') || haystack.includes('night')) matched.push('Sleep');
  if (haystack.includes('focus') || haystack.includes('day')) matched.push('Focus');
  if (haystack.includes('energy') || haystack.includes('wake')) matched.push('Energize');
  if (haystack.includes('chill') || haystack.includes('relax')) matched.push('Relax');
  if (haystack.includes('social') || haystack.includes('party')) matched.push('Social');

  return Array.from(new Set(matched));
}

/**
 * Real product description if available, empty string otherwise.
 * V4 §6.2 — the AI-template fallback ("X is a flower item from ...") is dropped
 * because the card already shows category, profile, size, THC, and price.
 */
export function getProductDescription(product: LiveMenuProduct) {
  return product.description?.trim() ?? '';
}

export function getDealLabel(product: LiveMenuProduct) {
  const firstDeal = product.deals[0];
  if (firstDeal?.name) return firstDeal.name;
  if (product.salePrice < product.price) return `${formatPrice(product.price - product.salePrice)} off`;
  return null;
}

export function getAvailableBrands(products: LiveMenuProduct[]) {
  return Array.from(new Set(products.map(getBrandLabel))).sort((a, b) => a.localeCompare(b));
}

export function getAvailableWeights(products: LiveMenuProduct[]) {
  return Array.from(new Set(products.map((product) => product.weight).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
}

export function getAvailableProfiles(products: LiveMenuProduct[]) {
  return Array.from(new Set(products.map(inferProfile))).sort((a, b) => a.localeCompare(b));
}

export function getMaxPrice(products: LiveMenuProduct[]) {
  return Math.ceil(Math.max(...products.map((product) => product.salePrice), 0) / 100);
}

export function getMenuSearchText(product: LiveMenuProduct) {
  return [
    product.name,
    product.category,
    getBrandLabel(product),
    product.type,
    product.species,
    product.weight,
    inferProfile(product),
    getPotencyLabel(product),
    getProductDescription(product),
    product.deals.map((deal) => deal.name).join(' ')
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
