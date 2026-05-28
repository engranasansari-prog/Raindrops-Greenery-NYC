'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Mail, Phone, ShieldCheck, ShoppingBag } from 'lucide-react';
import { InstagramIcon } from '@/components/SocialIcons';
import { useEffect, useState } from 'react';
import NewsletterForm from '@/components/NewsletterForm';
import OpenStatus from '@/components/OpenStatus';
import BackToTop from '@/components/BackToTop';
import { business, checkout, footerLinkGroups, social } from '@/lib/site-data';


/**
 * Primary CTA — the single canonical "Order now" button used in the Nav,
 * footer, hero sliders, and any high-priority call-to-action position.
 *
 * Uses the .btn-luxe + .btn-luxe-gold design-system classes so it stays
 * in lock-step with every other primary CTA on the site. Earlier this
 * component had its own inline Tailwind that mirrored the .btn-luxe-gold
 * spec — that drift was the cause of the "buttons look different from
 * each other" inconsistency the client flagged.
 *
 * `responsive` mode — when true, the button shows as an icon-only pill
 * on mobile (just the shopping bag) and expands to the full text version
 * at md: and up. Used in the site header where a full-width "ORDER NOW"
 * button would crowd the logo and create a visually unbalanced chrome on
 * 360–420px Android screens. Everywhere else (drawer footer, page CTAs,
 * mobile sticky bar) keeps the default full-text version.
 */
export function OrderButton({
  label = 'Order now',
  className = '',
  responsive = false
}: {
  label?: string;
  className?: string;
  responsive?: boolean;
}) {
  if (responsive) {
    return (
      <Link
        href={checkout.dutchieUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        className={`btn-luxe btn-luxe-gold inline-flex h-11 w-11 min-h-0 items-center justify-center !px-0 md:h-auto md:w-auto md:!px-6 ${className}`}
      >
        <ShoppingBag className="h-4 w-4" />
        <span className="hidden md:inline">{label}</span>
        <ArrowRight className="hidden h-4 w-4 md:inline" />
      </Link>
    );
  }
  return (
    <Link
      href={checkout.dutchieUrl}
      target="_blank"
      rel="noreferrer"
      className={`btn-luxe btn-luxe-gold ${className}`}
    >
      <ShoppingBag className="h-4 w-4" />
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function AgeGate() {
  // Three-phase modal: 'age' (21+ challenge) → 'subscribe' (optional welcome
  // signup) → closed. Skipping the subscribe step still dismisses the modal.
  const [phase, setPhase] = useState<'hidden' | 'age' | 'subscribe'>('hidden');
  const [declined, setDeclined] = useState(false);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');

  // sessionStorage per the brief (§4.1) — re-prompt each new session
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase(sessionStorage.getItem('rd_age_confirmed') === 'yes' ? 'hidden' : 'age');
  }, []);

  const showing = phase !== 'hidden';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (showing) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [showing]);

  const confirmAge = () => {
    sessionStorage.setItem('rd_age_confirmed', 'yes');
    setPhase('subscribe');
  };

  const declineAge = () => setDeclined(true);

  const close = () => setPhase('hidden');

  const subscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (subscribeStatus === 'loading' || subscribeStatus === 'success') return;
    setSubscribeStatus('loading');
    setSubscribeMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: phone || undefined, source: 'age-gate-welcome' })
      });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string };
      if (data.ok) {
        setSubscribeStatus('success');
        setSubscribeMessage(data.message ?? "You’re in. Drops incoming.");
        // Auto-close after a beat so the customer can see the success state.
        window.setTimeout(close, 1600);
      } else {
        setSubscribeStatus('error');
        setSubscribeMessage(data.error ?? 'Something went wrong.');
      }
    } catch {
      setSubscribeStatus('error');
      setSubscribeMessage('Network error — try again.');
    }
  };

  return (
    <AnimatePresence>
      {showing && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[color:var(--rd-ink)] p-5 text-[color:var(--rd-text)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="agegate-title"
        >
          {/* Full-bleed cinematic background */}
          <div className="absolute inset-0">
            <Image
              src="/assets/heroPhoto.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(19,36,29,0.62),rgba(19,36,29,0.95))]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[color:var(--rd-amber)]/40 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
              <Image src="/assets/logo.jpg" width={80} height={80} alt="Raindrops Greenery logo" className="h-full w-full object-cover" />
            </div>

            {phase === 'age' ? (
              <>
                <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
                  <span className="rd-pulse" aria-hidden />
                  21+ only · NYC delivery
                </p>

                <h2
                  id="agegate-title"
                  className="mt-5 text-[color:var(--rd-text)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
                >
                  Welcome to <span className="italic" style={{ fontWeight: 500 }}>Raindrops NY.</span>
                </h2>

                {declined ? (
                  <>
                    <p className="mx-auto mt-5 max-w-md text-base leading-7 text-[color:var(--rd-text-dim)]">
                      This website and delivery service are restricted to adults 21 and older. Please come back when you are of legal age.
                    </p>
                    <div className="mt-7 flex justify-center">
                      <button
                        onClick={() => setDeclined(false)}
                        className="btn-luxe btn-luxe-ghost"
                      >
                        Back
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mx-auto mt-5 max-w-md text-base leading-7 text-[color:var(--rd-text-dim)]">
                      This site is intended for adults 21 and older. By entering you confirm that you are 21+ and accept our{' '}
                      <Link href="/legal/terms" className="underline decoration-[color:var(--rd-glow)] underline-offset-4 hover:text-[color:var(--rd-glow)]">Terms</Link> and{' '}
                      <Link href="/legal/privacy" className="underline decoration-[color:var(--rd-glow)] underline-offset-4 hover:text-[color:var(--rd-glow)]">Privacy Policy</Link>.
                    </p>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <button onClick={confirmAge} className="btn-luxe btn-luxe-gold">
                        I am 21 or older
                      </button>
                      <button onClick={declineAge} className="btn-luxe btn-luxe-ghost">
                        I am under 21
                      </button>
                    </div>
                  </>
                )}
                <p className="mt-8 rd-eyebrow text-[color:var(--rd-text-mute)]">
                  Keep cannabis out of reach of children and pets.
                </p>
              </>
            ) : (
              // Phase 2 — optional welcome subscribe
              <>
                <p className="rd-eyebrow inline-flex items-center gap-2 text-[color:var(--rd-glow)]">
                  <span className="rd-pulse" aria-hidden />
                  Welcome aboard
                </p>

                <h2
                  id="agegate-title"
                  className="mt-5 text-[color:var(--rd-text)]"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.03em' }}
                >
                  Be first to know <span className="italic" style={{ fontWeight: 500 }}>about new drops.</span>
                </h2>
                <p className="mx-auto mt-5 max-w-md text-base leading-7 text-[color:var(--rd-text-dim)]">
                  Exclusive deals, sticky strain drops, and members-only previews. Phone optional — we’ll text major restocks only.
                </p>

                <form
                  onSubmit={subscribe}
                  className="mx-auto mt-7 grid w-full max-w-md gap-3 text-left"
                  aria-label="Welcome newsletter signup"
                >
                  <label className="grid gap-1.5">
                    <span className="rd-eyebrow text-[color:var(--rd-text-mute)]">Email</span>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="your@email.com"
                      className="h-12 rounded-full border border-[color:var(--rd-paper)]/16 bg-[color:var(--rd-ink-soft)]/55 px-4 text-sm text-[color:var(--rd-text)] outline-none transition placeholder:text-[color:var(--rd-text-mute)] focus:border-[color:var(--rd-glow)] focus:shadow-[0_0_0_4px_rgba(200,230,110,0.18)] disabled:opacity-60"
                    />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="rd-eyebrow flex items-center justify-between text-[color:var(--rd-text-mute)]">
                      Phone <span className="text-[10px] tracking-[0.16em] text-[color:var(--rd-text-mute)]/80">Optional</span>
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="(555) 123-4567"
                      className="h-12 rounded-full border border-[color:var(--rd-paper)]/16 bg-[color:var(--rd-ink-soft)]/55 px-4 text-sm text-[color:var(--rd-text)] outline-none transition placeholder:text-[color:var(--rd-text-mute)] focus:border-[color:var(--rd-glow)] focus:shadow-[0_0_0_4px_rgba(200,230,110,0.18)] disabled:opacity-60"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                    className="btn-luxe btn-luxe-gold mt-2 w-full justify-center disabled:opacity-70"
                  >
                    {subscribeStatus === 'loading'
                      ? 'Sending…'
                      : subscribeStatus === 'success'
                        ? '✓ Subscribed'
                        : 'Subscribe & enter site'}
                  </button>

                  {subscribeMessage && (
                    <p
                      role={subscribeStatus === 'error' ? 'alert' : 'status'}
                      className={`text-sm ${
                        subscribeStatus === 'success'
                          ? 'text-[color:var(--rd-glow)]'
                          : 'text-[color:var(--rd-amber)]'
                      }`}
                    >
                      {subscribeMessage}
                    </p>
                  )}
                </form>

                <button
                  onClick={close}
                  className="mt-5 rd-eyebrow text-[color:var(--rd-text-mute)] underline-offset-4 transition hover:text-[color:var(--rd-text-dim)] hover:underline"
                >
                  Skip for now
                </button>

                <p className="mt-6 rd-eyebrow text-[color:var(--rd-text-mute)]">
                  Unsubscribe anytime · 21+ only
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function Footer() {
  return (
    <footer className="bg-[color:var(--rd-ink)] text-[color:var(--rd-text)]">
      {/* Newsletter — full-width feature row */}
      <div className="border-y border-[color:var(--rd-paper)]/8 bg-[color:var(--rd-ink-soft)]/40 py-14 sm:py-16">
        <div className="luxury-shell grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="rd-eyebrow text-[color:var(--rd-glow)]">Weekly drops</p>
            <h3
              className="mt-4 text-3xl text-[color:var(--rd-text)] sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.025em' }}
            >
              Get drops weekly — <span className="italic">new strains, deals, NYC events.</span>
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--rd-text-dim)] sm:text-base">
              No spam. Unsubscribe anytime. 21+ only.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main footer grid */}
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
            Premium 21+ cannabis delivery across Manhattan plus parts of Brooklyn (Williamsburg, Greenpoint) and Queens (Long Island City). Free delivery, tax-free under Shinnecock authority.
          </p>

          <ul className="mt-6 grid gap-2 text-sm text-[color:var(--rd-text-dim)]">
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" />
              <a href={business.phoneHref} className="transition-colors hover:text-[color:var(--rd-text)]">
                {business.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" />
              <a href={business.emailHref} className="transition-colors hover:text-[color:var(--rd-text)]">
                {business.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" />
              <span>Daily 10:00 AM – 10:00 PM</span>
            </li>
          </ul>

          <div className="mt-5">
            <OpenStatus tone="dark" />
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinkGroups.map((group) => (
            <div key={group.heading}>
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">{group.heading}</p>
              <ul className="mt-4 grid gap-2 text-sm text-[color:var(--rd-text-dim)]">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-block relative transition-colors duration-300 [transition-timing-function:var(--ease-out)] hover:text-[color:var(--rd-text)]"
                    >
                      <span>{link.label}</span>
                      <span className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[color:var(--rd-glow)] transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:scale-x-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance row */}
      <div className="border-t border-[color:var(--rd-paper)]/8">
        <div className="luxury-shell flex flex-col gap-5 py-6 text-xs text-[color:var(--rd-text-mute)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[color:var(--rd-paper)]/14 px-3 py-1 font-medium text-[color:var(--rd-text-dim)] [font-family:var(--font-mono)]">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[color:var(--rd-glow)]" />
              <span className="break-words">{business.licensingShort}</span>
            </span>
            <span className="break-words">&copy; {new Date().getFullYear()} {business.legalName}. All rights reserved.</span>
          </div>
          {/* V6 §10 — Instagram only, show @handle next to icon.
              aria-label starts with the visible @handle so WCAG 2.5.3
              (label-content-name-mismatch) passes. */}
          {social.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.handle} on ${item.label}`}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--rd-paper)]/14 px-3.5 py-1.5 text-[color:var(--rd-text-dim)] transition hover:border-[color:var(--rd-glow)] hover:text-[color:var(--rd-glow)]"
            >
              <InstagramIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.handle}</span>
            </a>
          ))}
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
          className="fixed left-1/2 z-40 w-[min(720px,calc(100%-16px))] rounded-full border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink)]/90 p-2 shadow-[0_20px_70px_rgba(19,36,29,0.45)] backdrop-blur-2xl md:hidden"
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
      <main id="main" className="pt-[108px]">{children}</main>
      <Footer />
      <StickyOrderBar />
      <BackToTop />
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
