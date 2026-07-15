import { handler, insertRow, sendEmail, brandedEmail, escapeHtml, NOTIFY_EMAIL } from './_lib.js';

export default handler(async (body) => {
  const { name = '', email = '', message = '' } = body;
  if (!name || !email || !message) throw new Error('Missing required fields');

  const lead = await insertRow('contact_messages', { name, email, message, status: 'new' });

  const firstName = name.trim().split(/\s+/)[0] || 'there';
  const confirmation = await sendEmail({
    to: email,
    subject: 'We got your message — Risk Takers',
    html: brandedEmail(`Thanks, ${escapeHtml(firstName)} — we got your message`, `
      <p style="margin:0 0 18px;font-size:16px;">We've received your note and someone from the Risk Takers team will get back to you as soon as possible.</p>
      <div style="background:#F4F2ED;border-left:4px solid #1F1F1F;padding:16px 18px;margin:0 0 18px;">
        <p style="margin:0;font-size:14px;color:#555;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
      <p style="margin:0;font-size:15px;">If you need to add anything, just reply to this email.</p>`),
  });

  const staff = await sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: email,
    subject: `Contact form: ${name}`,
    text: `New contact-form message\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  });

  return { success: true, lead, notifications: { confirmation, staff } };
});
