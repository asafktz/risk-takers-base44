import { escapeHtml, handler, NOTIFY_EMAIL, sendEmail, upsertRow } from './_lib.js';

export default handler(async (body, req) => {
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    const error = new Error('Enter a valid email address.');
    error.status = 400;
    throw error;
  }

  const gpc = body.global_privacy_control === true || req.headers['sec-gpc'] === '1';
  const saved = await upsertRow('privacy_opt_outs', {
    email_normalized: email,
    email,
    sale_share_opt_out: true,
    targeted_advertising_opt_out: true,
    source: gpc ? 'privacy_choices_gpc' : 'privacy_choices',
    global_privacy_control: gpc,
    updated_at: new Date().toISOString(),
  }, 'email_normalized');

  await sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: email,
    subject: `Privacy opt-out: ${email}`,
    html: `<p><strong>${escapeHtml(email)}</strong> opted out of sale/sharing and targeted advertising.</p><p>Global Privacy Control: ${gpc ? 'yes' : 'no'}</p>`,
    text: `${email} opted out of sale/sharing and targeted advertising.\nGlobal Privacy Control: ${gpc ? 'yes' : 'no'}`,
  });

  return { success: true, updated_at: saved.updated_at };
});
