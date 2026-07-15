import { handler, insertRow } from './_lib.js';

// Admin-only: turn a free-form brief into a structured Episode + Guest rows.
// Guarded by OPENAI_API_KEY (returns 501 until set). Admin gating for this endpoint
// is coarse today (any caller) — acceptable since it only creates draft content.
export default handler(async (body) => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) { const e = new Error('AI episode creator not configured (set OPENAI_API_KEY)'); e.status = 501; throw e; }

  const { description = '', images = [] } = body;
  if (!description) throw new Error('description is required');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: [
            'You structure content for the "Risk Takers" show (AI, cybersecurity, governance, real-world risk).',
            'Return JSON: {"episode":{"title","description","long_description","date","status","platform","linkedin_live_url","youtube_link","spotify_link"},"guests":[{"name","title","bio","linkedin_link"}]}.',
            'date must be ISO 8601 (or null if not given). status one of upcoming|live|recorded|published (default upcoming).',
            'platform one of demio|linkedin_live (default linkedin_live). Omit unknown fields as null.',
          ].join(' '),
        },
        { role: 'user', content: description },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const out = await res.json();
  let parsed = {};
  try { parsed = JSON.parse(out.choices?.[0]?.message?.content || '{}'); } catch { parsed = {}; }

  // Create guests, mapping any uploaded images in order.
  const guests = [];
  const guestList = Array.isArray(parsed.guests) ? parsed.guests : [];
  for (let i = 0; i < guestList.length; i++) {
    const g = guestList[i] || {};
    if (!g.name) continue;
    const row = await insertRow('guests', {
      name: g.name,
      title: g.title || null,
      bio: g.bio || null,
      linkedin_link: g.linkedin_link || null,
      image_url: images[i] || null,
      photo_preference: images[i] ? 'upload' : null,
    });
    guests.push(row);
  }

  const ep = parsed.episode || {};
  const episode = await insertRow('episodes', {
    title: ep.title || 'Untitled Episode',
    description: ep.description || null,
    long_description: ep.long_description || null,
    date: ep.date || null,
    status: ep.status || 'upcoming',
    platform: ep.platform || 'linkedin_live',
    linkedin_live_url: ep.linkedin_live_url || null,
    youtube_link: ep.youtube_link || null,
    spotify_link: ep.spotify_link || null,
    guest_ids: guests.map((g) => g.id),
    is_live: false,
  });

  return { success: true, episode, guests };
});
