import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { ArrowRight } from 'lucide-react';
import { formatPrice, getBrandLabel, getStrainTag } from '@/lib/menu-utils';
import type { LiveMenuProduct } from '@/lib/menu';
import { PRODUCT_BLUR_DATA_URL } from '@/lib/image-blur';

/**
 * Shared server-rendered product card — used on /deals and the /menu/[category]
 * landing pages so both surfaces render identical, crawlable product cards in
 * the SSR HTML (the markup search engines + AI engines read). Links into the
 * full menu modal via ?product=ID.
 *
 * Solid dark ink chip + brand-accent text/border so the strain badge reads
 * cleanly against the LIGHT cream product-image area.
 */
const STRAIN_TINT: Record<string, string> = {
  INDICA: 'border-[color:var(--rd-rain)]/55 text-[color:var(--rd-rain)] bg-[color:var(--rd-ink)]/92',
  SATIVA: 'border-[color:var(--rd-glow)]/55 text-[color:var(--rd-glow)] bg-[color:var(--rd-ink)]/92',
  HYBRID: 'border-[color:var(--rd-amber)]/55 text-[color:var(--rd-amber)] bg-[color:var(--rd-ink)]/92',
  BALANCED: 'border-[color:var(--rd-mint)]/55 text-[color:var(--rd-mint)] bg-[color:var(--rd-ink)]/92'
};

export function ProductCard({ product, eager = false }: { product: LiveMenuProduct; eager?: boolean }) {
  const strain = getStrainTag(product);
  const tint = STRAIN_TINT[strain] ?? STRAIN_TINT.BALANCED;
  return (
    <Link
      href={`/menu?product=${encodeURIComponent(product.id)}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)] shadow-[0_20px_60px_rgba(8,18,14,0.5)] transition-[transform,border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:border-[color:var(--rd-glow)]/40 hover:shadow-[0_30px_70px_rgba(198,160,100,0.12)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[color:var(--rd-paper-soft)]">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            placeholder="blur"
            blurDataURL={PRODUCT_BLUR_DATA_URL}
            loading={eager ? 'eager' : 'lazy'}
            className="object-contain p-6"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] [font-family:var(--font-mono)] ${tint}`}>
            {strain}
          </span>
          {product.isSticky && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
              ✦ STICKY
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="rd-eyebrow truncate text-[color:var(--rd-text-mute)]">{getBrandLabel(product)}</p>
        <h3
          className="mt-1 line-clamp-2 break-words text-[color:var(--rd-text)]"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(1.05rem, 1.5vw, 1.35rem)',
            lineHeight: 1.2,
            minHeight: 'calc(1.2em * 2)'
          }}
          title={product.name}
        >
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="[font-family:var(--font-mono)]">
            {product.variants.length > 1 ? (
              <div className="grid grid-cols-[auto_auto] items-baseline gap-x-3 gap-y-0.5">
                {product.variants.map((variant, i) => (
                  <Fragment key={variant.label}>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] text-left">
                      {variant.label}
                    </span>
                    <span className={`font-semibold tabular-nums text-[color:var(--rd-amber)] text-right ${i === 0 ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg opacity-85'}`}>
                      {formatPrice(variant.price)}
                    </span>
                  </Fragment>
                ))}
              </div>
            ) : (
              <p className="text-xl font-semibold text-[color:var(--rd-amber)] sm:text-2xl">
                {formatPrice(product.salePrice)}
              </p>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rd-eyebrow text-[color:var(--rd-glow)]">
            View
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
