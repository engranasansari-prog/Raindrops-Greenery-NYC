'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BadgePercent, Check, Filter, PackageCheck, RotateCcw, Search, Share2, SlidersHorizontal, Sparkles, Tag, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { menuCounts, menuProducts, type LiveMenuProduct } from '@/lib/menu';
import {
  effectOptions,
  formatPrice,
  getAvailableBrands,
  getAvailableProfiles,
  getAvailableWeights,
  getBrandLabel,
  getDealLabel,
  getMaxPrice,
  getMenuSearchText,
  getPotencyLabel,
  getPrimaryPotency,
  getProductDescription,
  getStrainTag,
  hasSale,
  inferEffects,
  inferProfile,
  isSticky,
  productCategories,
  type StrainTag
} from '@/lib/menu-utils';

// Brand-aligned per-strain palette (mirrors HomePage DealsSection).
const STRAIN_BADGE: Record<StrainTag, string> = {
  INDICA: 'bg-[color:var(--rd-rain)]/15 text-[color:var(--rd-moss)] border-[color:var(--rd-rain)]/40',
  SATIVA: 'bg-[color:var(--rd-glow)]/22 text-[color:var(--rd-moss)] border-[color:var(--rd-moss)]/35',
  HYBRID: 'bg-[color:var(--rd-amber)]/22 text-[color:var(--rd-amber-dark)] border-[color:var(--rd-amber)]/40',
  BALANCED: 'bg-[color:var(--rd-mint)]/40 text-[color:var(--rd-moss)] border-[color:var(--rd-moss)]/35'
};
import { checkout } from '@/lib/site-data';

type CategoryFilter = 'All' | LiveMenuProduct['category'];
type SortMode = 'featured' | 'price-low' | 'price-high' | 'potency-high' | 'name';

const maxAvailablePrice = getMaxPrice(menuProducts);
const brands = getAvailableBrands(menuProducts);
const weights = getAvailableWeights(menuProducts);
const profiles = getAvailableProfiles(menuProducts);
const totalProducts = menuProducts.length;

const sortLabels: Record<SortMode, string> = {
  featured: 'Featured',
  'price-low': 'Price low to high',
  'price-high': 'Price high to low',
  'potency-high': 'THC high to low',
  name: 'Name A to Z'
};

function normalizeCategory(category?: string): CategoryFilter {
  if (productCategories.includes(category as LiveMenuProduct['category'])) return category as LiveMenuProduct['category'];
  return 'All';
}

function ProductImage({ product }: { product: LiveMenuProduct }) {
  // Image-less products are filtered out upstream in lib/menu.ts. Image is always
  // present here; the non-null assertion keeps types tight.
  return (
    <Image
      src={product.image!}
      alt={product.name}
      fill
      unoptimized
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-contain p-5 transition duration-500 group-hover:scale-105"
    />
  );
}

function ProductCard({ product, onDetails }: { product: LiveMenuProduct; onDetails: (product: LiveMenuProduct) => void }) {
  const potency = getPotencyLabel(product);
  const deal = getDealLabel(product);
  const strain = getStrainTag(product);
  const sticky = isSticky(product);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/70 bg-white/82 shadow-[0_18px_54px_rgba(25,35,20,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_86px_rgba(25,35,20,0.14)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#fbf7ee]">
        <ProductImage product={product} />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur [font-family:var(--font-mono)] ${STRAIN_BADGE[strain]}`}>
            {strain}
          </span>
          {sticky && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--rd-ink)] shadow-sm [font-family:var(--font-mono)]">
              ✦ STICKY
            </span>
          )}
        </div>
        {deal && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--rd-ink)] shadow-sm [font-family:var(--font-mono)]">
            <BadgePercent className="h-3 w-3" />
            Deal
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">{getBrandLabel(product)}</p>
            <h2 className="mt-2 font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--emerald-deep)]">{product.name}</h2>
          </div>
          <div className="shrink-0 text-right">
            {product.salePrice < product.price && <p className="text-xs font-bold text-[var(--muted)] line-through">{formatPrice(product.price)}</p>}
            <p className="font-[var(--font-display)] text-3xl font-bold text-[var(--emerald)]">{formatPrice(product.salePrice)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.weight && <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-bold text-[var(--emerald-deep)]">{product.weight}</span>}
          <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-bold text-[var(--emerald-deep)]">{inferProfile(product)}</span>
          {potency && <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-bold text-[var(--emerald-deep)]">{potency}</span>}
        </div>

        {getProductDescription(product) && (
          <p className="product-description-clamp mt-4 text-sm leading-7 text-[var(--muted)]">{getProductDescription(product)}</p>
        )}

        {deal && (
          <div className="mt-4 rounded-lg border border-[rgba(217,183,111,0.45)] bg-[rgba(217,183,111,0.12)] p-3">
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--champagne-dark)]">
              <Tag className="h-4 w-4" />
              {deal}
            </p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <button onClick={() => onDetails(product)} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--emerald-deep)] transition hover:border-[var(--champagne)]">
            Details
          </button>
          <Link href={checkout.dutchieUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--emerald)]">
            Order
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function ProductDetailDialog({ product, onClose }: { product: LiveMenuProduct; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const potency = getPotencyLabel(product);
  const effects = inferEffects(product);
  const detailRows = [
    ['Category', product.category],
    ['Brand', getBrandLabel(product)],
    ['Profile', inferProfile(product)],
    ['Size', product.weight ?? 'Confirm at checkout'],
    ['Potency', potency || 'Confirm at checkout'],
    ['Availability', product.quantity > 0 ? 'Available in menu' : 'Confirm at checkout']
  ];

  const sharePath = typeof window !== 'undefined'
    ? `${window.location.origin}/menu?product=${encodeURIComponent(product.id)}`
    : `/menu?product=${product.id}`;

  const share = async () => {
    try {
      if (typeof navigator !== 'undefined' && (navigator as Navigator & { share?: unknown }).share) {
        await (navigator as Navigator & { share: (data: { title: string; url: string; text?: string }) => Promise<void> }).share({
          title: product.name,
          text: `Check out ${product.name} on Raindrops Greenery NY`,
          url: sharePath
        });
        return;
      }
      await navigator.clipboard.writeText(sharePath);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore — user cancelled share sheet or clipboard not available.
    }
  };

  return (
    <motion.div className="fixed inset-0 z-[90] flex items-stretch justify-center bg-[#06130f]/82 p-0 backdrop-blur-lg sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }} className="max-h-[100dvh] w-full max-w-5xl overflow-y-auto bg-[#fffaf0] shadow-2xl sm:max-h-[92vh] sm:rounded-lg">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative h-[240px] bg-white sm:h-[320px] lg:h-auto lg:min-h-[360px]">
            <ProductImage product={product} />
          </div>
          <div className="p-5 sm:p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne-dark)]">{product.category}</p>
                <h2 className="mt-2 font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--emerald-deep)] sm:text-3xl md:text-4xl">{product.name}</h2>
              </div>
              <button onClick={onClose} className="rounded-full border border-[var(--line)] bg-white p-3 text-[var(--emerald-deep)] transition hover:border-[var(--champagne)]" aria-label="Close product details">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-end gap-3 sm:mt-5">
              {product.salePrice < product.price && <p className="pb-1 text-sm font-bold text-[var(--muted)] line-through">{formatPrice(product.price)}</p>}
              <p className="font-[var(--font-display)] text-3xl font-bold text-[var(--emerald)] sm:text-4xl">{formatPrice(product.salePrice)}</p>
            </div>

            {getProductDescription(product) && (
              <p className="mt-5 leading-8 text-[var(--muted)]">{getProductDescription(product)}</p>
            )}

            {effects.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">Reported effects</span>
                {effects.map((effect) => (
                  <span key={effect} className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-bold text-[var(--emerald-deep)]">
                    <Sparkles className="h-3 w-3 text-[var(--champagne)]" />
                    {effect}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {detailRows.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[var(--line)] bg-white/72 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">{label}</p>
                  <p className="mt-1 font-bold text-[var(--emerald-deep)]">{value}</p>
                </div>
              ))}
            </div>


            {product.deals.length > 0 && (
              <div className="mt-6 rounded-lg border border-[rgba(217,183,111,0.48)] bg-[rgba(217,183,111,0.14)] p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">Active deal</p>
                <p className="mt-2 font-bold text-[var(--emerald-deep)]">{product.deals[0].name}</p>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <OrderButton label="Order now" />
              <button onClick={share} className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--emerald-deep)] transition hover:border-[var(--champagne)]">
                <Share2 className="h-4 w-4" />
                {copied ? 'Link copied' : 'Share'}
              </button>
              <button onClick={onClose} className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--emerald-deep)] transition hover:border-[var(--champagne)]">
                Keep browsing
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-lg border border-[var(--line)] bg-white px-3 text-sm font-bold text-[var(--emerald-deep)] outline-none transition focus:border-[var(--champagne)]">
        {children}
      </select>
    </label>
  );
}

export default function MenuExplorer({ initialCategory, initialProductId, initialDealsOnly, initialEffect }: { initialCategory?: string; initialProductId?: string; initialDealsOnly?: boolean; initialEffect?: string }) {
  const [category, setCategory] = useState<CategoryFilter>(normalizeCategory(initialCategory));
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('All');
  const [profile, setProfile] = useState('All');
  const [weight, setWeight] = useState('All');
  const [effect, setEffect] = useState(initialEffect && effectOptions.includes(initialEffect) ? initialEffect : 'All');
  const [sort, setSort] = useState<SortMode>('featured');
  const [dealsOnly, setDealsOnly] = useState(Boolean(initialDealsOnly));
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMax, setPriceMax] = useState(maxAvailablePrice);
  const [minThc, setMinThc] = useState(0);
  const [visibleCount, setVisibleCount] = useState(18);
  const [selectedProduct, setSelectedProduct] = useState<LiveMenuProduct | null>(() => {
    if (!initialProductId) return null;
    return menuProducts.find((product) => product.id === initialProductId) ?? null;
  });

  // Keep ?product= in the URL in sync with the open modal so individual items are shareable.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (selectedProduct) {
      url.searchParams.set('product', selectedProduct.id);
    } else {
      url.searchParams.delete('product');
    }
    window.history.replaceState(null, '', url.toString());
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return menuProducts
      .filter((product) => category === 'All' || product.category === category)
      .filter((product) => brand === 'All' || getBrandLabel(product) === brand)
      .filter((product) => profile === 'All' || inferProfile(product) === profile)
      .filter((product) => weight === 'All' || product.weight === weight)
      .filter((product) => effect === 'All' || inferEffects(product).includes(effect))
      .filter((product) => !dealsOnly || hasSale(product))
      .filter((product) => !inStockOnly || product.quantity > 0)
      .filter((product) => product.salePrice / 100 <= priceMax)
      .filter((product) => getPrimaryPotency(product) >= minThc)
      .filter((product) => !normalizedQuery || getMenuSearchText(product).includes(normalizedQuery))
      .sort((a, b) => {
        if (sort === 'price-low') return a.salePrice - b.salePrice;
        if (sort === 'price-high') return b.salePrice - a.salePrice;
        if (sort === 'potency-high') return getPrimaryPotency(b) - getPrimaryPotency(a);
        if (sort === 'name') return a.name.localeCompare(b.name);
        return Number(hasSale(b)) - Number(hasSale(a)) || Number(b.quantity > 0) - Number(a.quantity > 0) || a.name.localeCompare(b.name);
      });
  }, [brand, category, dealsOnly, effect, inStockOnly, minThc, priceMax, profile, query, sort, weight]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const resetFilters = () => {
    setCategory('All');
    setQuery('');
    setBrand('All');
    setProfile('All');
    setWeight('All');
    setEffect('All');
    setSort('featured');
    setDealsOnly(false);
    setInStockOnly(false);
    setPriceMax(maxAvailablePrice);
    setMinThc(0);
    setVisibleCount(18);
  };

  const setFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setVisibleCount(18);
  };

  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-[#0b3025] text-white">
        <div className="absolute inset-0 mesh-bg opacity-15" />
        <div className="luxury-shell relative grid gap-8 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Breadcrumbs items={[{ label: 'Menu' }]} tone="dark" />
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">Raindrops NY menu</p>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">Flower, Pre-Rolls, and Edibles.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
              Search and filter a focused menu with product images, pricing, potency, size, brand, and deal details.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {productCategories.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(setCategory, item)}
                className="rounded-lg border border-white/12 bg-white/8 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white/12 sm:p-4"
              >
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--champagne)] sm:text-xs sm:tracking-[0.16em]">{item}</p>
                <p className="mt-1 font-[var(--font-display)] text-3xl font-bold sm:mt-2 sm:text-4xl">{menuCounts[item]}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-10">
        <div className="luxury-shell">
          <div className="rounded-lg border border-white/70 bg-white/82 p-4 shadow-[0_18px_54px_rgba(25,35,20,0.08)] backdrop-blur">
            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
              <label className="flex min-w-0 items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-[var(--emerald)]" />
                <input
                  value={query}
                  onChange={(event) => setFilter(setQuery, event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[var(--emerald-deep)] outline-none placeholder:text-[var(--muted)]"
                  aria-label="Search menu"
                  placeholder="Search product name, brand, profile, THC, size, or deal"
                />
              </label>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {(['All', ...productCategories] as CategoryFilter[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(setCategory, item)}
                    aria-pressed={category === item}
                    className={`whitespace-nowrap rounded-full px-4 py-3 text-xs font-extrabold uppercase tracking-[0.13em] transition ${category === item ? 'bg-[var(--emerald-deep)] text-white' : 'border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--champagne)] hover:text-[var(--emerald-deep)]'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
              <SelectField label="Brand" value={brand} onChange={(value) => setFilter(setBrand, value)}>
                <option>All</option>
                {brands.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </SelectField>
              <SelectField label="Profile" value={profile} onChange={(value) => setFilter(setProfile, value)}>
                <option>All</option>
                {profiles.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </SelectField>
              <SelectField label="Size" value={weight} onChange={(value) => setFilter(setWeight, value)}>
                <option>All</option>
                {weights.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </SelectField>
              <SelectField label="Effect" value={effect} onChange={(value) => setFilter(setEffect, value)}>
                <option>All</option>
                {effectOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </SelectField>
              <SelectField label="Sort" value={sort} onChange={(value) => setFilter(setSort, value as SortMode)}>
                {(Object.keys(sortLabels) as SortMode[]).map((item) => (
                  <option key={item} value={item}>{sortLabels[item]}</option>
                ))}
              </SelectField>
              <label className="grid gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">Max price: {formatPrice(priceMax * 100)}</span>
                <input type="range" min={10} max={maxAvailablePrice} value={priceMax} onChange={(event) => setFilter(setPriceMax, Number(event.target.value))} className="h-12 accent-[var(--emerald-deep)]" />
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">Min THC: {minThc}%</span>
                <input type="range" min={0} max={40} value={minThc} onChange={(event) => setFilter(setMinThc, Number(event.target.value))} className="h-12 accent-[var(--emerald-deep)]" />
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setFilter(setDealsOnly, !dealsOnly)} aria-pressed={dealsOnly} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.13em] transition ${dealsOnly ? 'bg-[var(--champagne)] text-[var(--emerald-deep)]' : 'border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--champagne)] hover:text-[var(--emerald-deep)]'}`}>
                  <BadgePercent className="h-4 w-4" />
                  Deals only
                </button>
                <button onClick={() => setFilter(setInStockOnly, !inStockOnly)} aria-pressed={inStockOnly} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.13em] transition ${inStockOnly ? 'bg-[var(--emerald-deep)] text-white' : 'border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--champagne)] hover:text-[var(--emerald-deep)]'}`}>
                  <PackageCheck className="h-4 w-4" />
                  In menu
                </button>
                <button onClick={resetFilters} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.13em] text-[var(--muted)] transition hover:border-[var(--champagne)] hover:text-[var(--emerald-deep)]">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
                <Filter className="h-4 w-4 text-[var(--emerald)]" />
                Showing {filteredProducts.length} of {menuProducts.length} products
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="luxury-shell">
          <AnimatePresence mode="popLayout">
            {visibleProducts.length > 0 ? (
              <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onDetails={setSelectedProduct} />
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-[var(--line)] bg-white/78 p-10 text-center">
                <SlidersHorizontal className="mx-auto h-10 w-10 text-[var(--emerald)]" />
                <h2 className="mt-4 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">No products matched.</h2>
                <p className="mt-2 text-[var(--muted)]">Adjust the filters or reset to see the full menu.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-lg border border-[var(--line)] bg-white/72 p-5 md:flex-row">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
              <Check className="h-4 w-4 text-[var(--emerald)]" />
              {visibleProducts.length} visible now
            </p>
            {visibleCount < filteredProducts.length ? (
              <button onClick={() => setVisibleCount((count) => count + 18)} className="rounded-full bg-[var(--emerald-deep)] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--emerald)]">
                Load more products
              </button>
            ) : (
              <OrderButton label="Continue to checkout" />
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>{selectedProduct && <ProductDetailDialog product={selectedProduct} onClose={() => setSelectedProduct(null)} />}</AnimatePresence>
    </SiteChrome>
  );
}
