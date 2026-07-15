import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { episodePath } from '@/lib/seo';
import TornPaper from '../TornPaper';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const { data: nextEpisode } = useQuery({
    queryKey: ['nextEpisode'],
    queryFn: async () => {
      const episodes = await base44.entities.Episode.list('date');
      const now = new Date();
      const upcoming = episodes.filter(ep => new Date(ep.date) >= now);
      return upcoming[0] || null;
    }
  });

  const { data: guests = [] } = useQuery({
    queryKey: ['guests'],
    queryFn: () => base44.entities.Guest.list()
  });

  // Get guest info for the next episode
  const episodeGuests = nextEpisode?.guest_ids 
    ? guests.filter(g => nextEpisode.guest_ids.includes(g.id))
    : [];

  return (
    <section className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-24">
      {/* Background texture noise */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Top label */}
        <div className="mb-12">
          <TornPaper 
            variant="both" 
            bgColor="#F1C40F" 
            className="inline-block"
            rotate={-1}
          >
            <span className="block px-4 py-2 text-xs font-bold tracking-[0.2em] text-[#1F1F1F] uppercase">
              Live Webinar Series
            </span>
          </TornPaper>
        </div>

        {/* Episode title */}
        {nextEpisode && (
          <>
            {episodeGuests.length > 0 && (
              <p className="text-lg text-[#666666] mb-8">
                with {episodeGuests.map(g => g.name).join(', ')}
              </p>
            )}

            <div className="relative mb-10">
              <TornPaper 
                variant="both" 
                bgColor="#FFFFFF" 
                className="inline-block max-w-4xl"
                rotate={0.5}
              >
                <blockquote className="px-6 py-8 sm:px-10 sm:py-12">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#111111] leading-[1.1] tracking-tight">
                    {nextEpisode.title}
                  </h1>
                </blockquote>
              </TornPaper>
            </div>

            {/* Description if available */}
            {nextEpisode.description && (
              <p className="text-lg sm:text-xl text-[#333333] max-w-2xl mb-12 leading-relaxed">
                {nextEpisode.description}
              </p>
            )}
          </>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          {nextEpisode && (
            <Button 
              asChild
              className="bg-[#1F1F1F] hover:bg-[#111111] text-white px-8 py-6 text-base font-bold tracking-wide transition-all hover:translate-y-[-2px]"
            >
              <Link to={`/register/${episodePath(nextEpisode).split('/').pop()}`}>
                Register for This Episode
              </Link>
            </Button>
          )}
          <Button 
            variant="outline"
            className="border-2 border-[#1F1F1F] text-[#1F1F1F] bg-transparent hover:bg-[#1F1F1F] hover:text-white px-8 py-6 text-base font-bold tracking-wide transition-all"
          >
            See Past Episodes
          </Button>
        </div>
      </div>

      {/* Decorative torn paper element */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
        <TornPaper variant="top" bgColor="#F4F2ED" className="h-full w-full" />
      </div>
    </section>
  );
}
