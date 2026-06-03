/**
 * Client-side conversion tracking.
 *
 * GA4 + the Meta Pixel are loaded in app/layout.tsx (lazyOnload). Both expose
 * globals — `gtag` (GA) and `fbq` (Pixel) — once their scripts run. These
 * helpers FIRE events to both at once and safely no-op on the server or before
 * the scripts have loaded (early events are simply dropped, which is fine — the
 * actions we care about happen well after first paint).
 *
 * The IDs themselves live in layout.tsx and are public by design (a GA
 * Measurement ID / Pixel ID are exposed in every site's HTML) — these helpers
 * carry no secrets, they only emit events.
 *
 * Why this exists: out of the box the site only logged PageView, so we could
 * see traffic but never which page/CTA drove an order, and the Pixel could only
 * optimise ads for clicks (not conversions). These events make the funnel
 * visible and let the Pixel learn who actually checks out.
 */

type Params = Record<string, string | number | boolean | undefined>;

function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(...args);
}

function fbq(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.(...args);
}

/** Raw GA4 event. */
export function gaEvent(name: string, params: Params = {}): void {
  gtag('event', name, params);
}

/** Raw Meta Pixel STANDARD event (InitiateCheckout, Lead, ViewContent, …). */
export function metaStandard(name: string, params: Params = {}): void {
  fbq('track', name, params);
}

/** Raw Meta Pixel CUSTOM event (anything not in Meta's standard list). */
export function metaCustom(name: string, params: Params = {}): void {
  fbq('trackCustom', name, params);
}

// ---------------------------------------------------------------------------
// Semantic events — fire to BOTH GA4 and the Pixel with sensible mappings.
// ---------------------------------------------------------------------------

/**
 * THE money event: a user clicked an Order / checkout CTA and is heading to the
 * external checkout. `source` says where (nav, sticky bar, menu card, …).
 */
export function trackOrderClick(source: string, extra: Params = {}): void {
  gaEvent('begin_checkout', { source, ...extra });
  metaStandard('InitiateCheckout', { source, ...extra });
}

/** A user opened a product's detail view. */
export function trackProductView(name: string, category?: string): void {
  gaEvent('view_item', { item_name: name, item_category: category });
  metaStandard('ViewContent', { content_name: name, content_category: category });
}

/** A user checked whether we deliver to their ZIP. */
export function trackZipCheck(zip: string, covered: boolean): void {
  gaEvent('zip_check', { zip, covered });
  metaStandard('Search', { search_string: zip, covered });
}

/** A lead was captured (newsletter / age-gate welcome signup). */
export function trackSignup(source: string): void {
  gaEvent('sign_up', { method: source });
  metaStandard('Lead', { source });
}

/** A user finished the strain-finder quiz. */
export function trackQuizComplete(result?: string): void {
  gaEvent('quiz_complete', { result });
  metaCustom('QuizComplete', { result });
}

/** Generic in-page CTA click (deals, cross-links, etc.). GA-only. */
export function trackCta(label: string, source: string): void {
  gaEvent('cta_click', { label, source });
}
