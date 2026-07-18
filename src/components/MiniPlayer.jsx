import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LIVE_EVENT, SHOWRUNNER_ORIGIN } from '@/config/liveEvent';

// Persistent mini player — the show follows visitors around the site. A compact pill on every page that
// expands into a floating player (the full Showrunner embed: signup → waiting room → live → replay) and
// AUTO-expands the moment the show goes live. Because this is a SPA, the player genuinely keeps playing
// across page navigation — no reload, no interruption. Hidden on /watch itself (the big screen is there).
// ✕ dismisses for the browser session.
export default function MiniPlayer() {
  const location = useLocation();
  const K = `rt-mini-${LIVE_EVENT.publicSlug}`;
  const [state, setState] = useState(() => {
    try { return sessionStorage.getItem(K) || 'pill'; } catch { return 'pill'; }
  }); // 'pill' | 'open' | 'closed'
  const [isLive, setIsLive] = useState(false);

  const save = (v) => { setState(v); try { sessionStorage.setItem(K, v); } catch { /* private mode */ } };

  // best-effort live detection: auto-pop the player when the show starts (stops once open/closed)
  useEffect(() => {
    if (state !== 'pill') return;
    let dead = false;
    const poll = async () => {
      try {
        const r = await fetch(`${SHOWRUNNER_ORIGIN}/api/live?room=${LIVE_EVENT.roomSlug}`);
        const d = await r.json();
        if (!dead && d?.live) { setIsLive(true); save('open'); }
      } catch { /* transient — keep the pill */ }
    };
    poll();
    const t = setInterval(poll, 30000);
    return () => { dead = true; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state === 'closed') return null;
  if (location.pathname.toLowerCase().startsWith('/watch')) return null;

  // forward personal params (r/n/utm_*) if someone landed on ANY page from an invite link
  const p = new URLSearchParams(location.search);
  const out = new URLSearchParams();
  p.forEach((v, k) => { if (k === 'r' || k === 'n' || k.startsWith('utm_')) out.append(k, v); });
  const qs = out.toString() ? `?${out.toString()}` : '';
  const open = state === 'open';

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 60, borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.45)', background: '#0b0d11', color: '#fff', fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', fontSize: 12, fontWeight: 700, maxWidth: open ? 360 : 300 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: isLive || open ? '#ef4444' : '#f97316', flex: 'none' }} />
        <button onClick={() => save(open ? 'pill' : 'open')} style={{ all: 'unset', cursor: 'pointer', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={open ? 'Minimize' : 'Open player'}>
          {LIVE_EVENT.title}
        </button>
        <Link to={`/watch/${LIVE_EVENT.publicSlug}${qs}`} style={{ color: '#fff', textDecoration: 'none', padding: '0 4px' }} title="Open the full watch page">⤢</Link>
        <button onClick={() => save(open ? 'pill' : 'open')} style={{ all: 'unset', cursor: 'pointer', padding: '0 4px' }} title={open ? 'Minimize' : 'Expand'}>{open ? '—' : '▶'}</button>
        <button onClick={() => save('closed')} style={{ all: 'unset', cursor: 'pointer', padding: '0 4px' }} title="Close">✕</button>
      </div>
      {open && (
        <iframe
          src={`${SHOWRUNNER_ORIGIN}/embed/${LIVE_EVENT.publicSlug}${qs}`}
          title={LIVE_EVENT.title}
          allow="camera; microphone; autoplay; fullscreen; picture-in-picture"
          style={{ width: 360, height: 202, border: 0, display: 'block', background: '#000' }}
        />
      )}
    </div>
  );
}
