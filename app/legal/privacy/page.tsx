import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { business } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Raindrops Greenery NY collects, uses, stores, and protects personal information when you use the website and delivery service.',
  alternates: { canonical: '/legal/privacy' }
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy policy"
      intro="This policy explains what information we collect when you use this website or order delivery from Raindrops Greenery, how we use it, who we share it with, and the choices you have."
      lastUpdated="May 2026"
      currentPath="/legal/privacy"
    >
      <p>
        {business.legalName} (“Raindrops Greenery”, “we”, “us”) operates licensed adult-use cannabis delivery in New York and the website at {business.baseUrl} (the “Service”). We respect the privacy of adults who use our Service and we are committed to handling personal information responsibly and in compliance with applicable law, including the New York Cannabis Law and the New York SHIELD Act.
      </p>

      <h2>1. Who this policy applies to</h2>
      <p>
        This policy applies to adults 21 years of age or older who use the Service to browse products, place orders, contact support, sign up for emails, or otherwise interact with us. The Service is not intended for, and we do not knowingly collect personal information from, anyone under 21.
      </p>

      <h2>2. Information we collect</h2>
      <ul>
        <li><strong>Account &amp; order information.</strong> Name, date of birth, government ID information at the door (verified, not retained beyond what is required for compliance), delivery address, email, phone, order history.</li>
        <li><strong>Payment information.</strong> Processed by our payment providers. We do not store full card numbers.</li>
        <li><strong>Device &amp; usage information.</strong> IP address, browser type, pages viewed, referring URL, approximate location, and other standard server logs.</li>
        <li><strong>Cookies &amp; similar technologies.</strong> Used for age confirmation, session state, basic analytics, and (if enabled) marketing measurement.</li>
        <li><strong>Communications.</strong> Messages you send to support, press, or sales addresses.</li>
      </ul>

      <h2>3. How we use information</h2>
      <ul>
        <li>Confirm you are 21 or older and verify identity at the door.</li>
        <li>Process, fulfill, and deliver orders.</li>
        <li>Provide customer support and respond to inquiries.</li>
        <li>Maintain records required by the New York Office of Cannabis Management.</li>
        <li>Improve the Service, measure traffic, and prevent fraud or abuse.</li>
        <li>Send transactional messages and, if you opt in, marketing emails.</li>
      </ul>

      <h2>4. How we share information</h2>
      <p>We share personal information only as needed:</p>
      <ul>
        <li>With service providers (payment processing, logistics, delivery, hosting, analytics) bound by confidentiality and use-limitation obligations.</li>
        <li>With government or regulatory bodies when required by law, including the New York Office of Cannabis Management.</li>
        <li>In connection with a corporate transaction (merger, acquisition, financing, asset sale) subject to appropriate protections.</li>
      </ul>
      <p>We do not sell personal information.</p>

      <h2>5. Cookies &amp; analytics</h2>
      <p>
        We use a small number of cookies to keep the site working (e.g. remembering that you confirmed your age) and to understand site usage. You can disable cookies in your browser, but parts of the Service may not work correctly without them.
      </p>

      <h2>6. Email &amp; marketing</h2>
      <p>
        If you sign up for emails, we use them to send new product drops, deals, and updates. Every marketing email includes an unsubscribe link. Transactional messages (order confirmation, delivery updates) are sent regardless of marketing preferences as long as you have an active order.
      </p>

      <h2>7. Data retention</h2>
      <p>
        We retain personal information only as long as necessary to provide the Service and to comply with our legal obligations under New York cannabis law and tax law. After that period we delete or de-identify the information.
      </p>

      <h2>8. Your choices</h2>
      <ul>
        <li>Access, correction, or deletion of your personal information — email <a href={business.supportEmailHref}>{business.supportEmail}</a>.</li>
        <li>Unsubscribe from marketing emails — use the link in any marketing email.</li>
        <li>Disable cookies in your browser settings.</li>
      </ul>

      <h2>9. Security</h2>
      <p>
        We use commercially reasonable administrative, technical, and physical safeguards to protect personal information. No internet transmission is ever completely secure, so we cannot guarantee absolute security.
      </p>

      <h2>10. Children</h2>
      <p>
        The Service is restricted to adults 21 and older. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal information, contact us and we will delete it.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update this policy. Material changes will be posted on this page with a new “Last updated” date. Continued use of the Service after an update constitutes acceptance.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions, requests, or complaints: <a href={business.supportEmailHref}>{business.supportEmail}</a> or write to {business.legalName}, {business.address.line1}, {business.address.city}, {business.address.region} {business.address.postalCode}.
      </p>
    </LegalLayout>
  );
}
