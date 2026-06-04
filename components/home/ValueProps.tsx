import { Box, Droplet, RotateCcw, ShieldCheck } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { valueProps } from '@/lib/site-data';

// Icons aligned to the four value props, in order.
const VALUE_ICONS = [Droplet, ShieldCheck, Box, RotateCcw];

/**
 * "Why Raindrops" — four static cards.
 *
 * A SERVER component: the markup + icon SVGs render on the server and never
 * hydrate. Only the small <Reveal> scroll wrappers are client islands. It's
 * rendered by app/page.tsx and slotted into the (client) HomePage via its
 * `valuePropsSlot` prop, which keeps this static content out of the home
 * page's client hydration payload. Hover effects are pure CSS (group-hover).
 */
export default function ValueProps() {
  return (
    <section className="rd-luxe-paper py-14 sm:py-20 lg:py-24">
      <div className="luxury-shell">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">Why Raindrops</p>
            <h2 className="mt-4 text-[color:var(--rd-ink)]">
              Four reasons New Yorkers <span className="italic">come back.</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2">
          {valueProps.map((item, index) => {
            const Icon = VALUE_ICONS[index] ?? Droplet;
            return (
              <Reveal key={item.title} delay={index * 0.05}>
                <div className="rd-shadow-luxe group relative h-full overflow-hidden rounded-3xl border border-[color:var(--rd-ink)]/12 bg-[color:var(--rd-paper-bright)] p-6 transition-[transform,border-color] duration-500 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 hover:border-[color:var(--rd-moss)]/35 sm:p-8 lg:p-9">
                  <div className="flex items-start justify-between gap-4">
                    <Icon className="h-8 w-8 text-[color:var(--rd-moss)] transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:rotate-[-6deg] sm:h-11 sm:w-11 lg:h-12 lg:w-12" />
                    <span
                      className="text-4xl text-[color:var(--rd-amber-dark)]/40 sm:text-5xl lg:text-6xl"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.05em' }}
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <h3
                    className="mt-5 text-xl text-[color:var(--rd-ink)] sm:mt-7 sm:text-2xl lg:text-3xl"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.55] text-[color:var(--rd-on-paper-dim)] sm:text-base sm:leading-7">{item.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
