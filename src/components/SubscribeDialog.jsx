import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SubscribeDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await base44.entities.Attendee.create({
        full_name: formData.name,
        email: formData.email,
        episode_ids: [],
        subscription_type: 'newsletter'
      });

      setStatus('success');
      setFormData({ name: '', email: '' });
      
      setTimeout(() => {
        onOpenChange(false);
        setStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Subscription error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-4 border-[#1F1F1F]">
        {status === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[#111111] mb-2">You're Subscribed!</h3>
            <p className="text-[#666666]">We'll let you know about our next episode.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-[#111111] text-center">
                Subscribe for Updates
              </DialogTitle>
            </DialogHeader>
            <div className="text-center mb-4">
              <p className="text-[#666666]">Get notified about upcoming episodes and never miss a conversation.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-2 border-[#1F1F1F]"
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="border-2 border-[#1F1F1F]"
              />
              {status === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-300 rounded">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700">Something went wrong. Please try again.</p>
                </div>
              )}
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#C0392B] hover:bg-[#A0301B] text-white font-bold py-6"
              >
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Subscribing...</> : 'Subscribe'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}