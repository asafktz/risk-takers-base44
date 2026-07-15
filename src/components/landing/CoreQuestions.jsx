import React from 'react';
import TornPaper from '../TornPaper';

const questions = [
  { category: "Security", text: "New attack paths, agent actions, tool access, MCPs, and real-world failure modes" },
  { category: "Privacy & Governance", text: "Data use, consent, retention, audits, and what is acceptable" },
  { category: "Cost", text: "Runaway usage, vendor sprawl, and how teams get control back" },
  { category: "Humans", text: "Pressure, burnout, trust, and what breaks inside teams when the pace is too high" }
];

export default function CoreQuestions() {
  return (
    <section className="py-20 px-4 sm:px-8 relative">
      {/* Yellow tape divider */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <TornPaper variant="both" bgColor="#F1C40F" className="h-3 w-[105%] -ml-[2.5%]" rotate={0.3} />
      </div>

      <div className="max-w-4xl mx-auto pt-8">
        {/* Section header */}
        <div className="mb-16">
          <TornPaper 
            variant="both" 
            bgColor="#FFFFFF" 
            className="inline-block"
            rotate={-0.8}
          >
            <h2 className="px-8 py-5 text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
              What We Cover
            </h2>
          </TornPaper>
        </div>

        {/* Questions list */}
        <ul className="space-y-8 mb-12">
          {questions.map((question, index) => (
            <li key={index} className="flex items-start gap-4">
              <span className="text-[#C0392B] text-2xl font-black mt-1">→</span>
              <div>
                <span className="text-base font-black text-[#C0392B] tracking-wide uppercase block mb-2">
                  {question.category}
                </span>
                <span className="text-lg sm:text-xl text-[#111111] leading-relaxed">
                  {question.text}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Kicker */}
        <TornPaper variant="both" bgColor="#FFFFFF" className="inline-block" rotate={0.4}>
          <p className="px-6 py-4 text-[#666666] text-base sm:text-lg italic">
            We cover the full set of risks that show up with massive AI adoption.
          </p>
        </TornPaper>
      </div>

      {/* Yellow tape divider bottom */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <TornPaper variant="both" bgColor="#F1C40F" className="h-3 w-[105%] -ml-[2.5%]" rotate={-0.2} />
      </div>
    </section>
  );
}