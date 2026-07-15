// Shared helpers for Risk Takers serverless functions (Vercel Node runtime).
// No external deps — uses fetch against Supabase REST + Resend REST.

// Public project URL — safe to hardcode as a fallback so functions work even if
// the SUPABASE_URL env var isn't set on this environment.
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://umznkxyzovuzhavkmqjt.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const NOTIFY_EMAIL = 'asaf@linkedotter.com';
// asafkatz.com is the domain verified in this Resend account. Swap to
// risktakers@risktakers.show once risktakers.show is verified in the same account.
export const FROM = 'Risk Takers <notifications@asafkatz.com>';

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

// Insert a row via the service role (bypasses RLS). Returns the created row.
export async function insertRow(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`insert ${table} failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function updateRow(table, id, patch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`update ${table} failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function deleteRow(table, id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) throw new Error(`delete ${table} failed: ${res.status} ${await res.text()}`);
  return { success: true };
}

// Send an email via Resend. Silently degrades if RESEND_API_KEY is unset.
export async function sendEmail({ to, subject, html, text, replyTo }) {
  if (!RESEND_API_KEY) return { skipped: 'no RESEND_API_KEY' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html, text, reply_to: replyTo }),
  });
  const out = await res.json().catch(() => ({}));
  return res.ok ? { sent: true, id: out.id } : { error: out };
}

export function escapeHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Branded confirmation email shell (matches the Base44 originals).
export function brandedEmail(heading, bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#F4F2ED;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;">
    <div style="background:#1F1F1F;padding:36px 30px;text-align:center;">
      <div style="color:#fff;font-size:26px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;">RISK TAKERS</div>
    </div>
    <div style="padding:36px 30px;color:#333;line-height:1.6;">
      <h1 style="color:#111;font-size:22px;font-weight:900;margin:0 0 18px;">${heading}</h1>
      ${bodyHtml}
    </div>
    <div style="background:#E8E6E1;padding:26px 30px;text-align:center;color:#666;font-size:13px;">
      <strong style="color:#111;font-weight:900;">RISK TAKERS</strong><br/>
      Conversations at the edge of AI, cybersecurity, governance, and real-world risk.
    </div>
  </div>
</body></html>`;
}

// Standard handler wrapper: JSON, CORS-safe (same-origin), error envelope.
export function handler(fn) {
  return async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    try {
      const body = await readBody(req);
      const out = await fn(body, req);
      res.status(200).json(out ?? { success: true });
    } catch (err) {
      console.error(err);
      res.status(err.status || 500).json({ error: err.message });
    }
  };
}
