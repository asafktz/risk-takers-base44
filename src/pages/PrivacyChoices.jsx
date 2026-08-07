import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { setSEO } from '@/lib/seo';

const STORAGE_KEY = 'rt_privacy_opt_out';

export default function PrivacyChoices() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const gpc = typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;

  useEffect(() => {
    setSEO({
      title: 'Your Privacy Choices',
      description: 'Opt out of the sale or sharing of personal information and targeted advertising.',
      path: '/privacy-choices',
    });
    if (gpc) {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) { /* storage may be disabled */ }
    }
  }, [gpc]);

  async function submit(event) {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');
    try {
      const response = await fetch('/api/submitPrivacyChoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, global_privacy_control: gpc }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to save your choice.');
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) { /* storage may be disabled */ }
      setStatus('success');
      setMessage('Your opt-out has been saved. We will suppress this email from sale, sharing, and targeted-advertising uses.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Unable to save your choice. Please try again.');
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F2ED] px-4 py-14 text-[#1F1F1F] sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl border-4 border-[#1F1F1F] bg-white p-6 shadow-[10px_10px_0_#1F1F1F] sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#C0392B]">Privacy control</p>
        <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl">Do Not Sell or Share My Personal Information</h1>
        <p className="mt-6 text-base leading-7 text-[#49443D]">Use this form to opt out of the sale or sharing of your personal information and its use for targeted advertising. The choice applies to the email address you submit and does not prevent service messages or processing needed to deliver an event you requested.</p>
        {gpc && <p className="mt-5 border-2 border-green-700 bg-green-50 p-3 font-bold text-green-900">Global Privacy Control is enabled in this browser. Optional Risk Takers tracking and media scripts are disabled here.</p>}
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label htmlFor="privacy-email" className="block text-sm font-black uppercase tracking-wide">Email address</label>
          <input id="privacy-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-none border-2 border-[#1F1F1F] px-3" autoComplete="email" />
          <button type="submit" disabled={status === 'submitting'} className="min-h-12 border-2 border-[#1F1F1F] bg-[#C0392B] px-5 font-black uppercase text-white disabled:opacity-60">
            {status === 'submitting' ? 'Saving…' : 'Opt out'}
          </button>
        </form>
        {message && <p role="status" className={`mt-5 border-2 p-3 font-bold ${status === 'success' ? 'border-green-700 bg-green-50 text-green-900' : 'border-[#C0392B] bg-red-50 text-[#8F241C]'}`}>{message}</p>}
        <p className="mt-8 text-sm leading-6 text-[#6D665B]">For access, correction, deletion, or other privacy requests, email <a className="font-black underline" href="mailto:hello@risktakers.live">hello@risktakers.live</a>. Read our <Link className="font-black underline" to="/privacy">Privacy Policy</Link>.</p>
      </div>
    </main>
  );
}
