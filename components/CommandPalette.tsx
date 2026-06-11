'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { menuProducts, type LiveMenuProduct } from '@/lib/menu';
import { formatPrice } from '@/lib/menu-utils';
import { trackCta } from '@/lib/analytics';
import { useModalA11y } from '@/hooks/useModalA11y';

/**
 * Ctrl/Cmd+K command palette — global quick-jump over pages, products, and
 * journal posts. All data is local (static page list + lib/menu products +
 * blog titles passed down from the server layout), so search is instant with
 * zero network. Rendered by Nav via next/dynamic ssr:false so none of this —
 * including the 44-product dataset — lands in the shared first-paint JS.
 *
 * Pattern: ARIA 1.2 combobox — focus stays in the input; the active option is
 * conveyed via aria-activedescendant, so arrow keys never move real focus.
 * Plain CSS entrance (.rd-card-in) — no framer-motion (no LazyMotion provider
 * exists at this level; an m. component here would crash).
 */

type PalettePost = { slug: string; title: string };

type Result = {
  href: string;
  label: string;
  /** Secondary text — page hint, product category tag, or "Journal". */
  hint?: string;
  /** Formatted entry price, products only. */
  price?: string;
};

type Group = { name: string; items: Result[] };

// Static page index — every routed page plus the three menu categories.
const PAGES: Array<{ label: string; href: string; hint: string }> = [
  { label: 'Home', href: '/', hint: 'Start here' },
  { label: 'Shop menu', href: '/menu', hint: 'All products' },
  { label: 'Deals', href: '/deals', hint: 'Offers + bundles' },
  { label: 'Strain finder quiz', href: '/quiz', hint: 'Find your match' },
  { label: 'Delivery areas', href: '/delivery', hint: 'Coverage + ETA' },
  { label: 'About', href: '/about', hint: 'Our story' },
  { label: 'Journal', href: '/blog', hint: 'Guides + reads' },
  { label: 'FAQ', href: '/faq', hint: 'Questions' },
  { label: 'Contact', href: '/contact', hint: 'Reach us' },
  { label: 'Flower Strains', href: '/menu/flower', hint: 'Category' },
  { label: 'Pre-Rolls', href: '/menu/pre-rolls', hint: 'Category' },
  { label: 'Edibles', href: '/menu/edibles', hint: 'Category' }
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Rank tiers: 0 = startsWith, 1 = word-boundary, 2 = substring, -1 = no match.
function matchScore(haystack: string, query: string): number {
  const h = haystack.toLowerCase();
  if (h.startsWith(query)) return 0;
  if (new RegExp(`\\b${escapeRegExp(query)}`).test(h)) return 1;
  if (h.includes(query)) return 2;
  return -1;
}

/** Best (lowest) score across an item's searchable fields. */
function bestScore(fields: Array<string | null | undefined>, query: string): number {
  let best = -1;
  for (const field of fields) {
    if (!field) continue;
    const score = matchScore(field, query);
    if (score === -1) continue;
    if (best === -1 || score < best) best = score;
    if (best === 0) break;
  }
  return best;
}

/** Filter + sort by score, keeping source order within a tier (stable sort). */
function rank<T>(list: readonly T[], score: (item: T) => number): T[] {
  return list
    .map((item, i) => ({ item, score: score(item), i }))
    .filter((entry) => entry.score !== -1)
    .sort((a, b) => a.score - b.score || a.i - b.i)
    .map((entry) => entry.item);
}

const pageResult = (page: (typeof PAGES)[number]): Result => ({
  href: page.href,
  label: page.label,
  hint: page.hint
});

// Products deep-link to the menu's existing ?product= modal (it opens the
// detail dialog + fires its own view tracking).
const productResult = (product: LiveMenuProduct): Result => ({
  href: `/menu?product=${encodeURIComponent(product.id)}`,
  label: product.name,
  hint: product.category,
  price: formatPrice(product.salePrice)
});

const postResult = (post: PalettePost): Result => ({
  href: `/blog/${post.slug}`,
  label: post.title,
  hint: 'Journal'
});

const optionId = (index: number) => `rd-palette-option-${index}`;

export default function CommandPalette({
  posts,
  open,
  onOpenChange
}: {
  posts: Array<{ slug: string; title: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Reset happens on close (always an event handler) so reopening starts
  // clean without a set-state-in-effect on the open transition.
  const close = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    onOpenChange(false);
  }, [onOpenChange]);

  const groups = useMemo<Group[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Empty query: full sitemap + a taste of the menu.
      return [
        { name: 'Pages', items: PAGES.map(pageResult) },
        { name: 'Popular', items: menuProducts.slice(0, 4).map(productResult) }
      ];
    }
    const built: Group[] = [
      { name: 'Pages', items: rank(PAGES, (p) => bestScore([p.label], q)).map(pageResult) },
      {
        name: 'Products',
        items: rank(menuProducts, (p) => bestScore([p.name, p.brand, p.category], q))
          .slice(0, 8)
          .map(productResult)
      },
      { name: 'Journal', items: rank(posts, (p) => bestScore([p.title], q)).map(postResult) }
    ];
    return built.filter((group) => group.items.length > 0);
  }, [query, posts]);

  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  // Clamp instead of resetting state so result-set shrinkage never strands
  // the highlight out of range.
  const active = flat.length === 0 ? -1 : Math.min(activeIndex, flat.length - 1);

  // Focus trap + Esc + body scroll lock + focus restore (shared modal hook).
  useModalA11y(open, panelRef, { onEscape: close });

  // The hook lands focus on the panel; hand it to the input. Registered after
  // useModalA11y so this rAF runs second and wins.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Global Ctrl/Cmd+K toggle — always armed (even while typing elsewhere;
  // standard palette behavior), and preventDefault stops the browser's own ⌘K.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      if (open) close();
      else onOpenChange(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close, onOpenChange]);

  useEffect(() => {
    if (open) trackCta('command_palette_open', 'nav');
  }, [open]);

  // Keep the active option visible as arrows move it.
  useEffect(() => {
    if (active < 0) return;
    listRef.current?.querySelector(`#${optionId(active)}`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const select = useCallback(
    (result: Result) => {
      close();
      // MenuExplorer reads ?product= only in its useState initializer, so a
      // soft push while ALREADY on /menu re-renders without opening the
      // dialog. Force a real navigation in that one case so the deep-link
      // modal mounts (and tracks) exactly like an external share link.
      if (pathname === '/menu' && result.href.startsWith('/menu?product=')) {
        window.location.assign(result.href);
        return;
      }
      router.push(result.href);
    },
    [close, pathname, router]
  );

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (flat.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((active + 1) % flat.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((active - 1 + flat.length) % flat.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (active >= 0) select(flat[active]);
    }
  };

  if (!open) return null;

  // Running offset gives each option its index in the flattened list, which
  // is what activeIndex / aria-activedescendant address.
  let offset = 0;

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[14vh]">
      <div
        className="absolute inset-0 bg-[color:var(--rd-scrim)] backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site search"
        tabIndex={-1}
        className="rd-card-in rd-card-shadow relative w-full max-w-xl overflow-hidden rounded-2xl border border-[color:var(--rd-paper)]/12 bg-[color:var(--rd-ink-soft)] outline-none"
      >
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-[color:var(--rd-paper)]/8 px-4">
          <Search size={18} strokeWidth={1.75} className="shrink-0 text-[color:var(--rd-text-mute)]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="rd-palette-listbox"
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
            aria-autocomplete="list"
            aria-label="Search pages, products, and journal posts"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Search pages, products, journal…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-[color:var(--rd-text)] outline-none placeholder:text-[color:var(--rd-text-mute)]"
          />
          <kbd className="shrink-0 rounded-md border border-[color:var(--rd-paper)]/14 px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          id="rd-palette-listbox"
          role="listbox"
          aria-label="Search results"
          className="max-h-[min(420px,55vh)] overflow-y-auto overscroll-contain py-2"
        >
          {flat.length === 0 ? (
            <li role="presentation" className="px-5 py-10 text-center text-sm text-[color:var(--rd-text-mute)]">
              No matches for “{query.trim()}” — try a strain name, page, or post title.
            </li>
          ) : (
            groups.map((group) => {
              const start = offset;
              offset += group.items.length;
              return (
                <Fragment key={group.name}>
                  <li role="presentation" className="rd-eyebrow px-5 pb-1.5 pt-3 text-[10px]">
                    {group.name}
                  </li>
                  {group.items.map((item, i) => {
                    const index = start + i;
                    const isActive = index === active;
                    return (
                      <li
                        key={`${group.name}-${item.href}`}
                        id={optionId(index)}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => select(item)}
                        onMouseMove={() => {
                          if (!isActive) setActiveIndex(index);
                        }}
                        className={`mx-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                          isActive ? 'bg-[color:var(--rd-glow)]/10' : ''
                        }`}
                      >
                        {/* Lime indicator bar for the active row */}
                        <span
                          className={`h-4 w-0.5 shrink-0 rounded-full ${isActive ? 'bg-[color:var(--rd-glow)]' : 'bg-transparent'}`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate text-[14px] text-[color:var(--rd-text)]">{item.label}</span>
                        {item.price && (
                          <span className="shrink-0 text-[12px] text-[color:var(--rd-glow)] [font-family:var(--font-mono)]">
                            {item.price}
                          </span>
                        )}
                        {item.hint && (
                          <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-[color:var(--rd-text-mute)] [font-family:var(--font-mono)]">
                            {item.hint}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </Fragment>
              );
            })
          )}
        </ul>

        {/* Keyboard legend */}
        <div className="flex items-center gap-4 border-t border-[color:var(--rd-paper)]/8 px-5 py-2.5">
          <span className="rd-eyebrow text-[10px]">↑↓ Navigate</span>
          <span className="rd-eyebrow text-[10px]">↵ Select</span>
          <span className="rd-eyebrow text-[10px]">Esc Close</span>
        </div>
      </div>
    </div>
  );
}
