import { handler, insertRow, updateRow } from './_lib.js';


const SUPABASE_URL = process.env.SUPABASE_URL || 'https://umznkxyzovuzhavkmqjt.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const MERCH_INTERESTS = new Set([
  'full-drop',
  'human-in-the-loop-tee',
  'zero-trust-high-agency-hoodie',
  'prompt-injection-fuel-mug',
  'attack-surface-desk-mat',
  'risk-takers-logo-sticker',
  'operators-desk-kit',
]);

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

export function normalizeMerchWaitlistInput(body = {}) {
  const name = String(body.name || '').trim().replace(/\s+/g, ' ');
  const email = String(body.email || '').trim().toLowerCase();
  const interest = String(body.interest || 'full-drop').trim();

  if (!name || name.length > 120) badRequest('Enter a valid name');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) badRequest('Enter a valid email address');
  if (!MERCH_INTERESTS.has(interest)) badRequest('Choose a valid merch interest');

  return { name, email, interest };
}

async function findExistingWaitlistEntry(email) {
  const query = new URLSearchParams({
    email: `eq.${email}`,
    subscription_type: 'eq.merch_waitlist',
    select: 'id',
    limit: '1',
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/attendees?${query}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  if (!response.ok) throw new Error(`waitlist lookup failed: ${response.status}`);
  const rows = await response.json();
  return rows[0] || null;
}

export default handler(async (body) => {
  const { name, email, interest } = normalizeMerchWaitlistInput(body);
  const description = `Source: /gift-store\nInterest: ${interest}`;
  const existing = await findExistingWaitlistEntry(email);

  if (existing) {
    await updateRow('attendees', existing.id, {
      full_name: name,
      description,
    });
    return { success: true, joined: true, existing: true };
  }

  await insertRow('attendees', {
    full_name: name,
    email,
    episode_ids: [],
    subscription_type: 'merch_waitlist',
    description,
  });

  return { success: true, joined: true, existing: false };
});
