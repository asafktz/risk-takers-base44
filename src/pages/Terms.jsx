import React from 'react';
import LegalPageLayout, { LegalList, LegalSection } from '@/components/LegalPageLayout';
import { setSEO } from '@/lib/seo';

const EFFECTIVE_DATE = 'August 12, 2026';

export default function Terms() {
  React.useEffect(() => {
    setSEO({
      title: 'Terms & Conditions',
      description: 'Terms governing use of the Risk Takers website, events, registrations, and content.',
      path: '/terms'
    });
  }, []);

  return (
    <LegalPageLayout eyebrow="Site and event rules" title="Terms & Conditions" effectiveDate={EFFECTIVE_DATE}>
      <LegalSection title="1. Agreement to these terms">
        <p>Risk Takers is owned and operated by LinkedOtter LLC. These Terms &amp; Conditions govern your use of risktakers.show and Risk Takers registrations, webinars, events, applications, communications, and content that link to these terms. In these terms, “Risk Takers,” “we,” “us,” and “our” refer to LinkedOtter LLC. By using those services, you agree to these terms. If you do not agree, do not use the services.</p>
      </LegalSection>

      <LegalSection title="2. What Risk Takers provides">
        <p>Risk Takers produces educational and professional content, live and recorded events, interviews, community experiences, and opportunities involving guests, vendors, sponsors, partners, and attendees. Features, speakers, dates, formats, eligibility, availability, and content may change.</p>
        <p>Risk Takers is a media business supported by advertising, sponsorships, lead generation, audience insights, and commercial data partnerships. Our Privacy Policy explains how LinkedOtter LLC may use, sell, license, share, or otherwise provide eligible business-contact, registration, application, and engagement information to event sponsors, advertisers, partners, and other third parties, subject to applicable law and privacy choices.</p>
      </LegalSection>

      <LegalSection title="3. Eligibility and accounts">
        <p>You must be legally able to agree to these terms. Information you submit must be accurate, current, and yours to provide. Keep private links or account access secure. We may reject, suspend, or remove registrations or access reasonably necessary to protect participants, systems, or event integrity.</p>
      </LegalSection>

      <LegalSection title="4. Registrations, applications, and event changes">
        <LegalList>
          <li>A registration or application does not guarantee acceptance, selection, speaking time, attendance, promotion, introductions, meetings, or commercial results.</li>
          <li>Unless an offer expressly says otherwise, website registrations are free and have no cash value.</li>
          <li>We may reschedule, change, postpone, move online, substitute participants, limit capacity, or cancel an event.</li>
          <li>Separate signed terms, order forms, or sponsorship agreements control if they conflict with these website terms.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. Merchandise, checkout, shipping, and returns">
        <p>Risk Takers may display merchandise that is sold through a Fourthwall-hosted product page and checkout. For those product orders, Fourthwall—not Risk Takers—is the seller, processes payment, acts as merchant of record for sales-tax purposes, and coordinates manufacturing, fulfillment, shipment, and catalog-order support. Risk Takers supplies the brand and artwork and may receive a royalty from a sale. The product page, checkout disclosures, order confirmation, and Fourthwall&apos;s applicable <a className="font-bold underline" href="https://fourthwall.com/terms-of-service" target="_blank" rel="noreferrer">terms</a> and <a className="font-bold underline" href="https://fourthwall.com/privacy-policy" target="_blank" rel="noreferrer">privacy policy</a> also apply.</p>
        <LegalList>
          <li>Prices are shown in the stated currency. Shipping, tax, duties, and other destination-based charges are shown or described during checkout where applicable.</li>
          <li>Products are made on demand. Product images are representative; placement and color may vary within normal manufacturing and display tolerances.</li>
          <li>Production and delivery estimates are estimates, not guarantees. Cross-border orders may incur import duties or customs charges unless the checkout states they were collected.</li>
          <li>Because items are made to order, returns for sizing preference, buyer&apos;s remorse, or a change of mind are not generally accepted. Verified damage, defects, incorrect items, or other fulfillment errors must be reported through the shop support channel within the stated claim window with the order number and requested evidence.</li>
          <li>Giveaway links are single-use, have no cash value, may become unavailable after redemption, and may be subject to product, destination, availability, or redemption restrictions shown with the offer.</li>
        </LegalList>
        <p>Nothing in this section excludes a refund, replacement, cancellation right, warranty, or other remedy that cannot lawfully be excluded under applicable consumer law.</p>
      </LegalSection>

      <LegalSection title="6. Recordings and participant contributions">
        <p>Events may be photographed, recorded, transcribed, streamed, clipped, edited, and distributed. When this is disclosed during registration or at the event, your attendance or participation acknowledges that recording. Speakers, guests, and featured participants may be asked to sign separate release terms.</p>
        <p>You retain ownership of material you submit. You grant Risk Takers a non-exclusive, worldwide, royalty-free license to host, reproduce, edit for length or format, display, and distribute contributions you intentionally provide for publication, event participation, or promotion, solely in connection with Risk Takers and its related content and promotion. You represent that you have the rights needed to provide that material.</p>
      </LegalSection>

      <LegalSection title="7. Acceptable use">
        <LegalList>
          <li>Do not break the law, infringe rights, impersonate others, misrepresent affiliation, or submit confidential information without authorization.</li>
          <li>Do not harass participants, disrupt events, distribute malware, probe security, scrape restricted areas, bypass access controls, or overload the services.</li>
          <li>Do not record private sessions or redistribute paid, private, or access-controlled content without permission.</li>
          <li>Do not use Risk Takers names, logos, recordings, or content to imply endorsement or partnership without written permission.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>The site, Risk Takers branding, graphics, formats, edited recordings, and original content are owned by LinkedOtter LLC or its licensors and protected by applicable law. You may access public content for personal or internal business learning. No other license is granted. Third-party names and content remain the property of their respective owners.</p>
      </LegalSection>

      <LegalSection title="9. Educational content; no professional advice">
        <p>Risk Takers content is general information and discussion, not legal, cybersecurity, financial, investment, insurance, compliance, medical, or other professional advice. Guests speak for themselves. Views expressed do not necessarily represent Risk Takers, its partners, or other participants. You are responsible for evaluating information and obtaining appropriate professional advice before acting.</p>
      </LegalSection>

      <LegalSection title="10. Third-party services">
        <p>The services may link to or embed third-party platforms such as LinkedIn, Showrunner, video hosts, registration providers, or other websites. We do not control those services and are not responsible for their availability, content, security, or practices. Their own terms and privacy policies apply.</p>
      </LegalSection>

      <LegalSection title="11. Disclaimers and limitation of liability">
        <p>To the maximum extent permitted by law, the services and content are provided “as is” and “as available,” without warranties of uninterrupted availability, accuracy, fitness for a particular purpose, non-infringement, or specific results. Nothing in these terms excludes rights that cannot lawfully be excluded.</p>
        <p>To the maximum extent permitted by law, LinkedOtter LLC and the Risk Takers team will not be liable for indirect, incidental, special, consequential, exemplary, or lost-profit damages arising from the services, events, content, or third-party platforms. Where liability cannot be excluded, it is limited to the greater of the amount you paid LinkedOtter LLC for the specific service giving rise to the claim during the preceding twelve months or US$100. This limitation does not apply where prohibited by law.</p>
      </LegalSection>

      <LegalSection title="12. Suspension, termination, and changes">
        <p>We may suspend or terminate access for a material breach, security risk, unlawful activity, or serious event disruption. Provisions that by their nature should survive will survive. We may update these terms; the effective date above identifies the latest version. Continuing to use the services after an update means you accept the revised terms to the extent permitted by law.</p>
      </LegalSection>

      <LegalSection title="13. General terms and contact">
        <p>If any provision is unenforceable, the remaining provisions remain effective. A failure to enforce a provision is not a waiver. These terms are governed by the laws applicable to LinkedOtter LLC, without overriding mandatory rights you may have under applicable consumer law. Before filing a claim, contact us so we can try to resolve the issue informally.</p>
        <p>Questions can be sent to <a className="font-bold underline" href="mailto:hello@risktakers.live">hello@risktakers.live</a>.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
