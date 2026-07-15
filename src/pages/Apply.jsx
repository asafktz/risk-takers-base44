import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import TornPaper from '../components/TornPaper';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { setSEO } from '@/lib/seo';

export default function Apply() {
  React.useEffect(() => {
    setSEO({
      title: 'Apply to Be a Guest',
      description: 'Apply to be a guest on Risk Takers and share practical experience with AI adoption, cybersecurity, governance, or risk.',
      path: '/apply'
    });
  }, []);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    linkedin_url: '',
    title: '',
    topic_pitch: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!form.linkedin_url.includes('linkedin.com')) {
      setError('Please provide a valid LinkedIn URL.');
      setSubmitting(false);
      return;
    }

    await base44.entities.GuestApplication.create(form);
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#E8E6E1] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-4 border-[#1F1F1F]">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-[#111111] mb-2">Application Received!</h2>
            <p className="text-[#666666]">
              Thanks for applying to be a guest on Risk Takers. We'll review your application and get back to you soon.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E6E1] py-12 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <TornPaper variant="both" bgColor="#1F1F1F" className="inline-block mb-6" rotate={-0.5}>
            <h1 className="px-8 py-5 text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Apply to Be a Guest
            </h1>
          </TornPaper>
          <p className="text-lg text-[#333333] max-w-xl mx-auto">
            Have a story about navigating AI risk, cybersecurity challenges, or bold technology decisions? We'd love to hear from you.
          </p>
        </div>

        <Card className="border-4 border-[#1F1F1F]">
          <CardContent className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="full_name" className="text-[#111111] font-bold">Full Name *</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  className="mt-1 border-2 border-[#E5E3DE]"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[#111111] font-bold">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="mt-1 border-2 border-[#E5E3DE]"
                />
              </div>

              <div>
                <Label htmlFor="linkedin_url" className="text-[#111111] font-bold">LinkedIn Profile URL *</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  required
                  className="mt-1 border-2 border-[#E5E3DE]"
                />
              </div>

              <div>
                <Label htmlFor="title" className="text-[#111111] font-bold">Professional Title & Company</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., CISO @ Acme Corp"
                  className="mt-1 border-2 border-[#E5E3DE]"
                />
              </div>

              <div>
                <Label htmlFor="topic_pitch" className="text-[#111111] font-bold">What would you like to talk about?</Label>
                <Textarea
                  id="topic_pitch"
                  value={form.topic_pitch}
                  onChange={(e) => setForm({ ...form, topic_pitch: e.target.value })}
                  placeholder="Share the topics, experiences, or perspectives you'd bring to the show..."
                  rows={4}
                  className="mt-1 border-2 border-[#E5E3DE]"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-300 rounded text-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C0392B] hover:bg-[#A0301B] text-white font-bold py-6 text-lg"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  'Submit Application'
                )}
              </Button>

              <p className="text-xs text-center text-[#666666]">
                We review every application and will reach out if it's a fit.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
