import React from 'react';
import TornPaper from '../TornPaper';

export default function AboutSection() {
  return (
    <section className="py-20 px-4 sm:px-8 relative">
      <div className="max-w-4xl mx-auto">
        {/* Section header with torn paper */}
        <div className="mb-12">
          <TornPaper 
            variant="both" 
            bgColor="#1F1F1F" 
            className="inline-block"
            rotate={-0.5}
          >
            <h2 className="px-6 py-4 text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              About Risk Takers
            </h2>
          </TornPaper>
        </div>

        {/* Main copy */}
        <div className="space-y-6 text-lg sm:text-xl text-[#333333] leading-relaxed">
          <p>
            Risk Takers is a show about what really happens when AI moves from "pilot" to "production" across a company.
          </p>

          <p>
            AI adoption is not just a tech project. It changes how teams work, how data moves, how decisions get made, and how risk shows up. Most companies are moving fast. The guardrails are not keeping up.
          </p>

          <p>
            We bring in the people who live this every day: security leaders, privacy and compliance teams, CTOs, operators, builders, and researchers.
          </p>

          {/* Stacked statements */}
          <div className="pt-6 space-y-2">
            <TornPaper variant="right" bgColor="#FFFFFF" className="inline-block" rotate={0.3}>
              <p className="px-4 py-2 text-[#111111] font-bold">No hype.</p>
            </TornPaper>
            <br />
            <TornPaper variant="right" bgColor="#FFFFFF" className="inline-block" rotate={-0.4}>
              <p className="px-4 py-2 text-[#111111] font-bold">No vendor pitches.</p>
            </TornPaper>
            <br />
            <TornPaper variant="right" bgColor="#FFFFFF" className="inline-block" rotate={0.2}>
              <p className="px-4 py-2 text-[#111111] font-bold">Just real stories, real tradeoffs, and practical playbooks.</p>
            </TornPaper>
          </div>
        </div>
      </div>
    </section>
  );
}