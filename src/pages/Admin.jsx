import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/lib/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EpisodesManager from '../components/admin/EpisodesManager';
import GuestsManager from '../components/admin/GuestsManager';
import AIEpisodeCreator from '../components/admin/AIEpisodeCreator';
import SubmissionsManager from '../components/admin/SubmissionsManager';
import { setSEO } from '@/lib/seo';

const ADMIN_TAB_CLASS = 'border-2 border-[#D4D0C8] bg-white px-4 py-2 data-[state=active]:border-[#1F1F1F] data-[state=active]:bg-[#F1C40F]';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await base44.auth.signInWithEmail(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send the login link.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F2ED] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border-2 border-[#1F1F1F] rounded-lg p-8">
        <h1 className="text-2xl font-black text-[#111111] mb-1">Risk Takers Admin</h1>
        <p className="text-sm text-[#666666] mb-6">Sign in with a magic link.</p>
        {sent ? (
          <div className="text-sm text-[#333333]">
            ✅ Check <strong>{email}</strong> for a sign-in link. Open it on this device to continue.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-[#E5E3DE] rounded px-3 py-2 text-sm focus:border-[#1F1F1F] outline-none"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#1F1F1F] text-white font-bold py-2 rounded hover:bg-[#111111] disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send magic link'}
            </button>
            {error && <p className="text-sm text-[#C0392B]">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSEO({ title: 'Admin', description: 'Risk Takers admin dashboard.', path: '/Admin', noindex: true });
  }, []);

  const loadUser = () => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUser();
    // Re-check when the magic-link session is established after redirect.
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      loadUser();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F2ED] flex items-center justify-center">
        <p className="text-[#666666]">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (user.role !== 'admin' && user.role !== 'producer') {
    return (
      <div className="min-h-screen bg-[#F4F2ED] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-black text-[#C0392B] mb-4">Access Denied</h1>
          <p className="text-[#666666] mb-4">{user.email} is not an admin.</p>
          <button onClick={() => base44.auth.logout()} className="text-sm underline text-[#666666]">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2ED] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-[#111111] mb-2">Admin Dashboard</h1>
            <p className="text-[#666666]">Manage content and review each operational workflow in its own context</p>
          </div>
          <button onClick={() => base44.auth.logout()} className="text-sm underline text-[#666666] mt-2">Sign out</button>
        </div>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="mb-8 flex h-auto w-full flex-wrap justify-start gap-2 rounded-none bg-transparent p-0">
            <TabsTrigger className={ADMIN_TAB_CLASS} value="ai">🤖 AI Creator</TabsTrigger>
            <TabsTrigger className={ADMIN_TAB_CLASS} value="episodes">📺 Episodes</TabsTrigger>
            <TabsTrigger className={ADMIN_TAB_CLASS} value="guests">👥 Guest directory</TabsTrigger>
            <TabsTrigger className={ADMIN_TAB_CLASS} value="registrations">🎟️ Event registrations</TabsTrigger>
            <TabsTrigger className={ADMIN_TAB_CLASS} value="vendor-applications">🏢 Vendor applications</TabsTrigger>
            <TabsTrigger className={ADMIN_TAB_CLASS} value="guest-applications">🎙️ Guest applications</TabsTrigger>
            <TabsTrigger className={ADMIN_TAB_CLASS} value="guest-intake">📝 Guest intake</TabsTrigger>
            <TabsTrigger className={ADMIN_TAB_CLASS} value="leads">📬 Leads &amp; inquiries</TabsTrigger>
            <TabsTrigger className={ADMIN_TAB_CLASS} value="privacy">🔒 Privacy choices</TabsTrigger>
          </TabsList>

          <TabsContent value="ai"><AIEpisodeCreator /></TabsContent>
          <TabsContent value="episodes"><EpisodesManager /></TabsContent>
          <TabsContent value="guests"><GuestsManager /></TabsContent>
          <TabsContent value="registrations">
            <SubmissionsManager
              sourceIds={['registrations']}
              title="Event registrations"
              description="Registrations and subscriptions are kept separate from applications and lead forms."
            />
          </TabsContent>
          <TabsContent value="vendor-applications">
            <SubmissionsManager
              sourceIds={['vendors']}
              title="Vendor applications"
              description="Commercial vendor applications, presenter details, and qualification context."
            />
          </TabsContent>
          <TabsContent value="guest-applications">
            <SubmissionsManager
              sourceIds={['guest-applications']}
              title="Guest applications"
              description="Prospective guests and their topic pitches, before any guest intake process begins."
            />
          </TabsContent>
          <TabsContent value="guest-intake">
            <SubmissionsManager
              sourceIds={['guest-intakes']}
              title="Guest intake"
              description="Confirmed guest profile, publishing, contact, and logistics details—not guest applications."
            />
          </TabsContent>
          <TabsContent value="leads">
            <SubmissionsManager
              sourceIds={['sponsorships', 'contact', 'ai-defense']}
              title="Leads &amp; inquiries"
              description="Inbound business and event inquiries, separated by their original source and purpose."
            />
          </TabsContent>
          <TabsContent value="privacy">
            <SubmissionsManager
              sourceIds={['privacy']}
              title="Privacy choices"
              description="Consent and opt-out records remain separate from operational applications and registrations."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
