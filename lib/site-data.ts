export const checkout = {
  dutchieUrl: 'https://dutchie.com/stores/raindrops-greenery-retail',
  liveMenuUrl: 'https://raindropsgreenery.dispensary.shop/rec/menu',
  sourceNote:
    'Product browsing is available on this website. Final availability, payment, verification, and delivery details are completed through checkout.'
};

export const business = {
  legalName: 'Raindrops Greenery NY LLC',
  tradeName: 'Raindrops Greenery',
  tagline: 'Premium NYC cannabis delivery',
  yearFounded: 2024,
  phone: '(888) 448-9717',
  phoneHref: 'tel:+18884489717',
  email: 'nycraindrops@gmail.com',
  emailHref: 'mailto:nycraindrops@gmail.com',
  pressEmail: 'nycraindrops@gmail.com',
  pressEmailHref: 'mailto:nycraindrops@gmail.com',
  supportEmail: 'nycraindrops@gmail.com',
  supportEmailHref: 'mailto:nycraindrops@gmail.com',
  // Open every day; the live OpenStatus indicator reads this list.
  hours: [
    { day: 'Every day', open: '10:00 AM', close: '10:00 PM' }
  ],
  // Continuous open window in 24h, used by the live status badge.
  openHour: 10,
  closeHour: 22,
  // Operating under a sovereign Shinnecock Indian Nation cannabis license.
  licensingAuthority: 'Shinnecock Indian Nation Cannabis Regulatory Division',
  licensingShort: 'Shinnecock-licensed cannabis delivery partner',
  // Sovereign tribal land base (Shinnecock Indian Nation, Long Island, New York).
  jurisdiction: 'Shinnecock Indian Nation, Long Island, New York',
  serviceRegion: 'New York City',
  // Production hostname — update to the actual deployed domain when live.
  domain: 'raindropsgreenery.com',
  baseUrl: 'https://raindropsgreenery.com'
};

// V6 §10 — Instagram only. TikTok / X / Facebook removed site-wide.
export const social = [
  { label: 'Instagram', href: 'https://www.instagram.com/raindropsgreenery/', handle: '@raindropsgreenery' }
];

export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Deals', href: '/deals' },
  { label: 'Quiz', href: '/quiz' },
  { label: 'Delivery', href: '/delivery' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' }
];

export const footerLinkGroups = [
  {
    heading: 'Shop',
    links: [
      { label: 'Full menu', href: '/menu' },
      { label: 'Flower', href: '/menu?category=Flower' },
      { label: 'Pre-Rolls', href: '/menu?category=Pre-Rolls' },
      { label: 'Edibles', href: '/menu?category=Edibles' },
      { label: 'Today’s deals', href: '/deals' },
      { label: 'Strain finder quiz', href: '/quiz' }
    ]
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Delivery areas', href: '/delivery' },
      { label: 'Journal', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' }
    ]
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/legal/privacy' },
      { label: 'Terms of service', href: '/legal/terms' },
      { label: 'Accessibility', href: '/legal/accessibility' },
      { label: '21+ disclosure', href: '/legal/accessibility#age' }
    ]
  }
];

// Coverage data now lives in /lib/coverage.ts (V4 brief §3). These exports
// remain for legacy consumers that still import from site-data — they derive
// from the canonical coverage source.
import { COVERAGE, ALL_ZIPS } from './coverage';

export const serviceAreas = ['Manhattan', 'Long Island City', 'Williamsburg', 'Greenpoint'];

export const serviceAreaDetails = COVERAGE.clusters.map((cluster) => ({
  name: cluster.name,
  shortName: cluster.shortName,
  headline: `${cluster.etaMinutes} min average ETA`,
  body: `Free same-day delivery — ${cluster.zips.length} ZIP${cluster.zips.length === 1 ? '' : 's'}.`,
  zips: [...cluster.zips]
}));

export const supportedZips = ALL_ZIPS;

export const trustPoints = [
  {
    title: 'Tax-free',
    body: 'Sovereign Shinnecock authority — no NY State cannabis tax on your order.'
  },
  {
    title: 'Free delivery',
    body: 'Unconditional. Every order, every ZIP we cover. No minimum, no hidden fees.'
  },
  {
    title: 'Same-day NYC',
    body: 'Manhattan and the East River neighborhoods of LIC, Williamsburg, and Greenpoint.'
  }
];

export const steps = [
  {
    eyebrow: '01',
    title: 'Browse the menu',
    body: 'Search Flower, Pre-Rolls, and Edibles by category, price, potency, size, brand, and deals.'
  },
  {
    eyebrow: '02',
    title: 'Compare product details',
    body: 'Review product images, pricing, size, potency, and deal information before starting checkout.'
  },
  {
    eyebrow: '03',
    title: 'Complete checkout',
    body: 'Use any order button to continue to the checkout flow for payment, verification, and delivery confirmation.'
  }
];

export const valueProps = [
  {
    title: 'Tax-free',
    body: 'Sovereign Shinnecock authority — no NY State cannabis excise or sales tax. The price on the card is the price at the door.'
  },
  {
    title: 'Free delivery',
    body: 'Unconditional. No minimum, no surge pricing, no hidden fees. Every order, every covered ZIP.'
  },
  {
    title: 'Sticky icky',
    body: 'Top-shelf flower hand-picked for resin. We carry strains we’d order ourselves — and we tell you the truth about them.'
  },
  {
    title: 'Discreet & professional',
    body: 'Unbranded packaging. 21+ ID verified at the door. Courteous drivers, short and clean hand-offs.'
  }
];

export const testimonials = [
  {
    quote: 'The site made it easy to compare a few hybrids before I ordered. Driver was on time, ID verified at the door, no fuss.',
    author: 'Jordan M.',
    location: 'Williamsburg, Brooklyn'
  },
  {
    quote: 'Cleanest menu I’ve used in New York. Pre-rolls were exactly what was on the page, prices matched. Easy.',
    author: 'Priya S.',
    location: 'Chelsea, Manhattan'
  },
  {
    quote: 'Ordered edibles on a Friday and they crossed the bridge in 50 minutes. Doing this again.',
    author: 'Daniel R.',
    location: 'Long Island City, Queens'
  }
];

export const faqs = [
  {
    q: 'Why is Raindrops tax-free?',
    a: 'Raindrops operates under the sovereign cannabis authority of the Shinnecock Indian Nation. Sales through our license are exempt from the New York State cannabis excise and sales taxes that apply to OCM-licensed dispensaries.'
  },
  {
    q: 'Is delivery really free?',
    a: 'Yes — free delivery on every order, no minimum, across our Manhattan + East River coverage area. No hidden fees.'
  },
  {
    q: 'Do I get a free gift?',
    a: 'Every first-time customer in our coverage area gets a complimentary pre-roll added to their order. Spot a Raindrops sticker around the city for additional welcome drops. 21+ only, while supplies last.'
  },
  {
    q: 'Who licenses Raindrops Greenery?',
    a: 'Raindrops Greenery operates under a sovereign cannabis license issued by the Shinnecock Indian Nation Cannabis Regulatory Division.'
  },
  {
    q: 'Where does Raindrops Greenery deliver?',
    a: 'We deliver across Manhattan plus the East River neighborhoods of Long Island City (Queens), Williamsburg (Brooklyn), and Greenpoint (Brooklyn). Use the coverage checker on the home page to confirm your ZIP.'
  },
  {
    q: 'Do I need to be 21 or older?',
    a: 'Yes. This website and the delivery experience are intended only for adults 21 and older. A valid government ID is required at the door before any delivery is handed off.'
  },
  {
    q: 'Can I place an order from the website?',
    a: 'You can browse products here. When you are ready, order buttons open the checkout flow to complete payment, verification, and delivery details.'
  },
  {
    q: 'Which products are shown on the menu page?',
    a: 'The menu page is intentionally limited to Flower, Pre-Rolls, and Edibles for a cleaner shopping experience.'
  },
  {
    q: 'Are prices and availability final?',
    a: 'Prices and availability can change. Please confirm final product details during checkout before placing an order.'
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Accepted payment options are shown in checkout and at the door. Cash is always accepted; debit and additional options may be available subject to current processor support.'
  },
  {
    q: 'How discreet is the delivery?',
    a: 'Packaging is plain and unbranded. Drivers are trained to keep handoffs short and professional, and we verify your 21+ ID at the door.'
  },
  {
    q: 'What is your return policy?',
    a: 'For safety and compliance reasons, cannabis products cannot be returned once delivered. If there is an issue with your order, contact support within 24 hours and we will make it right.'
  }
];

export const promoStrip = {
  // Set message to null to hide the strip.
  message: 'Free delivery in Manhattan + East River neighborhoods · Tax-free under Shinnecock · Open 10am–10pm',
  cta: { label: 'Check coverage', href: '#coverage' }
};
