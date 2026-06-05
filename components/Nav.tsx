'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Home,
  Info,
  Mail,
  Menu,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  X
} from 'lucide-react';
import { InstagramIcon } from '@/components/SocialIcons';
import DeliveryEta from '@/components/DeliveryEta';
import { OrderButton } from '@/components/SiteChrome';

/**
 * V7 §1 drop-in nav.
 * Fixed header, data-scrolled attribute drives the translucent → blurred
 * transition. Mobile drawer slides in from the left with icon + label items,
 * lime accent on active page, body scroll lock while open.
 *
 * Local adaptations from V7 spec:
 *  - lucide-react@1.16 lacks an Instagram brand glyph; we use our monoline
 *    <InstagramIcon /> from components/SocialIcons.tsx
 *  - Tailwind's `font-serif` / `font-mono` shortcuts replaced with explicit
 *    `[font-family:var(--font-display)]` and `[font-family:var(--font-mono)]`
 *    to match the design system tokens
 *  - Order CTA uses the dispensary URL from lib/site-data for consistency
 */

const NAV_ITEMS = [
  { href: '/', label: 'Home', short: 'Home', icon: Home },
  { href: '/menu', label: 'Shop menu', short: 'Menu', icon: ShoppingBag },
  { href: '/deals', label: 'Deals', short: 'Deals', icon: Tag },
  { href: '/quiz', label: 'Strain finder quiz', short: 'Quiz', icon: Sparkles },
  { href: '/delivery', label: 'Delivery areas', short: 'Delivery', icon: Truck },
  { href: '/about', label: 'About', short: 'About', icon: Info },
  { href: '/blog', label: 'Journal', short: 'Journal', icon: BookOpen },
  { href: '/faq', label: 'FAQ', short: 'FAQ', icon: HelpCircle },
  { href: '/contact', label: 'Contact', short: 'Contact', icon: Mail }
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll + ESC to close while drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setDrawerOpen(false);
      };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = previousOverflow;
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [drawerOpen]);

  return (
    <>
      <header
        data-scrolled={scrolled}
        className="fixed inset-x-0 top-9 z-50 h-[72px]
                   transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]
                   bg-[color:var(--rd-ink)]
                   border-b border-[rgba(200,230,110,0.08)]
                   data-[scrolled=true]:bg-[rgba(27,51,40,0.97)]
                   data-[scrolled=true]:border-[rgba(200,230,110,0.15)]
                   data-[scrolled=true]:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)]"
      >
        <div className="relative mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="rd-nav-drawer"
            className="-ml-2 inline-flex h-11 w-11 items-center justify-center text-[color:var(--rd-text)] transition hover:text-[color:var(--rd-glow)] md:hidden"
          >
            <Menu size={24} strokeWidth={1.75} />
          </button>

          {/*
            Logo — absolute-centered on mobile, static flex on desktop.
            Previously the header used `flex justify-between` for three
            children [hamburger, logo, order-button], but the order
            button is ~220px wide vs the hamburger's 44px, so the flex
            distribution placed the logo at ~30% from left rather than
            at horizontal center. Absolute-positioning on mobile gives
            the canonical luxury-brand mobile pattern (logo centered,
            actions in the corners). On desktop the logo returns to
            normal flow alongside the nav links via md:relative +
            md:translate-x-0.
          */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 text-[color:var(--rd-text)] transition hover:opacity-90 md:static md:translate-x-0 md:translate-y-0"
            aria-label="Raindrops Greenery home"
          >
            <Image
              src="/assets/logo.jpg"
              alt="Raindrops Greenery"
              width={40}
              height={40}
              className="rounded-full ring-1 ring-[rgba(200,230,110,0.2)]"
              priority
            />
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-[15px] font-semibold tracking-tight [font-family:var(--font-display)]">
                Raindrops <span className="text-[color:var(--rd-glow)]">·</span> NY
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
                Delivery
              </span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="ml-2 hidden items-center gap-6 md:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative text-[14px] font-medium transition ${
                    active ? 'text-[color:var(--rd-text)]' : 'text-[color:var(--rd-text-dim)] hover:text-[color:var(--rd-text)]'
                  }`}
                >
                  {item.short}
                  <span
                    className={`absolute left-0 -bottom-1.5 h-[1.5px] w-full origin-left bg-[color:var(--rd-glow)] transition-transform duration-300 [transition-timing-function:var(--ease-out)] ${
                      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right cluster: live delivery ETA + 21+ pill + Order CTA.
              The OrderButton here uses `responsive` so on mobile it
              renders as an icon-only 44px pill (matching the hamburger's
              footprint on the left) — balanced chrome, centered logo,
              and the icon still communicates "place an order" without
              a 220px-wide pill dominating the right half. At md: and up
              the button expands to its full "ORDER NOW →" form. */}
          <div className="flex items-center gap-2 md:gap-3">
            <DeliveryEta variant="desktop" />
            <span className="hidden items-center rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[11px] font-semibold tracking-wide text-[color:var(--rd-ink)] [font-family:var(--font-mono)] sm:inline-flex">
              21+
            </span>
            <OrderButton responsive />
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-[rgba(6,19,15,0.72)] backdrop-blur-md md:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="rd-nav-drawer"
            className="fixed bottom-0 left-0 top-0 z-[60] flex w-[85vw] max-w-[360px] flex-col overflow-y-auto border-r border-[rgba(200,230,110,0.1)] bg-[color:var(--rd-ink)] animate-[slideInLeft_250ms_cubic-bezier(0.22,1,0.36,1)] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[rgba(240,232,210,0.06)] p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[color:var(--rd-glow)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--rd-ink)] [font-family:var(--font-mono)]">
                  21+
                </span>
                <DeliveryEta variant="mobile" />
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 items-center justify-center text-[color:var(--rd-text-dim)] transition hover:text-[color:var(--rd-glow)]"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 py-2" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex h-14 items-center gap-3 border-l-2 px-5 transition ${
                      active
                        ? 'border-[color:var(--rd-glow)] bg-[rgba(200,230,110,0.04)] text-[color:var(--rd-glow)]'
                        : 'border-transparent text-[color:var(--rd-text-dim)] hover:bg-[rgba(240,232,210,0.03)] hover:text-[color:var(--rd-text)]'
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                    <span className="text-[15px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-4 border-t border-[rgba(240,232,210,0.06)] p-4">
              <OrderButton className="w-full" />
              <a
                href="https://www.instagram.com/raindropsgreenery/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow @raindropsgreenery on Instagram"
                className="flex items-center justify-center gap-2 text-[13px] text-[color:var(--rd-text-dim)] transition hover:text-[color:var(--rd-glow)]"
              >
                <InstagramIcon className="h-[18px] w-[18px]" />
                <span>@raindropsgreenery</span>
              </a>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
