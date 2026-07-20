// The CURRENT featured live show — drives /watch/<publicSlug> deep links and the site-wide mini player.
// Swap these two values when a new episode goes on the calendar.
//
// ONE slug only, deliberately: Showrunner's /api/live resolves a public (or retired) slug to the
// internal LiveKit room via the ws_internal_slug RPC, so the "is it live yet?" poll works off the
// public slug too. There used to be a separate `roomSlug` here and it had drifted to a DIFFERENT
// event's slug — meaning the mini player polled the wrong show and would never have lit up live.
// Two slugs to keep in sync was the bug; keeping one removes the whole class of it.
export const LIVE_EVENT = {
  // the public event slug on Showrunner (what /watch/:slug and invite links carry)
  publicSlug: 'the-human-operating-system-is-the-new-attack-surface-with-ev',
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

// The slug to send an episode's viewers to at /watch/<slug>, or null if this episode has no
// Showrunner show behind it (legacy LinkedIn Live / Demio episodes keep their own page).
//
// Two sources, in order of directness:
//   1. linkedin_live_url already holding the watch destination (…/watch/<slug>) — how the Eva
//      Benn episode is set up, and what Showrunner's own invite/reminder links point at.
//   2. the signup page in event_registration_url (…/e/<slug>) — the internal slug, which is
//      fine here: ws_event_public() resolves internal, public AND retired slugs alike.
export function watchSlugForEpisode(episode) {
  const direct = /risktakers\.show\/watch\/([a-z0-9-]+)/i.exec(episode?.linkedin_live_url || '');
  if (direct) return direct[1];
  return showrunnerSlugFromUrl(episode?.event_registration_url);
}
