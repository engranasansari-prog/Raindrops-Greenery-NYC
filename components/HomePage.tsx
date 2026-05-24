'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BadgePercent, ChevronDown, MapPin, Search, ShieldCheck, Sparkles, Star, Tag, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteChrome, { OrderButton, TextLink } from '@/components/SiteChrome';
import type { BlogPostMeta } from '@/lib/blog-posts';
import { menuCounts, menuProducts } from '@/lib/menu';
import { faqs, serviceAreas, steps, supportedZips, testimonials, trustPoints, valueProps } from '@/lib/site-data';
import { formatPrice, getBrandLabel, hasSale } from '@/lib/menu-utils';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 }
};

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

function Hero() {
  return (
    <section className="relative min-h-[680px] overflow-hidden bg-[#06130f] text-white md:min-h-[78vh]">
      <Image src="/assets/heroPhoto.jpg" alt="Raindrops Greenery New York delivery" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,19,15,0.88)_0%,rgba(6,19,15,0.62)_46%,rgba(6,19,15,0.18)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbf7ee] to-transparent" />

      <div className="luxury-shell relative flex min-h-[600px] items-center py-14 md:min-h-[calc(78vh-76px)]">
        <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.1 }} className="max-w-3xl">
          <motion.div variants={fadeUp} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/22 bg-white/12 px-4 py-2 backdrop-blur">
            <Sparkles className="h-4 w-4 text-[var(--champagne)]" />
            <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-white/86">Premium NYC cannabis delivery</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-[var(--font-display)] text-6xl font-extrabold leading-[0.92] text-white md:text-8xl">
            Raindrops Greenery
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-lg leading-8 text-white/78 md:text-xl">
            Browse Flower, Pre-Rolls, and Edibles for 21+ delivery in Manhattan, Brooklyn, and Queens.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/menu" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--emerald-deep)] shadow-xl transition hover:-translate-y-0.5 hover:bg-[var(--champagne)]">
              <Search className="h-4 w-4" />
              Browse menu
            </Link>
            <OrderButton />
          </motion.div>
          <motion.div variants={fadeUp} className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              [String(menuProducts.length), 'menu items'],
              ['3', 'delivery areas'],
              ['21+', 'adult use only']
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <p className="font-[var(--font-display)] text-3xl font-bold text-white">{value}</p>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-white/62">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MenuPreview() {
  return (
    <section className="py-14 md:py-20">
      <div className="luxury-shell">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne-dark)]">Product discovery</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">Shop by format, not by friction.</h2>
          </div>
          <TextLink href="/menu">Open full filtered menu</TextLink>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {categoryTiles.map((tile, index) => (
            <motion.div key={tile.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
              <Link href={tile.href} className="group block overflow-hidden rounded-lg border border-white/70 bg-white/76 shadow-[0_18px_54px_rgba(25,35,20,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(25,35,20,0.12)]">
                <div className="relative aspect-[5/3] overflow-hidden bg-[#f8f1e4]">
                  <Image src={tile.image} alt={`${tile.title} products`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--emerald-deep)] backdrop-blur">
                    {tile.count} items
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">{tile.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{tile.note}</p>
                  <p className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">
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
    <section className="border-y border-[var(--line)] bg-[#fffdf7] py-12 md:py-16">
      <div className="luxury-shell">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne-dark)]">
              <BadgePercent className="h-4 w-4" />
              On sale now
            </p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">Deals worth grabbing tonight.</h2>
          </div>
          <TextLink href="/deals">See all deals</TextLink>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {deals.map((product) => (
            <Link key={product.id} href={`/menu?product=${encodeURIComponent(product.id)}`} className="group flex items-center gap-3 rounded-lg border border-white/70 bg-white/82 p-3 shadow-[0_18px_54px_rgba(25,35,20,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(25,35,20,0.12)]">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#fbf7ee]">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill unoptimized sizes="80px" className="object-contain p-2" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--emerald-deep)]/40 text-xs">No image</div>
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
    <section className="py-14 md:py-20">
      <div className="luxury-shell">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne-dark)]">Why customers choose Raindrops</p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">Four reasons New Yorkers come back.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-lg border border-white/70 bg-white/82 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
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

function Testimonials() {
  return (
    <section className="bg-[#fbf7ee] py-14 md:py-20">
      <div className="luxury-shell">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne-dark)]">Customer voices</p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">Real orders, from real New Yorkers.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.author} className="rounded-lg border border-white/70 bg-white/86 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
              <div className="flex items-center gap-1 text-[var(--champagne)]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 font-[var(--font-display)] text-xl leading-7 text-[var(--emerald-deep)]">“{item.quote}”</blockquote>
              <figcaption className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">
                {item.author} • {item.location}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryStrip() {
  return (
    <section className="bg-[#0b3025] py-14 text-white md:py-20">
      <div className="luxury-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">Raindrops NY</p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold leading-tight md:text-5xl">Built for fast, clear New York delivery.</h2>
          <p className="mt-5 leading-8 text-white/68">
            A cleaner shopping path for adult customers: focused categories, easy product comparison, and a secure checkout flow when you are ready to order.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {trustPoints.map((point) => (
            <div key={point.title} className="rounded-lg border border-white/12 bg-white/8 p-5">
              <ShieldCheck className="h-6 w-6 text-[var(--champagne)]" />
              <h3 className="mt-4 font-bold text-white">{point.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeliveryCheck() {
  const [zip, setZip] = useState('');
  const clean = zip.replace(/\D/g, '').slice(0, 5);
  const status = useMemo(() => {
    if (clean.length < 5) return null;
    return supportedZips.includes(clean);
  }, [clean]);

  return (
    <section className="py-14 md:py-20">
      <div className="luxury-shell grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne-dark)]">Delivery coverage</p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">Focused on Manhattan, Brooklyn, and Queens.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-[var(--muted)]">
            Check your area, browse the menu, and confirm final delivery details during checkout.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {serviceAreas.map((area) => (
              <span key={area} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/72 px-4 py-2 text-sm font-bold text-[var(--emerald-deep)] shadow-sm">
                <MapPin className="h-4 w-4 text-[var(--emerald)]" />
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/70 bg-white/78 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)] backdrop-blur">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--emerald-deep)] text-white">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="mt-5 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">Quick ZIP check</h3>
          <input
            value={clean}
            onChange={(event) => setZip(event.target.value)}
            inputMode="numeric"
            aria-label="ZIP code"
            placeholder="Enter NYC ZIP code"
            className="mt-5 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-4 text-lg font-bold text-[var(--emerald-deep)] outline-none transition focus:border-[var(--champagne)]"
          />
          <div className="mt-4 min-h-16 rounded-lg border border-[var(--line)] bg-white/70 p-4">
            {status === null && <p className="text-sm text-[var(--muted)]">Enter a 5-digit ZIP to preview coverage.</p>}
            {status === true && <p className="font-bold text-[var(--emerald)]">This ZIP is in the current NYC coverage list. Final delivery details are confirmed during checkout.</p>}
            {status === false && <p className="font-bold text-[#92542c]">This ZIP is not in the preview list. Checkout will confirm final delivery eligibility.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section className="py-14 md:py-20">
      <div className="luxury-shell">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne-dark)]">Order flow</p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">Browse confidently, then checkout securely.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="rounded-lg border border-white/70 bg-white/76 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--champagne-dark)]">{step.eyebrow}</p>
              <h3 className="mt-4 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogPreview({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <section className="py-14 md:py-20">
      <div className="luxury-shell">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne-dark)]">Journal</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">Guides for smarter ordering.</h2>
          </div>
          <TextLink href="/blog">View all articles</TextLink>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-lg border border-white/70 bg-white/78 shadow-[0_18px_54px_rgba(25,35,20,0.08)] transition hover:-translate-y-1">
              <div className="relative aspect-[5/3] overflow-hidden bg-[#f8f1e4]">
                <Image src={post.coverImage} alt={post.coverAlt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne-dark)]">{post.category} - {post.readTime}</p>
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
    <section id="faq" className="py-14 md:py-20">
      <div className="luxury-shell grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne-dark)]">FAQ</p>
          <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">Clear answers before checkout.</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={faq.q} className="overflow-hidden rounded-lg border border-[var(--line)] bg-white/76 shadow-sm">
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
  return (
    <SiteChrome>
      <Hero />
      <MenuPreview />
      <DealsStrip />
      <ValuePropBar />
      <StoryStrip />
      <DeliveryCheck />
      <Steps />
      <Testimonials />
      <BlogPreview posts={posts} />
      <FAQ />
      <section className="pb-16">
        <div className="luxury-shell rounded-lg border border-[rgba(217,183,111,0.45)] bg-white/72 p-5 text-sm leading-7 text-[var(--muted)] shadow-sm">
          <strong className="text-[var(--emerald-deep)]">Menu note:</strong> Browse {menuProducts.length} Flower, Pre-Roll, and Edible products here. Final pricing, availability, and delivery details are confirmed during checkout.
        </div>
      </section>
    </SiteChrome>
  );
}
