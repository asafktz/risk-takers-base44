import { useEffect, useRef, useState } from 'react';
import { Play, LockKeyhole, ArrowUpRight, Check, Film, Captions, Clock3 } from 'lucide-react';
import Hls from 'hls.js';
import PrivacyCollectionNotice from '@/components/PrivacyCollectionNotice';
import { RECORDINGS, RECORDING_EVENT } from '../../config/recordings';
import { setSEO } from '@/lib/seo';
import './RecordingLibrary.css';
const duration = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
function Player({ recording, onExpired }) {
  const ref = useRef(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setError('');
    const video = ref.current;
    const url = `/api/replay?action=stream&id=${recording.id}`;
    let player;
    if (Hls.isSupported()) {
      player = new Hls();
      player.loadSource(url);
      player.attachMedia(video);
      player.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (data.response?.code === 401) onExpired();
        else setError('This recording could not load. Please try again.');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) video.src = url;
    else setError('Your browser cannot play this recording. Please use a current version of Safari, Chrome, Edge, or Firefox.');
    return () => { player?.destroy(); video.removeAttribute('src'); video.load(); };
  }, [recording.id, attempt, onExpired]);
  return <div className="rl-player"><video key={recording.id} ref={ref} controls playsInline preload="metadata" poster={recording.poster} aria-label={`${recording.title}: ${recording.label}`} onError={() => setError('This recording could not load. Please try again.')} />{error && <div className="rl-player-error" role="alert"><p>{error}</p><button onClick={() => setAttempt(n => n + 1)}>Try again</button></div>}</div>;
}
export default function RecordingLibrary() {
  const [selected, setSelected] = useState(() => RECORDINGS.find(r => r.id === new URLSearchParams(window.location.search).get('clip')) || RECORDINGS[0]);
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef(null);
  const topRef = useRef(null);
  const expireRef = useRef(() => setUnlocked(false));
  useEffect(() => {
    setSEO({ title: 'AI Defense Stack Day | Watch every recording', description: 'Watch the full AI Defense Stack Day episode, five company presentations, and every panel Q&A. Free access with your name and email.', path: `/watch/${RECORDING_EVENT}` });
    let active = true;
    fetch('/api/replay?action=status', { credentials: 'same-origin' }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(data => { if (active) setUnlocked(data.unlocked === true); }).catch(() => { if (active) setError('Could not check your access. You can enter your details below to try again.'); }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);
  async function unlock(event) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const r = await fetch('/api/replay?action=register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({name: form.get('name'), email: form.get('email'), website: form.get('website')}) });
      const data = await r.json();
      if (!r.ok || !data.unlocked) throw new Error(data.error || 'Could not unlock the recordings. Please try again.');
      setUnlocked(true);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  function choose(recording) {
    setSelected(recording);
    const url = new URL(window.location.href); url.searchParams.set('clip', recording.id); window.history.replaceState(null, '', url);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!unlocked) nameRef.current?.focus({ preventScroll: true });
  }
  const clips = RECORDINGS.filter(r => r.kind !== 'episode' && (filter === 'all' || r.kind === filter));
  return <main className="recording-library">
    <div className="rl-shell">
      <header className="rl-intro"><div className="rl-eyebrow"><span /> THE REPLAY COLLECTION <span className="rl-date">23 SEPTEMBER 2026</span></div><h1>The AI Defense<br /><em>Stack Day.</em></h1><p>Five companies. Five security leaders.<br className="rl-mobile-break" /> One conversation about what comes next.</p><div className="rl-stats"><span><Film size={16} /> 11 recordings</span><span><Captions size={17} /> Captioned throughout</span><span><Check size={16} /> Free to watch</span></div></header>
      <section className="rl-feature" ref={topRef} aria-label="Watch recording">
        <div className="rl-screen">
          {unlocked ? <Player recording={selected} onExpired={expireRef.current} /> : <button className="rl-locked-screen" onClick={() => nameRef.current?.focus()} aria-label={`Unlock ${selected.title}`}><img src={selected.poster} alt="" /><span className="rl-screen-shade" /><span className="rl-play-circle"><Play fill="currentColor" size={30} /></span><span className="rl-preview-note"><LockKeyhole size={15} /> Enter your details to watch</span></button>}
          <div className="rl-now"><div><span className="rl-label">{selected.label}</span><h2>{selected.kind === 'episode' ? 'The complete episode' : selected.title}</h2><p>{selected.kind === 'episode' ? 'All five presentations and the panel conversations, in one place.' : `${selected.speaker} · ${selected.topic}`}</p></div><span className="rl-duration"><Clock3 size={15} /> {duration(selected.duration)}</span></div>
        </div>
        <aside className="rl-access">
          {unlocked ? <><span className="rl-access-icon"><Check /></span><span className="rl-eyebrow">YOU’RE IN</span><h2>Your front-row<br />seat is ready.</h2><p>Watch the full episode or jump straight to the company or conversation that interests you.</p><button className="rl-primary" onClick={() => choose(RECORDINGS[0])}>Watch the full episode <Play size={17} /></button><a className="rl-browse" href="#recordings">Explore the clips <ArrowUpRight size={17} /></a></> : <><span className="rl-eyebrow">ONE SIGNUP. EVERY RECORDING.</span><h2>Take a seat.</h2><p>Get the full episode, every company presentation, and the panel’s questions and answers.</p><form onSubmit={unlock}><label htmlFor="replay-name">Your name</label><input ref={nameRef} id="replay-name" name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Full name" /><label htmlFor="replay-email">Email address</label><input id="replay-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" /><div className="rl-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div><button className="rl-primary" type="submit" disabled={busy || checking}>{busy ? 'Unlocking…' : checking ? 'Checking access…' : 'Unlock all recordings'}<ArrowUpRight size={18} /></button>{error && <p className="rl-error" role="alert">{error}</p>}</form><PrivacyCollectionNotice className="rl-privacy" /></>}
        </aside>
      </section>
      <section id="recordings" className="rl-collection" aria-labelledby="clips-heading"><div className="rl-collection-heading"><div><span className="rl-eyebrow">GO STRAIGHT TO THE CONVERSATION</span><h2 id="clips-heading">Pick your next watch.</h2></div><div className="rl-filters" aria-label="Filter recordings">{[['all', 'All clips'], ['pitch', 'Presentations'], ['qa', 'Panel Q&A']].map(([id, label]) => <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}>{label}</button>)}</div></div><div className="rl-grid">{clips.map(recording => <button key={recording.id} className={`rl-card ${selected.id === recording.id ? 'rl-card-selected' : ''}`} onClick={() => choose(recording)} aria-label={`Watch ${recording.title}: ${recording.label}`}><div className="rl-card-image"><img src={recording.poster} alt="" loading="lazy" /><span className="rl-card-play"><Play size={18} fill="currentColor" /></span><span className="rl-card-time">{duration(recording.duration)}</span></div><div className="rl-card-copy"><span className="rl-label">{recording.kind === 'qa' ? 'THE PANEL CONVERSATION' : 'FULL PITCH + PANEL DISCUSSION'}</span><div className="rl-card-title"><h3>{recording.title}</h3><ArrowUpRight size={20} /></div><p>{recording.topic}</p><span className="rl-speaker">{recording.speaker}</span></div></button>)}</div></section>
      <footer className="rl-bottom"><span>RISK TAKERS</span><p>Conversations at the edge of AI, cybersecurity, and real-world risk.</p><a href="#recordings">Keep exploring ↑</a></footer>
    </div>
  </main>;
}
