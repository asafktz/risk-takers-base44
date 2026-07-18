import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import TornPaper from '../components/TornPaper';
import { Loader2, CheckCircle2, AlertCircle, Calendar, Clock, ExternalLink, Mail, PlayCircle, FileText, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { episodeIdFromSlug, episodeJsonLd, episodePath, setSEO } from '@/lib/seo';

export default function Episode() {
  const { episodeSlug } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const episodeId = urlParams.get('episodeId') || episodeIdFromSlug(episodeSlug);

  const { data: episodeData, isLoading: loadingEpisode } = useQuery({
    queryKey: ['episode', episodeId],
    queryFn: async () => {
      if (!episodeId) throw new Error('No episode ID provided');
      
      const [episodes, guests] = await Promise.all([
        base44.entities.Episode.list(),
        base44.entities.Guest.list()
      ]);
      
      const episode = episodes.find(ep => ep.id === episodeId);
      if (!episode) throw new Error('Episode not found');

      const episodeGuests = episode.guest_ids?.map(guestId => 
        guests.find(g => g.id === guestId)
      ).filter(Boolean) || [];

      return { episode, guests: episodeGuests };
    },
    retry: false,
    enabled: !!episodeId
  });

  const [registrationForm, setRegistrationForm] = useState({ name: '', email: '' });
  const [emailSignupForm, setEmailSignupForm] = useState({ email: '' });
  const [registering, setRegistering] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [emailSignupStatus, setEmailSignupStatus] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const episode = episodeData?.episode;
  const guests = episodeData?.guests || [];

  React.useEffect(() => {
    if (!episode) return;
    setSEO({
      title: episode.title,
      description: episode.description || episode.long_description || 'Watch or register for this Risk Takers episode about AI, cybersecurity, governance, and technology risk.',
      path: episodePath(episode),
      image: episode.hero_image,
      type: 'article',
      jsonLd: episodeJsonLd(episode, guests)
    });
  }, [episode, guests]);

  const handleRegistration = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setRegistrationStatus(null);

    try {
      const { data } = await base44.functions.invoke('registerForEvent', {
        name: registrationForm.name,
        email: registrationForm.email,
        episodeId: episodeId
      });

      if (data.success) {
        setRegistrationStatus('success');
        setRegistrationForm({ name: '', email: '' });
      } else {
        setRegistrationStatus('error');
      }
    } catch (error) {
      setRegistrationStatus('error');
    } finally {
      setRegistering(false);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setSigningUp(true);
    setEmailSignupStatus(null);

    try {
      await base44.entities.Attendee.create({
        full_name: emailSignupForm.name || 'Newsletter Subscriber',
        email: emailSignupForm.email,
        episode_ids: [],
        subscription_type: 'newsletter'
      });
      setEmailSignupStatus('success');
      setEmailSignupForm({ email: '' });
    } catch (error) {
      setEmailSignupStatus('error');
    } finally {
      setSigningUp(false);
    }
  };

  if (!episodeId) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#111111] mb-2">Episode Not Found</h2>
            <p className="text-[#666666]">Please provide a valid episode ID.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingEpisode) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#666666]" />
      </div>
    );
  }

  if (!episodeData || !episodeData.episode) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#111111] mb-2">Episode Not Found</h2>
            <p className="text-[#666666]">This episode could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPast = episode.date && new Date(episode.date) < new Date();
  const hasRecording = episode.status === 'recorded' || episode.status === 'published';
  const isUpcoming = (episode.status === 'upcoming' || episode.status === 'live') && !isPast;
  const isEnded = isPast && !hasRecording;

  return (
    <div className="min-h-screen bg-[#E8E6E1]">
      {/* Hero */}
      {episode.hero_image && (
        <div className="w-full h-[400px] relative overflow-hidden">
          <img 
            src={episode.hero_image}
            alt={episode.title}
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#E8E6E1] to-transparent" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 -mt-32 relative z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <TornPaper variant="both" bgColor="#1F1F1F" className="inline-block mb-6" rotate={-0.5}>
            <h1 className="px-8 py-5 text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              {episode.title}
            </h1>
          </TornPaper>

          {episode.date && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-[#111111] mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-bold">{format(new Date(episode.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-bold">{format(new Date(episode.date), 'h:mm a')}</span>
              </div>
            </div>
          )}

          {episode.sponsor_name && (
            <div className="flex justify-center">
              <TornPaper variant="both" bgColor="#FFFFFF" className="inline-block" rotate={0.4}>
                <a
                  href={episode.sponsor_url || undefined}
                  target={episode.sponsor_url ? '_blank' : undefined}
                  rel={episode.sponsor_url ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span className="text-[11px] font-black tracking-[0.18em] text-[#666666] uppercase">
                    Sponsored by
                  </span>
                  {episode.sponsor_logo_url ? (
                    <img src={episode.sponsor_logo_url} alt={episode.sponsor_name} className="h-6 w-auto" />
                  ) : (
                    <span className="text-base font-black text-[#111111]">{episode.sponsor_name}</span>
                  )}
                </a>
              </TornPaper>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="space-y-8">
          {/* Registration Section (Upcoming) */}
          {isUpcoming && (
            <Card className="border-4 border-[#1F1F1F]">
              <CardContent className="p-8 bg-white">
                {registrationStatus === 'success' ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-[#111111] mb-2">You're Registered!</h3>
                    <p className="text-[#666666]">Check your email for confirmation and join link.</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-black text-[#111111] mb-6 text-center">Register for This Episode</h2>
                    <form onSubmit={handleRegistration} className="max-w-md mx-auto space-y-4">
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={registrationForm.name}
                        onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                        required
                        className="border-2 border-[#1F1F1F]"
                      />
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={registrationForm.email}
                        onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                        required
                        className="border-2 border-[#1F1F1F]"
                      />
                      {registrationStatus === 'error' && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-300 rounded">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-sm text-red-700">Registration failed. Please try again.</p>
                        </div>
                      )}
                      <Button
                        type="submit"
                        disabled={registering}
                        className="w-full bg-[#C0392B] hover:bg-[#A0301B] text-white font-bold py-6"
                      >
                        {registering ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Registering...</> : 'Register Now'}
                      </Button>
                      <p className="text-xs text-[#666666] text-center">
                        By registering you agree to receive event emails (confirmation, your join link and reminders). Unsubscribe anytime.
                      </p>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Event Ended — No Recording Yet */}
          {isEnded && (
            <Card className="border-4 border-[#1F1F1F]">
              <CardContent className="p-8 bg-white text-center">
                <div className="w-16 h-16 bg-[#F4F2ED] rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="w-8 h-8 text-[#666666]" />
                </div>
                <h2 className="text-2xl font-black text-[#111111] mb-2">This Event Has Ended</h2>
                <p className="text-[#666666] max-w-md mx-auto">
                  The recording will be available soon. Subscribe below to get notified when it's published.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recording Section (Past Episodes) */}
          {hasRecording && (
            <Card className="border-4 border-[#1F1F1F]">
              <CardContent className="p-8 bg-white">
                <h2 className="text-2xl font-black text-[#111111] mb-6">Watch Recording</h2>
                
                {/* Primary media based on display_media setting */}
                {(episode.display_media === 'recording' || !episode.display_media) && episode.recording_url && (
                  <div className="aspect-video bg-black mb-6 rounded-lg overflow-hidden">
                    <video
                      src={episode.recording_url}
                      controls
                      className="w-full h-full"
                      poster={episode.hero_image}
                    />
                  </div>
                )}

                {episode.display_media === 'youtube' && episode.youtube_link && (
                  <div className="aspect-video bg-black mb-6 rounded-lg overflow-hidden">
                    <iframe
                      src={episode.youtube_link.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allowFullScreen
                      title={episode.title}
                    />
                  </div>
                )}

                {episode.display_media === 'spotify' && episode.spotify_link && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <iframe
                      src={episode.spotify_link.replace('/episode/', '/embed/episode/')}
                      width="100%"
                      height="232"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      title={episode.title}
                    />
                  </div>
                )}

                <div className="flex gap-4 flex-wrap">
                  {episode.spotify_link && (
                    <Button asChild variant="outline" className="border-2 border-[#1F1F1F]">
                      <a href={episode.spotify_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Listen on Spotify
                      </a>
                    </Button>
                  )}
                  {episode.youtube_link && (
                    <Button asChild variant="outline" className="border-2 border-[#1F1F1F]">
                      <a href={episode.youtube_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Watch on YouTube
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card className="border-4 border-[#1F1F1F]">
            <CardContent className="p-8 bg-white">
              <h2 className="text-2xl font-black text-[#111111] mb-4">About This Episode</h2>
              <div className="prose prose-sm max-w-none text-[#333333] whitespace-pre-wrap">
                {episode.long_description || episode.description}
              </div>
            </CardContent>
          </Card>

          {/* Guests */}
          {guests && guests.length > 0 && (
            <Card className="border-4 border-[#1F1F1F]">
              <CardContent className="p-8 bg-white">
                <h2 className="text-2xl font-black text-[#111111] mb-6">Featured Guests</h2>
                <div className="space-y-6">
                  {guests.map((guest) => (
                    <div key={guest.id} className="flex gap-4">
                      {guest.image_url ? (
                        <div className="flex-shrink-0">
                          <TornPaper variant="both" bgColor="#FFFFFF" rotate={0.5}>
                            <div className="p-2">
                              <img 
                                src={guest.image_url}
                                alt={guest.name}
                                className="w-20 h-24 object-cover grayscale hover:grayscale-0 transition-all"
                              />
                            </div>
                          </TornPaper>
                        </div>
                      ) : (
                        <div className="w-20 h-24 bg-[#1F1F1F] flex items-center justify-center text-white font-black text-2xl">
                          {guest.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-black text-lg text-[#111111]">{guest.name}</h3>
                        <p className="text-sm text-[#666666] italic mb-2">{guest.title}</p>
                        {guest.bio && <p className="text-sm text-[#333333]">{guest.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Transcript */}
          {episode.transcript && (
            <Card className="border-4 border-[#1F1F1F]">
              <CardContent className="p-8 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-[#111111]" />
                  <h2 className="text-2xl font-black text-[#111111]">Full Transcript</h2>
                </div>
                <div className="relative">
                  <div
                    className={`prose prose-sm max-w-none text-[#333333] whitespace-pre-wrap leading-relaxed transition-all ${showTranscript ? '' : 'max-h-72 overflow-hidden'}`}
                  >
                    {episode.transcript}
                  </div>
                  {!showTranscript && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowTranscript((v) => !v)}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#C0392B] hover:text-[#A0301B]"
                >
                  {showTranscript ? 'Collapse transcript' : 'Read full transcript'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTranscript ? 'rotate-180' : ''}`} />
                </button>
              </CardContent>
            </Card>
          )}

          {/* Email Signup */}
          <Card className="border-4 border-[#1F1F1F] bg-[#F4F2ED]">
            <CardContent className="p-8">
              {emailSignupStatus === 'success' ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-[#111111] mb-2">Thanks for Subscribing!</h3>
                  <p className="text-[#666666]">You'll be notified about future episodes.</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <Mail className="w-12 h-12 text-[#111111] mx-auto mb-3" />
                    <h2 className="text-2xl font-black text-[#111111] mb-2">Never Miss an Episode</h2>
                    <p className="text-[#666666]">Get notified about upcoming shows and new recordings.</p>
                  </div>
                  <form onSubmit={handleEmailSignup} className="max-w-md mx-auto">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="Your Email"
                        value={emailSignupForm.email}
                        onChange={(e) => setEmailSignupForm({ email: e.target.value })}
                        required
                        className="flex-1 border-2 border-[#1F1F1F]"
                      />
                      <Button 
                        type="submit" 
                        disabled={signingUp}
                        className="bg-[#1F1F1F] hover:bg-[#111111] text-white font-bold"
                      >
                        {signingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe'}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}