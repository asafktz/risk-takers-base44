import React, { useState } from 'react';
import TornPaper from '../TornPaper';
import { Check } from 'lucide-react';
import SponsorshipForm from './SponsorshipForm';

const principles = [
  "Disclosed",
  "Approved with guests",
  "Independent of content",
  "Free from topic influence"
];

export default function SponsorshipsSection() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="py-20 px-4 sm:px-8 bg-[#1F1F1F]">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <TornPaper 
            variant="both" 
            bgColor="#F1C40F" 
            className="inline-block"
            rotate={-0.5}
          >
            <h2 className="px-6 py-4 text-xl sm:text-2xl font-black text-[#1F1F1F] tracking-tight uppercase">
              Sponsorships
            </h2>
          </TornPaper>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <TornPaper variant="both" bgColor="#FFFFFF" rotate={0.3}>
            <div className="px-6 py-6 sm:px-10 sm:py-8">
              <p className="text-xl sm:text-2xl font-bold text-[#111111] mb-6">
                Risk Takers is currently unsponsored.
              </p>
              
              <p className="text-[#333333] leading-relaxed mb-8">
                We selectively partner with organizations that contribute real insight to conversations around AI, cybersecurity, and risk — not sales pitches.
              </p>

              <p className="text-[#666666] mb-4">All sponsorships are:</p>
              
              <ul className="space-y-3 mb-8">
                {principles.map((principle, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-[#1F1F1F] rounded-sm flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                    <span className="text-[#111111] font-medium">{principle}</span>
                  </li>
                ))}
              </ul>

              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="border-2 border-[#1F1F1F] text-[#1F1F1F] bg-transparent hover:bg-[#1F1F1F] hover:text-white px-6 py-5 text-base font-bold tracking-wide transition-all"
                >
                  Inquire About Sponsorships
                </button>
              ) : (
                <SponsorshipForm />
              )}
            </div>
          </TornPaper>
        </div>
      </div>
    </section>
  );
}