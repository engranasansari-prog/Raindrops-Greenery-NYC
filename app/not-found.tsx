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
      <section className="relative overflow-hidden bg-[#06130f] text-white">
        <div className="absolute inset-0 mesh-bg opacity-15" />
        <div className="luxury-shell relative grid gap-10 py-16 md:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">404</p>
            <h1 className="mt-3 font-[var(--font-display)] text-5xl font-extrabold leading-tight sm:text-6xl md:text-8xl">Page not found.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/74">
              The link you followed may be old, or the page may have moved. From here you can jump back to the menu, see delivery areas, or get a hand from support.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:max-w-lg">
              <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--emerald-deep)] shadow-xl transition hover:-translate-y-0.5 hover:bg-[var(--champagne)]">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link href="/menu" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-white/16">
                Browse menu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-white/14 bg-white/10 p-6 backdrop-blur">
            <Compass className="h-7 w-7 text-[var(--champagne)]" />
            <h2 className="mt-4 font-[var(--font-display)] text-3xl font-bold">Helpful jumps</h2>
            <ul className="mt-4 grid gap-3 text-sm">
              <li><Link href="/deals" className="font-extrabold text-white/82 hover:text-white">→ Today’s deals</Link></li>
              <li><Link href="/delivery" className="font-extrabold text-white/82 hover:text-white">→ Delivery areas</Link></li>
              <li><Link href="/about" className="font-extrabold text-white/82 hover:text-white">→ About Raindrops</Link></li>
              <li><Link href="/blog" className="font-extrabold text-white/82 hover:text-white">→ Journal</Link></li>
              <li><Link href="/faq" className="font-extrabold text-white/82 hover:text-white">→ FAQ</Link></li>
              <li><Link href="/contact" className="font-extrabold text-white/82 hover:text-white">→ Contact support</Link></li>
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
