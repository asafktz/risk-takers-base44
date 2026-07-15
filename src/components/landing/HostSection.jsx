import React from 'react';
import TornPaper from '../TornPaper';
import { Linkedin } from 'lucide-react';

export default function HostSection() {
  return (
    <section className="py-20 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="mb-12">
          <TornPaper 
            variant="both" 
            bgColor="#FFFFFF" 
            className="inline-block"
            rotate={-0.6}
          >
            <h2 className="px-6 py-4 text-xl sm:text-2xl font-black text-[#111111] tracking-tight">
              Your Host
            </h2>
          </TornPaper>
        </div>

        {/* Host card - Asaf */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
          {/* Photo */}
          <div className="flex-shrink-0">
            <TornPaper variant="both" bgColor="#FFFFFF" rotate={1}>
              <div className="p-3">
                <div className="w-48 h-56 bg-[#E5E3DE] overflow-hidden">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b5a111214c1e0b6066ef6/0a0be976c_1628702269205.jpeg"
                    alt="Asaf Katz"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>
            </TornPaper>
            <div className="flex justify-center mt-3">
              <a 
                href="https://www.linkedin.com/in/asafkatz/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#0077B5] hover:text-[#006399] transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <h3 className="text-3xl sm:text-4xl font-black text-[#111111] mb-2">
              Asaf Katz
            </h3>
            <p className="text-lg text-[#666666] italic mb-6">
              Cybersecurity Investor & Advisor
            </p>
            
            <div className="space-y-4 text-[#333333] leading-relaxed">
              <p>
                Asaf has spent over a decade at the intersection of security, technology, and risk. As an investor, he's backed companies tackling identity, authorization, and AI safety before they became buzzwords.
              </p>
              <p>
                He started Risk Takers because the most important conversations about AI and security weren't happening in public — and they needed to.
              </p>
            </div>
          </div>
        </div>

        {/* Team member - Inna */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Photo */}
          <div className="flex-shrink-0">
            <TornPaper variant="both" bgColor="#FFFFFF" rotate={-0.8}>
              <div className="p-3">
                <div className="w-48 h-56 bg-[#E5E3DE] overflow-hidden">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b5a111214c1e0b6066ef6/3b04103cc_innakubovski.jpg"
                    alt="Inna Kubovski"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>
            </TornPaper>
            <div className="flex justify-center mt-3">
              <a 
                href="https://www.linkedin.com/in/kubovski/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#0077B5] hover:text-[#006399] transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4">
            <h3 className="text-3xl sm:text-4xl font-black text-[#111111] mb-2">
              Inna Kubovski
            </h3>
            <p className="text-lg text-[#666666] italic mb-6">
              All Things Marketing
            </p>
            
            <div className="space-y-4 text-[#333333] leading-relaxed">
              <p>
                Inna Kubovski is a cybersecurity and AI-focused marketing leader who works closely with startups to help them clearly articulate complex technical products and bring them to market.
              </p>
              <p>
                With experience spanning fractional CMO roles, AI startup advisory, and hands-on GTM execution, she specializes in translating deep technical value into clear positioning, demand generation, and growth strategies.
              </p>
              <p>
                Inna consistently writes about AI agents, security, and the real-world challenges of communicating risk and innovation—bridging the gap between builders, buyers, and the rapidly evolving AI security landscape.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}