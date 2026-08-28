import React, { useState } from 'react';
import { CheckCircle2, FileText, Loader2, MessageSquareText, Search } from 'lucide-react';
import TornPaper from '@/components/TornPaper';
import PrivacyCollectionNotice from '@/components/PrivacyCollectionNotice';
import { base44 } from '@/api/base44Client';
import { organizationJsonLd, setSEO } from '@/lib/seo';

const emptyForm = {
  name: '',
  email: '',
  organization: '',
  service: '',
  details: '',
};

const services = [
  {
    title: 'Specific content creation',
    description: 'Specific content developed around a defined audience, subject, or request.',
    icon: FileText,
  },
  {
    title: 'Market research',
    description: 'Focused research shaped around a market, category, or question you want to explore.',
    icon: Search,
  },
  {
    title: 'Facilitated session',
    description: 'A private or public session designed and facilitated for a particular request.',
    icon: MessageSquareText,
  },
];

export default function Services() {
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setSEO({
      title: 'Services',
      description: 'Risk Takers provides specific content creation, market research, and facilitated sessions on request.',
      path: '/services',
      jsonLd: [organizationJsonLd],
    });
  }, []);

  const update = (field) => (event) => setForm((current) => ({
    ...current,
    [field]: event.target.value,
  }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    setError('');

    try {
      const { data } = await base44.functions.invoke('submitServicesInquiry', form);
      if (!data?.success || !data?.delivery?.sent) throw new Error('Delivery was not confirmed');
      setSent(true);
      setForm(emptyForm);
    } catch {
      setError('We could not deliver your request. Please email asaf@risktakers.show directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E8E6E1] text-[#111111]">
      <section className="px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <TornPaper variant="both" bgColor="#1F1F1F" className="inline-block" rotate={-0.5}>
              <h1 className="px-8 py-5 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
                Services
              </h1>
            </TornPaper>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#444444]">
              We take on selected content, research, and facilitated-session work. Each engagement is shaped around the request.
            </p>
          </div>

          <div className="mb-12 grid gap-5 md:grid-cols-3">
            {services.map(({ title, description, icon: Icon }) => (
              <article key={title} className="border-4 border-[#1F1F1F] bg-white p-6">
                <Icon className="mb-5 h-8 w-8 text-[#C0392B]" aria-hidden="true" />
                <h2 className="mb-3 text-xl font-black">{title}</h2>
                <p className="leading-relaxed text-[#555555]">{description}</p>
              </article>
            ))}
          </div>

          <section className="mx-auto max-w-2xl border-4 border-[#1F1F1F] bg-white p-6 sm:p-8" aria-labelledby="services-form-title">
            {sent ? (
              <div className="py-10 text-center" role="status">
                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-700" aria-hidden="true" />
                <h2 id="services-form-title" className="mb-2 text-2xl font-black">Request sent</h2>
                <p className="text-[#555555]">Thanks. We will review it and follow up if there is a fit.</p>
              </div>
            ) : (
              <>
                <h2 id="services-form-title" className="mb-2 text-2xl font-black">Tell us what you need</h2>
                <p className="mb-7 text-[#555555]">Share a little context and we will take it from there.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="services-name" className="font-bold">Name *</label>
                    <input id="services-name" value={form.name} onChange={update('name')} required maxLength={120} autoComplete="name" className="mt-2 flex h-10 w-full border-2 border-[#1F1F1F] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2" />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="services-email" className="font-bold">Email *</label>
                      <input id="services-email" type="email" value={form.email} onChange={update('email')} required maxLength={254} autoComplete="email" className="mt-2 flex h-10 w-full border-2 border-[#1F1F1F] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2" />
                    </div>
                    <div>
                      <label htmlFor="services-organization" className="font-bold">Organization</label>
                      <input id="services-organization" value={form.organization} onChange={update('organization')} maxLength={160} autoComplete="organization" className="mt-2 flex h-10 w-full border-2 border-[#1F1F1F] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="services-type" className="font-bold">What are you looking for? *</label>
                    <select
                      id="services-type"
                      value={form.service}
                      onChange={update('service')}
                      required
                      className="mt-2 h-10 w-full border-2 border-[#1F1F1F] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2"
                    >
                      <option value="" disabled>Select one</option>
                      {services.map(({ title }) => <option key={title} value={title}>{title}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="services-details" className="font-bold">Request details *</label>
                    <textarea id="services-details" value={form.details} onChange={update('details')} required maxLength={5000} rows={6} className="mt-2 flex min-h-[120px] w-full border-2 border-[#1F1F1F] bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1F1F] focus-visible:ring-offset-2" placeholder="A short description is enough." />
                  </div>

                  {error && <p className="text-sm font-bold text-[#A93226]" role="alert">{error}</p>}
                  <PrivacyCollectionNotice />

                  <button type="submit" disabled={sending} className="inline-flex h-12 w-full items-center justify-center bg-[#C0392B] px-4 font-black uppercase tracking-wide text-white hover:bg-[#9F2F24] disabled:pointer-events-none disabled:opacity-50">
                    {sending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Sending</> : 'Send request'}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
