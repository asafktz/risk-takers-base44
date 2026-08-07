import React from 'react';
import LegalPageLayout, { LegalList, LegalSection } from '@/components/LegalPageLayout';
import { setSEO } from '@/lib/seo';

const EFFECTIVE_DATE = 'August 7, 2026';

export default function Privacy() {
  React.useEffect(() => {
    setSEO({
      title: 'Privacy Policy',
      description: 'How Risk Takers collects, uses, shares, and protects personal information.',
      path: '/privacy'
    });
  }, []);

  return (
    <LegalPageLayout eyebrow="Your information" title="Privacy Policy" effectiveDate={EFFECTIVE_DATE}>
      <LegalSection title="1. Who we are">
        <p>Risk Takers is owned and operated by LinkedOtter LLC. Risk Takers produces webinars, interviews, events, and related content about AI, cybersecurity, governance, and technology risk. This policy explains how LinkedOtter LLC handles personal information through <a className="font-bold underline" href="https://risktakers.show">risktakers.show</a>, Risk Takers events, and communications that link to this policy.</p>
        <p><strong>Risk Takers is a media business.</strong> As described below, our business includes advertising, sponsorships, lead generation, audience insights, and licensing or providing business-contact and engagement information to sponsors, advertisers, partners, and other third parties. Depending on applicable law, some of these disclosures may be considered a “sale,” “sharing,” or targeted advertising.</p>
        <p>Questions or privacy requests can be sent to <a className="font-bold underline" href="mailto:hello@risktakers.live">hello@risktakers.live</a>.</p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <LegalList>
          <li><strong>Contact and registration information:</strong> name, email address, event selections, and registration status.</li>
          <li><strong>Applications and business inquiries:</strong> company, title, work email, phone number, LinkedIn URL, presenter information, target accounts, topic ideas, demo links, and messages you submit.</li>
          <li><strong>Guest information:</strong> professional biography, role, company, contact details, headshot, LinkedIn profile, and production information supplied for an appearance.</li>
          <li><strong>Usage and device information:</strong> pages visited, referral information, browser or device information, approximate location derived from network information, and interactions with site or event features.</li>
          <li><strong>Communications:</strong> messages, support requests, preferences, and responses you send to us.</li>
          <li><strong>Event media:</strong> recordings, chat, questions, photographs, and other contributions when an event is recorded or documented.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <LegalList>
          <li>Operate the website, register attendees, deliver events, and send confirmations or join links.</li>
          <li>Respond to inquiries and review guest, vendor, sponsor, partner, or attendee applications.</li>
          <li>Send requested updates and marketing communications, subject to applicable law and your choices.</li>
          <li>Create audience segments, lead lists, market research, analytics, and business or professional profiles based on information you provide and your interactions with our services.</li>
          <li>Match attendees, applicants, viewers, and other audience members with sponsors, advertisers, vendors, event partners, and businesses that may want to contact them.</li>
          <li>Advertise, measure campaigns, generate revenue, and sell, license, share, or otherwise provide eligible information to third parties for their own marketing, sales, analytics, research, advertising, event, and business-development purposes.</li>
          <li>Produce, edit, distribute, and promote event recordings and related Risk Takers content.</li>
          <li>Understand audience interest, measure performance, improve our services, prevent abuse, maintain security, and comply with law.</li>
        </LegalList>
        <p>Where a legal basis is required, we rely on consent, performance of a requested service, legitimate interests such as operating and improving Risk Takers, and compliance with legal obligations, as applicable.</p>
      </LegalSection>

      <LegalSection title="4. Analytics, cookies, and similar technologies">
        <p>The site uses Google Tag Manager and may use analytics or marketing tags configured through it. It also loads a Showrunner visitor script and embeds Showrunner registration and viewing experiences. These technologies may store or read identifiers and collect usage, referral, device, and interaction information. Essential storage may also support authentication, security, preferences, and application operation.</p>
        <p>You can limit cookies through your browser settings and, where presented, use the site&apos;s consent choices. Blocking some technologies may affect functionality. Browser privacy signals are honored where required by applicable law and technically supported.</p>
      </LegalSection>

      <LegalSection title="5. When we sell, share, license, or disclose information">
        <p>Subject to applicable law and the choices described below, we may disclose information for monetary or other valuable consideration, or permit a recipient to use it for its own purposes. Recipients may use eligible information to contact you, market products or services, measure campaigns, build or enhance business records, conduct research, or identify prospective customers and event participants.</p>
        <p>We may sell, license, share, or disclose information to:</p>
        <LegalList>
          <li>Hosting, database, form-processing, email, analytics, security, and production providers working for us.</li>
          <li>Showrunner or another event platform when you view, register for, or attend an embedded event.</li>
          <li>Google and other providers whose tags are enabled through our tag-management setup.</li>
          <li>Event sponsors, exhibitors, advertisers, speakers, vendors, and partners, including attendee or registrant contact details and engagement information, so they can follow up, market, sell, measure sponsorship value, or plan future events.</li>
          <li>Business-data, advertising, analytics, research, demand-generation, lead-generation, and marketing companies, including data platforms and other commercial partners.</li>
          <li>Other third parties that acquire, license, sponsor, distribute, analyze, promote, or monetize Risk Takers content, events, audiences, or business information.</li>
          <li>Professional advisers, authorities, or counterparties when reasonably necessary for legal compliance, safety, fraud prevention, or a business transaction.</li>
        </LegalList>
        <p>The categories involved may include identifiers and contact details, professional or employment information, registration and application information, commercial information, internet or network activity, event engagement, communications, and inferences about business interests. We do not knowingly sell or share passwords, payment-card data, government identifiers, or personal information of people under 16. We do not use this policy to claim a right to process information where applicable law requires a separate notice, opt-in, or other authorization.</p>
      </LegalSection>

      <LegalSection title="6. International processing and retention">
        <p>Risk Takers and its providers may process information in countries other than your own. Where required, we use appropriate safeguards for international transfers. We retain information only as long as reasonably necessary for event operations, communications, recordkeeping, security, dispute resolution, and legal obligations. Retention periods vary by record type and context.</p>
      </LegalSection>

      <LegalSection title="7. Your choices and rights">
        <LegalList>
          <li>Unsubscribe from marketing using the link in an email or by contacting us.</li>
          <li>Ask to access, correct, delete, restrict, object to processing, or receive a copy of your personal information where applicable.</li>
          <li>Withdraw consent for certain processing where applicable; withdrawal does not affect earlier lawful processing.</li>
          <li>Opt out of the sale or sharing of personal information, targeted advertising, or certain profiling where applicable.</li>
          <li>Complain to your local data-protection authority where that right applies.</li>
        </LegalList>
        <p>To opt out of sale or sharing, use <a className="font-bold underline" href="/privacy-choices">Do Not Sell or Share My Personal Information</a>. For other requests, email <a className="font-bold underline" href="mailto:hello@risktakers.live">hello@risktakers.live</a>. We may need to verify your identity. Authorized agents may submit requests where permitted by law. We will not discriminate against you for exercising a privacy right.</p>
      </LegalSection>

      <LegalSection title="8. Security and children">
        <p>We use reasonable administrative, technical, and organizational measures designed to protect personal information, but no online system is completely secure. Risk Takers is intended for professional audiences and is not directed to children under 16. Contact us if you believe a child supplied information improperly.</p>
      </LegalSection>

      <LegalSection title="9. Third-party services and updates">
        <p>Links, embedded players, registration widgets, LinkedIn, and other third-party services operate under their own terms and privacy policies. We may update this policy as our practices or legal requirements change. The effective date above shows the latest version; material changes may receive additional notice when appropriate.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
