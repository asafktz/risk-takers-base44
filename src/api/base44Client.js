// Supabase-backed drop-in replacement for the Base44 SDK client.
// Same surface the app already uses (base44.entities.X.{list,filter,create,update,delete},
// base44.functions.invoke, base44.auth, base44.integrations.Core.UploadFile) so the
// ~26 call sites stay unchanged.
//
// Reads: public tables hit Supabase directly (anon, RLS); guests are read from the
//   PII-safe `guests_public` view when signed out, and the full table when an admin
//   is signed in.
// Writes: public creates (forms) go through the /api serverless functions (service
//   role); admin create/update/delete go straight to Supabase as the authenticated
//   admin, gated by RLS. auth + uploads use Supabase Auth + Storage.

import { supabase } from '@/lib/supabaseClient';

const TABLE = {
  Episode: 'episodes',
  Guest: 'guests',
  Attendee: 'attendees',
  GuestApplication: 'guest_applications',
  SponsorshipLead: 'sponsorship_leads',
  AIDefenseStackLead: 'ai_defense_stack_leads',
  VendorApplication: 'vendor_applications',
  ContactMessage: 'contact_messages',
};

async function hasSession() {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

function applyOrder(q, order) {
  if (!order) return q;
  const desc = order.startsWith('-');
  return q.order(order.replace(/^-/, ''), { ascending: !desc });
}

async function readSource(name) {
  // Guests carry PII (phone/shipping) — signed-out visitors read the safe view.
  if (name === 'Guest' && !(await hasSession())) return 'guests_public';
  return TABLE[name];
}

async function apiDb(op, entity, id, data) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, entity, id, data }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(out.error || `db ${op} ${entity} failed`); e.status = res.status; throw e; }
  return out;
}

function makeEntity(name) {
  const table = TABLE[name];
  return {
    async list(order) {
      let q = supabase.from(await readSource(name)).select('*');
      q = applyOrder(q, order);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async filter(filters, order) {
      let q = supabase.from(await readSource(name)).select('*');
      for (const [k, v] of Object.entries(filters || {})) q = q.eq(k, v);
      q = applyOrder(q, order);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async get(id) {
      const rows = await this.filter({ id });
      return rows[0] || null;
    },
    async create(data) {
      // Admin (signed in) → authenticated insert (RLS enforces admin).
      if (await hasSession()) {
        const { data: row, error } = await supabase.from(table).insert(data).select().single();
        if (error) throw error;
        return row;
      }
      // Public (forms) → service-role serverless with field whitelist.
      return apiDb('create', name, null, data);
    },
    async update(id, data) {
      const { data: row, error } = await supabase.from(table).update(data).eq('id', id).select().single();
      if (error) throw error;
      return row;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
  };
}

const entities = new Proxy({}, { get: (_t, name) => makeEntity(String(name)) });

const functions = {
  async invoke(name, payload) {
    const res = await fetch(`/api/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    const data = await res.json().catch(() => ({}));
    return { data };
  },
};

const auth = {
  // Returns the signed-in admin, or throws 401. Admin status is checked server-side
  // via the is_admin() RPC (email allow-list in the `admins` table).
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { const e = new Error('Not authenticated'); e.status = 401; throw e; }
    const { data: isAdmin } = await supabase.rpc('is_admin');
    return { id: user.id, email: user.email, role: isAdmin ? 'admin' : 'viewer' };
  },
  // Send a passwordless magic link (used by the admin login form).
  async signInWithEmail(email) {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/Admin` : undefined;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) throw error;
    return { sent: true };
  },
  async logout() {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') window.location.href = '/';
  },
  redirectToLogin() {
    if (typeof window !== 'undefined') window.location.href = '/Admin';
  },
};

const integrations = {
  Core: {
    // Uploads to the public `uploads` Storage bucket; returns { file_url } like Base44.
    async UploadFile({ file }) {
      const ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : 'bin';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(path);
      return { file_url: data.publicUrl };
    },
  },
};

export const base44 = { entities, functions, auth, integrations };
