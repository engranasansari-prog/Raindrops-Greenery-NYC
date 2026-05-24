import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Compass, HandHeart, Leaf, Shield, Sparkles, Truck } from 'lucide-react';
import SiteChrome, { OrderButton, TextLink } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { business, serviceAreas, testimonials, valueProps } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Raindrops Greenery is a New York licensed cannabis delivery operator focused on Manhattan, Brooklyn, and Queens. Curated menu, transparent pricing, professional handoff.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Raindrops Greenery',
    description: 'New York licensed cannabis delivery. Curated. Transparent. Professional.',
    url: '/about',
    images: [{ url: '/assets/storefront.webp', width: 1200, height: 800, alt: 'Raindrops Greenery delivery operations' }]
  }
};

const pillars = [
  { icon: Leaf, title: 'Curated', body: 'A focused menu of Flower, Pre-Rolls, and Edibles instead of overwhelming category sprawl.' },
  { icon: Shield, title: 'Compliant', body: 'New York licensed, age-verified at the door, fully tax-aware checkout.' },
  { icon: Truck, title: 'Local', body: 'Built around NYC delivery — Manhattan, Brooklyn, and Queens — with windows that fit the way the city moves.' },
  { icon: Sparkles, title: 'Premium', body: 'Brands we use ourselves, presented with the detail customers actually need.' }
];

export default function AboutPage() {
  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-[#06130f] text-white">
        <Image src="/assets/heroPhoto.jpg" alt="" fill priority sizes="100vw" className="object-cover opacity-32" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,19,15,0.92),rgba(6,19,15,0.62))]" />
        <div className="luxury-shell relative grid gap-8 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <Breadcrumbs items={[{ label: 'About' }]} tone="dark" />
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">About Raindrops</p>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">A premium New York cannabis delivery, done right.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/74">
              Raindrops Greenery launched to bring a calmer, more confident path into licensed cannabis delivery for {serviceAreas.join(', ')}. Less noise, better product detail, and a delivery experience that respects your time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--emerald-deep)] shadow-xl transition hover:-translate-y-0.5 hover:bg-[var(--champagne)]">
                Browse the menu
                <ArrowRight className="h-4 w-4" />
              </Link>
              <OrderButton />
            </div>
          </div>
          <div className="rounded-lg border border-white/14 bg-white/10 p-6 backdrop-blur">
            <Compass className="h-7 w-7 text-[var(--champagne)]" />
            <h2 className="mt-4 font-[var(--font-display)] text-3xl font-bold">Our promise</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-white/72">
              <li className="flex items-start gap-3"><HandHeart className="mt-0.5 h-4 w-4 shrink-0 text-[var(--champagne)]" /> Adult, 21+ delivery handled with care and discretion.</li>
              <li className="flex items-start gap-3"><Leaf className="mt-0.5 h-4 w-4 shrink-0 text-[var(--champagne)]" /> Sourced from licensed New York operators, lab-tested by NY-certified facilities.</li>
              <li className="flex items-start gap-3"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--champagne)]" /> Fast, on-time arrivals in {serviceAreas.join(' / ')} with clear pricing.</li>
              <li className="flex items-start gap-3"><Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--champagne)]" /> Secure checkout, ID verified at the door, unbranded packaging.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="luxury-shell grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne-dark)]">Why we built this</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">A clearer way to shop in a noisy market.</h2>
            <p className="mt-5 leading-8 text-[var(--muted)]">
              When New York opened legal adult-use cannabis, the customer experience didn’t catch up. Endless menus, vague product detail, and clunky checkout. Raindrops Greenery started with a simple bet: keep the catalog focused, show the details that actually help an adult customer decide, and make checkout fast.
            </p>
            <p className="mt-4 leading-8 text-[var(--muted)]">
              We curate Flower, Pre-Rolls, and Edibles — three categories, picked carefully — and we run delivery the way we’d want one for ourselves: discreet, on time, and respectful of your space.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <TextLink href="/menu">Browse the menu</TextLink>
              <TextLink href="/delivery">See delivery areas</TextLink>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-lg border border-white/70 bg-white/82 p-5 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
                <Icon className="h-7 w-7 text-[var(--emerald)]" />
                <h3 className="mt-4 font-[var(--font-display)] text-2xl font-bold text-[var(--emerald-deep)]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b3025] py-14 text-white md:py-20">
        <div className="luxury-shell">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">What we stand on</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold leading-tight md:text-5xl">Four commitments to every adult New York customer.</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {valueProps.map((value) => (
              <div key={value.title} className="rounded-lg border border-white/12 bg-white/8 p-6">
                <h3 className="font-[var(--font-display)] text-2xl font-bold">{value.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/68">{value.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="luxury-shell">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne-dark)]">Customer voices</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)] md:text-5xl">Real orders, from real New Yorkers.</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure key={item.author} className="rounded-lg border border-white/70 bg-white/84 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
                <blockquote className="font-[var(--font-display)] text-xl leading-7 text-[var(--emerald-deep)]">“{item.quote}”</blockquote>
                <figcaption className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--champagne-dark)]">
                  {item.author} • {item.location}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="luxury-shell rounded-lg border border-[rgba(217,183,111,0.45)] bg-white/82 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)] md:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--champagne-dark)]">Sovereign-licensed cannabis</p>
          <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)] md:text-4xl">Operating under Shinnecock Indian Nation authority.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            Raindrops Greenery is a Shinnecock-licensed cannabis delivery partner. Every product on the menu is sourced, tracked, and sold under the cannabis program of the {business.licensingAuthority}. Lab testing, packaging, and supply records are maintained accordingly.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <OrderButton label="Start an order" />
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--emerald-deep)] transition hover:border-[var(--champagne)]">
              Talk to support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-5 text-xs leading-6 text-[var(--muted)]">
            Operated by {business.legalName}. {business.licensingShort}.
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}
