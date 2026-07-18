import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setSEO, organizationJsonLd, absoluteUrl } from '@/lib/seo';
import { isBusinessEmail } from '@/lib/email';

const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'AI Defense Stack Showcase Day',
  description:
    '5 proven cybersecurity startups. 5 CISO judges. 5 real client stories. September 23, 2026.',
  startDate: '2026-09-23T12:00:00-04:00',
  endDate: '2026-09-23T16:00:00-04:00',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  organizer: {
    '@type': 'Organization',
    name: 'Risk Takers',
    url: 'https://risktakers.show'
  },
  url: absoluteUrl('/AIDefenseStack')
};

const judgesCriteria = [
  { title: 'IS THE PROBLEM REAL?', desc: 'Is this already affecting enterprises, or is the company building around a hypothetical future threat?' },
  { title: 'IS THE APPROACH DIFFERENT?', desc: 'Does the company solve the problem differently from existing security platforms and controls?' },
  { title: 'DOES THE EVIDENCE HOLD UP?', desc: 'Is the customer example specific enough to demonstrate real value?' },
  { title: 'CAN AN ENTERPRISE DEPLOY IT?', desc: 'What must the customer integrate, change, approve, or operate?' },
  { title: 'DOES IT SCALE?', desc: 'Does the approach work beyond one carefully selected customer?' },
  { title: 'WHERE DOES IT FIT?', desc: 'What does the solution replace, complement, or depend on inside the enterprise security stack?' }
];

const timelineItems = [
  { minutes: '3 minutes', title: 'Define the problem', desc: 'What has changed because of enterprise AI adoption? Why do existing controls fail?' },
  { minutes: '4 minutes', title: 'Explain the approach', desc: 'How does the company solve the problem? What is different about its method?' },
  { minutes: '3 minutes', title: 'Prove it with a client', desc: 'What was happening before? What did the customer implement? What changed?' },
  { minutes: '5 minutes', title: 'CISO pressure test', desc: 'The judges challenge the assumptions, evidence, deployment model, and role inside the wider security stack.' },
  { minutes: '1', title: 'LIVE AUDIENCE VOTE', desc: 'The audience selects the company that made the strongest case.' }
];

const initialForm = {
  name: '',
  company: '',
  email: '',
  website: ''
};

function scrollToRegister() {
  document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToApply() {
  document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { data } = await base44.functions.invoke('registerForEvent', {
        name: form.name,
        email: form.email,
      });
      if (data?.error) throw new Error(data.error);
      setSubmitted(true);
      setForm({ name: '', email: '' });
    } catch (submitError) {
      setError('Something went wrong. Please email risktakers@linkedotter.com.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h2 className="mt-5 text-3xl font-black uppercase">You're registered.</h2>
        <p className="mt-3 max-w-md text-base leading-7 text-[#55504A]">
          We'll send your watch link and details before September 23.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-black uppercase leading-none sm:text-3xl">Register to watch live</h2>
      <div>
        <Label htmlFor="register-name" className="font-black uppercase tracking-wide">Name *</Label>
        <Input
          id="register-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
          required
          className="mt-2 rounded-none border-2 border-[#1F1F1F]"
        />
      </div>
      <div>
        <Label htmlFor="register-email" className="font-black uppercase tracking-wide">Email *</Label>
        <Input
          id="register-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@company.com"
          required
          className="mt-2 rounded-none border-2 border-[#1F1F1F]"
        />
      </div>
      {error && <p className="border-2 border-[#C0392B] bg-red-50 p-3 text-sm font-bold text-[#C0392B]">{error}</p>}
      <Button type="submit" disabled={submitting} className="h-12 w-full rounded-none bg-[#C0392B] text-sm font-black uppercase tracking-wide text-white hover:bg-[#9f2f24]">
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Registering</> : <>Register <ArrowRight className="h-4 w-4" /></>}
      </Button>
      <p className="text-xs font-semibold leading-5 text-[#6D665B]">No spam. Unsubscribe anytime.</p>
    </form>
  );
}

function ApplyForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Your name is required.');
      return;
    }
    if (!form.company.trim()) {
      setError('Company name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!form.website.trim()) {
      setError('Website is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data } = await base44.functions.invoke('submitAIDefenseStackLead', {
        name: form.name,
        email: form.email,
        company: form.company,
        linkedin: form.website,
        role: 'vendor',
        message: 'AI Defense Stack showcase — startup application',
      });
      if (data?.error) throw new Error(data.error);
      setSubmitted(true);
      setForm(initialForm);
    } catch (submitError) {
      setError('Something went wrong. Please email risktakers@linkedotter.com.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h2 className="mt-5 text-3xl font-black uppercase">Application received.</h2>
        <p className="mt-3 max-w-md text-base leading-7 text-[#55504A]">
          We'll review your submission and be in touch if you move forward.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-black uppercase leading-none sm:text-3xl">Apply to be considered</h2>
      <p className="text-sm font-semibold leading-6 text-[#55504A]">
        We are selecting five cybersecurity startups representing different parts of the AI defense stack.
      </p>

      <div>
        <Label htmlFor="apply-name" className="font-black uppercase tracking-wide">Your name *</Label>
        <Input
          id="apply-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Contact name"
          className="mt-2 rounded-none border-2 border-[#1F1F1F]"
        />
      </div>

      <div>
        <Label htmlFor="apply-company" className="font-black uppercase tracking-wide">Company name *</Label>
        <Input
          id="apply-company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          placeholder="Your company"
          className="mt-2 rounded-none border-2 border-[#1F1F1F]"
        />
      </div>

      <div>
        <Label htmlFor="apply-email" className="font-black uppercase tracking-wide">Email *</Label>
        <Input
          id="apply-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Contact email"
          className="mt-2 rounded-none border-2 border-[#1F1F1F]"
        />
      </div>

      <div>
        <Label htmlFor="apply-website" className="font-black uppercase tracking-wide">Website *</Label>
        <Input
          id="apply-website"
          type="url"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          placeholder="https://yourcompany.com"
          className="mt-2 rounded-none border-2 border-[#1F1F1F]"
        />
      </div>

      {error && <p className="border-2 border-[#C0392B] bg-red-50 p-3 text-sm font-bold text-[#C0392B]">{error}</p>}

      <Button type="submit" disabled={submitting} className="h-12 w-full rounded-none bg-[#C0392B] text-sm font-black uppercase tracking-wide text-white hover:bg-[#9f2f24]">
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting</> : <>Submit Application <ArrowRight className="h-4 w-4" /></>}
      </Button>
      <p className="text-xs font-semibold leading-5 text-[#6D665B]">We'll contact you within two weeks.</p>
    </form>
  );
}

export default function AIDefenseStack() {
  useEffect(() => {
    setSEO({
      title: 'AI Defense Stack Showcase Day',
      description: 'September 23, 2026: 5 proven cybersecurity startups pitch their AI defense approaches to 5 CISO judges. Real customers. Real results. No demos.',
      path: '/AIDefenseStack',
      jsonLd: [organizationJsonLd, eventJsonLd]
    });
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F4F2ED] text-[#151515]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .ai-defense-page * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .ai-defense-page ::selection { background: #F1C40F; color: #111111; }
      `}</style>

      <div className="ai-defense-page">
        {/* HERO */}
        <section className="bg-[#1F1F1F] text-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-8 lg:grid-cols-2 lg:gap-24 lg:py-16">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#F1C40F]">September 23, 2026</p>
              <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-[4.4rem]">
                AI Defense<br />Stack
              </h1>
              <p className="mt-6 text-lg font-bold text-[#F1C40F]">
                5 proven cybersecurity startups.<br/>
                5 CISO judges.<br/>
                5 real client stories.
              </p>
              <p className="mt-6 text-lg leading-7 text-[#E8E6E1]">
                12:00 PM ET · 4:00 PM GMT · 7:00 PM Israel<br/>
                Live online
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={scrollToRegister} className="h-12 rounded-none bg-[#F1C40F] px-6 text-sm font-black uppercase tracking-wide text-[#111111] hover:bg-[#d9b00e]">
                  Register to watch live
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button onClick={scrollToApply} variant="outline" className="h-12 rounded-none border-2 border-white bg-transparent px-6 text-sm font-black uppercase tracking-wide text-white hover:bg-white hover:text-[#111111]">
                  Apply to present
                </Button>
              </div>
            </div>

            <div id="register-section" className="min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-none">
              <div className="border-4 border-[#F1C40F] bg-white p-5 text-[#111111] shadow-[10px_10px_0_rgba(0,0,0,0.35)] sm:p-7">
                <RegisterForm />
              </div>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="bg-[#F4F2ED] py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-8">
            <h2 className="text-3xl font-black uppercase sm:text-4xl">No product demos. No theoretical startups. No invented use cases.</h2>
            <div className="mt-8 space-y-6 text-lg leading-8">
              <p>Each company must explain:</p>
              <ul className="space-y-3 list-none pl-0">
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">→</span> The AI security problem it addresses</li>
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">→</span> Why existing security controls are not enough</li>
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">→</span> Its approach to solving the problem</li>
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">→</span> How a real customer implemented that approach</li>
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">→</span> What changed for the customer</li>
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">→</span> Where the solution belongs in the AI defense stack</li>
              </ul>
              <p className="mt-8">Then five experienced security leaders challenge the approach, test the evidence, and explain where they believe it fits inside a real enterprise.</p>
            </div>
          </div>
        </section>

        {/* NOT A DEMO DAY */}
        <section className="bg-[#111111] text-white py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-8">
            <h2 className="text-3xl font-black uppercase sm:text-4xl">This is not a demo day</h2>
            <div className="mt-8 space-y-6 text-lg leading-8">
              <p>You will not watch five founders race through product screens.</p>
              <p className="text-[#F1C40F] italic font-bold">The interface is not the point.</p>
              <p>The point is whether the company has identified an important enterprise security problem, developed a credible approach to solving it, and proved that approach with real customers.</p>
              <p>Every participating company must have existing clients and a customer example it is permitted to discuss.</p>
              <div className="mt-8 space-y-3">
                <p className="font-bold">The startup presents the problem.</p>
                <p className="font-bold">It explains its approach.</p>
                <p className="font-bold">It proves it with a client.</p>
                <p className="font-bold">The judges pressure-test the claims.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FORMAT */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-8">
            <h2 className="text-3xl font-black uppercase sm:text-4xl mb-12">The format</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="border-2 border-[#1F1F1F] bg-[#F4F2ED] p-6">
                <h3 className="text-xl font-black uppercase text-[#C0392B]">5 Proven Startups</h3>
                <p className="mt-4 text-base leading-7">Each participating company must have a working solution, existing clients, and evidence from a real implementation.</p>
              </div>
              <div className="border-2 border-[#1F1F1F] bg-[#F4F2ED] p-6">
                <h3 className="text-xl font-black uppercase text-[#C0392B]">5 CISO Judges</h3>
                <p className="mt-4 text-base leading-7">Security leaders evaluate each approach through the lens of enterprise risk, deployment, integration, ownership, and measurable impact.</p>
              </div>
            </div>

            <div className="border-l-4 border-[#1F1F1F]">
              <h3 className="text-2xl font-black uppercase mb-8 pl-6">15 Minutes Per Company</h3>
              {timelineItems.map((item, idx) => (
                <div key={idx} className="grid gap-4 border-b border-[#E5E0D7] px-6 py-6 sm:grid-cols-[120px_1fr]">
                  <span className="text-sm font-black uppercase tracking-[0.16em] text-[#C0392B]">{item.minutes}</span>
                  <div>
                    <h4 className="text-xl font-black uppercase">{item.title}</h4>
                    <p className="mt-2 text-base leading-7 text-[#55504A]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* JUDGES CRITERIA */}
        <section className="bg-[#111111] text-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <h2 className="text-3xl font-black uppercase sm:text-4xl mb-12">What the judges will test</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {judgesCriteria.map((item, idx) => (
                <div key={idx} className="border border-white/14 bg-white/[0.035] p-6">
                  <h3 className="text-lg font-black text-[#F1C40F] uppercase">{item.title}</h3>
                  <p className="mt-4 text-base leading-7 text-[#D9D4CA]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARTICIPATION */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-8">
            <h2 className="text-3xl font-black uppercase sm:text-4xl mb-8">Participation requirements</h2>
            <div className="space-y-6 mb-12">
              <p className="text-lg">We are selecting five cybersecurity startups representing different parts of the AI defense stack.</p>
              <p className="text-lg font-bold">Companies must:</p>
              <ul className="space-y-3 list-none pl-0">
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">▸</span> Have existing paying or production customers</li>
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">▸</span> Address a clearly defined enterprise AI security problem</li>
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">▸</span> Present a distinct approach rather than a generic platform story</li>
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">▸</span> Provide a real client example</li>
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">▸</span> Share specific outcomes or operational changes</li>
                <li className="flex gap-3"><span className="text-[#C0392B] font-black">▸</span> Be prepared for direct questions from experienced security leaders</li>
              </ul>
              <p className="text-lg font-bold mt-8">Companies will not be selected based on sponsorship.</p>
              <p className="text-xl font-black text-[#C0392B]">This is not a pay-to-pitch event.</p>
            </div>

            <div id="apply-section" className="border-4 border-[#F1C40F] bg-[#F4F2ED] p-5 sm:p-7">
              <ApplyForm />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#C0392B] px-4 py-12 text-white sm:px-8">
          <div className="mx-auto max-w-4xl flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-black uppercase">Get involved.</h2>
              <p className="mt-3 text-lg font-semibold">Watch real vendors pressure-tested by real CISOs. September 23, 2026.</p>
            </div>
            <Button onClick={scrollToRegister} className="h-12 rounded-none bg-[#F1C40F] px-6 text-sm font-black uppercase text-[#111111] hover:bg-[#d9b00e] whitespace-nowrap">
              Register now
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
