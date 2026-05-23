import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { business } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description:
    'Raindrops Greenery’s commitment to digital accessibility and ongoing WCAG 2.1 AA conformance for the NY delivery website.',
  alternates: { canonical: '/legal/accessibility' }
};

export default function AccessibilityPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Accessibility statement"
      intro="Raindrops Greenery is committed to making this website usable by everyone, including people who use assistive technologies."
      lastUpdated="May 2026"
      currentPath="/legal/accessibility"
    >
      <h2>Our commitment</h2>
      <p>
        We strive to align this website with the W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. We treat accessibility as an ongoing practice: every release is reviewed for color contrast, keyboard navigation, semantic structure, and screen reader behavior.
      </p>

      <h2>What we do</h2>
      <ul>
        <li>Color contrast is checked against WCAG AA on text, icons, and interactive elements.</li>
        <li>Every interactive control is reachable with a keyboard and has a visible focus state.</li>
        <li>Form fields have labels, helpful placeholder text, and clear error messages.</li>
        <li>Images use descriptive <code>alt</code> attributes where they carry meaning.</li>
        <li>Headings are used in a logical, sequential order and we provide a “Skip to content” link at the top of every page.</li>
        <li>Motion is reduced for users who prefer reduced motion in their operating system.</li>
      </ul>

      <h2 id="age">21+ age confirmation</h2>
      <p>
        Because cannabis is restricted to adults 21 and older, this website shows an age-confirmation prompt the first time you visit. The prompt is keyboard accessible and announces itself to screen readers as a modal. If you decline, you can return any time once you are 21 or older.
      </p>

      <h2>Known limitations</h2>
      <p>
        Some product images from third-party suppliers may have limited alt text. We continue to enrich those as data becomes available. If you encounter a specific accessibility barrier, please let us know.
      </p>

      <h2>Report an accessibility issue</h2>
      <p>
        Email <a href={business.supportEmailHref}>{business.supportEmail}</a> with the page URL, a short description, the assistive technology you were using, and your contact information. We aim to respond within five business days.
      </p>

      <h2>Alternative ways to order</h2>
      <p>
        If the website is not working for you, call us at <a href={business.phoneHref}>{business.phone}</a> during business hours and we will help place your order over the phone.
      </p>
    </LegalLayout>
  );
}
