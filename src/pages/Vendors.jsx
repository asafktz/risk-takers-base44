import { useEffect } from 'react';
import { ArrowRight, CalendarCheck, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { setSEO, organizationJsonLd } from '@/lib/seo';
import { EVENT } from '@/lib/event';

export default function Vendors() {
  useEffect(() => {
    setSEO({
      title: 'Vendor applications closed | The AI Defense Stack Day',
      description: 'Vendor applications for The AI Defense Stack Day on September 23, 2026 are now closed.',
      path: '/vendors',
      jsonLd: [organizationJsonLd]
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#F4F2ED] px-4 py-14 text-[#151515] sm:px-8 sm:py-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .vendors-page * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .vendors-page ::selection { background: #F1C40F; color: #111; }
      `}</style>

      <section className="vendors-page mx-auto max-w-5xl border-4 border-[#1F1F1F] bg-white p-6 shadow-[12px_12px_0_#1F1F1F] sm:p-10 lg:p-14">
        <span className="inline-flex items-center gap-2 border-2 border-[#1F1F1F] bg-[#F1C40F] px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
          <ShieldCheck className="h-4 w-4" /> The AI Defense Stack Day
        </span>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#C0392B]">
              <CheckCircle2 className="h-5 w-5" /> Presenter roster complete
            </p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl">
              Applications closed
            </h1>
            <p className="mt-7 max-w-2xl text-xl font-semibold leading-8 text-[#49443D]">
              Vendor applications for this event are now closed. The five presenting companies have been selected.
            </p>
          </div>

          <div className="border-2 border-[#1F1F1F] bg-[#1F1F1F] p-5 text-white">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#F1C40F]">
              <CalendarCheck className="h-5 w-5" /> Live online
            </p>
            <p className="mt-3 text-lg font-black uppercase">{EVENT.dateLabel}</p>
            <p className="mt-1 text-base font-semibold text-[#D6D1C7]">{EVENT.timeShort}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t-2 border-[#1F1F1F]/15 pt-8 sm:flex-row sm:items-center">
          <Button asChild className="h-12 rounded-none bg-[#C0392B] px-6 font-black uppercase text-white hover:bg-[#A93226]">
            <Link to="/AIDefenseStack#register">
              Register to attend <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-none border-2 border-[#1F1F1F] px-6 font-black uppercase">
            <a href="mailto:vendors@risktakers.show">
              Future opportunities <Mail className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
