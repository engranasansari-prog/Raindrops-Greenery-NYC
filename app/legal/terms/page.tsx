import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { business } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that govern your use of the Raindrops Greenery NY website and delivery service. Adult-use only, 21 and older.',
  alternates: { canonical: '/legal/terms' }
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms of service"
      intro="These Terms are a contract between you and Raindrops Greenery. By using the Service you agree to them. Please read carefully."
      lastUpdated="May 2026"
      currentPath="/legal/terms"
    >
      <p>
        These Terms of Service (“Terms”) govern your access to and use of the Raindrops Greenery website, ordering experience, and delivery service (collectively, the “Service”) operated by {business.legalName} (“Raindrops Greenery”, “we”, “us”), a Shinnecock-licensed cannabis delivery partner authorized by the {business.licensingAuthority}. By using the Service, you accept these Terms.
      </p>

      <h2>1. Eligibility — 21+ only</h2>
      <p>
        The Service is restricted to adults 21 years of age or older who can provide valid government-issued identification. You confirm you are 21+ when you enter the website and again at the door before any delivery is handed off. If we cannot verify your age, we cannot complete the delivery.
      </p>

      <h2>2. Geographic scope</h2>
      <p>
        Delivery is offered only to ZIP codes we are licensed and able to serve in Manhattan, Brooklyn, and Queens, under the cannabis program of the {business.licensingAuthority}. Final delivery eligibility is confirmed during checkout. We do not ship cannabis products outside our licensed service area.
      </p>

      <h2>3. Orders, pricing, and availability</h2>
      <ul>
        <li>Product availability and pricing shown on the Service is provided as of the displayed sync timestamp and may change without notice.</li>
        <li>Final price (including applicable taxes and delivery fees) is shown in checkout before you confirm.</li>
        <li>We may limit quantities, refuse, or cancel any order at our discretion, including for suspected fraud, ID issues, or unsafe delivery conditions.</li>
        <li>Promotional codes are limited to one per order unless stated otherwise and may be discontinued at any time.</li>
      </ul>

      <h2>4. Payment</h2>
      <p>
        We accept the payment methods listed in checkout. You authorize the applicable charge when you confirm an order. Failure to pay or chargebacks may result in account suspension and recovery actions.
      </p>

      <h2>5. Returns</h2>
      <p>
        For safety and compliance reasons, cannabis products cannot be returned once delivered. If a product is damaged on arrival, missing, or different from what you ordered, contact <a href={business.supportEmailHref}>{business.supportEmail}</a> within 24 hours and we will work with you on a remedy.
      </p>

      <h2>6. Responsible use</h2>
      <ul>
        <li>Cannabis products are for adult personal use only. Do not distribute or sell to anyone under 21.</li>
        <li>Do not operate a vehicle, machinery, or perform any task that requires alertness under the influence of cannabis.</li>
        <li>Cannabis affects each person differently; start low and go slow, especially with edibles.</li>
        <li>Keep products in their original packaging and out of reach of children and pets.</li>
      </ul>

      <h2>7. Acceptable use</h2>
      <p>
        You agree not to misuse the Service, including: misrepresenting your age or identity; using bots or automated tools to scrape, overload, or interfere with the Service; reselling products purchased through the Service; or using the Service in any way that violates law.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The Service, including text, graphics, logos, photographs, and software, is owned by Raindrops Greenery or licensed to it. You receive a limited, non-exclusive, non-transferable license to use the Service for personal, lawful, adult-use cannabis browsing and ordering.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Service is provided on an “as is” basis. To the maximum extent permitted by law, we disclaim all warranties, express or implied. Statements about cannabis products are not medical advice; cannabis has not been analyzed or approved by the FDA.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Raindrops Greenery is not liable for any indirect, incidental, consequential, special, or punitive damages, or for any lost profits or revenues, arising out of or related to your use of the Service. Our total liability for any claim related to the Service is limited to the amount you paid us in the 90 days preceding the event giving rise to the claim.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Raindrops Greenery and its officers, directors, employees, and agents from any claim or demand arising out of your breach of these Terms or your misuse of the Service.
      </p>

      <h2>12. Governing law &amp; dispute resolution</h2>
      <p>
        These Terms are governed by the laws of the State of New York, without regard to conflict of laws rules. Disputes that cannot be resolved informally will be brought exclusively in the state or federal courts located in New York County, New York, and you consent to personal jurisdiction there.
      </p>

      <h2>13. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be posted on this page with a new “Last updated” date and, where appropriate, notified by email. Continued use of the Service after an update constitutes acceptance.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions or notices under these Terms: <a href={business.supportEmailHref}>{business.supportEmail}</a> or by phone at <a href={business.phoneHref}>{business.phone}</a>. Notices may also be sent in writing to {business.legalName} via the same email.
      </p>
    </LegalLayout>
  );
}
