import { handler, insertRow, sendEmail, brandedEmail, escapeHtml, NOTIFY_EMAIL } from './_lib.js';

const domainFromEmail = (e) => (e && e.includes('@') ? e.split('@')[1].toLowerCase() : null);

// Note: the Base44 original also auto-scanned the vendor's website via the
// built-in LLM to prefill site_summary/signals/suggested_band. That enrichment
// is deferred (Phase 2, OpenAI) — the application is still captured + notified.
export default handler(async (body) => {
  const { name = '', work_email = '', phone = '', company = '', website = '',
          note = '', presenter = '', target_accounts = '' } = body;
  if (!name || !work_email || !phone || !company) throw new Error('Missing required fields');

  const domain = domainFromEmail(work_email);
  const app = await insertRow('vendor_applications', {
    name, work_email, email_domain: domain, phone, company,
    website: website || (domain ? `https://${domain}` : null),
    note, presenter, target_accounts, status: 'new',
  });

  await sendEmail({
    to: work_email,
    subject: 'Application received — Risk Takers',
    html: brandedEmail(`Thanks, ${escapeHtml(name.split(' ')[0] || 'there')}`, `
      <p style="margin:0 0 16px;font-size:16px;">We've received <strong>${escapeHtml(company)}</strong>'s application to present on Risk Takers.</p>
      <p style="margin:0 0 16px;font-size:16px;">We review every applicant for fit with our audience of security leaders. If there's a match, we'll reach out to schedule a short screening call.</p>
      <p style="margin:0;font-size:16px;">— The Risk Takers Team</p>`),
  });

  await sendEmail({
    to: NOTIFY_EMAIL, replyTo: work_email,
    subject: `Vendor application: ${company}`,
    text: `New vendor application\n\nName: ${name}\nEmail: ${work_email}\nPhone: ${phone}\nCompany: ${company}\nWebsite: ${website}\nPresenter: ${presenter}\nTarget accounts: ${target_accounts}\n\nNote:\n${note || ''}`,
  });

  return { success: true, application: app };
});
