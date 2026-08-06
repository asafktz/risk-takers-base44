import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, Eye, LayoutTemplate, ShieldCheck, Sparkles } from 'lucide-react';
import { setSEO } from '@/lib/seo';
import { SHOWRUNNER_ORIGIN } from '@/config/liveEvent';

const QA_EVENT_SLUG = 'test-pitch-night-qa-20260804';
const FLAREA_ORIGIN = new URL(SHOWRUNNER_ORIGIN).origin;

function EmbedFrame({ mode, title, initialHeight }) {
  const frameRef = useRef(null);
  const [height, setHeight] = useState(initialHeight);
  const src = useMemo(
    () => `${SHOWRUNNER_ORIGIN}/${mode}/${QA_EVENT_SLUG}?utm_source=risktakers&utm_medium=embed_lab&utm_campaign=before_after`,
    [mode],
  );

  useEffect(() => {
    if (mode !== 'embed') return undefined;
    function onMessage(event) {
      if (event.origin !== FLAREA_ORIGIN || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type !== 'flarea:embed:resize' || event.data?.slug !== QA_EVENT_SLUG) return;
      const next = Number(event.data.height);
      if (Number.isFinite(next)) setHeight(Math.max(620, Math.min(920, Math.round(next))));
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [mode]);

  return (
    <iframe
      ref={frameRef}
      src={src}
      title={title}
      allow={mode === 'embed'
        ? 'camera; microphone; autoplay; fullscreen; picture-in-picture; clipboard-write'
        : 'autoplay; fullscreen; picture-in-picture'}
      allowFullScreen
      className="block w-full border-0 bg-white transition-[height] duration-300"
      style={{ height }}
    />
  );
}

function Fact({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-[#3D3D3D]">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#F1C40F] text-[#1F1F1F]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span>{children}</span>
    </li>
  );
}

export default function FlareaEmbedLab() {
  useEffect(() => {
    setSEO({
      title: 'Flarea Embed Lab',
      description: 'A live before-and-after implementation test of the Flarea event embed on Risk Takers.',
      path: '/flarea-embed-lab',
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#F4F2ED] px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 bg-[#C0392B] px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white">
            <Sparkles className="h-3.5 w-3.5" />
            Live implementation test
          </div>
          <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-[#1F1F1F] sm:text-6xl">
            A better event embed, tested on a real site.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#505050] sm:text-lg">
            Both panels use the same synthetic QA event and the same Flarea registration pipeline. The left
            preserves the compact widget. The right exercises the full responsive event experience.
          </p>
        </div>

        <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          <article className="overflow-hidden border-4 border-[#1F1F1F] bg-white shadow-[10px_10px_0_#1F1F1F]">
            <header className="border-b-4 border-[#1F1F1F] bg-[#EFECE5] p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#C0392B]">Before</span>
                <span className="rounded-full border border-[#8A8A8A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#555]">Compact widget</span>
              </div>
              <h2 className="mt-3 text-2xl font-black text-[#1F1F1F]">The current mechanism</h2>
              <p className="mt-2 text-sm leading-6 text-[#666]">Functional registration, but very little event context or visual hierarchy.</p>
            </header>
            <EmbedFrame mode="widget" title="Before: current compact Flarea widget" initialHeight={380} />
          </article>

          <article className="overflow-hidden border-4 border-[#1F1F1F] bg-white shadow-[10px_10px_0_#C0392B]">
            <header className="border-b-4 border-[#1F1F1F] bg-[#1F1F1F] p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#F1C40F]">After</span>
                <span className="rounded-full border border-[#777] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#DDD]">Full event experience</span>
              </div>
              <h2 className="mt-3 text-2xl font-black">The improved Flarea embed</h2>
              <p className="mt-2 text-sm leading-6 text-[#C8C8C8]">One responsive surface for registration, waiting room, live show and replay.</p>
            </header>
            <EmbedFrame mode="embed" title="After: improved responsive Flarea event embed" initialHeight={760} />
          </article>
        </section>

        <section className="mt-14 grid gap-6 border-t-4 border-[#1F1F1F] pt-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C0392B]">What this validates</p>
            <ul className="mt-5 space-y-4">
              <Fact icon={LayoutTemplate}>The embed adapts its layout and height without the host page knowing Flarea internals.</Fact>
              <Fact icon={Eye}>Registration remains on risktakers.show while Flarea owns the event lifecycle.</Fact>
              <Fact icon={ShieldCheck}>A registrant receives a viewer-only Watcher profile—not a host dashboard or event-creation access.</Fact>
            </ul>
          </div>

          <div className="bg-[#1F1F1F] p-6 text-white sm:p-8">
            <div className="flex items-center gap-2 text-[#F1C40F]">
              <Check className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Watcher account model</span>
            </div>
            <h2 className="mt-4 text-2xl font-black">Your events, replays and progress in one place.</h2>
            <p className="mt-3 text-sm leading-6 text-[#C8C8C8]">
              Registering creates a private Flarea Watcher profile. It remembers shows across hosts and powers
              the Netflix-style library at <code className="text-white">/me</code>. Hosting stays separate and invite-only.
            </p>
            <a
              href={`${SHOWRUNNER_ORIGIN}/me`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-[#F1C40F] px-4 py-3 text-sm font-black text-[#1F1F1F] transition hover:bg-white"
            >
              See the Watcher library <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
