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
      {/* Hero — light paper to match the rest of the site */}
      <section className="relative overflow-hidden bg-[color:var(--rd-paper)] text-[color:var(--rd-ink)]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(198,160,100,0.10), transparent 55%), radial-gradient(ellipse at bottom right, rgba(46,82,64,0.45), transparent 60%)'
          }}
        />
        <div className="luxury-shell relative max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ label: 'Legal', href: '/legal/privacy' }, { label: title }]} tone="light" />
          <p className="mt-5 rd-eyebrow text-[color:var(--rd-moss)]">{eyebrow}</p>
          <h1 className="mt-4 text-[color:var(--rd-ink)]">{title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[color:var(--rd-on-paper-dim)] sm:text-lg sm:leading-8">{intro}</p>
          <p className="mt-4 rd-eyebrow text-[color:var(--rd-on-paper-mute)]">Last updated {lastUpdated}</p>
        </div>
      </section>

      {/* Sidebar + article on light surface */}
      <section className="bg-[color:var(--rd-paper)] py-12 sm:py-16 lg:py-20">
        <div className="luxury-shell grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-3xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/80 p-6 shadow-[0_18px_54px_rgba(46,82,64,0.08)]">
            <p className="rd-eyebrow text-[color:var(--rd-moss)]">Legal documents</p>
            <ul className="mt-4 grid gap-1.5 text-sm">
              {legalNav.map((item) => {
                const active = currentPath === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`block rounded-full px-4 py-2 text-[13px] font-medium transition ${
                        active
                          ? 'bg-[color:var(--rd-moss)] text-[color:var(--rd-paper)]'
                          : 'text-[color:var(--rd-ink)] hover:bg-[color:var(--rd-paper-bright)]/70'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 border-t border-[color:var(--rd-ink)]/8 pt-5">
              <p className="rd-eyebrow text-[color:var(--rd-moss)]">Need help?</p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--rd-on-paper-dim)]">
                Reach support at{' '}
                <a className="font-medium text-[color:var(--rd-moss)] underline underline-offset-4" href={business.supportEmailHref}>
                  {business.supportEmail}
                </a>
                .
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 rd-eyebrow text-[color:var(--rd-moss)] transition hover:text-[color:var(--rd-ink)]"
              >
                <span className="border-b border-[color:var(--rd-amber-dark)] pb-0.5">Contact us</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>

          <article className="rounded-3xl border border-[color:var(--rd-ink)]/8 bg-[color:var(--rd-paper-soft)]/80 p-6 shadow-[0_18px_54px_rgba(46,82,64,0.08)] sm:p-10">
            <div className="legal-prose">{children}</div>
            <div className="mt-10 grid gap-3 sm:flex sm:items-center sm:justify-between">
              <p className="text-xs leading-6 text-[color:var(--rd-on-paper-mute)]">
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
