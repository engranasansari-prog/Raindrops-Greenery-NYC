import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgePercent, Sparkles, Tag } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { menuProducts } from '@/lib/menu';
import { formatPrice, getBrandLabel, getDealLabel, hasSale } from '@/lib/menu-utils';

export const metadata: Metadata = {
  title: 'Deals',
  description:
    'Tax-free Shinnecock-licensed cannabis deals on Flower, Pre-Rolls, and Edibles. Free delivery across Manhattan, LIC, Williamsburg, and Greenpoint.',
  alternates: { canonical: '/deals' },
  openGraph: {
    title: 'Raindrops Greenery NY Deals',
    description: 'Tax-free deals on Flower, Pre-Rolls, and Edibles for NYC delivery.',
    url: '/deals',
    images: [{ url: '/assets/flower.avif', width: 1200, height: 800, alt: 'Raindrops Greenery deals' }]
  }
};

const offers = [
  { eyebrow: 'First time', title: 'Free pre-roll on first order', body: 'Every first-time customer in our coverage area gets a complimentary pre-roll dropped in the bag. 21+ only, while supplies last.', code: 'AUTO' },
  { eyebrow: 'Refer-a-friend', title: 'Give $15, get $15', body: 'Send a friend $15 off their first order. When it ships, your account gets $15 in credit.', code: 'INVITE-15' },
  { eyebrow: 'Tax-free', title: '0% NY State cannabis tax', body: 'Sovereign Shinnecock authority — every order ships tax-free. The price on the card is the price at the door.', code: 'SOVEREIGN' }
];

export default function DealsPage() {
  const dealProducts = menuProducts.filter(hasSale);

  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-[#06130f] text-white">
        <Image src="/assets/flower.avif" alt="" fill priority sizes="100vw" className="object-cover opacity-22" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,19,15,0.92),rgba(6,19,15,0.55))]" />
        <div className="luxury-shell relative grid gap-8 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Breadcrumbs items={[{ label: 'Deals' }]} tone="dark" />
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">Live deals</p>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">Sale pricing on Flower, Pre-Rolls, and Edibles.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/74">
              {dealProducts.length} deals live tonight. Codes stack with sale prices.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu?deals=1" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--emerald-deep)] shadow-xl transition hover:-translate-y-0.5 hover:bg-[var(--champagne)]">
                Filter menu to deals
                <ArrowRight className="h-4 w-4" />
              </Link>
              <OrderButton />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="luxury-shell">
          <div className="grid gap-4 md:grid-cols-3">
            {offers.map((offer) => (
              <div key={offer.code} className="rounded-lg border border-[rgba(217,183,111,0.45)] bg-white/82 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne-dark)]">{offer.eyebrow}</p>
                <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">{offer.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{offer.body}</p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--emerald-deep)] bg-[var(--emerald-deep)]/4 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--emerald-deep)]">
                  <Tag className="h-4 w-4" />
                  {offer.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="luxury-shell">
          <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--champagne-dark)]">On sale right now</p>
              <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">{dealProducts.length} products with active deals</h2>
            </div>
            <Link href="/menu?deals=1" className="inline-flex items-center gap-2 font-extrabold text-[var(--emerald-deep)] hover:text-[var(--champagne-dark)]">
              See in menu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {dealProducts.length === 0 ? (
            <div className="rounded-lg border border-[var(--line)] bg-white/78 p-10 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-[var(--emerald)]" />
              <h3 className="mt-4 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">No active deals right now.</h3>
              <p className="mt-2 text-[var(--muted)]">Check back soon — sale items are added throughout the week.</p>
              <div className="mt-6 inline-flex">
                <OrderButton label="Browse full menu" />
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {dealProducts.slice(0, 18).map((product) => (
                <Link key={product.id} href={`/menu?product=${encodeURIComponent(product.id)}`} className="group flex flex-col overflow-hidden rounded-lg border border-white/70 bg-white/82 shadow-[0_18px_54px_rgba(25,35,20,0.08)] transition hover:-translate-y-1 hover:shadow-[0_30px_86px_rgba(25,35,20,0.14)]">
                  <div className="relative aspect-[5/3] overflow-hidden bg-[#fbf7ee]">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-6 transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[var(--emerald-deep)]/30">No image</div>
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--champagne)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--emerald-deep)]">
                      <BadgePercent className="h-3 w-3" />
                      {getDealLabel(product) ?? 'Deal'}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">{getBrandLabel(product)}</p>
                    <h3 className="mt-2 font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--emerald-deep)]">{product.name}</h3>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                      <div>
                        {product.salePrice < product.price && <p className="text-xs font-bold text-[var(--muted)] line-through">{formatPrice(product.price)}</p>}
                        <p className="font-[var(--font-display)] text-3xl font-bold text-[var(--emerald)]">{formatPrice(product.salePrice)}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-[var(--emerald-deep)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white">
                        View
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 rounded-lg border border-[var(--line)] bg-white/60 p-5 text-xs leading-6 text-[color:var(--rd-on-paper-mute)] shadow-sm md:p-6">
            <p className="rd-eyebrow text-[color:var(--rd-on-paper-dim)]">Fine print</p>
            <p className="mt-2">Promo codes are limited to one per order unless the code description states otherwise. Sale pricing reflects on the menu and is not combinable with other discounts. Subject to change without notice. Must be 21+ to order.</p>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
