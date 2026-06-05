import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Compass, HandHeart, Leaf, Shield, Sparkles, Truck } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { business, serviceAreas, testimonials, valueProps } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'About Our NYC Weed Delivery',
  description:
    'Tribally licensed weed delivery for Manhattan plus Long Island City, Williamsburg, and Greenpoint. Curated cannabis menu, transparent pricing, free delivery.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Raindrops Greenery',
    description: 'Tribally licensed NYC cannabis delivery. Curated. Transparent. Professional.',
    url: '/about',
    images: [{ url: '/assets/DISPENSARYIMAGE.jpg', width: 1200, height: 800, alt: 'Raindrops Greenery NYC dispensary' }]
  }
};

const pillars = [
  { icon: Leaf, title: 'Curated', body: 'A focused menu of Flower Strains, Pre-Rolls, and Edibles instead of overwhelming category sprawl.' },
  { icon: Shield, title: 'Compliant', body: 'Age-verified at the door, tax-free checkout.' },
  { icon: Truck, title: 'Local', body: 'Built around NYC delivery — Manhattan plus parts of Brooklyn (Williamsburg, Greenpoint) and Queens (Long Island City) — with windows that fit the way the city moves.' },
  { icon: Sparkles, title: 'Premium', body: 'Brands we use ourselves, presented with the detail customers actually need.' }
];

// Icons for the "What we stand on" value cards, matched to valueProps order
// (Tax-free, Free delivery, Sticky icky, Premium). Gives each card a visual
// anchor so the shorter ones don't read as empty next to the long ones.
const VALUE_ICONS = [Shield, Truck, Leaf, Sparkles];

export default function AboutPage() {
  return (
    <SiteChrome>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
        <Image src="/assets/heroPhoto.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-[0.28]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,51,40,0.94),rgba(27,51,40,0.55))]" />
        <div className="luxury-shell relative grid gap-8 py-12 sm:py-16 lg:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Breadcrumbs items={[{ label: 'About' }]} tone="dark" />
            <p className="mt-5 rd-eyebrow text-[color:var(--rd-glow)]">About Raindrops</p>
            <h1 className="mt-4 text-[color:var(--rd-text)]">
              A premium New York <span className="italic">cannabis delivery,</span> done right.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-text-dim)] sm:text-lg sm:leading-8">
              Raindrops Greenery launched to bring a calmer, more confident path into licensed cannabis delivery for {serviceAreas.join(', ')}. Less noise, better product detail, and a delivery experience that respects your time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu" className="btn-luxe btn-luxe-gold">
                Browse the menu
                <ArrowRight />
              </Link>
              <OrderButton />
            </div>
          </div>
          <div className="rounded-3xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)]/65 p-6 shadow-[0_24px_72px_rgba(0,0,0,0.32)] backdrop-blur">
            <Compass className="h-7 w-7 text-[color:var(--rd-glow)]" />
            <h2
              className="mt-4 text-[color:var(--rd-text)]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', letterSpacing: '-0.015em' }}
            >
              Our <span className="italic">promise</span>
            </h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-[color:var(--rd-text-dim)]">
              <li className="flex items-start gap-3"><HandHeart className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" /> Adult, 21+ delivery handled with care and discretion.</li>
              <li className="flex items-start gap-3"><Leaf className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" /> Sourced through the Shinnecock Nation Cannabis Regulatory Division.</li>
              <li className="flex items-start gap-3"><Shield className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" /> Tax-Free</li>
              <li className="flex items-start gap-3"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" /> Free delivery on every order over $25.</li>
              <li className="flex items-start gap-3"><Shield className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" /> ID verified at the door. Discreet hand-offs.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why we built this */}
      <section className="bg-[color:var(--rd-paper)] py-12 sm:py-16 lg:py-20">
        <div className="luxury-shell grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-start">
          <div>
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">Why we built this</p>
            <h2 className="mt-3 text-[color:var(--rd-ink)]">
              A clearer way <span className="italic">to shop in a noisy market.</span>
            </h2>
            <p className="mt-5 text-base leading-8 text-[color:var(--rd-on-paper-dim)] sm:text-lg">
              When New York opened legal adult-use cannabis, the customer experience didn’t catch up. Endless menus, vague product detail, and clunky checkout. Raindrops Greenery started with a simple bet: keep the catalog focused, show the details that actually help an adult customer decide, and make checkout fast.
            </p>
            <p className="mt-4 text-base leading-8 text-[color:var(--rd-on-paper-dim)] sm:text-lg">
              We curate Flower Strains, Pre-Rolls, and Edibles — three categories, picked carefully — and we run delivery the way we’d want one for ourselves: discreet, on time, and respectful of your space.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/menu" className="btn-luxe btn-luxe-dark">
                Browse the menu
                <ArrowRight />
              </Link>
              <Link href="/delivery" className="btn-luxe btn-luxe-outline">
                See delivery areas
                <ArrowRight />
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/70 p-6 shadow-[0_18px_54px_rgba(46,82,64,0.08)]"
              >
                <Icon className="h-7 w-7 text-[color:var(--rd-moss)]" />
                <h3
                  className="mt-4 text-[color:var(--rd-ink)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(1.25rem, 1.6vw, 1.5rem)', letterSpacing: '-0.015em' }}
                >
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--rd-on-paper-dim)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we stand on — dark band */}
      <section className="bg-[color:var(--rd-ink)] py-16 text-[color:var(--rd-text)] sm:py-20">
        <div className="luxury-shell">
          <div className="max-w-3xl">
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">What we stand on</p>
            <h2 className="mt-3 text-[color:var(--rd-text)]">
              Four commitments <span className="italic">to every adult New York customer.</span>
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {valueProps.map((value, i) => {
              const Icon = VALUE_ICONS[i] ?? Leaf;
              return (
                <div
                  key={value.title}
                  className="flex h-full flex-col rounded-2xl border border-[color:var(--rd-paper)]/10 bg-[color:var(--rd-ink-soft)]/55 p-6 sm:p-7"
                >
                  <Icon className="h-7 w-7 text-[color:var(--rd-glow)]" />
                  <h3
                    className="mt-4 text-[color:var(--rd-text)]"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(1.2rem, 1.6vw, 1.4rem)', letterSpacing: '-0.015em' }}
                  >
                    {value.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--rd-text-dim)]">{value.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer voices */}
      <section className="bg-[color:var(--rd-paper)] py-12 sm:py-16 lg:py-20">
        <div className="luxury-shell">
          <div className="max-w-3xl">
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">Customer voices</p>
            <h2 className="mt-3 text-[color:var(--rd-ink)]">
              Real orders, <span className="italic">from real New Yorkers.</span>
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure
                key={item.author}
                className="rounded-3xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/80 p-7 shadow-[0_18px_54px_rgba(46,82,64,0.08)]"
              >
                <blockquote
                  className="text-[color:var(--rd-ink)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(1.1rem, 1.5vw, 1.25rem)', lineHeight: 1.45, letterSpacing: '-0.01em' }}
                >
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-6 inline-flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--rd-moss)] text-sm font-semibold text-[color:var(--rd-glow)] [font-family:var(--font-mono)]">
                    {item.author.charAt(0)}
                  </span>
                  <span className="text-left leading-tight">
                    <span className="block text-sm font-semibold text-[color:var(--rd-ink)]">{item.author}</span>
                    <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--rd-moss)] [font-family:var(--font-mono)]">
                      {item.location}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Licensing CTA card */}
      <section className="bg-[color:var(--rd-paper)] pb-20 sm:pb-24">
        <div className="luxury-shell">
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--rd-amber)]/30 bg-[color:var(--rd-paper-soft)]/85 p-8 shadow-[0_24px_72px_rgba(46,82,64,0.10)] sm:p-12">
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">Tribally licensed cannabis</p>
            <h2 className="mt-3 text-[color:var(--rd-ink)]">
              A <span className="italic">Tribally licensed</span> dispensary.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[color:var(--rd-on-paper-dim)] sm:text-lg">
              Raindrops Greenery is a Tribally licensed dispensary. All Products are produced, packaged, and sold on Native Sovereign Land. {business.license}.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <OrderButton label="Start an order" />
              <Link href="/contact" className="btn-luxe btn-luxe-outline">
                Talk to support
                <ArrowRight />
              </Link>
            </div>
            <p className="mt-6 text-xs leading-6 text-[color:var(--rd-on-paper-mute)]">
              Operated by {business.legalName}. {business.licensingShort}.
            </p>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
