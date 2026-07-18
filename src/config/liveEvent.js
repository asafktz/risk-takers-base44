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
