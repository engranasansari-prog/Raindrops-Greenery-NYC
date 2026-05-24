import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items, tone = 'light' }: { items: Crumb[]; tone?: 'light' | 'dark' }) {
  const base: Crumb = { label: 'Home', href: '/' };
  const trail = [base, ...items];

  const baseColor = tone === 'dark' ? 'text-white/64' : 'text-[var(--muted)]';
  const activeColor = tone === 'dark' ? 'text-white' : 'text-[var(--emerald-deep)]';
  const sepColor = tone === 'dark' ? 'text-white/32' : 'text-[var(--muted)]/50';

  return (
    <nav aria-label="Breadcrumb" className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${baseColor}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1.5">
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className={`inline-flex items-center gap-1.5 transition hover:${activeColor}`}>
                  {index === 0 && <Home className="h-3 w-3" />}
                  <span>{crumb.label}</span>
                </Link>
              ) : (
                <span className={`inline-flex items-center gap-1.5 ${activeColor}`}>
                  {index === 0 && <Home className="h-3 w-3" />}
                  <span>{crumb.label}</span>
                </span>
              )}
              {!isLast && <ChevronRight className={`h-3 w-3 ${sepColor}`} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
