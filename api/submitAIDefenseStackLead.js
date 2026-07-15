import { handler, insertRow, sendEmail, brandedEmail, escapeHtml, NOTIFY_EMAIL } from './_lib.js';

const domainFromEmail = (e) => (e && e.includes('@') ? e.split('@')[1].toLowerCase() : null);

export default handler(async (body) => {
  const { name = '', email = '', company = '', title = '', linkedin = '',
          role = 'vendor', category = '', message = '' } = body;
  if (!name || !email || !company) throw new Error('Missing required fields');

  const lead = await insertRow('ai_defense_stack_leads', {
    name, email, email_domain: domainFromEmail(email), company, title, linkedin,
    role, category, message, status: 'new',
  });

  const sideCopy = role === 'security_team'
    ? "We'll be in touch about joining the room as a CISO / security leader."
    : "We'll be in touch about presenting your solution to the right security audience.";

  await sendEmail({
    to: email,
    subject: 'Thanks — AI Defense Stack',
    html: brandedEmail(`Thanks, ${escapeHtml(name.split(' ')[0] || 'there')}`, `
      <p style="margin:0 0 16px;font-size:16px;">We received your interest in the AI Defense Stack series for <strong>${escapeHtml(company)}</strong>.</p>
      <p style="margin:0 0 16px;font-size:16px;">${sideCopy}</p>
      <p style="margin:0;font-size:16px;">— The Risk Takers Team</p>`),
  });

  await sendEmail({
    to: NOTIFY_EMAIL, replyTo: email,
    subject: `AI Defense Stack lead (${role}): ${company}`,
    text: `New AI Defense Stack lead\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nTitle: ${title}\nRole: ${role}\nCategory: ${category}\nLinkedIn: ${linkedin}\n\n${message || ''}`,
  });

  return { success: true, lead };
});
