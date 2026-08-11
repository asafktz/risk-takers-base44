import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FlaskConical } from 'lucide-react';
import { setSEO } from '@/lib/seo';

export const QA_EVENT_SLUG = 'test-only-risk-takers-first-part-gmbr';
const FLAREA_ORIGIN = 'https://flarea.ai';

export default function AnalyticsJourneyQA() {
  const frameRef = useRef(null);
  const [height, setHeight] = useState(760);
  const src = useMemo(() => {
    const forwarded = new URLSearchParams();
    new URLSearchParams(window.location.search).forEach((value, key) => {
      if (key === 'r' || key === 'n' || key.startsWith('utm_')) forwarded.append(key, value);
    });
    const query = forwarded.toString();
    return `${FLAREA_ORIGIN}/embed/${QA_EVENT_SLUG}${query ? `?${query}` : ''}`;
  }, []);

  useEffect(() => {
    setSEO({
      title: 'Analytics Journey QA',
      description: 'A synthetic, unpromoted test of first-party event attribution on Risk Takers.',
      path: '/analytics-journey-qa-20260810',
      noindex: true,
    });
  }, []);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== FLAREA_ORIGIN || event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type !== 'flarea:embed:resize' || event.data?.slug !== QA_EVENT_SLUG) return;
      const next = Number(event.data.height);
      if (Number.isFinite(next)) setHeight(Math.max(620, Math.min(920, Math.round(next))));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <main className="min-h-screen bg-[#F4F2ED] px-4 py-10 text-[#1F1F1F] sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="inline-flex items-center gap-2 border-2 border-[#1F1F1F] bg-[#F1C40F] px-3 py-2 text-xs font-black uppercase tracking-[0.18em]">
          <FlaskConical className="h-4 w-4" /> Synthetic QA only · not promoted
        </div>
        <h1 className="mt-5 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] sm:text-6xl">
          First-party journey attribution test
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[#514B43] sm:text-lg">
          This unlisted page embeds a brand-new Flarea test event. Risk Takers loads one account pixel site-wide; the event embed is responsible for identifying the registrant without another event-specific pixel.
        </p>

        <section className="mt-9 overflow-hidden border-4 border-[#1F1F1F] bg-white shadow-[10px_10px_0_#C0392B]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-[#1F1F1F] bg-[#1F1F1F] p-5 text-white">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F1C40F]">Test event</p>
              <h2 className="mt-2 text-2xl font-black">Risk Takers first-party journey QA</h2>
            </div>
            <span className="font-mono text-xs text-[#D8D4CC]">{QA_EVENT_SLUG}</span>
          </header>
          <iframe
            ref={frameRef}
            src={src}
            title="Risk Takers first-party journey analytics test event"
            allow="camera; microphone; autoplay; fullscreen; picture-in-picture; clipboard-write"
            allowFullScreen
            className="block w-full border-0 bg-white transition-[height] duration-300"
            style={{ height }}
          />
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ['Browse', 'Visit ordinary editorial pages before or after registration.', '/about'],
            ['Show intent', 'Visit a buying-intent page so the report has a strong signal.', '/contact'],
            ['Return', 'Come back to this embedded show from another page.', '/analytics-journey-qa-20260810'],
          ].map(([title, copy, href]) => (
            <article key={title} className="border-2 border-[#1F1F1F] bg-white p-5">
              <CheckCircle2 className="h-5 w-5 text-[#C0392B]" />
              <h2 className="mt-3 text-xl font-black uppercase">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#5A554D]">{copy}</p>
              <Link to={href} className="mt-4 inline-flex items-center gap-2 font-black underline">Open path <ArrowRight className="h-4 w-4" /></Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
