import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { episodePath } from '@/lib/seo';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TornPaper from '../TornPaper';
import { Button } from '@/components/ui/button';
import SubscribeDialog from '../SubscribeDialog';

export default function FooterCTA() {
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const { data: nextEpisode } = useQuery({
    queryKey: ['nextEpisode'],
    queryFn: async () => {
      const episodes = await base44.entities.Episode.list('date');
      const now = new Date();
      const upcoming = episodes.filter(ep => new Date(ep.date) >= now);
      return upcoming[0] || null;
    }
  });

  return (
    <section className="py-24 px-4 sm:px-8 relative overflow-hidden">
      {/* Top torn edge */}
      <div className="absolute top-0 left-0 right-0">
        <TornPaper variant="bottom" bgColor="#1F1F1F" className="h-8 w-full" />
      </div>

      <div className="max-w-3xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <TornPaper 
            variant="both" 
            bgColor="#FFFFFF" 
            className="inline-block"
            rotate={0.5}
          >
            <h2 className="px-8 py-5 text-2xl sm:text-4xl font-black text-[#111111] tracking-tight">
              Join the Conversation
            </h2>
          </TornPaper>
        </div>

        {/* Copy */}
        <p className="text-lg sm:text-xl text-[#333333] max-w-2xl mx-auto mb-12 leading-relaxed">
          If you're navigating AI adoption, security decisions, or risk frameworks in the real world, Risk Takers is where those conversations happen — honestly.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {nextEpisode ? (
            <Button 
              asChild
              className="bg-[#1F1F1F] hover:bg-[#111111] text-white px-8 py-6 text-base font-bold tracking-wide transition-all hover:translate-y-[-2px]"
            >
              <Link to={episodePath(nextEpisode)}>
                Register for the Next Episode
              </Link>
            </Button>
          ) : (
            <Button 
              disabled
              className="bg-[#1F1F1F] hover:bg-[#111111] text-white px-8 py-6 text-base font-bold tracking-wide transition-all hover:translate-y-[-2px]"
            >
              Register for the Next Episode
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => setSubscribeOpen(true)}
            className="border-2 border-[#1F1F1F] text-[#1F1F1F] bg-transparent hover:bg-[#1F1F1F] hover:text-white px-8 py-6 text-base font-bold tracking-wide transition-all"
          >
            Subscribe for Updates
          </Button>
          <SubscribeDialog open={subscribeOpen} onOpenChange={setSubscribeOpen} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-24 pt-8 border-t border-[#E5E3DE]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[#111111] font-black text-xl tracking-tight uppercase">
            Risk Takers
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <Link to="/about" className="text-[#666666] hover:text-[#111111] text-sm transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-[#666666] hover:text-[#111111] text-sm transition-colors">
              Contact
            </Link>
            <Link to={createPageUrl('Admin')} className="text-[#666666] hover:text-[#111111] text-sm transition-colors">
              Admin
            </Link>
            <div className="text-[#666666] text-sm">
              © {new Date().getFullYear()} Risk Takers. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
