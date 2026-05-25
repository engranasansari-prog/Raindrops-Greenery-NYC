'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BadgePercent, ChevronDown, Sparkles, Star, Tag } from 'lucide-react';
import { useState } from 'react';
import SiteChrome, { OrderButton, TextLink } from '@/components/SiteChrome';
import HeroSlider, { type HeroSlide } from '@/components/HeroSlider';
import ClaimOfferModal from '@/components/ClaimOfferModal';
import CoverageMap from '@/components/CoverageMap';
import type { BlogPostMeta } from '@/lib/blog-posts';
import { menuCounts, menuProducts } from '@/lib/menu';
import { formatPrice, getBrandLabel, hasSale } from '@/lib/menu-utils';
import { faqs, steps, testimonials, valueProps } from '@/lib/site-data';

const categoryTiles = [
  {
    title: 'Flower',
    href: '/menu?category=Flower',
    image: '/assets/flower.avif',
    count: menuCounts.Flower,
    note: 'Strain-led options with price, size, THC, and deal filters.'
  },
  {
    title: 'Pre-Rolls',
    href: '/menu?category=Pre-Rolls',
    image: '/assets/preroll.avif',
    count: menuCounts['Pre-Rolls'],
    note: 'Ready-to-order formats built for speed and convenience.'
  },
  {
    title: 'Edibles',
    href: '/menu?category=Edibles',
    image: '/assets/edible.avif',
    count: menuCounts.Edibles,
    note: 'Flavor-first products with clear pricing and product detail.'
  }
];

function ClaimSection({ onClaim }: { onClaim: () => void }) {
  return (
    <section className="luxe-dark relative overflow-hidden py-14 sm:py-16">
      <div className="luxury-shell relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--champagne)] sm:text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Free gift drop
          </p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
            Scan, claim, delivered to your door.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">
            Spot the Raindrops sticker around NYC? Drop your details — adults 21+ in Manhattan, Brooklyn, or Queens are eligible for a complimentary gift with their next order.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
          <button onClick={onClaim} className="btn-luxe btn-luxe-gold">
            Claim this offer
            <ArrowRight className="h-4 w-4" />
          </button>
          <Link href="#coverage" className="btn-luxe btn-luxe-ghost">
            Check coverage
          </Link>
        </div>
      </div>
    </section>
  );
}

function MenuPreview() {
  return (
    <section className="py-14 sm:py-16 md:py-20">
      <div className="luxury-shell">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.24em]">Shop categories</p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)] sm:text-4xl md:text-5xl">Shop by format, not by friction.</h2>
          </div>
          <TextLink href="/menu">Open full filtered menu</TextLink>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {categoryTiles.map((tile, index) => (
            <motion.div key={tile.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
              <Link href={tile.href} className="group block overflow-hidden rounded-2xl border border-white/70 bg-white/76 shadow-[0_18px_54px_rgba(25,35,20,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(25,35,20,0.12)]">
                <div className="relative aspect-[5/3] overflow-hidden bg-[#f8f1e4]">
                  <Image src={tile.image} alt={`${tile.title} products`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--emerald-deep)] backdrop-blur sm:text-xs sm:tracking-[0.14em]">
                    {tile.count} items
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">{tile.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{tile.note}</p>
                  <p className="mt-4 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.16em]">
                    Filter category
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DealsStrip() {
  const deals = menuProducts.filter(hasSale).slice(0, 6);
  if (deals.length === 0) return null;

  return (
    <section className="border-y border-[var(--line)] bg-[#fffdf7] py-12 sm:py-14 md:py-16">
      <div className="luxury-shell">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.24em]">
              <BadgePercent className="h-3.5 w-3.5" />
              On sale now
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)] sm:text-4xl md:text-5xl">Deals worth grabbing tonight.</h2>
          </div>
          <TextLink href="/deals">See all deals</TextLink>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {deals.map((product) => (
            <Link key={product.id} href={`/menu?product=${encodeURIComponent(product.id)}`} className="group flex items-center gap-3 rounded-2xl border border-white/70 bg-white/82 p-3 shadow-[0_18px_54px_rgba(25,35,20,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(25,35,20,0.12)]">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#fbf7ee]">
                {product.image && (
                  <Image src={product.image} alt={product.name} fill unoptimized sizes="80px" className="object-contain p-2" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">{getBrandLabel(product)}</p>
                <p className="truncate font-bold text-[var(--emerald-deep)]">{product.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  {product.salePrice < product.price && <span className="text-[11px] font-bold text-[var(--muted)] line-through">{formatPrice(product.price)}</span>}
                  <span className="text-base font-extrabold text-[var(--emerald)]">{formatPrice(product.salePrice)}</span>
                </div>
              </div>
              <Tag className="h-4 w-4 shrink-0 text-[var(--champagne)]" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValuePropBar() {
  return (
    <section className="py-14 sm:py-16 md:py-20">
      <div className="luxury-shell">
        <div className="max-w-3xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.24em]">Why choose Raindrops</p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)] sm:text-4xl md:text-5xl">Four reasons New Yorkers come back.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-white/70 bg-white/82 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
              <Star className="h-6 w-6 text-[var(--emerald)]" />
              <h3 className="mt-4 font-[var(--font-display)] text-2xl font-bold text-[var(--emerald-deep)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section className="py-14 sm:py-16 md:py-20">
      <div className="luxury-shell">
        <div className="mb-8 max-w-3xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.24em]">How ordering works</p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)] sm:text-4xl md:text-5xl">Browse confidently, then checkout securely.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="rounded-2xl border border-white/70 bg-white/76 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.2em]">{step.eyebrow}</p>
              <h3 className="mt-4 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-[#fbf7ee] py-14 sm:py-16 md:py-20">
      <div className="luxury-shell">
        <div className="max-w-3xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.24em]">Customer voices</p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)] sm:text-4xl md:text-5xl">Real orders, from real New Yorkers.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.author} className="rounded-2xl border border-white/70 bg-white/86 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
              <div className="flex items-center gap-1 text-[var(--champagne)]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 font-[var(--font-display)] text-xl leading-7 text-[var(--emerald-deep)]">“{item.quote}”</blockquote>
              <figcaption className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.16em]">
                {item.author} • {item.location}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogPreview({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <section className="py-14 sm:py-16 md:py-20">
      <div className="luxury-shell">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.24em]">Journal</p>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)] sm:text-4xl md:text-5xl">Guides for smarter ordering.</h2>
          </div>
          <TextLink href="/blog">View all articles</TextLink>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-2xl border border-white/70 bg-white/78 shadow-[0_18px_54px_rgba(25,35,20,0.08)] transition hover:-translate-y-1">
              <div className="relative aspect-[5/3] overflow-hidden bg-[#f8f1e4]">
                <Image src={post.coverImage} alt={post.coverAlt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.18em]">{post.category} - {post.readTime}</p>
                <h3 className="mt-3 font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--emerald-deep)]">{post.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [active, setActive] = useState(0);

  return (
    <section id="faq" className="py-14 sm:py-16 md:py-20">
      <div className="luxury-shell grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--champagne-dark)] sm:text-xs sm:tracking-[0.24em]">FAQ</p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)] sm:text-4xl md:text-5xl">Clear answers before checkout.</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={faq.q} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/76 shadow-sm">
              <button
                onClick={() => setActive(active === index ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-[var(--emerald-deep)]"
                aria-expanded={active === index}
              >
                {faq.q}
                <ChevronDown className={`h-5 w-5 shrink-0 transition ${active === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {active === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <p className="px-5 pb-5 text-sm leading-7 text-[var(--muted)]">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage({ posts }: { posts: BlogPostMeta[] }) {
  const [claimOpen, setClaimOpen] = useState(false);
  const openClaim = () => setClaimOpen(true);
  const closeClaim = () => setClaimOpen(false);

  const slides: HeroSlide[] = [
    {
      id: 'free-gift',
      image: '/assets/banner-gift.jpg',
      imageAlt: 'Raindrops Greenery free gift drop — Manhattan, Brooklyn, Queens',
      imagePosition: 'right center',
      eyebrow: 'NYC ONLY · 21+',
      headline: 'Your FREE GIFT is waiting',
      headlineAccent: 'FREE GIFT',
      subtext: 'Scan the sticker. Claim your offer. Available for NYC customers only.',
      primary: { label: 'Claim this offer', onClick: openClaim },
      secondary: { label: 'Browse menu', href: '/menu' }
    },
    {
      id: 'premium-drops',
      image: '/assets/banner-drops.webp',
      imageAlt: 'Premium Raindrops Greenery deliveries across New York City',
      imagePosition: 'center',
      eyebrow: 'Members only · 21+',
      headline: 'Premium drops. NYC only.',
      headlineAccent: 'NYC only',
      subtext: 'Exclusive Raindrops Greenery offers for local customers — same-day delivery across Manhattan, Brooklyn, and Queens.',
      primary: { label: 'Check availability', href: '#coverage' },
      secondary: { label: 'Shop deals', href: '/deals' }
    }
  ];

  return (
    <SiteChrome>
      <HeroSlider slides={slides} />
      <ClaimSection onClaim={openClaim} />
      <div id="coverage">
        <CoverageMap />
      </div>
      <MenuPreview />
      <DealsStrip />
      <ValuePropBar />
      <Steps />
      <Testimonials />
      <BlogPreview posts={posts} />
      <FAQ />
      <section className="pb-16">
        <div className="luxury-shell rounded-2xl border border-[rgba(217,183,111,0.45)] bg-white/72 p-5 text-sm leading-7 text-[var(--muted)] shadow-sm">
          <strong className="text-[var(--emerald-deep)]">Menu note:</strong> Browse {menuProducts.length} Flower, Pre-Roll, and Edible products here. Final pricing, availability, and delivery details are confirmed during checkout.
        </div>
      </section>

      <ClaimOfferModal open={claimOpen} onClose={closeClaim} />
    </SiteChrome>
  );
}
