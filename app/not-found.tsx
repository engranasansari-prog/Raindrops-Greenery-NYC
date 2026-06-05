import Link from 'next/link';
import { ArrowRight, Compass, Home } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';

export const metadata = {
  title: 'Page not found',
  description: 'The page you’re looking for isn’t here. Browse the Raindrops Greenery menu, delivery areas, or contact support.'
};

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-[color:var(--rd-paper)] text-[color:var(--rd-ink)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(198,160,100,0.10), transparent 55%), radial-gradient(ellipse at bottom right, rgba(46,82,64,0.10), transparent 60%)'
          }}
        />
        <div className="luxury-shell relative grid gap-10 py-14 sm:py-20 lg:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">Error 404</p>
            <h1 className="mt-4 text-[color:var(--rd-ink)]">
              This page is <span className="italic">out of stock.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--rd-on-paper-dim)] sm:text-lg sm:leading-8">
              The link you followed is either old or got rolled up and smoked. Pick a destination below — your free weed gift is still waiting.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:max-w-lg">
              <Link href="/" className="btn-luxe btn-luxe-gold">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link href="/menu" className="btn-luxe btn-luxe-paper">
                Browse menu
                <ArrowRight />
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-[color:var(--rd-ink)]/10 bg-[color:var(--rd-paper-bright)] p-6 rd-shadow-luxe backdrop-blur">
            <Compass className="h-7 w-7 text-[color:var(--rd-moss)]" />
            <h2 className="mt-4 text-[color:var(--rd-ink)]">
              Helpful <span className="italic">jumps.</span>
            </h2>
            <ul className="mt-5 grid gap-3 text-sm">
              <li><Link href="/deals" className="font-medium text-[color:var(--rd-on-paper-dim)] transition hover:text-[color:var(--rd-moss)]">→ Today’s deals</Link></li>
              <li><Link href="/delivery" className="font-medium text-[color:var(--rd-on-paper-dim)] transition hover:text-[color:var(--rd-moss)]">→ Delivery areas</Link></li>
              <li><Link href="/about" className="font-medium text-[color:var(--rd-on-paper-dim)] transition hover:text-[color:var(--rd-moss)]">→ About Raindrops</Link></li>
              <li><Link href="/blog" className="font-medium text-[color:var(--rd-on-paper-dim)] transition hover:text-[color:var(--rd-moss)]">→ Journal</Link></li>
              <li><Link href="/faq" className="font-medium text-[color:var(--rd-on-paper-dim)] transition hover:text-[color:var(--rd-moss)]">→ FAQ</Link></li>
              <li><Link href="/contact" className="font-medium text-[color:var(--rd-on-paper-dim)] transition hover:text-[color:var(--rd-moss)]">→ Contact support</Link></li>
            </ul>
            <div className="mt-6">
              <OrderButton label="Continue to checkout" />
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
