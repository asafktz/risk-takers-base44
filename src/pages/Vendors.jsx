import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Mic, Building2, CalendarCheck, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { setSEO, organizationJsonLd } from '@/lib/seo';
import { isBusinessEmail } from '@/lib/email';
import { isValidPhone } from '@/lib/phone';
import { EVENT } from '@/lib/event';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const initialForm = {
  name: '',
  work_email: '',
  phone: '',
  company: '',
  note: '',
  presenter: '',
  target_accounts: ''
};

const idealFit = [
  'Emerging companies with a new or recently launched AI-era security product.',
  'Out of stealth in the last 12 months, or a major new product/module launched recently.',
  'Strong technical differentiation — not just another dashboard.',
  'A clear demo that shows the product working.',
  'Early customer proof: pilots, design partners, or credible case studies.',
  'Strong technology is still welcome even if commercial proof is early.',
  'Relevant to AI-era defense: agent security, identity, cloud, AppSec, endpoint, data, human-layer attacks, SecOps, automation, exposure management, or similar.'
];

export default function Vendors() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSEO({
      title: 'Apply as a Vendor — The AI Defense Stack',
      description:
        'Apply for a demo slot at Risk Takers: The AI Defense Stack. We handpick 4-5 emerging cybersecurity companies with a clear role in the AI defense stack.',
      path: '/vendors',
      jsonLd: [organizationJsonLd]
    });
  }, []);

  const companyFromEmail = useMemo(() => {
    const at = form.work_email.lastIndexOf('@');
    return at > -1 ? form.work_email.slice(at + 1).split('.')[0] : '';
  }, [form.work_email]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isBusinessEmail(form.work_email)) {
      setError('Please use your work email. Free inboxes like Gmail, Outlook, or Yahoo are not accepted.');
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError('Please enter a valid phone number, including country code (e.g. +1 415 555 0123).');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { data } = await base44.functions.invoke('submitVendorApplication', form);
      if (data?.error) throw new Error(data.error);
      setSubmitted(true);
      setForm(initialForm);
    } catch (submitError) {
      const msg = submitError?.response?.data?.error || submitError?.message;
      setError(msg || 'Something went wrong. Please email hello@risktakers.live and mention The AI Defense Stack.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F2ED] text-[#151515]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .vendors-page * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .vendors-page ::selection { background: #F1C40F; color: #111; }
        .vendors-page .phone-input { display: flex; align-items: center; gap: 0.5rem; border: 2px solid #1F1F1F; background: #fff; padding: 0 0.6rem; height: 2.5rem; }
        .vendors-page .phone-input .PhoneInputInput { border: none; outline: none; background: transparent; height: 100%; font-size: 0.95rem; color: #111; }
        .vendors-page .phone-input .PhoneInputCountryIcon { box-shadow: none; }
      `}</style>

      <div className="vendors-page mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 border-2 border-[#1F1F1F] bg-[#F1C40F] px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
            <ShieldCheck className="h-4 w-4" /> Vendor application
          </span>
          <h1 className="mt-5 text-[2.6rem] font-black uppercase leading-[0.95] tracking-tight sm:text-5xl">
            Apply for a demo slot
          </h1>
          <p className="mt-4 text-base font-black uppercase tracking-wide text-[#C0392B]">
            {EVENT.dateLabel} · {EVENT.timeShort}
          </p>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#49443D]">
            We handpick 4-5 emerging cybersecurity companies with a clear role in the AI defense stack — a sharp technical
            wedge, a demo security leaders can grasp quickly, and either early market proof or technology strong enough to
            deserve a serious look.
          </p>

          <div className="mt-7 max-w-xl space-y-4">
            <div className="flex items-start gap-3">
              <Mic className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#C0392B]" />
              <p className="text-base leading-7 text-[#2B2B2B]">
                <span className="font-black">Pitch live to world-class CISOs.</span> Demo your product to senior security
                leaders and judges in the room — live, not a recording.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#C0392B]" />
              <p className="text-base leading-7 text-[#2B2B2B]">
                <span className="font-black">Reach beyond the room.</span> We push the event across our network of
                security companies and leaders — your demo and follow-up travel far past the people in the room.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#C0392B]" />
              <p className="text-base leading-7 text-[#2B2B2B]">
                <span className="font-black">Open doors at the accounts you want.</span> Tell us which companies you'd
                love in the room and we'll work to get them invited — an indirect intro to the accounts on your list.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CalendarCheck className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#C0392B]" />
              <p className="text-base leading-7 text-[#2B2B2B]">
                <span className="font-black">Meetings when there's interest.</span> We capture interest during and after
                the event and work to book you qualified meetings wherever there's a real fit.
              </p>
            </div>
          </div>

          <p className="mt-7 max-w-xl text-base font-semibold leading-7 text-[#6D665B]">
            Takes under a minute. Just the essentials — we do our homework on our side before we follow up.
          </p>
        </div>

        <div className="border-4 border-[#1F1F1F] bg-white p-5 shadow-[10px_10px_0_#1F1F1F] sm:p-7">
          {submitted ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
              <h2 className="mt-5 text-3xl font-black uppercase">Application received</h2>
              <p className="mt-3 max-w-md text-base leading-7 text-[#55504A]">
                Thanks. We review every applicant for fit before we follow up. If there's a match, you'll hear from us with
                next steps.
              </p>
              <Button onClick={() => setSubmitted(false)} className="mt-7 rounded-none bg-[#1F1F1F] px-5 font-black uppercase text-white hover:bg-[#333]">
                Submit another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-2xl font-black uppercase leading-none sm:text-3xl">Tell us who you are</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="v-name" className="font-black uppercase tracking-wide">Name *</Label>
                  <Input id="v-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-2 rounded-none border-2 border-[#1F1F1F]" />
                </div>
                <div>
                  <Label htmlFor="v-email" className="font-black uppercase tracking-wide">Work email *</Label>
                  <Input id="v-email" type="email" value={form.work_email}
                    onChange={(e) => setForm({ ...form, work_email: e.target.value })}
                    onBlur={() => { if (!form.company && companyFromEmail) setForm((f) => ({ ...f, company: companyFromEmail })); }}
                    required className="mt-2 rounded-none border-2 border-[#1F1F1F]" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="v-phone" className="font-black uppercase tracking-wide">Phone *</Label>
                  <PhoneInput
                    id="v-phone"
                    international
                    defaultCountry="US"
                    value={form.phone}
                    onChange={(value) => setForm({ ...form, phone: value || '' })}
                    placeholder="Enter phone number"
                    className="phone-input mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="v-company" className="font-black uppercase tracking-wide">Company *</Label>
                  <Input id="v-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required className="mt-2 rounded-none border-2 border-[#1F1F1F]" />
                </div>
              </div>

              <div>
                <Label htmlFor="v-note" className="font-black uppercase tracking-wide">Show us what you do best</Label>
                <Textarea id="v-note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={3} placeholder="Drop a demo link, your site, or a one-liner on what makes you timely." className="mt-2 rounded-none border-2 border-[#1F1F1F]" />
              </div>

              <div>
                <Label htmlFor="v-presenter" className="font-black uppercase tracking-wide">Who would present? <span className="font-semibold normal-case text-[#6D665B]">(optional)</span></Label>
                <Input id="v-presenter" value={form.presenter} onChange={(e) => setForm({ ...form, presenter: e.target.value })} placeholder="Name, title" className="mt-2 rounded-none border-2 border-[#1F1F1F]" />
              </div>

              <div>
                <Label htmlFor="v-accounts" className="font-black uppercase tracking-wide">Accounts you'd want in the room <span className="font-semibold normal-case text-[#6D665B]">(optional)</span></Label>
                <Textarea id="v-accounts" value={form.target_accounts} onChange={(e) => setForm({ ...form, target_accounts: e.target.value })} rows={2} placeholder="Companies you'd love us to invite — we'll work to get them there." className="mt-2 rounded-none border-2 border-[#1F1F1F]" />
              </div>

              {error && <p className="border-2 border-[#C0392B] bg-red-50 p-3 text-sm font-bold text-[#C0392B]">{error}</p>}

              <Button type="submit" disabled={submitting} className="h-12 w-full rounded-none bg-[#C0392B] text-sm font-black uppercase tracking-wide text-white hover:bg-[#9f2f24]">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending</> : <>Submit application <ArrowRight className="h-4 w-4" /></>}
              </Button>
              <p className="text-xs font-semibold leading-5 text-[#6D665B]">
                Work email required. Submission does not guarantee selection — we review fit before follow-up.
              </p>
            </form>
          )}
        </div>
      </div>

      <section className="vendors-page border-t-2 border-[#1F1F1F]/15">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-8">
          <h2 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">Who should apply</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#49443D]">
            We're looking for cybersecurity startups building what defenders will need next.
          </p>

          <p className="mt-9 text-sm font-black uppercase tracking-[0.16em] text-[#C0392B]">Ideal fit</p>
          <ul className="mt-4 grid max-w-4xl gap-3 sm:grid-cols-2">
            {idealFit.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#C0392B]" />
                <span className="text-base leading-7 text-[#2B2B2B]">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 max-w-3xl border-l-4 border-[#1F1F1F] bg-white p-5 shadow-[6px_6px_0_#1F1F1F]">
            <p className="text-base font-semibold leading-7 text-[#2B2B2B]">
              This is not only for brand-new companies. If you're an older startup with a genuinely new product that
              security leaders haven't seen yet, you may still be a fit.
            </p>
          </div>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-[#49443D]">
            We're selecting for novelty, practical defensive value, and whether the product gives security teams a real
            advantage against the next wave of attacks.
          </p>
        </div>
      </section>
    </main>
  );
}
