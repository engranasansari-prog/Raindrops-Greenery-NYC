'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Mail, Menu, Phone, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import PromoStrip from '@/components/PromoStrip';
import NewsletterForm from '@/components/NewsletterForm';
import OpenStatus from '@/components/OpenStatus';
import { business, checkout, footerLinkGroups, navItems, serviceAreas, social } from '@/lib/site-data';

/**
 * Primary CTA — pill in --rd-glow with ink text. Matches design brief §3.1.
 * Use this for the highest-priority action on a page.
 */
export function OrderButton({ label = 'Order now', className = '' }: { label?: string; className?: string }) {
  return (
    <Link
      href={checkout.dutchieUrl}
      target="_blank"
      rel="noreferrer"
      className={`group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[color:var(--rd-glow)] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-ink)] shadow-[0_12px_36px_rgba(200,230,110,0.32)] transition-[transform,box-shadow,background] duration-300 [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(200,230,110,0.42)] [font-family:var(--font-mono)] ${className}`}
    >
      <ShoppingBag className="h-3.5 w-3.5" />
      {label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform [transition-timing-function:var(--ease-out)] group-hover:translate-x-0.5" />
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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (show) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [show]);

  const confirmAge = () => {
    localStorage.setItem('rd_age_confirmed', 'yes');
    setShow(false);
  };

  const declineAge = () => setDeclined(true);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--rd-ink)]/92 p-5 backdrop-blur-xl"
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
            className="w-full max-w-md rounded-2xl border border-[color:var(--rd-paper-soft)]/60 bg-[color:var(--rd-paper)] p-8 text-center shadow-2xl"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[color:var(--rd-amber)]/50 bg-white shadow-lg">
              <Image src="/assets/logo.jpg" width={80} height={80} alt="Raindrops Greenery logo" className="h-full w-full object-cover" />
            </div>
            <p className="rd-eyebrow text-[color:var(--rd-amber-dark)]">21+ only</p>
            <h2 id="agegate-title" className="mt-4 text-3xl text-[color:var(--rd-ink)]">
              Welcome to Raindrops NY
            </h2>
            {declined ? (
              <>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[color:var(--rd-on-paper-dim)]">
                  Sorry — this website and our delivery service are restricted to adults 21 and older. Please come back when you are of legal age.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setDeclined(false)}
                    className="rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--rd-ink)] transition hover:border-[color:var(--rd-glow)] [font-family:var(--font-mono)]"
                  >
                    Back
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[color:var(--rd-on-paper-dim)]">
                  This website is intended for adults 21 and older. By entering you confirm that you are 21+ and accept our{' '}
                  <Link href="/legal/terms" className="underline decoration-[color:var(--rd-glow)] underline-offset-4">Terms</Link> and{' '}
                  <Link href="/legal/privacy" className="underline decoration-[color:var(--rd-glow)] underline-offset-4">Privacy Policy</Link>.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button onClick={confirmAge} className="rounded-full bg-[color:var(--rd-glow)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--rd-ink)] transition hover:-translate-y-0.5 [transition-timing-function:var(--ease-out)] [font-family:var(--font-mono)]">
                    I am 21 or older
                  </button>
                  <button onClick={declineAge} className="rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--rd-ink)] transition hover:border-[color:var(--rd-moss)] [font-family:var(--font-mono)]">
                    I am under 21
                  </button>
                </div>
              </>
            )}
            <p className="mt-6 rd-eyebrow text-[color:var(--rd-on-paper-mute)]">
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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 24);
    handle();
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-[background,backdrop-filter,border-color] duration-500 [transition-timing-function:var(--ease-out)] ${
        scrolled
          ? 'border-b border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink)]/82 backdrop-blur-2xl backdrop-saturate-150'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <PromoStrip />
      <div className="luxury-shell flex h-[72px] items-center justify-between gap-5 md:h-[84px]">
        <Link href="/" className="group flex items-center gap-3" aria-label="Raindrops Greenery home">
          <span className="relative flex h-10 w-10 overflow-hidden rounded-full border border-[color:var(--rd-amber)]/40 bg-[color:var(--rd-ink-soft)] shadow-sm transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:scale-105 md:h-11 md:w-11">
            <Image src="/assets/logo.jpg" alt="Raindrops Greenery" fill sizes="44px" className="object-cover" />
          </span>
          <span className="leading-none">
            <span className="block text-2xl font-medium tracking-[-0.02em] text-[color:var(--rd-text)] [font-family:var(--font-display)] md:text-[1.625rem]">
              Raindrops
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)]">
              NY · Delivery
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative px-3 py-2 text-sm transition-colors duration-300 [transition-timing-function:var(--ease-out)] ${
                  active ? 'text-[color:var(--rd-glow)]' : 'text-[color:var(--rd-text-dim)] hover:text-[color:var(--rd-text)]'
                }`}
              >
                {item.label}
                <span
                  className={`pointer-events-none absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-[color:var(--rd-glow)] transition-transform duration-300 [transition-timing-function:var(--ease-out)] ${
                    active ? 'scale-x-100' : 'group-hover:scale-x-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <OpenStatus tone="dark" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
            21+
          </span>
          <OrderButton />
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-[color:var(--rd-text-dim)]/30 bg-[color:var(--rd-ink-soft)]/60 p-3 text-[color:var(--rd-text)] backdrop-blur transition hover:border-[color:var(--rd-glow)] hover:text-[color:var(--rd-glow)] lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink)]/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="luxury-shell grid gap-2 py-5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)] px-4 py-3.5 text-sm font-medium text-[color:var(--rd-text)] transition hover:border-[color:var(--rd-glow)]/40 hover:text-[color:var(--rd-glow)]"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between gap-3">
                <OpenStatus tone="dark" />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
                  21+
                </span>
              </div>
              <OrderButton className="mt-2 w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
      <div className="luxury-shell grid gap-10 py-14 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex h-12 w-12 overflow-hidden rounded-full border border-[color:var(--rd-amber)]/40">
              <Image src="/assets/logo.jpg" alt="Raindrops Greenery logo" fill sizes="48px" className="object-cover" />
            </span>
            <span>
              <span className="block text-2xl text-[color:var(--rd-text)] [font-family:var(--font-display)]">{business.tradeName}</span>
              <span className="rd-eyebrow mt-1 block">New York delivery</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-[color:var(--rd-text-dim)]">
            Premium 21+ cannabis delivery for {serviceAreas.join(', ')}. Browse Flower, Pre-Rolls, and Edibles before completing secure checkout.
          </p>

          <ul className="mt-6 grid gap-2 text-sm text-[color:var(--rd-text-dim)]">
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" />
              <a href={business.phoneHref} className="hover:text-[color:var(--rd-text)]">{business.phone}</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" />
              <a href={business.emailHref} className="hover:text-[color:var(--rd-text)]">{business.email}</a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" />
              <span>Daily 10:00 AM – 12:00 AM</span>
            </li>
          </ul>

          <div className="mt-5">
            <OpenStatus tone="dark" />
          </div>

          <div className="mt-6">
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">Get drops by email</p>
            <div className="mt-3 max-w-sm">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinkGroups.map((group) => (
            <div key={group.heading}>
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">{group.heading}</p>
              <ul className="mt-4 grid gap-2 text-sm text-[color:var(--rd-text-dim)]">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors duration-300 [transition-timing-function:var(--ease-out)] hover:text-[color:var(--rd-text)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[color:var(--rd-paper)]/8">
        <div className="luxury-shell flex flex-col gap-5 py-6 text-xs text-[color:var(--rd-text-mute)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[color:var(--rd-paper)]/14 px-3 py-1 font-medium text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)]">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[color:var(--rd-glow)]" />
              <span className="break-words">{business.licensingShort}</span>
            </span>
            <span className="break-words">&copy; {new Date().getFullYear()} {business.legalName}. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {social.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[color:var(--rd-paper)]/14 px-3 py-1 font-medium text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)] hover:text-[color:var(--rd-glow)] [font-family:var(--font-mono)]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="luxury-shell pb-6 text-[11px] leading-6 text-[color:var(--rd-text-mute)]">
          For use only by adults 21 years of age or older. Keep out of reach of children and pets. Do not operate a vehicle or machinery under the influence of cannabis. There may be health risks associated with consumption of this product. Cannabis has not been analyzed or approved by the FDA. Sales and delivery are conducted under a cannabis license issued by the {business.licensingAuthority}.
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
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-1/2 z-40 w-[min(720px,calc(100%-16px))] rounded-full border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink)]/90 p-2 shadow-[0_20px_70px_rgba(10,20,16,0.45)] backdrop-blur-2xl"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="hidden pl-4 sm:block">
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">Ready to checkout?</p>
              <p className="mt-1 text-sm text-[color:var(--rd-text)]">Continue to secure checkout</p>
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
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm font-medium tracking-[-0.005em] text-[color:var(--rd-ink)] transition-colors duration-300 [transition-timing-function:var(--ease-out)] hover:text-[color:var(--rd-moss)]"
    >
      <span className="border-b border-[color:var(--rd-glow)] pb-0.5">{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1" />
    </Link>
  );
}
