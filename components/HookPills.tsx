import { Droplet, Leaf, Sparkles, Truck } from 'lucide-react';

const HOOKS = [
  { icon: Droplet, label: 'Tax free' },
  { icon: Sparkles, label: 'Free weed gift' },
  { icon: Truck, label: 'Free delivery' },
  { icon: Leaf, label: 'Sticky · icky' }
] as const;

/**
 * V4 §7 — four lime-outline pills used under the hero on the home page and
 * near the top of /menu, /deals, /delivery, /about.
 *
 * `tone`:
 *   - "dark"  → on ink/dark sections (default). Glow outline + glow text.
 *   - "light" → on paper/cream sections. Moss outline + glow fill.
 */
export default function HookPills({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const dark = tone === 'dark';
  return (
    <ul
      className={`no-scrollbar flex flex-wrap items-center gap-2 ${dark ? '' : ''}`}
      aria-label="Why Raindrops"
    >
      {HOOKS.map((hook) => {
        const Icon = hook.icon;
        return (
          <li key={hook.label}>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] [font-family:var(--font-mono)] ${
                dark
                  ? 'border-[color:var(--rd-glow)]/40 bg-[color:var(--rd-glow)]/8 text-[color:var(--rd-glow)]'
                  : 'border-[color:var(--rd-moss)]/45 bg-[color:var(--rd-glow)]/24 text-[color:var(--rd-moss)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {hook.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
