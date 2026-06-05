'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * SPA pageview bridge for the App Router.
 *
 * GA4 (gtag) and the Meta Pixel (fbq) bootstrap in app/layout.tsx and fire ONE
 * pageview on the initial document load. After that, every in-app navigation is
 * a client-side route transition — the document never reloads — so neither
 * analytics library sees the new URL on its own. Without this component, all
 * traffic after the landing page is invisible (single-page sessions, broken
 * funnels, no per-page conversions).
 *
 * This watches pathname + search params and re-fires page_view / PageView on
 * each route CHANGE. The very first render is skipped on purpose: the inline
 * scripts in layout already counted the initial load, and double-counting it
 * would inflate the landing page and deflate bounce/engagement metrics.
 *
 * `useSearchParams()` opts the subtree into client-side rendering, so this
 * component must be wrapped in a <Suspense> boundary by its consumer (it is, in
 * layout.tsx). It renders nothing.
 */
export default function AnalyticsPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Skip the initial mount — layout's inline GA/Pixel snippets already fired the
  // first pageview for this document load.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    // GA + Pixel attach these globals to window once their layout scripts run.
    // No ambient Window augmentation exists in this project (see lib/analytics.ts),
    // so we read them via a local cast to stay typesafe and consistent.
    const w = window as unknown as {
      gtag?: (...a: unknown[]) => void;
      fbq?: (...a: unknown[]) => void;
    };

    // GA4 — manual page_view with the full path+query of the new route.
    w.gtag?.('event', 'page_view', {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title
    });

    // Meta Pixel — standard PageView for the new route.
    w.fbq?.('track', 'PageView');
  }, [pathname, searchParams]);

  return null;
}
