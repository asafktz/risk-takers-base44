import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';


export default function HeroNew() {
  return (
    <section className="relative bg-[#1F1F1F] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center">
          
          {/* Text block — full width */}
          <div>
            <div className="inline-block bg-[#F1C40F] px-3 py-1 mb-6">
              <span className="text-xs font-black tracking-[0.2em] text-[#1F1F1F] uppercase">
                Live Show Series
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              RISK<br />TAKERS
            </h1>

            <p className="text-lg sm:text-xl text-[#AAAAAA] max-w-xl mx-auto mb-8 leading-relaxed">
              What really happens when AI moves from "pilot" to "production" across a company. Real stories, real tradeoffs, and practical playbooks.
            </p>

            <div className="space-y-2 mb-10">
              <p className="text-white font-bold text-base">No hype.</p>
              <p className="text-white font-bold text-base">No vendor pitches.</p>
              <p className="text-[#F1C40F] font-black text-lg">Just real stories, real tradeoffs, and practical playbooks.</p>
            </div>

            <p className="text-sm text-[#AAAAAA] font-medium mb-6">
              🎉 Thank you <span className="text-white font-bold">2,000 attendees</span> in our events since January!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-[#F1C40F] hover:bg-[#D4AC0D] text-[#1F1F1F] h-auto whitespace-normal px-8 py-4 text-base font-bold tracking-wide transition-all hover:translate-y-[-2px]"
                >
                  <Link to="/AIDefenseStack">
                    Explore AI Defense Stack Day
                  </Link>
                </Button>
              <Button
                variant="outline"
                className="border-2 border-[#555] text-white bg-transparent hover:bg-[#333] hover:text-white px-8 py-6 text-base font-bold tracking-wide transition-all"
                onClick={() => {
                  const el = document.getElementById('episodes');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Episodes
              </Button>
            </div>
          </div>

          <div className="w-full max-w-4xl mt-12 rounded-xl border border-[#F1C40F]/40 bg-[#292929] px-6 py-10 sm:px-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#F1C40F]">
              September 23, 2026 · Live online
            </p>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white">
              The AI Defense Stack Day
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-[#CCCCCC]">
              Five cybersecurity companies. Five security leaders. Live demos and questions on defending against AI security risks.
            </p>
            <p className="mt-4 text-sm font-semibold text-white">12 PM Eastern · 7 PM Israel</p>
            <Button asChild className="mt-8 h-auto whitespace-normal bg-[#F1C40F] hover:bg-[#D4AC0D] text-[#1F1F1F] px-8 py-4 text-base font-bold">
              <Link to="/AIDefenseStack">See the lineup and register free</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#F4F2ED]" 
        style={{ clipPath: 'polygon(0 40%, 2% 60%, 5% 30%, 8% 55%, 12% 25%, 15% 50%, 20% 35%, 25% 55%, 30% 30%, 35% 50%, 40% 25%, 45% 55%, 50% 35%, 55% 60%, 60% 30%, 65% 50%, 70% 25%, 75% 55%, 80% 35%, 85% 50%, 90% 30%, 95% 55%, 100% 40%, 100% 100%, 0 100%)' }}
      />
    </section>
  );
}