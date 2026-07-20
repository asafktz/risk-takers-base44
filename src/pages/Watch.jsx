import React, { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SHOWRUNNER_ORIGIN } from '@/config/liveEvent';

// The show lives HERE — risktakers.show/watch/<slug> is the watch destination Showrunner invite,
// reminder and calendar links point at (the event's "Where should attendees watch?" setting). The full
// Showrunner journey (registration → waiting room → live show → replay) runs inside the embed, so
// attendees never leave the Risk Takers domain. Personal links arrive with ?r=&n= (and utm_*) — we
// forward exactly those into the iframe so registrants auto-join without re-entering anything.
export default function WatchPage() {
  const { slug } = useParams();
  const location = useLocation();

  const src = useMemo(() => {
    const clean = String(slug || '').replace(/[^a-z0-9-]/gi, '');
    const p = new URLSearchParams(location.search);
    const out = new URLSearchParams();
    p.forEach((v, k) => { if (k === 'r' || k === 'n' || k.startsWith('utm_')) out.append(k, v); });
    const qs = out.toString();
    return `${SHOWRUNNER_ORIGIN}/embed/${clean}${qs ? `?${qs}` : ''}`;
  }, [slug, location.search]);

  // 3.5rem = the sticky navbar's h-14. Using 100dvh keeps the show fully visible on mobile, where
  // 100vh sits behind the browser's collapsing chrome and would clip the bottom of the stage.
  const fill = 'calc(100dvh - 3.5rem)';

  return (
    <div className="bg-black" style={{ minHeight: fill }}>
      <iframe
        src={src}
        title="Risk Takers — live show"
        allow="camera; microphone; autoplay; fullscreen; picture-in-picture; clipboard-write"
        allowFullScreen
        style={{ border: 0, width: '100%', height: fill, display: 'block', background: '#000' }}
      />
    </div>
  );
}
