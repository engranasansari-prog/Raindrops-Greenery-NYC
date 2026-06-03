'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Cannabis, Check, Cigarette, Cookie, Filter, RotateCcw, Search, Share2, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import BrandLogoLoop from '@/components/BrandLogoLoop';
import { trackOrderClick, trackProductView } from '@/lib/analytics';
import { menuCounts, menuProducts, type LiveMenuProduct } from '@/lib/menu';
import {
  effectOptions,
  formatPrice,
  getAvailableBrands,
  getAvailableProfiles,
  getAvailableWeights,
  getBrandLabel,
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

// Solid dark chip with brand-accent text + border. The badge sits on the
// LIGHT cream product-image area (--rd-paper-soft), so a translucent
// brand-tinted bg blends in. Switching to a near-solid ink chip with the
// accent kept on the text/border gives unambiguous contrast against any
// product photo while still reading on-brand.
const STRAIN_BADGE: Record<StrainTag, string> = {
  INDICA: 'border-[color:var(--rd-rain)]/55 text-[color:var(--rd-rain)] bg-[color:var(--rd-ink)]/92',
  SATIVA: 'border-[color:var(--rd-glow)]/55 text-[color:var(--rd-glow)] bg-[color:var(--rd-ink)]/92',
  HYBRID: 'border-[color:var(--rd-amber)]/55 text-[color:var(--rd-amber)] bg-[color:var(--rd-ink)]/92',
  BALANCED: 'border-[color:var(--rd-mint)]/55 text-[color:var(--rd-mint)] bg-[color:var(--rd-ink)]/92'
};
import { checkout } from '@/lib/site-data';
import { PRODUCT_BLUR_DATA_URL } from '@/lib/image-blur';
import { useModalA11y } from '@/hooks/useModalA11y';

type CategoryFilter = 'All' | LiveMenuProduct['category'];
type SortMode = 'featured' | 'price-low' | 'price-high' | 'potency-high' | 'name';

/**
 * Category icons + display labels — client review request.
 *
 * • Flower → renamed to "Flower Strains" in the UI (data stays 'Flower')
 * • All view ordering: Edibles → Flower → Pre-Rolls
 * • Min-THC filter only applies to Flower; hidden for Pre-Rolls + Edibles
 */
const CATEGORY_ICONS: Record<LiveMenuProduct['category'], LucideIcon> = {
  Edibles: Cookie,
  Flower: Cannabis,
  'Pre-Rolls': Cigarette
};

const CATEGORY_LABEL: Record<LiveMenuProduct['category'], string> = {
  Edibles: 'Edibles',
  Flower: 'Flower Strains',
  'Pre-Rolls': 'Pre-Rolls'
};

/** Custom sort order used when filter is "All" — Edibles → Flower → Pre-Rolls */
const CATEGORY_ORDER: Record<LiveMenuProduct['category'], number> = {
  Edibles: 0,
  Flower: 1,
  'Pre-Rolls': 2
};

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

function ProductImage({ product, eager = false }: { product: LiveMenuProduct; eager?: boolean }) {
  // Image-less products are filtered out upstream in lib/menu.ts. Image is always
  // present here; the non-null assertion keeps types tight.
  return (
    <Image
      src={product.image!}
      alt={product.name}
      fill
      // Removed `unoptimized` — Next.js now routes through /_next/image
      // to serve AVIF/WebP variants at the right pixel density. With the
      // s3-us-west-2.amazonaws.com/dutchie-images/** remotePattern in
      // next.config, every product asset is optimized + edge-cached.
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      // quality defaults to 75 (Next.js's only allowed value unless we
      // override images.qualities in next.config). Difference between
      // 72 and 75 is imperceptible — let it default to avoid 400s.
      placeholder="blur"
      blurDataURL={PRODUCT_BLUR_DATA_URL}
      loading={eager ? 'eager' : 'lazy'}
      className="object-contain p-5 transition duration-500 group-hover:scale-105"
    />
  );
}

function ProductCard({
  product,
  onDetails,
  eager = false
}: {
  product: LiveMenuProduct;
  onDetails: (product: LiveMenuProduct) => void;
  /** When true, the card image is hinted eager so the first 6 above-the-fold load immediately */
  eager?: boolean;
}) {
  const potency = getPotencyLabel(product);
  const strain = getStrainTag(product);
  const sticky = isSticky(product);

  return (
    <motion.article
      /* No `layout`: it made framer run a FLIP layout animation across EVERY
         visible card on each filter/sort keystroke (animating top/left on
         40+ nodes = the menu's main INP/jank source). Dropping it keeps a
         clean fade-in for newly-matched cards while surviving cards stay put
         instantly — filtering now feels immediate instead of "busy". */
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] shadow-[0_20px_60px_rgba(8,18,14,0.5)] transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:border-[color:var(--rd-glow)]/40 hover:shadow-[0_30px_70px_rgba(200,230,110,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[color:var(--rd-paper-soft)]">
        <ProductImage product={product} eager={eager} />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur [font-family:var(--font-mono)] ${STRAIN_BADGE[strain]}`}>
            {strain}
          </span>
          {sticky && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--rd-ink)] shadow-sm [font-family:var(--font-mono)]">
              ✦ STICKY
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="rd-eyebrow truncate text-[color:var(--rd-text-mute)]">{getBrandLabel(product)}</p>
            <h3
              className="mt-2 line-clamp-2 break-words text-[color:var(--rd-text)]"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(1.05rem, 1.5vw, 1.35rem)',
                lineHeight: 1.2
              }}
              title={product.name}
            >
              {product.name}
            </h3>
          </div>
          {/*
            Price column — luxury-bar-menu style. Sizes left-aligned in
            uppercase mono, prices right-aligned in mono numerals, like
            a high-end wine list. Same information density as the prior
            two-tier divider treatment but reads more refined.

            For flowers (multi-variant): two rows aligned in a 2-col grid
            so size labels and prices form clean vertical columns.
            For single-variant products: collapses back to the simple
            single-price treatment.
          */}
          <div className="shrink-0 [font-family:var(--font-mono)]">
            {product.variants.length > 1 ? (
              <div className="grid grid-cols-[auto_auto] items-baseline gap-x-3 gap-y-1 text-right">
                {product.variants.map((variant, i) => (
                  <Fragment key={variant.label}>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] text-left">
                      {variant.label}
                    </span>
                    <span className={`font-semibold tabular-nums text-[color:var(--rd-amber)] ${i === 0 ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg opacity-85'}`}>
                      {formatPrice(variant.price)}
                    </span>
                  </Fragment>
                ))}
              </div>
            ) : (
              <p className="text-xl font-semibold text-[color:var(--rd-amber)] sm:text-2xl text-right">
                {formatPrice(product.salePrice)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {/* Hide the standalone weight chip when the price column already
              shows each variant's size — keeps the card from repeating "3.5g"
              twice. Pre-rolls and edibles (single-variant) still render the
              weight chip when present. */}
          {product.weight && product.variants.length <= 1 && <span className="rounded-full border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink)]/55 px-3 py-1 text-[11px] tracking-wider text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)]">{product.weight}</span>}
          <span className="rounded-full border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink)]/55 px-3 py-1 text-[11px] tracking-wider text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)]">{inferProfile(product)}</span>
          {potency && <span className="rounded-full border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-glow)]/8 px-3 py-1 text-[11px] tracking-wider text-[color:var(--rd-glow)] [font-family:var(--font-mono)]">{potency}</span>}
        </div>

        {getProductDescription(product) && (
          <p className="product-description-clamp mt-4 text-sm leading-7 text-[color:var(--rd-text-dim)]">{getProductDescription(product)}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <button onClick={() => onDetails(product)} className="btn-luxe btn-luxe-ghost btn-luxe-sm">
            Details
          </button>
          <Link
            href={product.orderUrl || checkout.dutchieUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Order ${product.name} — secure checkout`}
            onClick={() => trackOrderClick('menu_card', { item: product.name })}
            className="btn-luxe btn-luxe-gold btn-luxe-sm"
          >
            Order
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function ProductDetailDialog({ product, onClose }: { product: LiveMenuProduct; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  // Modal a11y: focus into the dialog, trap Tab, Escape to close, lock scroll,
  // and restore focus to the product card on close (pre-launch QA finding).
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalA11y(true, dialogRef, { onEscape: onClose });
  const potency = getPotencyLabel(product);
  const effects = inferEffects(product);
  // Build detail rows conditionally so we only show fields the customer
  // can actually act on. Edibles don't have a "Size" (all variants are
  // Default), and pre-rolls' 1.5g is suppressed per client request — so
  // hiding the Size row entirely for those categories avoids "Confirm
  // at checkout" placeholders that just confuse the customer.
  const detailRows: Array<[string, string]> = [
    ['Category', CATEGORY_LABEL[product.category]],
    ['Brand', getBrandLabel(product)]
  ];
  if (product.category !== 'Edibles') {
    detailRows.push(['Profile', inferProfile(product)]);
  }
  // Hide the Size row when the modal already shows variant pricing above
  // (flowers with 3.5g + 7g). For single-variant products keep it as before
  // so customers see the size next to brand/profile/potency.
  if (product.weight && product.variants.length <= 1) {
    detailRows.push(['Size', product.weight]);
  }
  if (potency) {
    detailRows.push(['Potency', potency]);
  }
  if (product.quantity > 0) {
    detailRows.push(['Availability', 'Available in menu']);
  }

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
    <motion.div
      className="fixed inset-0 z-[90] flex items-stretch justify-center bg-[rgba(6,19,15,0.78)] p-0 backdrop-blur-xl sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} — product details`}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        className="max-h-[100dvh] w-full max-w-5xl overflow-y-auto border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] text-[color:var(--rd-text)] shadow-[0_40px_120px_rgba(0,0,0,0.5)] outline-none sm:max-h-[92vh] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative h-[260px] overflow-hidden bg-[color:var(--rd-paper-soft)] sm:h-[340px] lg:h-auto lg:min-h-[420px]">
            <ProductImage product={product} />
            <div className="absolute left-4 top-4 flex flex-col gap-1.5">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur [font-family:var(--font-mono)] ${STRAIN_BADGE[getStrainTag(product)]}`}>
                {getStrainTag(product)}
              </span>
              {isSticky(product) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--rd-ink)] shadow-sm [font-family:var(--font-mono)]">
                  ✦ STICKY
                </span>
              )}
            </div>
          </div>
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="rd-eyebrow text-[color:var(--rd-glow)]">{product.category}</p>
                <h2
                  className="mt-3 text-[color:var(--rd-text)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.85rem, 2.4vw, 2.6rem)', lineHeight: 1.15, letterSpacing: '-0.02em' }}
                >
                  {product.name}
                </h2>
                <p className="mt-2 text-sm text-[color:var(--rd-text-mute)]">{getBrandLabel(product)}</p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-text)]"
                aria-label="Close product details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Price block — multi-variant aware. Flowers show both 3.5g and
                7g side-by-side so customers see all sizes at a glance.
                Single-variant products (pre-rolls, edibles) collapse back
                to the original single-price treatment. */}
            <div className="mt-5 sm:mt-6 [font-family:var(--font-mono)]">
              {product.variants.length > 1 ? (
                <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                  {product.variants.map((variant, i) => (
                    <div key={variant.label} className="flex flex-col">
                      <p className={`font-semibold text-[color:var(--rd-amber)] ${i === 0 ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl opacity-80'}`}>
                        {formatPrice(variant.price)}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)]">
                        {variant.label}
                      </p>
                    </div>
                  ))}
                  <p className="ml-auto pb-1 text-[11px] uppercase tracking-[0.16em] text-[color:var(--rd-text-mute)]">
                    Pick size at checkout
                  </p>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  {product.salePrice < product.price && (
                    <p className="pb-1 text-sm font-medium text-[color:var(--rd-text-mute)] line-through">{formatPrice(product.price)}</p>
                  )}
                  <p className="text-4xl font-semibold text-[color:var(--rd-amber)] sm:text-5xl">{formatPrice(product.salePrice)}</p>
                </div>
              )}
            </div>

            {getProductDescription(product) && (
              <p className="mt-5 text-base leading-8 text-[color:var(--rd-text-dim)]">{getProductDescription(product)}</p>
            )}

            {effects.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">Reported effects</span>
                {effects.map((effect) => (
                  <span
                    key={effect}
                    className="inline-flex items-center gap-1 rounded-full border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink)]/55 px-3 py-1 text-xs text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)]"
                  >
                    <Sparkles className="h-3 w-3 text-[color:var(--rd-glow)]" />
                    {effect}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {detailRows.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink)]/55 p-4"
                >
                  <p className="rd-eyebrow text-[color:var(--rd-text-mute)]">{label}</p>
                  <p className="mt-2 text-sm font-medium text-[color:var(--rd-text)]">{value}</p>
                </div>
              ))}
            </div>

            {product.deals.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[color:var(--rd-amber)]/40 bg-[color:var(--rd-amber)]/10 p-4">
                <p className="rd-eyebrow text-[color:var(--rd-amber)]">Active deal</p>
                <p className="mt-2 text-sm font-medium text-[color:var(--rd-text)]">{product.deals[0].name}</p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* Order CTA — secure checkout for this exact product */}
              <Link
                href={product.orderUrl || checkout.dutchieUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Order ${product.name} — secure checkout`}
                onClick={() => trackOrderClick('menu_modal', { item: product.name })}
                className="btn-luxe btn-luxe-gold"
              >
                Secure checkout
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button onClick={share} className="btn-luxe btn-luxe-ghost">
                <Share2 className="h-4 w-4" />
                {copied ? 'Link copied' : 'Share'}
              </button>
              <button onClick={onClose} className="btn-luxe btn-luxe-ghost">
                Keep browsing
              </button>
            </div>

            {/* Reassurance right at the decision point — the three things a
                first-time buyer is unsure about, answered beside the checkout
                button: the promised gift is automatic, the delivery threshold,
                and the door ID check. Reduces the #1 abandonment driver (fear
                the gift/price won't carry over to checkout). */}
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[color:var(--rd-text-dim)]">
              <span className="inline-flex items-center gap-1.5 font-medium text-[color:var(--rd-glow)]">
                <Check className="h-3.5 w-3.5" />
                Free pre-roll gift added
              </span>
              <span aria-hidden className="text-[color:var(--rd-paper)]/25">·</span>
              <span>Free delivery over $25 · tax-free</span>
              <span aria-hidden className="text-[color:var(--rd-paper)]/25">·</span>
              <span>21+ · ID checked at the door</span>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 px-4 text-sm font-medium text-[color:var(--rd-text)] outline-none transition hover:border-[color:var(--rd-glow)]/30 focus:border-[color:var(--rd-glow)] focus:shadow-[0_0_0_4px_rgba(200,230,110,0.18)] [font-family:var(--font-sans)]"
      >
        {children}
      </select>
    </label>
  );
}

export default function MenuExplorer({ initialCategory, initialProductId, initialDealsOnly, initialEffect }: { initialCategory?: string; initialProductId?: string; initialDealsOnly?: boolean; initialEffect?: string }) {
  const [category, setCategory] = useState<CategoryFilter>(normalizeCategory(initialCategory));
  const [query, setQuery] = useState('');
  const [profile, setProfile] = useState('All');
  const [weight, setWeight] = useState('All');
  const [sort, setSort] = useState<SortMode>('featured');
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

  // Auto-reset filters that don't apply to the active category so a
  // hidden control can't silently constrain results.
  // - Edibles  → no Profile, no Size, no Min THC
  // - Pre-Rolls → no Size, no Min THC
  // - Flower   → all apply
  useEffect(() => {
    if (category === 'Edibles') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile('All');
       
      setWeight('All');
       
      setMinThc(0);
    } else if (category === 'Pre-Rolls') {
       
      setWeight('All');
       
      setMinThc(0);
    }
  }, [category]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return menuProducts
      .filter((product) => category === 'All' || product.category === category)
      .filter((product) => profile === 'All' || inferProfile(product) === profile)
      // Match the size against ANY variant the product carries, not just
      // product.weight (which only reflects the first variant). Otherwise
      // filtering by "7g" returned zero matches even though every flower
      // has a 7g variant in the data.
      .filter((product) => {
        if (weight === 'All') return true;
        if (product.variants.length > 0) return product.variants.some((v) => v.label === weight);
        return product.weight === weight;
      })
      // Price filter — the product matches if ANY of its variants falls
      // within the slider range. Customers dragging the slider to $75
      // see the flower whose 7g variant is $75 even though its 3.5g is $40.
      .filter((product) => {
        const cap = priceMax * 100;
        if (product.variants.length > 0) return product.variants.some((v) => v.price <= cap);
        return product.salePrice <= cap;
      })
      // Min-THC slider applies ONLY to Flower (client request — Pre-Rolls
      // are pre-made products where the % varies less, and Edibles use mg).
      .filter((product) => category !== 'Flower' || getPrimaryPotency(product) >= minThc)
      .filter((product) => !normalizedQuery || getMenuSearchText(product).includes(normalizedQuery))
      .sort((a, b) => {
        if (sort === 'price-low') return a.salePrice - b.salePrice;
        if (sort === 'price-high') return b.salePrice - a.salePrice;
        if (sort === 'potency-high') return getPrimaryPotency(b) - getPrimaryPotency(a);
        if (sort === 'name') return a.name.localeCompare(b.name);
        // Featured: when "All" is selected, group by category (Edibles
        // first, then Flower, then Pre-Rolls per client request); then
        // sticky-on-sale priority, in-stock, name.
        const categoryDelta = category === 'All' ? CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category] : 0;
        if (categoryDelta !== 0) return categoryDelta;
        return Number(hasSale(b)) - Number(hasSale(a)) || Number(b.quantity > 0) - Number(a.quantity > 0) || a.name.localeCompare(b.name);
      });
  }, [category, minThc, priceMax, profile, query, sort, weight]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const resetFilters = () => {
    setCategory('All');
    setQuery('');
    setProfile('All');
    setWeight('All');
    setSort('featured');
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
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(200,230,110,0.10), transparent 55%), radial-gradient(ellipse at bottom right, rgba(46, 82, 64,0.45), transparent 60%)'
          }}
        />
        <div className="luxury-shell relative py-12 sm:py-16 lg:py-20">
          {/*
            Brand logo loop — promoted to the TOP of the hero, horizontally
            centered, spanning the full width above the 2-column grid.
            Sits like a wax-seal stamp at the head of the page — the
            canonical luxury menu pattern (Eleven Madison Park, Le Bernardin,
            high-end boutique sites). Originally placed in the left column
            beside the heading, which made the right column's 3 category
            buttons feel light by comparison; this hierarchy balances the
            composition: ceremonial logo at the top, two equal columns
            (text + categories) below.

            Square 368×368 source displayed at 112px (mobile) / 128px
            (desktop) — pixel-sharp on retina, soft circular frame with
            faint lime ring + drop shadow.
          */}
          <div className="mb-8 flex justify-center sm:mb-10">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-[color:var(--rd-glow)]/22 bg-[color:var(--rd-ink-soft)] shadow-[0_0_0_4px_rgba(200,230,110,0.05),0_18px_44px_rgba(0,0,0,0.32)] sm:h-32 sm:w-32">
              <BrandLogoLoop />
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Breadcrumbs items={[{ label: 'Menu' }]} tone="dark" />
            <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">Raindrops NY menu</p>
            <h1 className="mt-4 text-[color:var(--rd-text)]">
              Flower Strains, Pre-Rolls, <span className="italic">and Edibles.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
              Browse the Raindrops weed delivery menu — curated cannabis Flower Strains, Pre-Rolls, and Edibles. Filter by price, potency, size, brand, and deals, then tap any product for secure checkout.
            </p>
            {/* Free-gift reinforcement — the hero "Claim free weed gift" CTA
                lands here, so confirm the gift is automatic with any order
                (no separate claim form needed). */}
            <p className="mt-5 inline-flex items-start gap-2 rounded-2xl border border-[color:var(--rd-glow)]/30 bg-[color:var(--rd-glow)]/10 px-4 py-2 text-sm font-medium text-[color:var(--rd-text)]">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" />
              Free pre-roll gift added to every order.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {productCategories.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  onClick={() => setFilter(setCategory, item)}
                  aria-pressed={active}
                  className={`group rounded-2xl border p-3 text-left transition-[transform,border-color,background-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 sm:p-4 ${
                    active
                      ? 'border-[color:var(--rd-glow)]/55 bg-[color:var(--rd-glow)]/10 shadow-[0_20px_60px_rgba(200,230,110,0.18)]'
                      : 'border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] hover:border-[color:var(--rd-glow)]/30 hover:bg-[color:var(--rd-ink-soft)]/80'
                  }`}
                >
                  {(() => {
                    const Icon = CATEGORY_ICONS[item];
                    return (
                      <Icon
                        className={`h-5 w-5 transition-colors ${active ? 'text-[color:var(--rd-glow)]' : 'text-[color:var(--rd-text-dim)] group-hover:text-[color:var(--rd-glow)]'}`}
                        strokeWidth={1.6}
                      />
                    );
                  })()}
                  <p className={`mt-2 rd-eyebrow ${active ? 'text-[color:var(--rd-glow)]' : 'text-[color:var(--rd-text-mute)]'}`}>{CATEGORY_LABEL[item]}</p>
                  <p
                    className="mt-1 text-[color:var(--rd-text)]"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.85rem, 3vw, 2.5rem)', letterSpacing: '-0.02em' }}
                  >
                    {menuCounts[item]}
                  </p>
                </button>
              );
            })}
          </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink)] py-8 text-[color:var(--rd-text)] sm:py-10">
        <div className="luxury-shell">
          <div className="rounded-3xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-6">
            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
              <label className="flex min-w-0 items-center gap-3 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 px-5 py-3 transition focus-within:border-[color:var(--rd-glow)]/50">
                <Search className="h-5 w-5 shrink-0 text-[color:var(--rd-glow)]" />
                <input
                  value={query}
                  onChange={(event) => setFilter(setQuery, event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-[color:var(--rd-text)] outline-none placeholder:text-[color:var(--rd-text-mute)]"
                  aria-label="Search menu"
                  placeholder="Search product name, brand, profile, THC, size, or deal"
                />
              </label>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {(['All', ...productCategories] as CategoryFilter[]).map((item) => {
                  const active = category === item;
                  const Icon = item === 'All' ? null : CATEGORY_ICONS[item];
                  const label = item === 'All' ? 'All' : CATEGORY_LABEL[item];
                  return (
                    <button
                      key={item}
                      onClick={() => setFilter(setCategory, item)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition [font-family:var(--font-mono)] ${
                        active
                          ? 'bg-[color:var(--rd-glow)] text-[color:var(--rd-ink)] shadow-[0_8px_24px_rgba(200,230,110,0.32)]'
                          : 'border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 text-[color:var(--rd-text-dim)] hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-text)]'
                      }`}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contextual filter set — per client review (V9 + V10). Each
                filter only renders for the categories where it actually
                narrows the catalog. Keeps the UX clean and avoids dead
                controls.
                  All       → Profile · Sort · Price · (Size & THC hidden)
                  Flower    → Profile · Size · Sort · Price · Min THC
                  Pre-Rolls → Profile · Sort · Price
                  Edibles   → Sort · Price

                V10 (client request, May 2026): Size is now Flower-only.
                Previously visible under "All" too, but in mixed mode
                only flowers carry meaningful sizes (1.5g pre-rolls are
                suppressed per V9, edibles all use "Default"). The Size
                control then narrowed only one of three categories — a
                dead filter from the customer's point of view. Hiding it
                in "All" mode makes the filter rail self-consistent. */}
            {(() => {
              const showProfile = category !== 'Edibles';
              const showSize = category === 'Flower';
              const showMinThc = category === 'Flower';
              // Count visible filters to keep grid columns sensible.
              const slots = 2 + Number(showProfile) + Number(showSize) + Number(showMinThc); // sort + price always
              const cols =
                slots <= 2 ? 'md:grid-cols-2' :
                slots === 3 ? 'md:grid-cols-3' :
                slots === 4 ? 'md:grid-cols-2 xl:grid-cols-4' :
                'md:grid-cols-2 xl:grid-cols-5';
              return (
            <div className={`mt-5 grid gap-4 ${cols}`}>
              {showProfile && (
                <SelectField label="Profile" value={profile} onChange={(value) => setFilter(setProfile, value)}>
                  <option>All</option>
                  {profiles.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </SelectField>
              )}
              {showSize && (
                <SelectField label="Size" value={weight} onChange={(value) => setFilter(setWeight, value)}>
                  <option>All</option>
                  {weights.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </SelectField>
              )}
              <SelectField label="Sort" value={sort} onChange={(value) => setFilter(setSort, value as SortMode)}>
                {(Object.keys(sortLabels) as SortMode[]).map((item) => (
                  <option key={item} value={item}>{sortLabels[item]}</option>
                ))}
              </SelectField>
              <label className="grid gap-2">
                <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">
                  Max price <span className="text-[color:var(--rd-glow)]">{formatPrice(priceMax * 100)}</span>
                </span>
                <input
                  type="range"
                  min={15}
                  max={Math.max(maxAvailablePrice, 50)}
                  value={priceMax}
                  onChange={(event) => setFilter(setPriceMax, Number(event.target.value))}
                  aria-label="Maximum price"
                  aria-valuetext={formatPrice(priceMax * 100)}
                  className="h-12 accent-[color:var(--rd-glow)]"
                />
              </label>
              {showMinThc && (
                <label className="grid gap-2">
                  <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">
                    Min THC <span className="text-[color:var(--rd-glow)]">{minThc}%</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={minThc}
                    onChange={(event) => setFilter(setMinThc, Number(event.target.value))}
                    aria-label="Minimum THC percent"
                    aria-valuetext={`${minThc}%`}
                    className="h-12 accent-[color:var(--rd-glow)]"
                  />
                </label>
              )}
            </div>
              );
            })()}

            <div className="mt-5 flex flex-col gap-3 border-t border-[color:var(--rd-paper)]/8 pt-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rd-paper)]/14 bg-[color:var(--rd-ink)]/55 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-text)] [font-family:var(--font-mono)]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              <p className="inline-flex items-center gap-2 text-sm text-[color:var(--rd-text-dim)]">
                <Filter className="h-4 w-4 text-[color:var(--rd-glow)]" />
                Showing <span className="text-[color:var(--rd-text)] [font-family:var(--font-mono)]">{filteredProducts.length}</span> of <span className="text-[color:var(--rd-text)] [font-family:var(--font-mono)]">{menuProducts.length}</span> products
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--rd-ink)] pb-20 text-[color:var(--rd-text)]">
        <div className="luxury-shell">
          {/* Section heading for the product grid. Visually hidden (the hero H1
              + filter rail already frame this area), but it gives screen readers
              and crawlers the H2 level between the page H1 and the H3 product
              titles — fixes the H1→H3 heading-order skip. */}
          <h2 className="sr-only">Cannabis delivery menu — Flower Strains, Pre-Rolls, and Edibles</h2>
          <AnimatePresence mode="popLayout">
            {visibleProducts.length > 0 ? (
              <motion.div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDetails={(p) => {
                      setSelectedProduct(p);
                      trackProductView(p.name, p.category);
                    }}
                    /* First 6 cards above the fold are hinted eager so they render
                       without waiting for IntersectionObserver. Use the map index
                       (was indexOf — an O(n²) scan per render). */
                    eager={i < 6}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto max-w-2xl rounded-3xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-10 text-center"
              >
                <SlidersHorizontal className="mx-auto h-10 w-10 text-[color:var(--rd-glow)]" />
                <h2 className="mt-5 text-[color:var(--rd-text)]">
                  No products <span className="italic">matched.</span>
                </h2>
                <p className="mt-3 text-[color:var(--rd-text-dim)]">Adjust the filters or reset to see the full menu.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] p-5 md:flex-row">
            <p className="inline-flex items-center gap-2 text-sm text-[color:var(--rd-text-dim)]">
              <Check className="h-4 w-4 text-[color:var(--rd-glow)]" />
              <span className="text-[color:var(--rd-text)] [font-family:var(--font-mono)]">{visibleProducts.length}</span> visible now
            </p>
            {visibleCount < filteredProducts.length ? (
              <button
                onClick={() => setVisibleCount((count) => count + 18)}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--rd-glow)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-ink)] shadow-[0_12px_36px_rgba(200,230,110,0.32)] transition-[transform,box-shadow] duration-300 [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(200,230,110,0.42)] [font-family:var(--font-mono)]"
              >
                Load more products
                <ArrowRight className="h-3.5 w-3.5" />
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
