import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import TornPaper from '../components/TornPaper';
import { base44 } from '@/api/base44Client';
import { setSEO, organizationJsonLd } from '@/lib/seo';

export default function Contact() {
  React.useEffect(() => {
    setSEO({
      title: 'Contact',
      description: 'Contact the Risk Takers team about episodes, guests, partnerships, sponsorships, and AI or cybersecurity conversations.',
      path: '/contact',
      jsonLd: [organizationJsonLd]
    });
  }, []);

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const { data } = await base44.functions.invoke('submitContactMessage', {
        name: form.name,
        email: form.email,
        message: form.message
      });
      if (data?.error) {
        throw new Error(data.error);
      }
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (submitError) {
      setError('Something went wrong. Please email hello@risktakers.live directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E6E1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
        <div className="text-center mb-12">
          <TornPaper variant="both" bgColor="#1F1F1F" className="inline-block" rotate={-0.5}>
            <h1 className="px-8 py-5 text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              Contact Us
            </h1>
          </TornPaper>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Email */}
          <Card className="border-4 border-[#1F1F1F]">
            <CardContent className="p-8 bg-white flex items-center gap-4">
              <Mail className="w-8 h-8 text-[#1F1F1F] flex-shrink-0" />
              <div>
                <h2 className="font-black text-lg text-[#111111]">Email Us Directly</h2>
                <a href="mailto:hello@risktakers.live" className="text-[#C0392B] hover:underline font-medium">
                  hello@risktakers.live
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="border-4 border-[#1F1F1F]">
            <CardContent className="p-8 bg-white">
              {sent ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-[#111111] mb-2">Message Sent!</h3>
                  <p className="text-[#666666]">We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-[#111111] mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      placeholder="Your Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="border-2 border-[#1F1F1F]"
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="border-2 border-[#1F1F1F]"
                    />
                    <Textarea
                      placeholder="Your Message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                      rows={5}
                      className="border-2 border-[#1F1F1F]"
                    />
                    {error && (
                      <p className="text-[#C0392B] text-sm font-medium">{error}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-[#1F1F1F] hover:bg-[#111111] text-white font-bold py-6"
                    >
                      {sending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</> : 'Send Message'}
                    </Button>
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
