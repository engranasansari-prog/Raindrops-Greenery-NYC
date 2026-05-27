import type { SVGProps } from 'react';

/**
 * Inline monoline social icons. The installed lucide-react version (1.16.0)
 * does not ship Facebook/Instagram/Twitter brand glyphs, and licensing makes
 * adding a brand-icon package overkill. These are simple, on-brand SVGs.
 *
 * All use currentColor + 1.5px stroke so they inherit text color.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="M14 4v9.5a3 3 0 1 1-3-3" />
      <path d="M14 4c.5 2 2 3.5 4 4" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="M14 22v-9h3l.5-4H14V6.5c0-1 .3-1.5 1.5-1.5H18V2h-3c-2.5 0-4 1.5-4 4v3H8v4h3v9" />
    </svg>
  );
}
