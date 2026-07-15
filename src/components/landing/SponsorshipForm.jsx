import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function SponsorshipForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.functions.invoke('submitSponsorshipLead', formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <h3 className="text-2xl font-black text-[#111111] mb-4">
          Thank you!
        </h3>
        <p className="text-[#333333]">
          We've received your inquiry and will get back to you within 2-3 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="bg-[#F4F2ED] border-[#1F1F1F] text-[#111111] placeholder:text-[#666666]"
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="bg-[#F4F2ED] border-[#1F1F1F] text-[#111111] placeholder:text-[#666666]"
        />
      </div>
      <div>
        <Input
          placeholder="Company Name"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          required
          className="bg-[#F4F2ED] border-[#1F1F1F] text-[#111111] placeholder:text-[#666666]"
        />
      </div>
      <div>
        <Textarea
          placeholder="Tell us about your company and why you're interested in sponsoring Risk Takers..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="bg-[#F4F2ED] border-[#1F1F1F] text-[#111111] placeholder:text-[#666666] min-h-[120px]"
        />
      </div>
      <Button 
        type="submit"
        disabled={loading}
        className="w-full bg-[#1F1F1F] hover:bg-[#111111] text-white font-bold py-5 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Inquiry'
        )}
      </Button>
    </form>
  );
}