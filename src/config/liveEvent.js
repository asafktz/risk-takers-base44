// The CURRENT featured live show — drives /watch/<publicSlug> deep links and the site-wide mini player.
// Swap these three values when a new episode goes on the calendar.
export const LIVE_EVENT = {
  // the public event slug on Showrunner (what /watch/:slug and invite links carry)
  publicSlug: 'the-human-operating-system-is-the-new-attack-surface-with-ev',
  // the internal LiveKit room slug — used only for the lightweight "is it live yet?" poll
  roomSlug: 'unpopular-opinion-using-ai-to-cu-a0fq',
  title: 'The Human Operating System is the New Attack Surface — with Eva Benn',
};

export const SHOWRUNNER_ORIGIN = 'https://webinar-show.vercel.app';

// An episode produced on Showrunner carries its signup page in event_registration_url
// (…/e/<slug>). Extract the slug so pages can embed Showrunner's OWN registration widget
// (/widget/<slug>) instead of a hand-built form — one real signup surface, not a lookalike.
// Legacy/non-Showrunner episodes (plain LinkedIn Live, old Demio links) have no match here,
// and those pages fall back to their local form.
export function showrunnerSlugFromUrl(url) {
  const m = /webinar-show\.vercel\.app\/e\/([a-z0-9-]+)/i.exec(url || '');
  return m ? m[1] : null;
}
