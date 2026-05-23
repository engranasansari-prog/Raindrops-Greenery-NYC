'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Mail, Menu, MapPin, Phone, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import PromoStrip from '@/components/PromoStrip';
import NewsletterForm from '@/components/NewsletterForm';
import { business, checkout, footerLinkGroups, navItems, serviceAreas, social } from '@/lib/site-data';

export function OrderButton({ label = 'Order now', className = '' }: { label?: string; className?: string }) {
  return (
    <Link
      href={checkout.dutchieUrl}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[var(--emerald-deep)] px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_16px_44px_rgba(7,51,38,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--emerald)] ${className}`}
    >
      <ShoppingBag className="h-4 w-4" />
      {label}
    </Link>
  );
}

function AgeGate() {
  const [show, setShow] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(localStorage.getItem('rd_age_confirmed') !== 'yes');
  }, []);

  const confirmAge = () => {
    localStorage.setItem('rd_age_confirmed', 'yes');
    setShow(false);
  };

  const declineAge = () => setDeclined(true);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06130f]/90 p-5 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="agegate-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-md rounded-lg border border-white/70 bg-[#fffaf0] p-7 text-center shadow-2xl"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[var(--champagne)] bg-white shadow-lg">
              <Image src="/assets/logo.jpg" width={80} height={80} alt="Raindrops Greenery logo" className="h-full w-full object-cover" />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[var(--champagne-dark)]">21+ only</p>
            <h2 id="agegate-title" className="mt-3 font-[var(--font-display)] text-4xl font-bold leading-tight text-[var(--emerald-deep)]">
              Welcome to Raindrops NY
            </h2>
            {declined ? (
              <>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[var(--muted)]">
                  Sorry — this website and our delivery service are restricted to adults 21 and older. Please come back when you are of legal age.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setDeclined(false)}
                    className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[var(--champagne)]"
                  >
                    Back
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[var(--muted)]">
                  This website is intended for adults 21 and older. By entering you confirm that you are 21+ and accept our{' '}
                  <Link href="/legal/terms" className="underline">Terms</Link> and{' '}
                  <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button onClick={confirmAge} className="rounded-full bg-[var(--emerald-deep)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--emerald)]">
                    I am 21 or older
                  </button>
                  <button onClick={declineAge} className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--champagne)]">
                    I am under 21
                  </button>
                </div>
              </>
            )}
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
              Keep cannabis out of reach of children and pets.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-[#fffaf0]/86 backdrop-blur-2xl">
      <PromoStrip />
      <div className="luxury-shell flex h-[76px] items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3" aria-label="Raindrops Greenery home">
          <span className="relative flex h-11 w-11 overflow-hidden rounded-full border border-[var(--champagne)] bg-white shadow-sm">
            <Image src="/assets/logo.jpg" alt="Raindrops Greenery" fill sizes="44px" className="object-cover" />
          </span>
          <span>
            <span className="block font-[var(--font-display)] text-xl font-bold leading-none text-[var(--emerald-deep)]">Raindrops</span>
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--champagne-dark)]">NY Delivery</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 text-sm font-bold transition ${isActive(item.href) ? 'bg-white text-[var(--emerald-deep)] shadow-sm' : 'text-[var(--muted)] hover:bg-white/70 hover:text-[var(--emerald-deep)]'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--emerald-deep)]">
            <ShieldCheck className="h-4 w-4 text-[var(--emerald)]" />
            21+ delivery
          </span>
          <OrderButton />
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-[var(--line)] bg-white p-3 text-[var(--emerald-deep)] shadow-sm lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[var(--line)] bg-[#fffaf0] lg:hidden">
            <div className="luxury-shell grid gap-2 py-5">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-[var(--emerald-deep)] shadow-sm">
                  {item.label}
                </Link>
              ))}
              <OrderButton className="mt-2 w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  const address = business.address;
  return (
    <footer className="border-t border-[var(--line)] bg-[#06130f] text-white">
      <div className="luxury-shell grid gap-10 py-14 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex h-12 w-12 overflow-hidden rounded-full border border-[var(--champagne)]">
              <Image src="/assets/logo.jpg" alt="Raindrops Greenery logo" fill sizes="48px" className="object-cover" />
            </span>
            <span>
              <span className="block font-[var(--font-display)] text-2xl font-bold">{business.tradeName}</span>
              <span className="block text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--champagne)]">New York delivery</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/64">
            Premium 21+ cannabis delivery for {serviceAreas.join(', ')}. Browse Flower, Pre-Rolls, and Edibles before completing secure checkout.
          </p>

          <ul className="mt-6 grid gap-2 text-sm text-white/74">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--champagne)]" />
              <span>
                {address.line1}, {address.line2}<br />
                {address.city}, {address.region} {address.postalCode}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-[var(--champagne)]" />
              <a href={business.phoneHref} className="hover:text-white">{business.phone}</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-[var(--champagne)]" />
              <a href={business.emailHref} className="hover:text-white">{business.email}</a>
            </li>
          </ul>

          <div className="mt-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--champagne)]">Get drops by email</p>
            <div className="mt-3 max-w-sm">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinkGroups.map((group) => (
            <div key={group.heading}>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[var(--champagne)]">{group.heading}</p>
              <ul className="mt-4 grid gap-2 text-sm text-white/72">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-white">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="luxury-shell flex flex-col gap-5 py-6 text-xs text-white/56 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/14 px-3 py-1 font-extrabold uppercase tracking-[0.2em] text-white/72">
              NY OCM license: {business.ocmLicense}
            </span>
            <span>&copy; {new Date().getFullYear()} {business.legalName}. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {social.map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="rounded-full border border-white/14 px-3 py-1 font-bold text-white/70 transition hover:border-[var(--champagne)] hover:text-white">
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="luxury-shell pb-6 text-[11px] leading-6 text-white/40">
          For use only by adults 21 years of age or older. Keep out of reach of children and pets. Do not operate a vehicle or machinery under the influence of cannabis. There may be health risks associated with consumption of this product. Cannabis has not been analyzed or approved by the FDA. For more information go to the New York State Cannabis Control Board.
        </div>
      </div>
    </footer>
  );
}

function StickyOrderBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 520);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 24, x: '-50%' }}
          className="fixed bottom-4 left-1/2 z-40 w-[min(720px,calc(100%-24px))] rounded-full border border-white/70 bg-[#fffaf0]/90 p-2 shadow-[0_20px_70px_rgba(7,51,38,0.22)] backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="hidden pl-4 sm:block">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--champagne-dark)]">Ready to checkout?</p>
              <p className="text-sm font-bold text-[var(--emerald-deep)]">Continue to secure checkout</p>
            </div>
            <OrderButton className="w-full sm:w-auto" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AgeGate />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <StickyOrderBar />
    </>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-extrabold text-[var(--emerald-deep)] transition hover:text-[var(--champagne-dark)]">
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
