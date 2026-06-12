import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { business } from '@/lib/site-data';

export type Crumb = { label: string; href?: string };

/**
 * Visual breadcrumb trail + automatic Schema.org BreadcrumbList JSON-LD
 * for SEO. Every page that uses <Breadcrumbs/> now emits structured data.
 */
export default function Breadcrumbs({ items, tone = 'light' }: { items: Crumb[]; tone?: 'light' | 'dark' }) {
  const base: Crumb = { label: 'Home', href: '/' };
  const trail = [base, ...items];

  // All colors flow through design tokens — no raw text-white. Dark-tone
  // breadcrumbs sit on --rd-ink hero sections; light-tone ones on cream.
  const baseColor = tone === 'dark' ? 'text-[color:var(--rd-text-dim)]' : 'text-[color:var(--rd-on-paper-dim)]';
  const activeColor = tone === 'dark' ? 'text-[color:var(--rd-glow)]' : 'text-[color:var(--rd-moss)]';
  const sepColor = tone === 'dark' ? 'text-[color:var(--rd-text-mute)]' : 'text-[color:var(--rd-on-paper-mute)]';

  // BreadcrumbList JSON-LD — Google reads this to render the breadcrumb
  // path in search results instead of a raw URL.
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${business.baseUrl}${crumb.href}` } : {})
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <nav aria-label="Breadcrumb" className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${baseColor}`}>
        <ol className="flex flex-wrap items-center gap-1.5">
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1.5">
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className={`-my-2 inline-flex items-center gap-1.5 py-2 transition ${tone === 'dark' ? 'hover:text-[color:var(--rd-glow)]' : 'hover:text-[color:var(--rd-moss)]'}`}>
                    {index === 0 && <Home className="h-3 w-3" aria-hidden />}
                    <span>{crumb.label}</span>
                  </Link>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 ${activeColor}`} aria-current={isLast ? 'page' : undefined}>
                    {index === 0 && <Home className="h-3 w-3" aria-hidden />}
                    <span>{crumb.label}</span>
                  </span>
                )}
                {!isLast && <ChevronRight className={`h-3 w-3 ${sepColor}`} aria-hidden />}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
