import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { setSEO, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import HeroNew from '@/components/landing/HeroNew';
import FeaturedShow from '@/components/landing/FeaturedShow';
import AboutSection from '@/components/landing/AboutSection';
import CoreQuestions from '@/components/landing/CoreQuestions';
import EpisodesSection from '@/components/landing/EpisodesSection';
import HostSection from '@/components/landing/HostSection';
import SponsorshipsSection from '@/components/landing/SponsorshipsSection';
import FooterCTA from '@/components/landing/FooterCTA';

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSEO({
      description: 'Risk Takers is a live webinar series with candid conversations on AI adoption, cybersecurity, governance, and real-world technology risk.',
      path: '/',
      jsonLd: [organizationJsonLd, websiteJsonLd]
    });
  }, []);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role === 'producer') {
        navigate(createPageUrl('Admin'));
      } else {
        setUser(u);
      }
    }).catch(() => {
      setUser(null);
    });
  }, [navigate]);

  useEffect(() => {
    const scrollTarget = location.state?.scrollTo;
    if (scrollTarget) {
      // Small delay to let sections render
      setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      // Clear the state so it doesn't re-scroll on re-render
      window.history.replaceState({}, '');
    }
  }, [location.state]);
  return (
    <div className="min-h-screen bg-[#F4F2ED]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        ::selection {
          background: #F1C40F;
          color: #1F1F1F;
        }
      `}</style>
      
      <HeroNew />
      <FeaturedShow />
      <AboutSection />
      <CoreQuestions />
      <EpisodesSection />
      <HostSection />
      <SponsorshipsSection />
      <FooterCTA />
    </div>
  );
}
