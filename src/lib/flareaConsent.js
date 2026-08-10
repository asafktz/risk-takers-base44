export const FLAREA_ANALYTICS_CONSENT_KEY = 'rt_flarea_analytics_consent';
export const RISK_TAKERS_PRIVACY_OPT_OUT_KEY = 'rt_privacy_opt_out';

export function resolveFlareaConsent({ gpc = false, optedOut = false, saved = null } = {}) {
  if (gpc || optedOut || saved === 'denied') return { consent: false, prompt: false };
  if (saved === 'granted') return { consent: true, prompt: false };
  return { consent: null, prompt: true };
}

export function readFlareaConsentState() {
  const gpc = typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;
  let optedOut = false;
  let saved = null;
  try {
    optedOut = localStorage.getItem(RISK_TAKERS_PRIVACY_OPT_OUT_KEY) === '1';
    saved = localStorage.getItem(FLAREA_ANALYTICS_CONSENT_KEY);
  } catch (_) { /* storage may be disabled */ }
  return resolveFlareaConsent({ gpc, optedOut, saved });
}

export function applyFlareaConsent(consent) {
  if (typeof window === 'undefined' || typeof consent !== 'boolean') return;
  window.__rtFlareaConsent = consent;
  if (typeof window.srConsent === 'function') window.srConsent(consent);
}

export function saveFlareaConsent(consent) {
  try {
    localStorage.setItem(FLAREA_ANALYTICS_CONSENT_KEY, consent ? 'granted' : 'denied');
  } catch (_) { /* storage may be disabled */ }
  applyFlareaConsent(consent);
}

export function disableOptionalFlarea() {
  saveFlareaConsent(false);
  if (typeof window !== 'undefined') {
    window.__rtPrivacyOptOut = true;
    window.dispatchEvent(new Event('rt:privacy-opt-out'));
  }
}
