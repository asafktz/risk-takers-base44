// Phone validation/normalization shared by the vendor form.
// Real validity (per-country length + prefix rules) via libphonenumber-js — no SMS.
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

// True only for a genuinely valid number. If no country code is given, assume US.
export function isValidPhone(value, defaultCountry = 'US') {
  const v = (value || '').trim();
  if (!v) return false;
  try {
    return v.startsWith('+') ? isValidPhoneNumber(v) : isValidPhoneNumber(v, defaultCountry);
  } catch {
    return false;
  }
}

// Normalize to E.164 (e.g. +14155550123) for storage; falls back to the raw value.
export function normalizePhone(value, defaultCountry = 'US') {
  const v = (value || '').trim();
  try {
    const p = v.startsWith('+') ? parsePhoneNumber(v) : parsePhoneNumber(v, defaultCountry);
    return p ? p.number : v;
  } catch {
    return v;
  }
}
