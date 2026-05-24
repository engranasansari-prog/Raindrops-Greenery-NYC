import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteChrome, { OrderButton } from '@/components/SiteChrome';
import Breadcrumbs from '@/components/Breadcrumbs';
import { business } from '@/lib/site-data';

const legalNav = [
  { label: 'Privacy policy', href: '/legal/privacy' },
  { label: 'Terms of service', href: '/legal/terms' },
  { label: 'Accessibility', href: '/legal/accessibility' }
];

export default function LegalLayout({
  eyebrow,
  title,
  intro,
  lastUpdated,
  currentPath,
  children
}: {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  currentPath: string;
  children: React.ReactNode;
}) {
  return (
    <SiteChrome>
      <section className="relative overflow-hidden bg-[#0b3025] text-white">
        <div className="absolute inset-0 mesh-bg opacity-15" />
        <div className="luxury-shell relative max-w-4xl py-14 md:py-20">
          <Breadcrumbs items={[{ label: 'Legal', href: '/legal/privacy' }, { label: title }]} tone="dark" />
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--champagne)]">{eyebrow}</p>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl font-extrabold leading-tight md:text-7xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/74">{intro}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-white/52">Last updated {lastUpdated}</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="luxury-shell grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-lg border border-white/70 bg-white/82 p-5 shadow-[0_18px_54px_rgba(25,35,20,0.08)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne-dark)]">Legal documents</p>
            <ul className="mt-4 grid gap-2 text-sm">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 font-bold transition ${currentPath === item.href ? 'bg-[var(--emerald-deep)] text-white' : 'text-[var(--emerald-deep)] hover:bg-white'}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-[var(--line)] pt-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--champagne-dark)]">Need help?</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Reach support at <a className="font-bold text-[var(--emerald-deep)] underline" href={business.supportEmailHref}>{business.supportEmail}</a>.
              </p>
              <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--emerald-deep)] hover:text-[var(--champagne-dark)]">
                Contact us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>

          <article className="rounded-lg border border-white/70 bg-white/82 p-6 shadow-[0_18px_54px_rgba(25,35,20,0.08)] md:p-9">
            <div className="legal-prose">{children}</div>
            <div className="mt-10 grid gap-3 sm:flex sm:items-center sm:justify-between">
              <p className="text-xs leading-6 text-[var(--muted)]">
                Operated by {business.legalName}. {business.licensingShort} — licensed by the {business.licensingAuthority}.
              </p>
              <OrderButton label="Browse menu" />
            </div>
          </article>
        </div>
      </section>
    </SiteChrome>
  );
}
