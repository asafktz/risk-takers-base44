import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  MessageSquareText,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PrivacyCollectionNotice from '@/components/PrivacyCollectionNotice';
import { SHOWRUNNER_ORIGIN } from '@/config/liveEvent';
import { absoluteUrl, organizationJsonLd, setSEO } from '@/lib/seo';

const EVENT_SLUG = 'ai-defense-stack-showcase-day-n4qd';
const EVENT_URL = `${SHOWRUNNER_ORIGIN}/e/${EVENT_SLUG}`;
const WIDGET_URL = `${SHOWRUNNER_ORIGIN}/widget/${EVENT_SLUG}?utm_source=risktakers&utm_medium=owned_registration&utm_campaign=ai_defense_stack_day`;

const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'The AI Defense Stack Day',
  description: 'Five cybersecurity companies present distinct advances against today\'s top AI security risks, followed by live questions from a panel of security leaders.',
  startDate: '2026-09-23T16:00:00Z',
  endDate: '2026-09-23T18:00:00Z',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  isAccessibleForFree: true,
  organizer: {
    '@type': 'Organization',
    name: 'Risk Takers',
    url: 'https://risktakers.show',
  },
  location: {
    '@type': 'VirtualLocation',
    url: absoluteUrl('/AIDefenseStack'),
  },
  url: absoluteUrl('/AIDefenseStack'),
};

const panelists = [
  {
    name: 'Phillip Miller',
    title: 'Vice President and CISO',
    company: 'H&R Block',
    image: '/ai-defense-stack/phillip-miller.jpeg',
  },
  {
    name: 'Benjamin Corll',
    title: 'CISO in Residence',
    company: 'Zscaler',
    image: '/ai-defense-stack/benjamin-corll.jpeg',
  },
  {
    name: 'Eva Benn',
    title: 'Multi-Award Winning Security Leader and Educator',
    company: 'Microsoft',
    image: '/ai-defense-stack/eva-benn.jpeg',
  },
  {
    name: 'Merlin Namuth',
    title: 'CISO',
    company: 'City and County of Denver',
    image: '/ai-defense-stack/merlin-namuth.jpeg',
  },
  {
    name: 'Priya Mouli',
    title: 'CISO',
    company: 'University of Alberta · Top 10 CISO in Canada, 2026',
    image: '/ai-defense-stack/priya-mouli.png',
  },
];

const highlights = [
  {
    number: '01',
    title: 'Five distinct approaches',
    copy: 'Identity, agentic AI, runtime defense, data security and other critical AI-era security domains.',
  },
  {
    number: '02',
    title: 'Real pressure testing',
    copy: 'Security leaders challenge the assumptions, urgency, evidence and enterprise fit of every approach.',
  },
  {
    number: '03',
    title: 'Your questions, live',
    copy: 'Join the audience conversation, ask direct questions and connect with the companies you want to know.',
  },
];

const schedule = [
  { time: 'Opening', duration: 'About 10 min', detail: 'Welcome, event context, panel introduction and format.' },
  { time: 'Vendors 1–3', duration: 'About 45 min', detail: 'Three blocks: seven-minute company perspective plus seven minutes with the panel.' },
  { time: 'Panel commentary', duration: 'About 15 min', detail: 'The panel connects the arguments, surfaces implications and brings in audience questions.' },
  { time: 'Vendors 4–5', duration: 'About 30 min', detail: 'Two blocks: seven-minute company perspective plus seven minutes with the panel.' },
  { time: 'Closing and results', duration: 'About 10 min', detail: 'Final takeaways, audience results and connection prompts.' },
];

const attendeeBenefits = [
  { icon: Users, title: 'Handpicked community', copy: 'Risk Takers brings together decision-makers, builders, defenders and risk owners.' },
  { icon: ShieldCheck, title: 'Specific, not theoretical', copy: 'Every perspective is grounded in a real security problem and practical evidence.' },
  { icon: MessageSquareText, title: 'Audience participation', copy: 'Ask questions during the show and signal which companies you want to meet.' },
  { icon: Check, title: 'Live plus replay', copy: 'Register once for the live show and the gated evergreen event experience.' },
];

function scrollToRegistration() {
  document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionLabel({ children }) {
  return (
    <div className="inline-flex border border-[#756F63] border-l-4 border-l-[#E0A800] bg-[#11110F] px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#E0A800] shadow-[0_5px_16px_rgba(0,0,0,.55)]">
      {children}
    </div>
  );
}

function FlareaRegistration() {
  return (
    <aside id="register" className="scroll-mt-20 border border-[#6B665E] border-t-[6px] border-t-[#E0A800] bg-[#F1E9DA] text-[#0A0A09] shadow-[14px_14px_0_rgba(0,0,0,.5)]">
      <div className="px-5 pb-2 pt-6 sm:px-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8D6900]">Free live registration</p>
        <h2 className="rt-display mt-2 text-4xl uppercase leading-[0.92] sm:text-5xl">Join the live showcase</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#514D47]">
          Register through Flarea to receive your personal access link, calendar invitation and event reminders.
        </p>
      </div>
      <iframe
        src={WIDGET_URL}
        title="Register for The AI Defense Stack Day with Flarea"
        className="block h-[360px] w-full border-0 bg-white"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <PrivacyCollectionNotice className="px-5 pb-5 pt-3 sm:px-7" />
      <div className="border-t border-[#C4BAA9] px-5 py-4 text-center sm:px-7">
        <a
          href={EVENT_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#514D47] underline decoration-[#E0A800] decoration-2 underline-offset-4 hover:text-black"
        >
          Open the registration form in a new tab <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </aside>
  );
}

function EventFooter() {
  return (
    <footer className="border-t border-[#4E4A43] bg-[#070707] px-4 py-10 text-[#A8A39A] sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 text-white">
            <img src="/ai-defense-stack/risk-takers-logo.png" alt="Risk Takers" className="h-14 w-14 object-cover" />
            <span className="rt-display text-3xl uppercase leading-none">Risk Takers</span>
          </Link>
          <p className="mt-3 max-w-md text-sm leading-6">No safe takes on AI and security. Risk Takers is owned and operated by LinkedOtter LLC.</p>
        </div>
        <nav aria-label="Legal and site links" className="flex max-w-xl flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
          <Link className="hover:text-[#E0A800]" to="/about">About</Link>
          <Link className="hover:text-[#E0A800]" to="/contact">Contact</Link>
          <Link className="hover:text-[#E0A800]" to="/privacy">Privacy Policy</Link>
          <Link className="hover:text-[#E0A800]" to="/terms">Terms &amp; Conditions</Link>
          <Link className="hover:text-[#E0A800]" to="/privacy-choices">Do Not Sell or Share</Link>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-[#302E2A] pt-5 text-xs text-[#77736B]">
        © {new Date().getFullYear()} LinkedOtter LLC. All rights reserved.
      </div>
    </footer>
  );
}

export default function AIDefenseStack() {
  useEffect(() => {
    setSEO({
      title: 'The AI Defense Stack Day | Live Cybersecurity Showcase',
      description: 'Join five cybersecurity companies and five leading security executives live on September 23, 2026 at 7 PM Israel and 12 PM Eastern.',
      path: '/AIDefenseStack',
      image: '/ai-defense-stack/industrial-landscape.jpg',
      jsonLd: [organizationJsonLd, eventJsonLd],
    });

    if (window.location.hash === '#register') {
      window.requestAnimationFrame(() => scrollToRegistration());
    }
  }, []);

  return (
    <main className="ai-defense-page min-h-screen overflow-x-hidden bg-[#070707] text-[#EFE7D5]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@500;600;700;800;900&display=swap');
        .ai-defense-page { font-family: 'Montserrat', Arial, sans-serif; }
        .ai-defense-page .rt-display { font-family: 'Bebas Neue', 'Arial Narrow', Arial, sans-serif; font-weight: 900; letter-spacing: .01em; }
        .ai-defense-page ::selection { background: #E0A800; color: #080808; }
        .rt-industrial {
          background-color: #070707;
          background-image: linear-gradient(rgba(5,5,5,.68), rgba(5,5,5,.88)), url('/ai-defense-stack/industrial-landscape.jpg');
          background-position: center top;
          background-size: cover;
        }
        .rt-hazard {
          background-image: repeating-linear-gradient(135deg, #E0A800 0 14px, #0B0B0A 14px 28px);
        }
      `}</style>

      <section className="rt-industrial relative border-b border-[#4E4A43]">
        <div className="rt-hazard h-3 opacity-80" />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(350px,.75fr)] lg:items-start lg:gap-14 lg:py-20">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <SectionLabel>Risk Takers live event</SectionLabel>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-[#C3BFB6]">Live online · Free to attend</span>
            </div>

            <h1 className="rt-display mt-7 max-w-3xl text-[4.5rem] uppercase leading-[0.82] text-[#EFE7D5] sm:text-[6.5rem] lg:text-[7.4rem]">
              The AI<br /><span className="text-[#E0A800]">Defense Stack Day</span>
            </h1>
            <p className="mt-7 max-w-3xl text-xl font-semibold leading-8 text-[#E8E4DC] sm:text-2xl sm:leading-9">
              Hear five cybersecurity companies present distinct advances against today&apos;s top AI security risks. Then five leading security executives pressure-test the thinking live.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 border border-[#6B665E] bg-black/70 px-4 py-3 text-sm font-black uppercase tracking-wide">
                <CalendarDays className="h-4 w-4 text-[#E0A800]" /> 23 September 2026
              </div>
              <div className="inline-flex items-center gap-2 border border-[#6B665E] bg-black/70 px-4 py-3 text-sm font-black uppercase tracking-wide">
                <Clock3 className="h-4 w-4 text-[#E0A800]" /> 7 PM Israel · 12 PM Eastern
              </div>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <article key={item.number} className="border border-[#625E56] border-t-4 border-t-[#E0A800] bg-[linear-gradient(145deg,rgba(38,38,36,.94),rgba(8,8,8,.97))] p-5">
                  <div className="rt-display text-4xl text-[#E0A800]">{item.number}</div>
                  <h2 className="rt-display mt-2 text-2xl uppercase leading-none">{item.title}</h2>
                  <p className="mt-3 text-sm font-medium leading-6 text-[#BEB9AF]">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>

          <FlareaRegistration />
        </div>
      </section>

      <section className="px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <SectionLabel>The panel</SectionLabel>
              <h2 className="rt-display mt-5 max-w-4xl text-5xl uppercase leading-[0.92] sm:text-7xl">Security leaders who will challenge the thinking</h2>
            </div>
            <p className="text-base font-medium leading-7 text-[#BEB9AF]">Every company gets seven minutes to present its perspective, followed by seven minutes of direct questions from the panel.</p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {panelists.map((person) => (
              <article key={person.name} className="min-w-0">
                <div className="aspect-square overflow-hidden border-2 border-[#A77D00] bg-[#171716]">
                  <img
                    src={person.image}
                    alt={person.name}
                    className={`h-full w-full object-cover ${person.name === 'Eva Benn' ? 'object-[center_35%]' : 'object-center'} ${person.name === 'Priya Mouli' ? 'scale-[1.08]' : ''}`}
                  />
                </div>
                <h3 className="rt-display mt-4 text-3xl uppercase leading-[0.88]">{person.name}</h3>
                <p className="mt-2 text-xs font-black uppercase leading-5 text-[#E0A800]">{person.title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#ABA69D]">{person.company}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#4E4A43] bg-[#10100F] px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>What to expect</SectionLabel>
          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
            <h2 className="rt-display text-5xl uppercase leading-[0.92] sm:text-7xl">A fast, useful look at what is changing</h2>
            <p className="text-base font-medium leading-7 text-[#BEB9AF]">No product walkthroughs. Companies explain the problem, why it matters now, their philosophy and evidence from real deployments or case studies.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ['The problem', 'What changed in the threat or technology landscape, and why the old approach is no longer enough.'],
              ['The approach', 'The company’s distinct philosophy, architecture or operating model for solving it.'],
              ['The pressure test', 'Panel questions, audience challenges and direct opportunities to connect with the companies.'],
            ].map(([title, copy], index) => (
              <article key={title} className="border border-[#625E56] border-l-[6px] border-l-[#E0A800] bg-[linear-gradient(145deg,#252523,#080808)] p-6">
                <div className="rt-display text-5xl text-[#E0A800]">0{index + 1}</div>
                <h3 className="rt-display mt-3 text-3xl uppercase">{title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-[#BEB9AF]">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 border border-[#625E56] bg-[#080808] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="rt-display text-3xl uppercase text-[#E0A800]">First company announced</p>
              <p className="mt-1 font-black">Way Security · Identity · Yonatan Rosenberg, CTO and Co-Founder</p>
            </div>
            <p className="max-w-md text-sm font-semibold leading-6 text-[#AAA59C]">Four more companies will be announced across critical AI-era security domains.</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[330px_minmax(0,1fr)]">
            <div>
              <SectionLabel>The schedule</SectionLabel>
              <h2 className="rt-display mt-5 text-5xl uppercase leading-[0.92] sm:text-6xl">Five clear chunks. One live conversation.</h2>
              <p className="mt-5 text-sm font-semibold leading-6 text-[#AAA59C]">The event is expected to run for approximately two hours.</p>
            </div>
            <div className="space-y-3">
              {schedule.map((item, index) => (
                <article key={item.time} className="grid gap-3 border border-[#5E5951] border-l-[6px] border-l-[#E0A800] bg-[linear-gradient(145deg,#242422,#090909)] p-5 sm:grid-cols-[52px_1fr_auto] sm:items-center sm:gap-5">
                  <span className="rt-display text-4xl text-[#E0A800]">0{index + 1}</span>
                  <div>
                    <h3 className="rt-display text-3xl uppercase leading-none">{item.time}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-[#BEB9AF]">{item.detail}</p>
                  </div>
                  <span className="justify-self-start border border-[#686259] bg-black px-3 py-2 text-xs font-black uppercase tracking-wide text-[#E8E2D7] sm:justify-self-end">{item.duration}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rt-industrial border-y border-[#4E4A43] px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionLabel>Who should attend</SectionLabel>
            <h2 className="rt-display mt-5 text-5xl uppercase leading-[0.92] sm:text-7xl">Built for the people deciding what comes next</h2>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#D1CCC2]">CISOs, security leaders, practitioners, architects, AI governance teams, investors and builders looking for credible new approaches to AI-era defense.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {attendeeBenefits.map(({ icon: Icon, title, copy }) => (
              <li key={title} className="border border-[#625E56] bg-black/80 p-5">
                <div className="flex items-center gap-3 text-[#E0A800]">
                  <Icon className="h-5 w-5" />
                  <h3 className="rt-display text-2xl uppercase">{title}</h3>
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-[#BEB9AF]">{copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#E0A800] px-4 py-12 text-[#080808] sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em]">23 September · Live online</p>
            <h2 className="rt-display mt-2 text-5xl uppercase leading-none sm:text-6xl">See the forefront of cyber defense</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={scrollToRegistration} className="h-14 rounded-none bg-[#080808] px-7 text-sm font-black uppercase tracking-wide text-white hover:bg-[#2A2A28]">
              Reserve my seat <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline" className="h-14 rounded-none border-2 border-[#080808] bg-transparent px-7 text-sm font-black uppercase tracking-wide text-[#080808] hover:bg-[#080808] hover:text-white">
              <Link to="/vendors">Apply as a vendor</Link>
            </Button>
          </div>
        </div>
      </section>

      <EventFooter />
    </main>
  );
}
