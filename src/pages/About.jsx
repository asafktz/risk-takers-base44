import React from 'react';
import { Link } from 'react-router-dom';
import TornPaper from '../components/TornPaper';
import { setSEO, organizationJsonLd } from '@/lib/seo';

export default function About() {
  React.useEffect(() => {
    setSEO({
      title: 'About',
      description: 'Learn what Risk Takers is, who it is for, and how the show covers AI adoption, cybersecurity, governance, and risk.',
      path: '/about',
      jsonLd: [organizationJsonLd]
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#E8E6E1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center mb-12">
          <TornPaper variant="both" bgColor="#1F1F1F" className="inline-block" rotate={-0.5}>
            <h1 className="px-8 py-5 text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              About Risk Takers
            </h1>
          </TornPaper>
        </div>

        <div className="space-y-8 max-w-3xl mx-auto">
          <div className="bg-white border-4 border-[#1F1F1F] rounded-lg p-8">
            <h2 className="text-2xl font-black text-[#111111] mb-4">What Is Risk Takers?</h2>
            <p className="text-[#333333] leading-relaxed mb-4">
              Risk Takers is a live show series dedicated to exploring the real-world challenges of cybersecurity, 
              AI adoption, and risk management. Each episode brings together industry leaders, practitioners, and 
              innovators who share candid insights about navigating the complex landscape of modern technology risk. 
              Unlike polished corporate presentations, Risk Takers prioritizes honest, unfiltered conversations about 
              what actually works — and what doesn't — when organizations face critical security and technology decisions.
            </p>
            <p className="text-[#333333] leading-relaxed mb-4">
              The series is designed for CISOs, security professionals, technology leaders, risk managers, and anyone 
              involved in making strategic decisions about cybersecurity and AI within their organization. Whether you 
              are evaluating new security frameworks, managing compliance requirements, or trying to understand how 
              AI is reshaping the threat landscape, Risk Takers delivers actionable perspectives from people who have 
              been in the trenches.
            </p>
            <p className="text-[#333333] leading-relaxed">
              Risk Takers is produced by a team passionate about bridging the gap between security theory and practice. 
              We believe that the best way to strengthen the industry is through open dialogue, shared experience, and 
              a willingness to challenge conventional thinking. Every episode is available live and later 
              as recordings on YouTube and Spotify, ensuring the community can access these conversations on their 
              own schedule.
            </p>
          </div>

          <div className="text-center">
            <Link
              to="/contact"
              className="inline-block bg-[#1F1F1F] hover:bg-[#111111] text-white font-bold px-8 py-3 rounded transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}