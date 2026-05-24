'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { serviceAreas, supportedZips, trustPoints } from '@/lib/site-data';

export default function DeliveryPage() {
  const [zip, setZip] = useState('');
  const clean = zip.replace(/\D/g, '').slice(0, 5);
  const status = useMemo(() => {
    if (clean.length < 5) return null;
    return supportedZips.includes(clean);
  }, [clean]);

  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-[#06130f] text-white">
        <Image src="/assets/storefront.webp" alt="Raindrops Greenery delivery" fill priority sizes="100vw" className="object-cover opacity-32" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,19,15,0.9),rgba(6,19,15,0.58),rgba(6,19,15,0.72))]" />
        <div className="luxury-shell relative grid gap-8 py-14 md:py-20 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <Breadcrumbs items={[{ label: 'Delivery' }]} tone="dark" />
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">Raindrops New York delivery</p>
            <h1 className="mt-3 font-[var(--font-display)] text-5xl font-extrabold leading-tight md:text-7xl">Premium delivery for Manhattan, Brooklyn, and Queens.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/74">
              Browse a focused cannabis menu, check your area, and continue to secure checkout when you are ready to order.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/menu" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--emerald-deep)] shadow-xl transition hover:-translate-y-0.5 hover:bg-[var(--champagne)]">
                Browse menu
                <ArrowRight className="h-4 w-4" />
              </Link>
              <OrderButton />
            </div>
          </div>

          <div className="rounded-lg border border-white/14 bg-white/10 p-5 backdrop-blur">
            <Truck className="h-8 w-8 text-[var(--champagne)]" />
            <h2 className="mt-4 font-[var(--font-display)] text-3xl font-bold">Coverage preview</h2>
            <p className="mt-3 text-sm leading-7 text-white/64">
              Use this quick check before ordering. Final delivery eligibility, timing, payment, and verification are confirmed during checkout.
            </p>
            <input
              value={clean}
              onChange={(event) => setZip(event.target.value)}
              inputMode="numeric"
              aria-label="ZIP code"
              placeholder="Enter ZIP code"
              className="mt-5 w-full rounded-lg border border-white/16 bg-white px-4 py-4 text-lg font-bold text-[var(--emerald-deep)] outline-none transition focus:border-[var(--champagne)]"
            />
            <div className="mt-4 rounded-lg border border-white/12 bg-white/8 p-4">
              {status === null && <p className="text-sm text-white/62">Enter a 5-digit ZIP to preview coverage.</p>}
              {status === true && <p className="font-bold text-white">This ZIP is in the current preview list. Final details are confirmed during checkout.</p>}
              {status === false && <p className="font-bold text-[var(--champagne)]">This ZIP is not in the preview list. Checkout will confirm final eligibility.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="luxury-shell grid gap-5 md:grid-cols-3">
          {serviceAreas.map((area, index) => (
            <motion.div key={area} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="rounded-lg border border-white/70 bg-white/82 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
              <MapPin className="h-7 w-7 text-[var(--emerald)]" />
              <h2 className="mt-5 font-[var(--font-display)] text-3xl font-bold text-[var(--emerald-deep)]">{area}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Fast product browsing, clear checkout, and a mobile-first ordering path.</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-[#0b3025] py-12 text-white md:py-16">
        <div className="luxury-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">Delivery experience</p>
            <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold leading-tight md:text-5xl">Simple, focused, and built for repeat ordering.</h2>
            <p className="mt-5 leading-8 text-white/68">
              Everything on the site is designed to help adult customers find the right category quickly and move into checkout with confidence.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {trustPoints.map((point) => (
              <div key={point.title} className="rounded-lg border border-white/12 bg-white/8 p-5">
                <ShieldCheck className="h-6 w-6 text-[var(--champagne)]" />
                <h3 className="mt-4 font-bold">{point.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="luxury-shell rounded-lg border border-[rgba(217,183,111,0.45)] bg-white/82 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)] md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--champagne-dark)]">Customer promise</p>
              <h2 className="mt-3 font-[var(--font-display)] text-4xl font-bold text-[var(--emerald-deep)]">Browse here. Checkout securely.</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {['21+ only', 'Secure checkout', 'NYC delivery focus'].map((item) => (
                  <p key={item} className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)]">
                    <Check className="h-4 w-4 text-[var(--emerald)]" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <OrderButton label="Start checkout" />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
