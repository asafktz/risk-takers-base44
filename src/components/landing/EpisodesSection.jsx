import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TornPaper from '../TornPaper';
import EpisodeCard from './EpisodeCard';
import { format } from 'date-fns';

export default function EpisodesSection() {
  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['episodes'],
    queryFn: async () => {
      const episodesData = await base44.entities.Episode.list('-date');
      const guestsData = await base44.entities.Guest.list();
      
      // Map episodes with their guests
      return episodesData.map(ep => {
        const episodeGuests = ep.guest_ids?.map(guestId => 
          guestsData.find(g => g.id === guestId)
        ).filter(Boolean) || [];
        
        const episodeDate = new Date(ep.date);
        
        return {
          id: ep.id,
          title: ep.title,
          guests: episodeGuests.map(g => ({
            name: g.name,
            title: g.title,
            image: g.image_url
          })),
          description: ep.description,
          date: format(episodeDate, 'EEE, d MMM'),
          times: {
            primary: "11:00 AM ET | 10:00 AM CT | 9:00 AM MT | 8:00 AM PT",
            international: "5:00 PM CET | 4:00 PM UK | 6:00 PM Israel"
          },
          isLive: ep.is_live,
          spotify_link: ep.spotify_link,
          youtube_link: ep.youtube_link,
          registration_link: ep.registration_link,
          date_raw: ep.date
        };
      });
    }
  });

  if (isLoading) {
    return (
      <section className="py-20 px-4 sm:px-8 bg-[#E8E6E1]">
        <div className="max-w-6xl mx-auto text-center text-[#666666]">
          Loading episodes...
        </div>
      </section>
    );
  }
  return (
    <section className="py-20 px-4 sm:px-8 bg-[#E8E6E1]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <TornPaper 
            variant="both" 
            bgColor="#1F1F1F" 
            className="inline-block"
            rotate={0.5}
          >
            <h2 className="px-8 py-5 text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Episodes
            </h2>
          </TornPaper>
        </div>

        {/* Episodes grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {episodes.map((episode, index) => (
            <EpisodeCard key={index} episode={episode} />
          ))}
        </div>
      </div>
    </section>
  );
}
