import { handler, insertRow, sendEmail, brandedEmail, escapeHtml, NOTIFY_EMAIL } from './_lib.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://umznkxyzovuzhavkmqjt.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getEpisode(id) {
  if (!id) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/episodes?id=eq.${encodeURIComponent(id)}&select=*`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] || null;
}

// Demio is retired. Every event is now treated as a LinkedIn Live / link-based
// registration: capture the attendee and email them the join link.
export default handler(async (body) => {
  const { name, email, episodeId } = body;
  if (!name || !email) throw new Error('Name and email are required');

  const episode = await getEpisode(episodeId);
  const joinLink = episode?.linkedin_live_url || episode?.event_registration_url || null;

  const attendee = await insertRow('attendees', {
    full_name: name,
    email,
    episode_ids: episodeId ? [episodeId] : [],
    subscription_type: 'episode',
    join_link: joinLink,
  });

  const title = episode?.title || 'Risk Takers';
  if (joinLink) {
    await sendEmail({
      to: email,
      subject: `You're registered: ${title}`,
      html: brandedEmail(`Hey ${escapeHtml(name)}!`, `
        <p style="margin:0 0 16px;font-size:16px;">You're registered for <strong>${escapeHtml(title)}</strong>.</p>
        <p style="margin:0 0 16px;font-size:16px;">This episode streams live. Join here:</p>
        <p style="margin:0 0 16px;"><a href="${joinLink}" style="display:inline-block;padding:12px 24px;background:#0A66C2;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Join the live event</a></p>
        <p style="margin:0;font-size:16px;">See you there!</p>`),
    });
  }

  await sendEmail({
    to: NOTIFY_EMAIL,
    subject: `New registration: ${title}`,
    text: `New registration\n\nName: ${name}\nEmail: ${email}\nEpisode: ${title}`,
  });

  return { success: true, data: joinLink ? [{ join_link: joinLink }] : [] };
});
