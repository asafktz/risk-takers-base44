import { useEffect } from 'react';
import { Check } from 'lucide-react';
import SponsorshipForm from '@/components/landing/SponsorshipForm';
import { setSEO, organizationJsonLd } from '@/lib/seo';
import { SPONSORSHIP_CTA, SPONSORSHIP_PATH, SPONSORSHIP_PRINCIPLES } from '@/lib/sponsorship';

export default function Sponsorships() {
  useEffect(() => {
    setSEO({
      title: 'Sponsorships',
      description: 'Explore Risk Takers sponsorships and tell us about your audience and goals.',
      path: SPONSORSHIP_PATH,
      jsonLd: [organizationJsonLd],
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#1F1F1F] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 lg:py-24 grid gap-12 lg:grid-cols-[1fr_0.9fr] items-start">
        <div>
          <p className="text-[#F1C40F] text-sm font-black tracking-[0.18em] uppercase mb-5">Risk Takers sponsorships</p>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.02] mb-7">
            Sponsor a conversation worth having.
          </h1>
          <p className="text-lg text-[#E8E6E1] leading-relaxed mb-9 max-w-xl">
            We work with organizations that bring useful insight to conversations about AI, cybersecurity, and risk. Tell us who you hope to reach and what you want to contribute.
          </p>
          <p className="text-sm font-bold uppercase tracking-wider text-[#CFC9BB] mb-4">Our sponsorship principles</p>
          <ul className="grid gap-3 mb-10">
            {SPONSORSHIP_PRINCIPLES.map((principle) => (
              <li key={principle} className="flex items-center gap-3 font-semibold">
                <Check className="w-5 h-5 text-[#F1C40F] flex-shrink-0" aria-hidden="true" />
                {principle}
              </li>
            ))}
          </ul>
          <a
            href="/case-studies/ai-defense-stack-day.html"
            className="inline-block text-[#F1C40F] font-bold underline underline-offset-4 hover:text-white"
          >
            See the AI Defense Stack Day case study
          </a>
        </div>

        <section id="inquiry" aria-labelledby="inquiry-heading" className="bg-white text-[#111111] p-6 sm:p-9 border-t-8 border-[#F1C40F]">
          <h2 id="inquiry-heading" className="text-3xl font-black tracking-tight mb-3">{SPONSORSHIP_CTA}</h2>
          <p className="text-[#555555] mb-7">Share a little about your company. We’ll follow up to discuss the right fit.</p>
          <SponsorshipForm />
        </section>
      </div>
    </main>
  );
}
