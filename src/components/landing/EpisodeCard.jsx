import React from 'react';
import { Link } from 'react-router-dom';
import { episodePath } from '@/lib/seo';
import TornPaper from '../TornPaper';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Globe } from 'lucide-react';

export default function EpisodeCard({ episode }) {
  const {
    title,
    guest,
    guests,
    guestTitle,
    guestImage,
    description,
    date,
    times,
    isLive,
    spotify_link,
    youtube_link
  } = episode;

  const hasRecording = spotify_link || youtube_link;

  return (
    <div className="relative">
      {isLive && (
        <div className="absolute -top-3 -right-3 z-10">
          <TornPaper variant="both" bgColor="#C0392B" rotate={3}>
            <span className="block px-3 py-1 text-xs font-black text-white tracking-widest uppercase">
              LIVE
            </span>
          </TornPaper>
        </div>
      )}

      <TornPaper variant="both" bgColor="#FFFFFF" className="h-full">
        <div className="p-6 sm:p-8">
          {guests ? (
            <div className="mb-6">
              <p className="text-sm text-[#666666] mb-3">with</p>
              <div className="flex gap-4 flex-wrap">
                {guests.map((g, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-sm bg-[#E5E3DE]">
                      {g.image ? (
                        <img
                          src={g.image}
                          alt={g.name}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-black text-[#666666]">
                          {g.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="pt-1">
                      <h4 className="text-base font-black text-[#111111]">{g.name}</h4>
                      {g.title && (
                        <p className="text-xs text-[#666666] mt-1">{g.title}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-5 mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-sm bg-[#E5E3DE]">
                {guestImage ? (
                  <img
                    src={guestImage}
                    alt={guest}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-[#666666]">
                    {guest?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="pt-1">
                <p className="text-sm text-[#666666] mb-1">with</p>
                <h4 className="text-xl font-black text-[#111111]">{guest}</h4>
                {guestTitle && (
                  <p className="text-sm text-[#666666] mt-1">{guestTitle}</p>
                )}
              </div>
            </div>
          )}

          <TornPaper variant="both" bgColor="#F4F2ED" className="mb-5" rotate={-0.3}>
            <h3 className="px-4 py-3 text-lg sm:text-xl font-black text-[#111111] leading-snug">
              "{title}"
            </h3>
          </TornPaper>

          <p className="text-[#333333] mb-6 leading-relaxed">
            {description}
          </p>

          <div className="space-y-2 text-sm text-[#666666] mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{times.primary}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{times.international}</span>
            </div>
          </div>

          <Button
            asChild
            className="w-full bg-[#1F1F1F] hover:bg-[#111111] text-white font-bold py-5 transition-all hover:translate-y-[-2px]"
          >
            <Link to={episodePath(episode)}>
              {isLive ? 'Register Live' : hasRecording ? 'View Episode' : 'Learn More'}
            </Link>
          </Button>
        </div>
      </TornPaper>
    </div>
  );
}
