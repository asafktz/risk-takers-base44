import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { episodePath, setSEO, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import { watchSlugForEpisode } from '@/config/liveEvent';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, PlayCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import TornPaper from '@/components/TornPaper';

export default function PreviousEpisodes() {
  React.useEffect(() => {
    setSEO({
      title: 'Previous Episodes',
      description: 'Watch past Risk Takers episodes about AI security, governance, cybersecurity risk, and real-world AI adoption.',
      path: '/episodes',
      jsonLd: [organizationJsonLd, websiteJsonLd]
    });
  }, []);

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ['previousEpisodes'],
    queryFn: async () => {
      const all = await base44.entities.Episode.list('-date');
      return all.filter(ep => ep.status === 'recorded' || ep.status === 'published');
    }
  });

  const { data: guests = [] } = useQuery({
    queryKey: ['guests'],
    queryFn: () => base44.entities.Guest.list()
  });

  const getGuestNames = (guestIds) => {
    if (!guestIds || guestIds.length === 0) return null;
    return guestIds
      .map(id => guests.find(g => g.id === id))
      .filter(Boolean)
      .map(g => g.name)
      .join(', ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#666666]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E6E1]">
      <div className="bg-[#1F1F1F] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 text-center">
          <TornPaper variant="both" bgColor="#F1C40F" className="inline-block mb-4" rotate={-0.5}>
            <span className="px-4 py-1 text-xs font-black tracking-[0.2em] text-[#1F1F1F] uppercase block">
              Archive
            </span>
          </TornPaper>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Previous Episodes
          </h1>
          <p className="text-[#AAAAAA] mt-4 text-lg max-w-xl mx-auto">
            Watch past episodes with real stories, real tradeoffs, and practical playbooks.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        {episodes.length === 0 ? (
          <div className="text-center py-16">
            <PlayCircle className="w-16 h-16 text-[#999] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#333]">No recordings available yet</h2>
            <p className="text-[#666] mt-2">Check back soon for past episode recordings.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {episodes.map((episode) => {
              const guestNames = getGuestNames(episode.guest_ids);
              // Showrunner-produced episodes have a watch destination on our own domain.
              // The card body still goes to the episode page; this is the direct route to the show.
              const watchSlug = watchSlugForEpisode(episode);
              const isRecorded = episode.status === 'recorded' || episode.status === 'published';
              const watchLabel = episode.is_live || episode.status === 'live'
                ? 'Watch live'
                : isRecorded ? 'Watch replay' : 'Register & watch';
              return (
                <Card key={episode.id} className="border-2 border-[#1F1F1F] hover:shadow-lg transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {episode.hero_image && (
                        <Link to={episodePath(episode)} className="sm:w-64 h-48 sm:h-auto flex-shrink-0 block">
                          <img
                            src={episode.hero_image}
                            alt={episode.title}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                          />
                        </Link>
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-center">
                        <Link to={episodePath(episode)} className="block">
                          <div className="flex items-center gap-2 mb-2">
                            <PlayCircle className="w-5 h-5 text-[#C0392B]" />
                            <span className="text-xs font-bold text-[#C0392B] uppercase tracking-wide">
                              {episode.display_media === 'recording' ? 'Recording' : episode.display_media === 'spotify' ? 'Podcast' : 'Video'}
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-[#111] mb-2">
                            {episode.title}
                          </h2>
                          {episode.date && (
                            <div className="flex items-center gap-2 text-[#666] text-sm mb-2">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(episode.date), 'MMMM d, yyyy')}</span>
                            </div>
                          )}
                          {guestNames && (
                            <p className="text-sm text-[#555] mb-2">
                              <span className="font-semibold">Featuring:</span> {guestNames}
                            </p>
                          )}
                          {episode.description && (
                            <p className="text-sm text-[#666] line-clamp-2">{episode.description}</p>
                          )}
                          {episode.sponsor_name && (
                            <p className="text-xs text-[#888] mt-2 uppercase tracking-wide">
                              Sponsored by <span className="font-bold text-[#555]">{episode.sponsor_name}</span>
                            </p>
                          )}
                        </Link>
                        {watchSlug && (
                          <div className="mt-4">
                            <Link
                              to={`/watch/${watchSlug}`}
                              className="inline-flex items-center gap-2 bg-[#C0392B] hover:bg-[#A0301B] text-white text-xs font-black uppercase tracking-wide px-4 py-2 rounded-none transition-colors"
                            >
                              <PlayCircle className="w-4 h-4" />
                              {watchLabel}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
