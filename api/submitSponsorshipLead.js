import { handler, insertRow, sendEmail, brandedEmail, escapeHtml, NOTIFY_EMAIL } from './_lib.js';

export default handler(async (body) => {
  const { name = '', email = '', company = '', message = '' } = body;
  if (!name || !email || !company) throw new Error('Missing required fields');

  const lead = await insertRow('sponsorship_leads', { name, email, company, message, status: 'new' });

  await sendEmail({
    to: email,
    subject: 'Thank you for your interest in Risk Takers sponsorship',
    html: brandedEmail(`Thank you for your interest, ${escapeHtml(name)}`, `
      <p style="margin:0 0 16px;font-size:16px;">We've received your sponsorship inquiry for <strong>${escapeHtml(company)}</strong>.</p>
      <p style="margin:0 0 16px;font-size:16px;">Risk Takers is selective about partnerships — we only work with organizations that contribute real insight to conversations around AI, cybersecurity, and risk, not sales pitches.</p>
      <div style="background:#F1C40F;padding:20px;margin:25px 0;border-left:4px solid #1F1F1F;">
        <p style="margin:0;font-weight:600;color:#111;">All sponsorships are disclosed, approved with guests, independent of content, and free from topic influence.</p>
      </div>
      <p style="margin:0 0 16px;font-size:16px;">We'll review your inquiry and get back to you within 2-3 business days.</p>
      <p style="margin:0;font-size:16px;">Thank you,<br><strong>The Risk Takers Team</strong></p>`),
  });

  await sendEmail({
    to: NOTIFY_EMAIL, replyTo: email,
    subject: `Sponsorship lead: ${company}`,
    text: `New sponsorship lead\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message || ''}`,
  });

  return { success: true, lead };
});
