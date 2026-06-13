'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Mail, Phone, ShieldCheck, ShoppingBag } from 'lucide-react';
import { InstagramIcon } from '@/components/SocialIcons';
import NewsletterForm from '@/components/NewsletterForm';
import OpenStatus from '@/components/OpenStatus';
import BackToTop from '@/components/BackToTop';
import dynamic from 'next/dynamic';
import { business, checkout, footerLinkGroups, social } from '@/lib/site-data';
import { trackOrderClick } from '@/lib/analytics';

// Chat concierge — load after hydration (client-only floating widget) so it
// never competes with first paint / LCP.
const ChatAssistant = dynamic(() => import('@/components/ChatAssistant'), { ssr: false });

// PERF: AgeGate and StickyOrderBar are the only framer-motion consumers in the
// site chrome. They're loaded via next/dynamic with `{ ssr: false }` so
// framer-motion (~45KB) ships in its own client-only async chunk instead of
// SiteChrome's static shared bundle. Interior routes (/about, /faq, /blog,
// /legal) therefore no longer download or hydrate framer just to render chrome.
// Both are purely client-side (scroll listeners, localStorage, entrance
// animations) with no SSR-visible markup, so skipping SSR changes nothing the
// user or a crawler sees on first paint — the age gate still appears on first
// visit and the sticky order bar still works.
const AgeGate = dynamic(() => import('@/components/AgeGate'), { ssr: false });
const StickyOrderBar = dynamic(() => import('@/components/StickyOrderBar'), { ssr: false });


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
  responsive = false,
  source = 'order_button'
}: {
  label?: string;
  className?: string;
  responsive?: boolean;
  source?: string;
}) {
  if (responsive) {
    return (
      <Link
        href={checkout.dutchieUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        onClick={() => trackOrderClick(source)}
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
      onClick={() => trackOrderClick(source)}
      className={`btn-luxe btn-luxe-gold ${className}`}
    >
      <ShoppingBag className="h-4 w-4" />
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
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
              <span className="rd-eyebrow mt-1 block text-[color:var(--rd-text-dim)]">New York delivery</span>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-[color:var(--rd-text-dim)]">
            Premium 21+ cannabis delivery across Manhattan plus parts of Brooklyn (Williamsburg, Greenpoint) and Queens (Long Island City). Free delivery, tax-free.
          </p>

          <ul className="mt-6 grid gap-2 text-sm text-[color:var(--rd-text-dim)]">
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" />
              <a href={business.phoneHref} className="inline-flex items-center py-1.5 -my-1.5 transition-colors hover:text-[color:var(--rd-text)]">
                {business.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-[color:var(--rd-glow)]" />
              <a href={business.emailHref} className="inline-flex items-center py-1.5 -my-1.5 transition-colors hover:text-[color:var(--rd-text)]">
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

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerLinkGroups.map((group) => (
            <div key={group.heading}>
              <p className="rd-eyebrow text-[color:var(--rd-glow)]">{group.heading}</p>
              <ul className="mt-4 grid gap-2 text-sm text-[color:var(--rd-text-dim)]">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {/* py-1.5 -my-1.5 widens the tap target to ~32px without
                        changing the visual rhythm; the hover underline moves
                        from -bottom-0.5 to bottom-1 so it stays ~2px under
                        the text now that the padding box is taller. */}
                    <Link
                      href={link.href}
                      className="group inline-block relative py-1.5 -my-1.5 transition-colors duration-300 [transition-timing-function:var(--ease-out)] hover:text-[color:var(--rd-text)]"
                    >
                      <span>{link.label}</span>
                      <span className="pointer-events-none absolute bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[color:var(--rd-glow)] transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:scale-x-100" />
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

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AgeGate />
      <main id="main" className="pt-[var(--rd-chrome-h)]">{children}</main>
      <Footer />
      <StickyOrderBar />
      <BackToTop />
      <ChatAssistant />
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
