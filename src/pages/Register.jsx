import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import TornPaper from '../components/TornPaper';
import { Loader2, CheckCircle2, AlertCircle, Calendar, Clock, Users, Linkedin } from 'lucide-react';
import { format } from 'date-fns';
import { episodeIdFromSlug, episodePath, setSEO } from '@/lib/seo';
import { SHOWRUNNER_ORIGIN, showrunnerSlugFromUrl } from '@/config/liveEvent';

export default function Register() {
  const { episodeSlug } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const episodeId = urlParams.get('episodeId') || episodeIdFromSlug(episodeSlug);

  const { data: episodeData, isLoading: loadingEpisode } = useQuery({
    queryKey: ['episode', episodeId],
    queryFn: async () => {
      if (!episodeId) return null;
      const episodes = await base44.entities.Episode.list();
      const episode = episodes.find(ep => ep.id === episodeId);
      
      if (!episode) return null;

      // Fetch guests
      const guests = await base44.entities.Guest.list();
      const episodeGuests = episode.guest_ids?.map(guestId => 
        guests.find(g => g.id === guestId)
      ).filter(Boolean) || [];

      return { episode, guests: episodeGuests };
    },
    enabled: !!episodeId
  });

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const episode = episodeData?.episode;
  const guests = episodeData?.guests || [];

  const isLinkedInLive = episode?.platform === 'linkedin_live';
  // Showrunner-produced episode → embed its REAL registration widget instead of this local form.
  const srSlug = showrunnerSlugFromUrl(episode?.event_registration_url);

  React.useEffect(() => {
    if (!episode) return;
    setSEO({
      title: `Register: ${episode.title}`,
      description: episode.description || 'Register for this Risk Takers live episode about AI, cybersecurity, governance, and technology risk.',
      path: `/register/${episodePath(episode).split('/').pop()}`,
      image: episode.hero_image,
      noindex: true
    });
  }, [episode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setMessage('');

    try {
      const { data } = await base44.functions.invoke('registerForEvent', {
        name: formData.name,
        email: formData.email,
        episodeId: episodeId
      });

      if (data.success) {
        setStatus('success');
        if (isLinkedInLive) {
          setMessage('You\'re registered! Join us on LinkedIn Live.');
          setJoinLink(episodeData.episode.linkedin_live_url || '');
        } else {
          setMessage('Successfully registered! Check your email for confirmation.');
          setJoinLink(data.data?.[0]?.join_link || '');
        }
        setFormData({ name: '', email: '' });
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!episodeId) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#111111] mb-2">Missing Episode ID</h2>
            <p className="text-[#666666]">Please provide an episode ID in the URL to register for an event.</p>
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
            <p className="text-[#666666]">The episode you're trying to register for could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E6E1]">
      {/* Hero Section */}
      {episode.hero_image && (
        <div className="w-full h-[400px] relative overflow-hidden">
          <img 
            src={episode.hero_image}
            alt={episode.title}
            className="w-full h-full object-cover grayscale"
            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#E8E6E1] to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 -mt-32 relative z-10">
        {/* Episode Title */}
        <div className="text-center mb-8">
          <TornPaper 
            variant="both" 
            bgColor="#1F1F1F" 
            className="inline-block mb-6"
            rotate={-0.5}
          >
            <h1 className="px-8 py-5 text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              {episode.title}
            </h1>
          </TornPaper>

          {/* Date & Time */}
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
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Episode Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Long Description */}
            {episode.long_description && (
              <Card className="border-4 border-[#1F1F1F]">
                <CardContent className="p-6 bg-white">
                  <h2 className="text-2xl font-black text-[#111111] mb-4">About This Episode</h2>
                  <div className="prose prose-sm max-w-none text-[#333333] whitespace-pre-wrap">
                    {episode.long_description}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guests */}
            {guests && guests.length > 0 && (
              <Card className="border-4 border-[#1F1F1F]">
                <CardContent className="p-6 bg-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-6 h-6" />
                    <h2 className="text-2xl font-black text-[#111111]">Featured Guests</h2>
                  </div>
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
          </div>

          {/* Right Column - Registration Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="border-4 border-[#1F1F1F] shadow-2xl">
                <CardContent className={srSlug ? 'p-0' : 'p-6 bg-white'}>
                  {srSlug ? (
                    // The REAL Showrunner signup widget — same form/pipeline as every other
                    // Showrunner registration; it handles its own submit, consent and confirmation.
                    <iframe
                      key={srSlug}
                      src={`${SHOWRUNNER_ORIGIN}/widget/${srSlug}`}
                      title="Register — powered by Showrunner"
                      className="w-full block"
                      style={{ height: 440, border: 0 }}
                    />
                  ) : status === 'success' ? (
                    <div className="text-center py-4">
                      <div className="mb-4 flex justify-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-[#111111] mb-2">You're Registered!</h3>
                      <p className="text-sm text-[#666666] mb-4">{message}</p>
                      {joinLink && (
                        <a 
                          href={joinLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center gap-2 w-full font-bold px-6 py-3 rounded transition-colors ${
                            isLinkedInLive 
                              ? 'bg-[#0A66C2] hover:bg-[#004182] text-white' 
                              : 'bg-[#C0392B] hover:bg-[#A0301B] text-white'
                          }`}
                        >
                          {isLinkedInLive && <Linkedin className="w-5 h-5" />}
                          {isLinkedInLive ? 'Join on LinkedIn' : 'Join Event'}
                        </a>
                      )}
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-black text-[#111111] mb-4">
                        {isLinkedInLive ? 'Register & Get the Link' : 'Reserve Your Spot'}
                      </h3>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Input
                            type="text"
                            placeholder="Full Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="border-2 border-[#1F1F1F] focus:border-[#C0392B]"
                          />
                        </div>

                        <div>
                          <Input
                            type="email"
                            placeholder="Email Address *"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="border-2 border-[#1F1F1F] focus:border-[#C0392B]"
                          />
                        </div>

                        {status === 'error' && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 border-2 border-red-300 rounded text-sm">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700">{message}</p>
                          </div>
                        )}

                        <Button 
                          type="submit" 
                          disabled={loading}
                          className={`w-full font-bold py-6 ${
                            isLinkedInLive 
                              ? 'bg-[#0A66C2] hover:bg-[#004182] text-white' 
                              : 'bg-[#C0392B] hover:bg-[#A0301B] text-white'
                          }`}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Registering...
                            </>
                          ) : (
                            <span className="flex items-center gap-2">
                              {isLinkedInLive && <Linkedin className="w-5 h-5" />}
                              Register Now
                            </span>
                          )}
                        </Button>

                        <p className="text-xs text-center text-[#666666]">
                          Free event • {isLinkedInLive ? 'Live on LinkedIn' : 'You\'ll receive a confirmation email'}
                        </p>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
