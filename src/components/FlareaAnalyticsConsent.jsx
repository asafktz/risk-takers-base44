import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  applyFlareaConsent,
  readFlareaConsentState,
  saveFlareaConsent,
} from '@/lib/flareaConsent';

export default function FlareaAnalyticsConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const state = readFlareaConsentState();
    if (typeof state.consent === 'boolean') applyFlareaConsent(state.consent);
    setVisible(state.prompt);

    const syncConsent = () => {
      const current = readFlareaConsentState();
      if (typeof current.consent === 'boolean') applyFlareaConsent(current.consent);
    };
    window.addEventListener('flarea:pixel-ready', syncConsent);
    return () => window.removeEventListener('flarea:pixel-ready', syncConsent);
  }, []);

  if (!visible) return null;

  const decide = (consent) => {
    saveFlareaConsent(consent);
    setVisible(false);
  };

  return (
    <aside
      role="dialog"
      aria-label="Analytics choice"
      className="fixed inset-x-4 bottom-4 z-[2147482999] mx-auto max-w-3xl border-2 border-[#1F1F1F] bg-[#F4F2ED] p-4 text-[#1F1F1F] shadow-[8px_8px_0_#1F1F1F] sm:flex sm:items-center sm:gap-5"
    >
      <p className="flex-1 text-sm font-semibold leading-6">
        Allow optional Flarea analytics to connect the pages you visit with your event registration so Risk Takers can understand audience engagement. Read our{' '}
        <Link className="font-black underline" to="/privacy">Privacy Policy</Link>.
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button type="button" onClick={() => decide(false)} className="border-2 border-[#1F1F1F] bg-white px-4 py-2 text-sm font-black uppercase">
          Reject
        </button>
        <button type="button" onClick={() => decide(true)} className="border-2 border-[#1F1F1F] bg-[#E0A800] px-4 py-2 text-sm font-black uppercase">
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
