import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import TornPaper from '../components/TornPaper';
import { Loader2, Calendar, Clock, Globe, ExternalLink } from 'lucide-react';
import { setSEO } from '@/lib/seo';

export default function RegisterWebinar() {
  React.useEffect(() => {
    setSEO({
      title: 'Show Registration',
      description: 'Legacy Risk Takers show registration page.',
      path: '/RegisterWebinar',
      noindex: true
    });
  }, []);

  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [joinLink, setJoinLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await base44.functions.invoke('registerWebinar', {
        name: formData.name,
        email: formData.email
      });
      
      // Handle both array and object responses
      if (data?.join_link) {
        setJoinLink(data.join_link);
      } else if (Array.isArray(data) && data.length > 0 && data[0]?.join_link) {
        setJoinLink(data[0].join_link);
      } else {
        console.error('Unexpected response format:', data);
        setError(`Registration failed. Response: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(`Unable to register. Please check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E6E1]">
      {/* Hero Banner */}
      <div className="bg-[#1F1F1F] py-4 px-4">
        <div className="max-w-5xl mx-auto">
          <TornPaper variant="both" bgColor="#F1C40F" className="inline-block" rotate={-1}>
            <span className="block px-4 py-2 text-xs font-bold tracking-[0.2em] text-[#1F1F1F] uppercase">
              Live Show • January 20, 2026
            </span>
          </TornPaper>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-sm font-bold tracking-[0.2em] text-[#666666] uppercase mb-4">
            Risk Takers Show Series
          </h1>
          
          <TornPaper variant="both" bgColor="#FFFFFF" className="inline-block mb-8" rotate={0.5}>
            <h2 className="px-8 py-6 text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] leading-tight max-w-3xl">
              "AI Security / Securing the Use of AI Is Going to{' '}
              <span className="text-[#C0392B]">Kill Me.</span>"
            </h2>
          </TornPaper>

          <p className="text-lg text-[#333333] max-w-2xl mx-auto">
            A conversation about IDEsaster, agentic risk, authorization, MCP, and what security leaders are learning the hard way.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Episode Details */}
          <div className="lg:col-span-3 space-y-8">
            {/* Date & Time Card */}
            <Card className="border-4 border-[#1F1F1F]">
              <CardContent className="p-6 bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#C0392B]" />
                    <span className="font-bold text-[#111111]">Tuesday, January 20, 2026</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#C0392B]" />
                    <span className="text-[#333333]">11:00 AM ET | 10:00 AM CT | 9:00 AM MT | 8:00 AM PT</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#C0392B]" />
                    <span className="text-[#333333]">5:00 PM CET | 4:00 PM UK | 6:00 PM Israel</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Description */}
            <Card className="border-4 border-[#1F1F1F]">
              <CardContent className="p-6 bg-white">
                <h3 className="text-xl font-black text-[#111111] mb-4">About This Session</h3>
                <div className="space-y-4 text-[#333333]">
                  <p>
                    When AI agents can write code, run tools, and take action, security changes fast. In this Risk Takers session, Asaf Katz sits down with Rock Lambros to explore the real risks emerging inside the IDE—and what actually works in practice.
                  </p>
                  <p className="font-medium text-[#111111]">Together, they'll dig into questions like:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex gap-2">
                      <span className="text-[#C0392B] font-bold">•</span>
                      <span>When AI can act, what actually stops it?</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#C0392B] font-bold">•</span>
                      <span>What does "authorization" really mean for AI agents?</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#C0392B] font-bold">•</span>
                      <span>Can NIST CSF keep up with agentic AI?</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#C0392B] font-bold">•</span>
                      <span>What breaks first when MCP goes live?</span>
                    </li>
                  </ul>
                  <p className="italic text-[#666666]">
                    A practical, no-hype conversation for security leaders, builders, and anyone navigating large-scale AI adoption.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Guests */}
            <Card className="border-4 border-[#1F1F1F]">
              <CardContent className="p-6 bg-white">
                <h3 className="text-xl font-black text-[#111111] mb-6">Featuring</h3>
                <div className="space-y-6">
                  {/* Rock Lambros */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <TornPaper variant="both" bgColor="#FFFFFF" rotate={0.5}>
                        <div className="p-1">
                          <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b5a111214c1e0b6066ef6/4b083dcf7_rocklambrose.jpg"
                            alt="Rock Lambros"
                            className="w-24 h-28 object-cover grayscale hover:grayscale-0 transition-all"
                          />
                        </div>
                      </TornPaper>
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-[#111111]">Rock Lambros</h4>
                      <p className="text-sm text-[#C0392B] font-medium mb-2">CEO @ RockCyber | AI & Cybersecurity CxO Advisor</p>
                      <p className="text-sm text-[#666666]">CEO of RockCyber and AI & Cybersecurity CxO Advisor</p>
                    </div>
                  </div>

                  {/* Ari Marzuk */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <TornPaper variant="both" bgColor="#FFFFFF" rotate={-0.5}>
                        <div className="p-1">
                          <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b5a111214c1e0b6066ef6/57d57f231_arimarzuk.jpg"
                            alt="Ari Marzuk"
                            className="w-24 h-28 object-cover grayscale hover:grayscale-0 transition-all"
                          />
                        </div>
                      </TornPaper>
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-[#111111]">Ari Marzuk</h4>
                      <p className="text-sm text-[#C0392B] font-medium mb-2">Senior AI Security Researcher</p>
                      <p className="text-sm text-[#666666]">Senior AI Security Researcher</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Registration Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <Card className="border-4 border-[#1F1F1F] shadow-2xl">
                <CardContent className="p-6 bg-white">
                  {joinLink ? (
                    <div className="text-center py-4">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-[#111111] mb-2">You're Registered!</h3>
                      <p className="text-sm text-[#666666] mb-4">Check your email for confirmation details.</p>
                      
                      <div className="mb-6 p-3 bg-[#F4F2ED] border-2 border-[#E5E3DE] rounded">
                        <p className="text-xs text-[#666666] mb-2 font-medium">Your Join Link:</p>
                        <div className="flex items-center gap-2 p-2 bg-white border border-[#E5E3DE] rounded">
                          <input 
                            type="text" 
                            readOnly 
                            value={joinLink}
                            className="flex-1 text-xs text-[#333333] bg-transparent border-none outline-none"
                            onClick={(e) => e.target.select()}
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(joinLink);
                            }}
                            className="text-[#666666] hover:text-[#111111] text-xs font-medium"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <a 
                        href={joinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 w-full justify-center bg-[#C0392B] hover:bg-[#A0301B] text-white font-bold px-6 py-4 rounded transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Join Event
                      </a>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-black text-[#111111] mb-2">Reserve Your Spot</h3>
                      <p className="text-sm text-[#666666] mb-6">Free event • Limited seats available</p>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="border-2 border-[#1F1F1F] focus:border-[#C0392B] py-5"
                          />
                        </div>

                        <div>
                          <Input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="border-2 border-[#1F1F1F] focus:border-[#C0392B] py-5"
                          />
                        </div>

                        {error && (
                          <div className="p-3 bg-red-50 border-2 border-red-300 rounded text-sm text-red-700">
                            {error}
                          </div>
                        )}

                        <Button 
                          type="submit" 
                          disabled={loading}
                          className="w-full bg-[#C0392B] hover:bg-[#A0301B] text-white font-bold py-6 text-lg"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Registering...
                            </>
                          ) : (
                            'Register Now'
                          )}
                        </Button>

                        <p className="text-xs text-center text-[#666666]">
                          You'll receive a confirmation email with your unique join link.
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