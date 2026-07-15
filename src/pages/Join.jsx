import React from 'react';
import TornPaper from '../components/TornPaper';
import { Calendar, Clock, Radio } from 'lucide-react';
import { setSEO } from '@/lib/seo';

/**
 * Join — dedicated on-site registration page for the current Risk Takers show.
 * It embeds the Showrunner signup widget (the real registration form) so people
 * register without leaving risktakers.show. The widget posts the registrant's
 * email back to the site-wide Showrunner pixel (sr.js, loaded in index.html), so
 * the visitor's on-site journey is attributed to them on submit.
 *
 * Showrunner event: building-resilient-systems-insig-s1pc
 *   "Unpopular Opinion: Using AI to Cut Headcount Is Playing Small" — with Joshua Copeland
 */

const SHOWRUNNER_ORIGIN = 'https://webinar-show.vercel.app';
const EVENT_SLUG = 'building-resilient-systems-insig-s1pc';
const FILE_BASE = `${SHOWRUNNER_ORIGIN}/api/file/${EVENT_SLUG}/banners`;

const BANNER_BG = `${FILE_BASE}/bg-1781533968437.png`;
const GUEST_CUTOUT = `${FILE_BASE}/cut-0-1781533968437.png`;
const WIDGET_URL = `${SHOWRUNNER_ORIGIN}/widget/${EVENT_SLUG}`;

export default function Join() {
  React.useEffect(() => {
    setSEO({
      title: 'Register',
      description: 'Save your seat for the next Risk Takers show — Unpopular Opinion: Using AI to Cut Headcount Is Playing Small, with Joshua Copeland. Free, live + replay.',
      path: '/Join',
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F2ED] py-12 sm:py-16 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <TornPaper variant="both" bgColor="#C0392B" className="inline-block" rotate={-0.5}>
            <h1 className="px-7 py-4 text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              Save your seat
            </h1>
          </TornPaper>
          <span className="inline-flex items-center gap-2 bg-[#1F1F1F] text-[#F1C40F] text-xs font-black tracking-[0.2em] uppercase px-3 py-2">
            <Radio className="w-3.5 h-3.5" />
            Live on Showrunner
          </span>
        </div>

        {/* Banner (left) + embedded signup form (right) */}
        <div className="border-4 border-[#1F1F1F] bg-[#1F1F1F] shadow-2xl overflow-hidden grid lg:grid-cols-5">
          {/* Banner */}
          <div className="lg:col-span-3 relative min-h-[320px] sm:min-h-[440px] overflow-hidden">
            <img src={BANNER_BG} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1F1F1F] via-[#1F1F1F]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F]/80 via-transparent to-transparent" />

            <img
              src={GUEST_CUTOUT}
              alt="Joshua Copeland"
              className="absolute bottom-0 right-1 sm:right-4 h-[78%] sm:h-[88%] w-auto object-contain object-bottom pointer-events-none select-none drop-shadow-2xl"
            />

            <div className="relative z-10 p-7 sm:p-9 max-w-[64%]">
              <span className="inline-flex items-center gap-2 bg-[#C0392B] text-white text-[10px] sm:text-[11px] font-black tracking-[0.18em] uppercase px-3 py-1.5">
                <Radio className="w-3.5 h-3.5" />
                Live show
              </span>

              <h2 className="mt-5 text-2xl sm:text-3xl lg:text-[2.25rem] font-black text-white leading-[1.08] tracking-tight">
                Unpopular Opinion:{' '}
                <span className="text-[#F1C40F]">Using AI to Cut Headcount Is Playing Small.</span>
              </h2>

              <div className="mt-5">
                <p className="text-white font-black text-base sm:text-lg leading-tight">Joshua Copeland</p>
                <p className="text-[#BBBBBB] text-xs sm:text-sm">CISO · Professor · Best-Selling Author</p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                  <Calendar className="w-4 h-4 text-[#C0392B]" />
                  Mon, Jul 6, 2026
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-white">
                  <Clock className="w-4 h-4 text-[#C0392B]" />
                  9:00 AM CT · 2:00 PM UTC
                </span>
              </div>
            </div>
          </div>

          {/* Embedded Showrunner registration form */}
          <div className="lg:col-span-2 bg-white flex flex-col">
            <div className="bg-[#1F1F1F] px-6 py-4">
              <p className="text-white font-black text-sm tracking-wide uppercase">Register free</p>
              <p className="text-[#AAAAAA] text-xs">Free · live + replay · instant join link</p>
            </div>

            <iframe
              title="Register for the Risk Takers show"
              src={WIDGET_URL}
              className="w-full border-0 block flex-1"
              style={{ minHeight: 380 }}
              allow="clipboard-write"
            />

            <p className="px-6 pb-5 pt-2 text-[11px] text-[#666666] text-center">
              You&apos;ll get a confirmation email with your unique join link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}