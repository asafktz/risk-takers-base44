import { handler, insertRow, updateRow, deleteRow, sendEmail, NOTIFY_EMAIL } from './_lib.js';

// Maps the Base44 entity names the frontend uses to Postgres tables + the fields
// that may be written from the client. Reads happen directly against Supabase
// (anon, RLS). Writes funnel here so the service role can insert past RLS while
// we whitelist fields and force safe defaults.
const ENTITIES = {
  Attendee: {
    table: 'attendees',
    fields: ['full_name', 'email', 'episode_ids', 'subscription_type', 'description', 'hash', 'join_link'],
    publicCreate: true,
  },
  GuestApplication: {
    table: 'guest_applications',
    fields: ['full_name', 'email', 'linkedin_url', 'title', 'topic_pitch'],
    publicCreate: true,
  },
  Guest: {
    table: 'guests',
    fields: ['name', 'preferred_name', 'title', 'bio', 'linkedin_link', 'image_url',
             'photo_preference', 'shipping_address', 'phone', 'phone_extension'],
    publicCreate: true, // guest intake form
  },
  Episode: { table: 'episodes', fields: null, publicCreate: false }, // admin only
};

function pick(data, fields) {
  if (!fields) return { ...data };
  const out = {};
  for (const f of fields) if (data[f] !== undefined) out[f] = data[f];
  return out;
}

export default handler(async (body) => {
  const { op, entity, id, data } = body;
  const cfg = ENTITIES[entity];
  if (!cfg) throw new Error(`Unknown entity: ${entity}`);

  if (op === 'create') {
    if (!cfg.publicCreate) {
      const e = new Error('Admin auth required (Phase 2)'); e.status = 501; throw e;
    }
    const row = pick(data || {}, cfg.fields);
    if ('status' in (data || {})) row.status = 'new'; // never trust client status
    const created = await insertRow(cfg.table, row);

    if (entity === 'GuestApplication') {
      await sendEmail({
        to: NOTIFY_EMAIL, replyTo: created.email,
        subject: `New guest application: ${created.full_name || 'Unknown'}`,
        text: `Name: ${created.full_name}\nEmail: ${created.email}\nLinkedIn: ${created.linkedin_url}\nTitle: ${created.title}\n\nPitch:\n${created.topic_pitch || ''}`,
      });
    }
    return created;
  }

  // update / delete are admin operations — wired in Phase 2 with Supabase Auth.
  if (op === 'update' || op === 'delete') {
    const e = new Error('Admin auth required (Phase 2)'); e.status = 501; throw e;
  }

  throw new Error(`Unknown op: ${op}`);
});
