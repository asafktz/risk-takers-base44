// Free / personal email providers we don't accept on lead forms — we want work emails.
// Keep this list in sync with the copy in base44/functions/submitAIDefenseStackLead/entry.ts
export const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'outlook.com', 'outlook.fr', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'aim.com',
  'proton.me', 'protonmail.com', 'pm.me',
  'gmx.com', 'gmx.net', 'gmx.de', 'mail.com', 'email.com', 'inbox.com',
  'zoho.com', 'yandex.com', 'yandex.ru', 'fastmail.com', 'hey.com', 'hushmail.com',
  'qq.com', '163.com', '126.com', 'sina.com', 'naver.com',
  'gmx.at', 'web.de', 't-online.de', 'libero.it', 'orange.fr', 'wanadoo.fr', 'free.fr',
]);

// Returns the lowercased domain part of an email, or '' if it can't be parsed.
export function extractEmailDomain(email) {
  if (!email || typeof email !== 'string') return '';
  const at = email.lastIndexOf('@');
  if (at === -1) return '';
  return email.slice(at + 1).trim().toLowerCase();
}

// True only for plausible work emails: a valid-looking address whose domain isn't a free provider.
export function isBusinessEmail(email) {
  const domain = extractEmailDomain(email);
  if (!domain || !domain.includes('.')) return false;
  return !FREE_EMAIL_DOMAINS.has(domain);
}
