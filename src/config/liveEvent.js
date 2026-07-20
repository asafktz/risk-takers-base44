// The site-wide floating mini player is NOT built here — it's a Showrunner feature. Copy the
// "Persistent mini player" snippet from the event's embed panel and paste it in index.html.
// We used to hand-roll it in React (components/MiniPlayer.jsx) with its own live-poll and its own
// copy of the featured-event config; that duplicated a platform capability and drifted out of sync
// (its poll slug had rotted to a different event, so it would never have opened when the show went live).
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
