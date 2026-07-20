import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TornPaper from '../TornPaper';
import EpisodeCard from './EpisodeCard';
import { format } from 'date-fns';
import { watchSlugForEpisode } from '@/config/liveEvent';

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
        // real per-episode times — the old hardcoded "11:00 AM ET |…" row silently lied whenever a
        // show wasn't in that exact slot (the Jul 22 episode is 12 PM ET, not 11 AM)
        const tzTime = (zone) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: zone }).format(episodeDate);

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
            primary: `${tzTime('America/New_York')} ET | ${tzTime('America/Chicago')} CT | ${tzTime('America/Denver')} MT | ${tzTime('America/Los_Angeles')} PT`,
            international: `${tzTime('Europe/Paris')} CET | ${tzTime('Europe/London')} UK | ${tzTime('Asia/Jerusalem')} Israel`
          },
          isLive: ep.is_live,
          spotify_link: ep.spotify_link,
          youtube_link: ep.youtube_link,
          registration_link: ep.registration_link,
          // resolved here because the raw episode (with linkedin_live_url / event_registration_url)
          // isn't passed down to the card — the card only sees this view model
          watchSlug: watchSlugForEpisode(ep),
          status: ep.status,
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
