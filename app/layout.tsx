import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { Fraunces, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { business, serviceAreas, social } from '@/lib/site-data';
import { COVERAGE } from '@/lib/coverage';
import Nav from '@/components/Nav';
import AnnouncementBar from '@/components/AnnouncementBar';
import HideOnDashboard from '@/components/HideOnDashboard';
import AnalyticsPageview from '@/components/AnalyticsPageview';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

// Display — Fraunces (variable). We load THREE expressive axes:
//   • opsz  — optical sizing, dialed per heading size in globals.css so big
//             display text gets the tight, high-contrast cut and small text
//             stays readable (instead of one static opsz for every size).
//   • SOFT  — softens terminals slightly for a warmer, less clinical serif.
//   • WONK  — Fraunces' signature "wonky" axis (swashy ball-terminals + the
//             expressive italic). This is what makes Fraunces look like a
//             $$$ editorial face rather than a generic serif; we switch it on
//             for the large display sizes only.
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: 'variable',
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap'
});
// Body — DM Sans (clean, modern, non-Inter)
const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});
// Mono — JetBrains Mono for prices, badges, eyebrows
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL(business.baseUrl),
  // Title template uses 56-char optimal length for the homepage and lets
  // every interior page set its own primary-keyword title that auto-
  // appends the brand. SEO best practice: keyword first, brand last.
  title: {
    default: 'Tax-Free Weed Delivery NYC | Raindrops Greenery NY',
    template: '%s | Raindrops Greenery NY'
  },
  // ~155-char meta description, primary KW ("weed delivery NYC") in first 100
  // chars + CTA. Ampersand-free so the rendered length isn't inflated.
  description:
    'Tax-free, same-day weed delivery in NYC — Manhattan, LIC, Williamsburg, and Greenpoint. Curated cannabis flower, pre-rolls, and edibles. Free over $25, 21+.',
  applicationName: 'Raindrops Greenery',
  authors: [{ name: business.tradeName, url: business.baseUrl }],
  creator: business.tradeName,
  publisher: business.legalName,
  keywords: [
    // Primary commercial intent — high competition, high value
    'NYC cannabis delivery',
    'weed delivery NYC',
    'cannabis delivery New York',
    'Manhattan weed delivery',
    'Brooklyn cannabis delivery',
    'Queens cannabis delivery',
    'Williamsburg weed delivery',
    'Greenpoint cannabis delivery',
    'LIC cannabis delivery',
    // Differentiator keywords
    'tax-free cannabis NYC',
    'tax-free weed New York',
    'Shinnecock cannabis',
    'free weed delivery NYC',
    // Product-specific
    'flower strains NYC',
    'pre-rolls NYC',
    'edibles NYC',
    'same-day weed delivery',
    // Branded
    'Raindrops Greenery',
    'Raindrops Greenery NY',
    'Raindrops Greenery delivery'
  ],
  alternates: {
    canonical: business.baseUrl
  },
  // manifest is auto-linked by app/manifest.ts (basePath-aware) — no explicit URL.
  // icons are auto-linked from app/icon.jpg + app/apple-icon.jpg (file-based
  // metadata). Next.js emits the <link rel="icon"> (icon.jpg) and
  // <link rel="apple-touch-icon"> (apple-icon.jpg) tags, so no manual `icons`
  // block is needed. NOTE: /favicon.ico is NOT separately provided — there's no
  // app/favicon.ico, so a hard request to /favicon.ico 404s. That's fine:
  // browsers use the emitted <link rel="icon"> for the tab icon and only fall
  // back to /favicon.ico when no such link exists.
  openGraph: {
    title: 'Tax-Free Weed Delivery NYC | Raindrops Greenery',
    description:
      'Same-day tax-free weed delivery for Manhattan, LIC, Williamsburg, and Greenpoint. Curated cannabis flower, pre-rolls, and edibles. Free over $25.',
    url: business.baseUrl,
    siteName: 'Raindrops Greenery',
    locale: 'en_US',
    type: 'website'
    // No explicit `images` here: app/opengraph-image.tsx generates a correct
    // 1200×630 branded card that Next.js auto-links for both og:image AND
    // twitter:image. (The old hard-coded DISPENSARYIMAGE entry declared
    // 1200×800 but the real file is 1000×750 — a mismatch crawlers flag.)
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tax-Free Weed Delivery NYC | Raindrops Greenery',
    description: 'Same-day tax-free weed delivery, free over $25, 21+. Manhattan, Williamsburg, Greenpoint, and LIC.'
    // images omitted on purpose — falls back to the generated opengraph-image.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  // Geo meta tags — secondary but consistent local SEO signal alongside
  // the LocalBusiness JSON-LD geo coordinates.
  other: {
    'geo.region': 'US-NY',
    'geo.placename': 'New York',
    'geo.position': `${business.geo.latitude};${business.geo.longitude}`,
    ICBM: `${business.geo.latitude}, ${business.geo.longitude}`,
    'distribution': 'local'
  },
  category: 'cannabis delivery'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F0E8D2' },
    { media: '(prefers-color-scheme: dark)', color: '#1B3328' }
  ]
};

/* =====================================================================
   STRUCTURED DATA / JSON-LD
   Four connected schemas exposed at the root of every page:

     1. Organization (brand)  — the multi-location Raindrops Greenery brand:
                                identity, sameAs, subOrganization list
     2. Organization (NYC)    — this location's org node: contactPoint,
                                logo, parentOrganization → brand
     3. LocalBusiness/Store   — local-pack signals: geo, areaServed, hours,
                                payment, price range, image gallery, services
     4. WebSite               — sitelinks search box via SearchAction

   Every schema cross-references via @id so Google understands they're
   the same entity. Per Google's structured-data documentation, this is
   the gold-standard local business + brand setup.
   ===================================================================== */

const ZIP_LIST = COVERAGE.clusters.flatMap((c) => [...c.zips]);

// Parent brand — the Raindrops Greenery multi-location entity that owns
// every regional location (Southampton, NYC, Long Island). Defined as a
// stable @id so each location's JSON-LD can reference it via
// parentOrganization / branchOf. Lives at the bare apex (no sub-path) so
// it's a single canonical entity across all three location sites.
const BRAND_ORIGIN = 'https://www.raindropsgreenery.com';
const BRAND_ID = `${BRAND_ORIGIN}#brand`;

const brandLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': BRAND_ID,
  name: 'Raindrops Greenery',
  // Brand-level alias only. The NY LLC legal name belongs on the #org
  // (location) node, not the multi-location brand entity.
  alternateName: 'Raindrops Greenery NY',
  url: BRAND_ORIGIN,
  logo: {
    '@type': 'ImageObject',
    url: `${business.baseUrl}/assets/logo.jpg`,
    width: 1024,
    height: 1024
  },
  description:
    'Raindrops Greenery is a multi-location premium cannabis brand — a Tribally licensed dispensary offering tax-free, same-day delivery across New York with locations in Southampton, New York City, and Long Island.',
  sameAs: social.map((item) => item.href),
  // The three locations under one brand. New Long Island URL will go in
  // when that site launches.
  subOrganization: [
    { '@type': 'Organization', name: 'Raindrops Greenery — Southampton', url: `${BRAND_ORIGIN}/southampton-raindrops-greenery` },
    { '@type': 'Organization', '@id': `${business.baseUrl}#org`, name: 'Raindrops Greenery — New York City', url: business.baseUrl },
    { '@type': 'Organization', name: 'Raindrops Greenery — Long Island', url: `${BRAND_ORIGIN}/long-island-raindrops-greenery` }
  ]
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${business.baseUrl}#org`,
  name: business.legalName,
  alternateName: business.tradeName,
  url: business.baseUrl,
  // Links this NYC location to the multi-location brand entity so search
  // engines + AI engines understand all three locations are one brand.
  parentOrganization: { '@id': BRAND_ID },
  logo: {
    '@type': 'ImageObject',
    url: `${business.baseUrl}/assets/logo.jpg`,
    width: 1024,
    height: 1024
  },
  image: [
    `${business.baseUrl}/assets/DISPENSARYIMAGE.jpg`,
    `${business.baseUrl}/assets/dispensaryimage2.jpg`,
    `${business.baseUrl}/assets/heroPhoto.jpg`
  ],
  description:
    'Premium Shinnecock-licensed cannabis delivery across Manhattan plus parts of Brooklyn (Williamsburg, Greenpoint) and Queens (Long Island City). Tax-free, free delivery on orders over $25, same-day.',
  foundingDate: `${business.yearFounded}-01-01`,
  email: business.email,
  telephone: business.phone,
  sameAs: social.map((item) => item.href),
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: business.phoneHref.replace('tel:', ''),
      email: business.email,
      contactType: 'customer service',
      areaServed: 'US-NY',
      availableLanguage: ['English'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '10:00',
        closes: '22:00'
      }
    }
  ]
};

const localBusinessLd = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'Store'],
  '@id': `${business.baseUrl}#business`,
  name: `${business.tradeName} — New York City`,
  legalName: business.legalName,
  url: business.baseUrl,
  // Ties this LocalBusiness to the multi-location parent brand. Combined
  // with parentOrganization on the Organization node, this is what tells
  // Google + AI engines "this is one of three Raindrops Greenery
  // locations" rather than treating it as a standalone shop.
  branchOf: { '@id': BRAND_ID },
  image: [
    `${business.baseUrl}/assets/DISPENSARYIMAGE.jpg`,
    `${business.baseUrl}/assets/dispensaryimage2.jpg`,
    `${business.baseUrl}/assets/heroPhoto.jpg`,
    `${business.baseUrl}/assets/banner-gift1.jpg`
  ],
  logo: `${business.baseUrl}/assets/logo.jpg`,
  telephone: business.phone,
  email: business.email,
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Pay by Bank through Dutchie Pay',
  slogan: business.tagline,
  description:
    'Premium 21+ Shinnecock-licensed cannabis delivery for NYC — Manhattan plus parts of Brooklyn (Williamsburg, Greenpoint) and Queens (Long Island City). Tax-free pricing. Free delivery on orders over $25.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New York',
    addressRegion: 'NY',
    postalCode: '10001',
    addressCountry: 'US'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: business.geo.latitude,
    longitude: business.geo.longitude
  },
  // Every city we serve + every covered ZIP — this is what unlocks
  // local-pack rankings for neighborhood-specific queries.
  areaServed: [
    ...serviceAreas.map((area) => ({ '@type': 'City', name: area })),
    ...COVERAGE.clusters.map((cluster) => ({
      '@type': 'AdministrativeArea',
      name: cluster.name,
      containedInPlace: { '@type': 'City', name: cluster.borough === 'Manhattan' ? 'New York' : cluster.borough }
    })),
    ...ZIP_LIST.map((zip) => ({ '@type': 'PostalCodeArea', postalCode: zip, addressCountry: 'US' }))
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '22:00'
    }
  ],
  sameAs: social.map((item) => item.href),
  // NOTE: aggregateRating + review were intentionally removed from this
  // LocalBusiness markup. Google's review-snippet policy prohibits
  // self-authored reviews about your own business in structured data, and a
  // perfect 5.0 from a handful of first-party testimonials is a classic
  // structured-data manual-action trigger. The testimonials still render
  // visually on the home page (components/HomePage.tsx → TestimonialFeature);
  // only the rich-result markup is dropped. Re-add via a genuine,
  // independently collected review pipeline (with datePublished) if/when one
  // exists.
  // Service catalog: every delivery cluster surfaces as its own service.
  // Each becomes a discrete result for "weed delivery <neighborhood>".
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Cannabis delivery zones',
    itemListElement: COVERAGE.clusters.map((cluster) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: `Cannabis delivery to ${cluster.shortName}`,
        serviceType: 'Cannabis Delivery',
        areaServed: { '@type': 'AdministrativeArea', name: cluster.name },
        provider: { '@id': `${business.baseUrl}#business` },
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: `${business.baseUrl}/delivery`,
          servicePhone: business.phone
        }
      },
      eligibleRegion: cluster.zips.map((zip) => ({
        '@type': 'PostalCodeArea',
        postalCode: zip,
        addressCountry: 'US'
      })),
      priceSpecification: {
        '@type': 'DeliveryChargeSpecification',
        appliesToDeliveryMethod: { '@type': 'DeliveryMethod', name: 'On Foot / Local Drive' },
        priceCurrency: 'USD',
        price: '0',
        eligibleTransactionVolume: {
          '@type': 'PriceSpecification',
          minPrice: '25',
          priceCurrency: 'USD'
        }
      }
    }))
  },
  knowsAbout: [
    'Cannabis delivery',
    'Cannabis flower',
    'Pre-rolls',
    'Edibles',
    'NYC cannabis',
    'Shinnecock cannabis',
    'Tax-free cannabis'
  ],
  isAccessibleForFree: false,
  publicAccess: false  // 21+ ID required at the door
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${business.baseUrl}#website`,
  url: business.baseUrl,
  name: business.tradeName,
  alternateName: business.legalName,
  description:
    'Browse and order tax-free, Shinnecock-licensed cannabis for NYC delivery — Flower Strains, Pre-Rolls, Edibles.',
  publisher: { '@id': `${business.baseUrl}#org` },
  inLanguage: 'en-US',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${business.baseUrl}/menu?query={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
};

// GA4 Measurement ID. Public (it ships in the page HTML), so it's safe to keep
// in source. But the hard-coded fallback is applied ONLY on the production
// Vercel deploy — otherwise preview deploys, local dev, and forks would all
// report into the live GA property and pollute its data. A NEXT_PUBLIC_GA_ID
// env var always wins if set (e.g. to point a preview deploy at a separate
// property), and anywhere it's unset off-production GA_ID stays undefined, so
// the <Script> block below (gated on `GA_ID &&`) never mounts.
const GA_ID =
  process.env.NEXT_PUBLIC_GA_ID ??
  (process.env.VERCEL_ENV === 'production' ? 'G-K36KHP6THQ' : undefined);

// Meta Pixel ID — env-only (no default), so the Pixel scripts mount only when a
// client actually provisions one in Vercel.
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        {/* NOTE: no font-CDN preconnect. next/font SELF-HOSTS Fraunces / DM Sans
            / JetBrains Mono from this origin at build time, so the browser never
            requests fonts.googleapis.com or fonts.gstatic.com — preconnecting to
            them just burned two DNS+TLS handshakes on cold mobile for nothing. */}
        {/* No product-image CDN preconnect needed: next/image proxies every
            menu thumbnail through same-origin /_next/image, so the browser
            never opens a direct connection to the upstream S3 host. (The prior
            hint pointed at storage.googleapis.com, which isn't even the host
            that serves product images — it was a no-op.) */}
        {/*
          AI-crawler discovery hints. /llms.txt + /llms-full.txt follow
          the llmstxt.org spec and are the highest-fidelity surface for
          Perplexity / ChatGPT Search / Claude / Google AI Overviews to
          ground answers about Raindrops Greenery. /api/site-summary is
          the JSON equivalent.
        */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-friendly summary" />
        <link rel="alternate" type="application/json" href="/api/site-summary" title="Structured site summary" />
        {/*
          JSON-LD structured data — rendered as plain <script> tags inside
          <head> so they ship in the initial server-rendered HTML. We avoid
          next/script (which defers JSON-LD into the RSC Flight payload and
          relies on client hydration to inject the tag — Googlebot can miss
          it on a single-pass crawl). Per Google's structured-data docs,
          inline JSON-LD in <head> is the gold standard for discoverability.
        */}
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandLd) }}
        />
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
        />
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body className="font-[var(--font-sans)] antialiased">
        <noscript>
          <div style={{ background: 'var(--rd-ink)', color: 'var(--rd-text)', padding: '16px 24px', textAlign: 'center', fontFamily: 'var(--font-sans), system-ui, sans-serif', fontSize: 14, lineHeight: 1.6 }}>
            This site uses JavaScript for the interactive menu, ZIP checker, and age verification. Please enable JavaScript, or call us at <strong style={{ color: 'var(--rd-glow)' }}>(888) 448-4717</strong> to order. 21+ only.
          </div>
        </noscript>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-[var(--rd-glow)] focus:px-4 focus:py-2 focus:text-xs focus:font-extrabold focus:uppercase focus:tracking-[0.16em] focus:text-[var(--rd-ink)]">
          Skip to content
        </a>
        {/* Marketing chrome is hidden on the internal /dashboard routes. */}
        <HideOnDashboard>
          <AnnouncementBar />
          <Nav />
        </HideOnDashboard>
        {/*
          Analytics — fully wired, zero code changes needed to go live. The
          scripts auto-load ONLY when their env var is set in Vercel:
            • GA4:        set NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  (Project Settings →
              Environment Variables → Production → redeploy)
            • Meta Pixel: set NEXT_PUBLIC_META_PIXEL_ID=...
          Loaded via next/script afterInteractive so they never block render.
          GA4 setup: https://support.google.com/analytics/answer/9304153
        */}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
            <Script id="ga4" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="lazyOnload">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
        {/*
          SPA pageview bridge. The inline GA/Pixel snippets above fire only the
          initial document-load pageview; App Router navigations are client-side
          and would otherwise go uncounted. AnalyticsPageview re-fires page_view /
          PageView on every route change (skipping the first render). It mounts
          whenever EITHER analytics surface is active. Wrapped in <Suspense>
          because it reads useSearchParams (required for a CSR bailout boundary).
        */}
        {(GA_ID || META_PIXEL_ID) && (
          <Suspense fallback={null}>
            <AnalyticsPageview />
          </Suspense>
        )}
        {/*
          NOTE: no root MotionProvider here on purpose. Wrapping {children} at
          the layout put the framer-motion core in the SHARED bundle, taxing
          every static route (+35KB) — including pages with zero animation.
          Instead, each animated surface owns its provider: the page roots
          (HomePage, DeliveryPage, MenuExplorer, StrainQuiz) and the lazy
          chrome islands (AgeGate, StickyOrderBar, ChatAssistant) wrap
          themselves in <MotionProvider>, so motion costs only the routes and
          chunks that actually animate.
        */}
        {children}
        {/* Vercel Speed Insights — real-user Core Web Vitals (LCP / INP / CLS)
            field data. Sends nothing in dev; collects in production once Speed
            Insights is enabled in Vercel → Settings → Speed Insights (included
            on the Pro plan). This is the source of the INP numbers in the
            Vercel dashboard. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
