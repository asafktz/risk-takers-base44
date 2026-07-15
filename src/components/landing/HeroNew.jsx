import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { episodePath } from '@/lib/seo';
import { Button } from '@/components/ui/button';


export default function HeroNew() {
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
    <section className="relative bg-[#1F1F1F] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center">
          
          {/* Text block — full width */}
          <div>
            <div className="inline-block bg-[#F1C40F] px-3 py-1 mb-6">
              <span className="text-xs font-black tracking-[0.2em] text-[#1F1F1F] uppercase">
                Live Show Series
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              RISK<br />TAKERS
            </h1>

            <p className="text-lg sm:text-xl text-[#AAAAAA] max-w-xl mx-auto mb-8 leading-relaxed">
              What really happens when AI moves from "pilot" to "production" across a company. Real stories, real tradeoffs, and practical playbooks.
            </p>

            <div className="space-y-2 mb-10">
              <p className="text-white font-bold text-base">No hype.</p>
              <p className="text-white font-bold text-base">No vendor pitches.</p>
              <p className="text-[#F1C40F] font-black text-lg">Just real stories, real tradeoffs, and practical playbooks.</p>
            </div>

            <p className="text-sm text-[#AAAAAA] font-medium mb-6">
              🎉 Thank you <span className="text-white font-bold">2,000 attendees</span> in our events since January!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {nextEpisode && (
                <Button
                  asChild
                  className="bg-[#F1C40F] hover:bg-[#D4AC0D] text-[#1F1F1F] px-8 py-6 text-base font-bold tracking-wide transition-all hover:translate-y-[-2px]"
                >
                  <Link to={`/register/${episodePath(nextEpisode).split('/').pop()}`}>
                    Register for Next Episode
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                className="border-2 border-[#555] text-white bg-transparent hover:bg-[#333] hover:text-white px-8 py-6 text-base font-bold tracking-wide transition-all"
                onClick={() => {
                  const el = document.getElementById('episodes');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Episodes
              </Button>
            </div>
          </div>

          {/* Live show embed — full width below */}
          <div className="w-full mt-12">
            <iframe
              src="https://webinar-show.vercel.app/embed/building-resilient-systems-insig-s1pc"
              width="100%"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full rounded-xl"
              style={{ border: 0, height: '70vh' }}
              title="Risk Takers live show"
            />
          </div>
        </div>
      </div>

      {/* Bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#F4F2ED]" 
        style={{ clipPath: 'polygon(0 40%, 2% 60%, 5% 30%, 8% 55%, 12% 25%, 15% 50%, 20% 35%, 25% 55%, 30% 30%, 35% 50%, 40% 25%, 45% 55%, 50% 35%, 55% 60%, 60% 30%, 65% 50%, 70% 25%, 75% 55%, 80% 35%, 85% 50%, 90% 30%, 95% 55%, 100% 40%, 100% 100%, 0 100%)' }}
      />
    </section>
  );
}