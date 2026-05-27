import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Fraunces, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { business, serviceAreas, social, testimonials } from '@/lib/site-data';
import { COVERAGE } from '@/lib/coverage';
import Nav from '@/components/Nav';
import AnnouncementBar from '@/components/AnnouncementBar';
import './globals.css';

// Display — Fraunces (variable, opsz + SOFT for editorial feel)
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: 'variable',
  axes: ['opsz', 'SOFT'],
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
    default: 'NYC Cannabis Delivery — Tax-Free | Raindrops Greenery',
    template: '%s | Raindrops Greenery NY'
  },
  // 158-char meta description with primary KW in first 100 chars + CTA.
  description:
    'Tax-free NYC cannabis delivery — same-day to Manhattan, LIC, Williamsburg & Greenpoint. Shop curated Flower Strains, Pre-Rolls, and Edibles. Free over $25. 21+.',
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
    canonical: business.baseUrl,
    languages: { 'en-US': business.baseUrl }
  },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/assets/logo.jpg', type: 'image/jpeg' }],
    apple: [{ url: '/assets/logo.jpg' }],
    shortcut: ['/assets/logo.jpg']
  },
  openGraph: {
    title: 'NYC Cannabis Delivery — Tax-Free | Raindrops Greenery',
    description:
      'Same-day tax-free cannabis delivery for Manhattan, LIC, Williamsburg, and Greenpoint. Curated Flower Strains, Pre-Rolls, Edibles. Free over $25.',
    url: business.baseUrl,
    siteName: 'Raindrops Greenery',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${business.baseUrl}/assets/DISPENSARYIMAGE.jpg`,
        width: 1200,
        height: 800,
        alt: 'Raindrops Greenery NYC dispensary'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NYC Cannabis Delivery — Tax-Free | Raindrops Greenery',
    description: 'Same-day cannabis delivery, free over $25, 21+. Manhattan + East River neighborhoods.',
    images: [`${business.baseUrl}/assets/DISPENSARYIMAGE.jpg`]
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
    { media: '(prefers-color-scheme: light)', color: '#F5F1E8' },
    { media: '(prefers-color-scheme: dark)', color: '#0A1410' }
  ]
};

/* =====================================================================
   STRUCTURED DATA / JSON-LD
   Five connected schemas exposed at the root of every page:

     1. Organization       — brand identity, sameAs, contactPoint
     2. LocalBusiness      — local-pack signals: geo, areaServed, hours,
                             rating, payment, price range, image gallery
     3. WebSite            — sitelinks search box via SearchAction
     4. WebPage            — generic page envelope linking the above
     5. FAQ headline       — top-3 conversion-relevant FAQs surfaced
                             site-wide so any page can win the FAQ snippet

   Every schema cross-references via @id so Google understands they're
   the same entity. Per Google's structured-data documentation, this is
   the gold-standard local business + brand setup.
   ===================================================================== */

const ZIP_LIST = COVERAGE.clusters.flatMap((c) => [...c.zips]);

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${business.baseUrl}#org`,
  name: business.legalName,
  alternateName: business.tradeName,
  url: business.baseUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${business.baseUrl}/assets/logo.jpg`,
    width: 800,
    height: 800
  },
  image: [
    `${business.baseUrl}/assets/DISPENSARYIMAGE.jpg`,
    `${business.baseUrl}/assets/dispensaryimage2.jpg`,
    `${business.baseUrl}/assets/heroPhoto.jpg`
  ],
  description:
    'Premium Shinnecock-licensed cannabis delivery for Manhattan plus the East River neighborhoods of LIC, Williamsburg, and Greenpoint. Tax-free, free delivery on orders over $25, same-day.',
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
  name: business.tradeName,
  legalName: business.legalName,
  url: business.baseUrl,
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
  paymentAccepted: 'Cash, Debit Card',
  slogan: business.tagline,
  description:
    'Premium 21+ Shinnecock-licensed cannabis delivery for NYC — Manhattan plus the East River neighborhoods of Long Island City, Williamsburg, and Greenpoint. Tax-free under sovereign authority. Free delivery on orders over $25.',
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
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    bestRating: '5',
    reviewCount: `${testimonials.length}`
  },
  review: testimonials.map((t) => ({
    '@type': 'Review',
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    author: { '@type': 'Person', name: t.author },
    reviewBody: t.quote,
    locationCreated: { '@type': 'Place', name: t.location }
  })),
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        {/* Preconnect to font CDN for snappier first paint (covered by next/font
            but the explicit hint helps in some browsers and crawlers). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS-prefetch the Flowhub product image CDN so menu thumbs warm up. */}
        <link rel="dns-prefetch" href="https://storage.googleapis.com" />
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
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body className="font-[var(--font-sans)] antialiased">
        <noscript>
          <div style={{ background: '#0A1410', color: '#F5F1E8', padding: '16px 24px', textAlign: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 14, lineHeight: 1.6 }}>
            This site uses JavaScript for the interactive menu, ZIP checker, and age verification. Please enable JavaScript, or call us at <strong style={{ color: '#C8E66E' }}>(888) 448-4717</strong> to order. 21+ only.
          </div>
        </noscript>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-[var(--rd-glow)] focus:px-4 focus:py-2 focus:text-xs focus:font-extrabold focus:uppercase focus:tracking-[0.16em] focus:text-[var(--rd-ink)]">
          Skip to content
        </a>
        <AnnouncementBar />
        <Nav />
        {/*
          Analytics placeholders. Replace ga_id / pixel_id with real IDs before launch.
          GA4: https://support.google.com/analytics/answer/9304153
          Meta Pixel: https://www.facebook.com/business/help/952192354843755
        */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.NEXT_PUBLIC_META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
        {children}
      </body>
    </html>
  );
}
