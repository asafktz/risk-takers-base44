import { handler, insertRow, sendEmail, brandedEmail, escapeHtml, NOTIFY_EMAIL } from './_lib.js';
import { EVENT } from '../src/lib/event.js';

const domainFromEmail = (e) => (e && e.includes('@') ? e.split('@')[1].toLowerCase() : null);
export const VENDOR_PACK_URL = 'https://www.risktakers.show/downloads/AI-Defense-Stack-Day-Vendor-Information-Pack.pdf';
const VENDOR_PACK_FILENAME = 'AI-Defense-Stack-Day-Vendor-Information-Pack.pdf';

export function buildVendorApplicantEmail({ name, company, applicationId }) {
  const firstName = escapeHtml(name.split(' ')[0] || 'there');
  const companyName = escapeHtml(company);

  return {
    subject: 'Your AI Defense Stack Day vendor information pack',
    replyTo: 'vendors@risktakers.show',
    idempotencyKey: applicationId ? `vendor-pack-${applicationId}` : undefined,
    attachments: [{ filename: VENDOR_PACK_FILENAME, path: VENDOR_PACK_URL }],
    html: brandedEmail(`Application received, ${firstName}`, `
      <p style="margin:0 0 16px;font-size:16px;">Thank you for applying to present <strong>${companyName}</strong> at The AI Defense Stack on ${escapeHtml(EVENT.dateLabel)}.</p>
      <p style="margin:0 0 16px;font-size:16px;">We review every submission and will contact selected companies directly.</p>
      <p style="margin:0 0 16px;font-size:16px;">Your vendor information pack is attached. You can also <a href="${VENDOR_PACK_URL}" style="color:#C0392B;font-weight:700;">download it here</a>.</p>
      <p style="margin:0 0 16px;font-size:16px;">Questions? Reply to this email or contact vendors@risktakers.show.</p>
      <p style="margin:0;font-size:16px;">— The Risk Takers Team</p>`),
  };
}

function deliverySummary(result) {
  if (result?.sent) return { sent: true, id: result.id };
  return {
    sent: false,
    status: result?.status || null,
    code: result?.error?.name || result?.error?.code || 'unknown_error',
    message: result?.error?.message || 'Email provider rejected the request',
  };
}

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

  const [applicantEmail, staffEmail] = await Promise.all([
    sendEmail({
      to: work_email,
      ...buildVendorApplicantEmail({ name, company, applicationId: app.id }),
    }),
    sendEmail({
      to: NOTIFY_EMAIL, replyTo: work_email,
      subject: `Vendor application: ${company}`,
      idempotencyKey: app.id ? `vendor-notification-${app.id}` : undefined,
      text: `New vendor application\n\nName: ${name}\nEmail: ${work_email}\nPhone: ${phone}\nCompany: ${company}\nWebsite: ${website}\nPresenter: ${presenter}\nTarget accounts: ${target_accounts}\n\nNote:\n${note || ''}`,
    }),
  ]);

  const notifications = {
    applicant: deliverySummary(applicantEmail),
    staff: deliverySummary(staffEmail),
  };
  if (!notifications.applicant.sent || !notifications.staff.sent) {
    console.error('vendor_application_email_failure', JSON.stringify({ application_id: app.id, notifications }));
  }

  return { success: true, application: app, notifications };
});
