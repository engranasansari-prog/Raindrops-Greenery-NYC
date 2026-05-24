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
  address: {
    line1: '[REPLACE: 000 Example Ave]',
    line2: 'Suite 100',
    city: 'New York',
    region: 'NY',
    postalCode: '10001'
  },
  hours: [
    { day: 'Every day', open: '10:00 AM', close: '12:00 AM' }
  ],
  // NY Office of Cannabis Management retail dispensary license number.
  ocmLicense: '[REPLACE: OCM-RETAIL-XXXX-XXXX]',
  // Replace with the real production hostname before launch.
  domain: 'raindropsgreenery.com',
  baseUrl: 'https://raindropsgreenery.com'
};

export const social = [
  { label: 'Instagram', href: 'https://instagram.com/raindropsgreenery', handle: '@raindropsgreenery' },
  { label: 'TikTok', href: 'https://tiktok.com/@raindropsgreenery', handle: '@raindropsgreenery' },
  { label: 'X', href: 'https://x.com/raindropsgreenery', handle: '@raindropsgreenery' },
  { label: 'Facebook', href: 'https://facebook.com/raindropsgreenery', handle: 'Raindrops Greenery' }
];

export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Deals', href: '/deals' },
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
      { label: 'Today’s deals', href: '/deals' }
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

export const serviceAreas = ['Manhattan', 'Brooklyn', 'Queens'];

export const serviceAreaDetails = [
  {
    name: 'Manhattan',
    headline: 'Downtown to Uptown coverage',
    body: 'From the Financial District through Midtown to the Upper West and East Sides, with frequent drops across Chelsea, SoHo, the Village, and Harlem.',
    zips: ['10001', '10002', '10003', '10009', '10010', '10011', '10012', '10013', '10014']
  },
  {
    name: 'Brooklyn',
    headline: 'North & West Brooklyn corridor',
    body: 'DUMBO, Williamsburg, Bushwick, Fort Greene, Park Slope, Crown Heights, and Bed-Stuy with extended evening windows.',
    zips: ['11201', '11205', '11206', '11211', '11215', '11216', '11217', '11221', '11222']
  },
  {
    name: 'Queens',
    headline: 'Long Island City to Flushing',
    body: 'Long Island City, Astoria, Sunnyside, Woodside, Jackson Heights, and Flushing with timed afternoon and evening runs.',
    zips: ['11101', '11102', '11103', '11104', '11105', '11354', '11355', '11372', '11373']
  }
];

export const supportedZips = serviceAreaDetails.flatMap((area) => area.zips);

export const trustPoints = [
  {
    title: 'Curated menu',
    body: 'Browse a focused selection of Flower, Pre-Rolls, and Edibles without digging through unrelated categories.'
  },
  {
    title: 'NYC delivery focus',
    body: 'Built around a simple delivery experience for Manhattan, Brooklyn, and Queens.'
  },
  {
    title: 'Secure checkout',
    body: 'Order buttons open the checkout flow for final availability, payment, and 21+ verification.'
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
    title: 'NY-tested products',
    body: 'Every product on the menu is sourced from licensed New York operators with state-required testing on record. Ask for the Certificate of Analysis at checkout for any item.'
  },
  {
    title: 'Transparent pricing',
    body: 'List price, sale price, weight, and active deal are all visible up front. No hidden fees on the menu — final taxes are confirmed at checkout.'
  },
  {
    title: 'Discreet, professional delivery',
    body: 'Unbranded packaging. Verified 21+ at the door. Trained, courteous drivers focused on a calm hand-off.'
  },
  {
    title: 'Built for repeat orders',
    body: 'Reorder favorites in a few taps. Easy zip check, transparent inventory, and a checkout flow that remembers your verified status.'
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
    quote: 'Ordered edibles on a Friday night and they were at my door inside the window. Will use them again.',
    author: 'Daniel R.',
    location: 'Astoria, Queens'
  }
];

export const pressMentions = [
  '[REPLACE: New York Cannabis Insider]',
  '[REPLACE: Time Out NY]',
  '[REPLACE: Resident Magazine]',
  '[REPLACE: High Times Local]'
];

export const faqs = [
  {
    q: 'Where does Raindrops Greenery deliver?',
    a: 'Raindrops Greenery New York delivery focuses on Manhattan, Brooklyn, and Queens. Final delivery eligibility is confirmed during checkout.'
  },
  {
    q: 'Do I need to be 21 or older?',
    a: 'Yes. This website and checkout experience are intended only for adults 21 and older. A valid government ID is required at the door before a delivery is handed off.'
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
    q: 'Are products lab tested?',
    a: 'Yes. All products are sourced from New York licensed operators that are required to test for potency, pesticides, microbials, and heavy metals. Certificates of Analysis are available on request.'
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Accepted payment options are shown in checkout and at the door. Cash is always accepted; debit and additional options may be available subject to current processor support.'
  },
  {
    q: 'What is the delivery fee and minimum?',
    a: 'A minimum order and a small delivery fee may apply depending on your zone. Both are shown clearly in checkout before you confirm an order.'
  },
  {
    q: 'How discreet is the delivery?',
    a: 'Packaging is plain and unbranded. Drivers are trained to keep handoffs short and professional.'
  },
  {
    q: 'What is your return policy?',
    a: 'For safety and compliance reasons, cannabis products cannot be returned once delivered. If there is an issue with your order, contact support within 24 hours and we will make it right.'
  }
];

export const promoStrip = {
  // Set to null to hide the strip.
  message: 'First-time NYC delivery? Use code WELCOME10 at checkout for $10 off your first order.',
  cta: { label: 'Shop deals', href: '/deals' }
};
