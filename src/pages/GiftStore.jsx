import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDown,
  Check,
  CheckCircle2,
  Gift,
  Loader2,
  Mail,
  Sparkles,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PrivacyCollectionNotice from '@/components/PrivacyCollectionNotice';
import { setSEO, absoluteUrl } from '@/lib/seo';
import { formatMerchPrice, merchProducts } from '@/config/merch';


const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Risk Takers Merch Waitlist',
  url: absoluteUrl('/gift-store'),
  description: 'Preview the first Risk Takers merch collection and join the waitlist.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: merchProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: absoluteUrl(`/gift-store#${product.id}`),
    })),
  },
};


function ProductCard({ product, index, onJoin }) {
  const isWide = index === 0 || index === 3 || index === 5;

  return (
    <article
      id={product.id}
      className={`group relative overflow-hidden border-2 border-[#1B1B19] bg-[#F5F0E4] shadow-[7px_7px_0_#1B1B19] transition-transform duration-300 hover:-translate-y-1 ${
        isWide ? 'lg:col-span-7' : 'lg:col-span-5'
      }`}
    >
      <div className="relative aspect-[7/6] overflow-hidden border-b-2 border-[#1B1B19] bg-[#E8E3D7]">
        <img
          src={product.image}
          alt={`${product.name} product concept`}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
          loading={index < 2 ? 'eager' : 'lazy'}
        />
        <span className="absolute left-4 top-4 border-2 border-[#1B1B19] bg-[#F1C40F] px-3 py-1 font-mono text-[11px] font-black tracking-[0.14em] text-[#1B1B19]">
          {product.badge}
        </span>
        <span className="absolute bottom-4 right-4 border-2 border-[#1B1B19] bg-[#F5F0E4] px-3 py-1 text-sm font-black text-[#1B1B19]">
          WAITLIST ONLY
        </span>
      </div>

      <div className="p-5 sm:p-7">
        <div className="mb-4 flex items-start justify-between gap-5">
          <div>
            <p className="mb-2 font-mono text-[11px] font-bold tracking-[0.18em] text-[#806C12]">
              FIELD SUPPLY / {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="max-w-xl text-2xl font-black uppercase leading-[1.05] tracking-[-0.03em] text-[#1B1B19] sm:text-3xl">
              {product.name}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#6D665B]">Planned retail</p>
            <p className="text-2xl font-black text-[#1B1B19]">{formatMerchPrice(product.retailValue)}</p>
          </div>
        </div>

        <p className="max-w-2xl text-base leading-7 text-[#4B4943]">{product.description}</p>

        <ul className="mt-5 grid gap-2 text-sm font-semibold text-[#34332F] sm:grid-cols-3">
          {product.details.map((detail) => (
            <li key={detail} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#9A7B00]" strokeWidth={3} aria-hidden="true" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onJoin(product.id)}
          aria-controls="merch-waitlist"
          className="mt-7 inline-flex w-full items-center justify-between bg-[#1B1B19] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#806C12] focus:outline-none focus:ring-4 focus:ring-[#F1C40F] sm:w-auto sm:min-w-64"
        >
          Join waitlist for this item
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}


function MerchWaitlistForm({ selectedInterest, onInterestChange }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState('idle');

  const selectedProduct = merchProducts.find((product) => product.id === selectedInterest);
  const interestLabel = selectedProduct?.name || 'The full Drop 001 collection';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');

    try {
      const { data } = await base44.functions.invoke('submitMerchWaitlist', {
        name: formData.name,
        email: formData.email,
        interest: selectedInterest,
      });
      if (!data?.success) throw new Error(data?.error || 'Waitlist signup failed');
      setStatus('success');
      setFormData({ name: '', email: '' });
    } catch (error) {
      console.error('Merch waitlist signup failed:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="border-2 border-[#1B1B19] bg-[#F5F0E4] p-7 text-[#1B1B19] shadow-[8px_8px_0_#F1C40F] sm:p-10" role="status" aria-live="polite">
        <CheckCircle2 className="h-12 w-12 text-[#806C12]" strokeWidth={2.5} aria-hidden="true" />
        <h3 className="mt-5 text-3xl font-black uppercase tracking-[-0.04em]">You’re on the list.</h3>
        <p className="mt-3 max-w-xl text-base leading-7 text-[#4B4943]">
          We recorded your interest in {interestLabel}. We’ll email you when the first Risk Takers drop or giveaway opens.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 font-mono text-xs font-black uppercase tracking-[0.14em] underline underline-offset-4"
        >
          Add another email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-[#1B1B19] bg-[#F5F0E4] p-6 text-[#1B1B19] shadow-[8px_8px_0_#F1C40F] sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.12em]">
          Name
          <input
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            className="min-h-12 border-2 border-[#1B1B19] bg-white px-4 font-sans text-base font-semibold normal-case tracking-normal outline-none focus:ring-4 focus:ring-[#F1C40F]"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-2 font-mono text-xs font-black uppercase tracking-[0.12em]">
          Email
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
            className="min-h-12 border-2 border-[#1B1B19] bg-white px-4 font-sans text-base font-semibold normal-case tracking-normal outline-none focus:ring-4 focus:ring-[#F1C40F]"
            placeholder="you@company.com"
          />
        </label>
      </div>

      <label className="mt-5 grid gap-2 font-mono text-xs font-black uppercase tracking-[0.12em]">
        Most interested in
        <select
          value={selectedInterest}
          onChange={(event) => onInterestChange(event.target.value)}
          className="min-h-12 border-2 border-[#1B1B19] bg-white px-4 font-sans text-base font-semibold normal-case tracking-normal outline-none focus:ring-4 focus:ring-[#F1C40F]"
        >
          <option value="full-drop">The full Drop 001 collection</option>
          {merchProducts.map((product) => (
            <option key={product.id} value={product.id}>{product.name}</option>
          ))}
        </select>
      </label>

      <PrivacyCollectionNotice className="mt-5" />

      {status === 'error' && (
        <div className="mt-5 flex items-start gap-3 border-2 border-[#9B2C23] bg-[#FFF0ED] p-4 text-sm font-bold text-[#7D251E]" role="alert">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          We couldn’t add you just now. Please try again.
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 bg-[#1B1B19] px-6 text-sm font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#806C12] focus:outline-none focus:ring-4 focus:ring-[#F1C40F] disabled:cursor-wait disabled:opacity-70"
      >
        {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Mail className="h-5 w-5" aria-hidden="true" />}
        {status === 'loading' ? 'Joining…' : 'Join the merch waitlist'}
      </button>

      <p className="mt-4 text-center text-xs font-bold leading-5 text-[#6D665B]">
        No purchase or reservation is created. See the notice above for how Risk Takers may use your signup information.
      </p>
    </form>
  );
}


export default function GiftStore() {
  const waitlistRef = useRef(null);
  const [selectedInterest, setSelectedInterest] = useState('full-drop');

  useEffect(() => {
    setSEO({
      title: 'Merch Waitlist',
      description: 'Preview Risk Takers apparel and desk gear, then join the waitlist for Drop 001.',
      path: '/gift-store',
      image: absoluteUrl('/merch/hero/risk-takers-gift-store-hero.png'),
      jsonLd: [collectionJsonLd],
    });
  }, []);

  const openWaitlist = (interest = 'full-drop') => {
    setSelectedInterest(interest);
    window.requestAnimationFrame(() => waitlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <main className="min-h-screen bg-[#E8E3D7] font-sans text-[#1B1B19]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        .gift-store-grid {
          background-image:
            linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
          background-size: 44px 44px;
        }
        .gift-store-hazard {
          background: repeating-linear-gradient(135deg, #F1C40F 0 18px, #1B1B19 18px 36px);
        }
      `}</style>

      <section
        className="gift-store-grid relative isolate min-h-[720px] overflow-hidden bg-[#151513] text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(14,14,13,.97) 0%, rgba(14,14,13,.89) 38%, rgba(14,14,13,.30) 72%, rgba(14,14,13,.52) 100%), url('/merch/hero/risk-takers-gift-store-hero.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-2 gift-store-hazard" />
        <div className="mx-auto flex min-h-[720px] max-w-6xl items-center px-4 py-20 sm:px-8">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 border border-[#F1C40F] bg-[#1B1B19]/85 px-3 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-[#F1C40F] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              RISK TAKERS / DROP 001 / WAITLIST OPEN
            </div>

            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.91] tracking-[-0.055em] text-[#F5F0E4] sm:text-7xl lg:text-[6.4rem]">
              Hardware for
              <span className="block text-[#F1C40F]">bold operators.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-[#D0CBC0] sm:text-xl">
              The first Risk Takers merch collection is being prepared. Preview the concepts and join the list for launch access and future giveaways.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => openWaitlist()}
                className="inline-flex items-center justify-center gap-3 bg-[#F1C40F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#1B1B19] transition-colors hover:bg-[#F8D84B] focus:outline-none focus:ring-4 focus:ring-white"
              >
                Join the waitlist
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <a
                href="#collection"
                className="inline-flex items-center justify-center gap-3 border border-[#77736A] bg-[#1B1B19]/75 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors hover:border-white"
              >
                <Gift className="h-4 w-4" aria-hidden="true" />
                Preview Drop 001
              </a>
            </div>

            <p className="mt-5 font-mono text-xs font-black uppercase tracking-[0.12em] text-[#B4A85F]">
              Preview only — nothing on this page is for sale yet.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#E8E3D7] [clip-path:polygon(0_52%,4%_18%,9%_63%,15%_30%,22%_66%,28%_23%,35%_58%,41%_19%,48%_64%,55%_26%,62%_70%,68%_31%,75%_62%,82%_19%,89%_56%,95%_26%,100%_60%,100%_100%,0_100%)]" />
      </section>

      <section className="border-y-2 border-[#1B1B19] bg-[#F1C40F]">
        <div className="mx-auto grid max-w-6xl px-4 py-6 sm:grid-cols-3 sm:px-8">
          {[
            ['01', 'PREVIEW THE DROP', 'See the first six concepts.'],
            ['02', 'PICK YOUR FAVORITE', 'Tell us what you want first.'],
            ['03', 'GET FIRST ACCESS', 'We’ll email the waitlist before launch.'],
          ].map(([number, title, body]) => (
            <div key={number} className="flex items-start gap-4 border-b-2 border-[#1B1B19] py-4 last:border-b-0 sm:border-b-0 sm:border-l-2 sm:px-6 sm:first:border-l-0 sm:first:pl-0">
              <span className="font-mono text-sm font-black">{number}</span>
              <div>
                <p className="text-sm font-black tracking-[0.08em]">{title}</p>
                <p className="mt-1 text-sm text-[#454238]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="collection" className="scroll-mt-20 px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <p className="font-mono text-xs font-black tracking-[0.18em] text-[#806C12]">THE FIRST DROP</p>
              <h2 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.045em] sm:text-6xl">
                For the operator who has enough tote bags.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#4B4943] lg:justify-self-end">
              Six logo-led concepts for AI and security people. Planned retail values are directional until the drop opens; joining the waitlist does not reserve or purchase anything.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {merchProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onJoin={openWaitlist} />
            ))}
          </div>
        </div>
      </section>

      <section ref={waitlistRef} id="merch-waitlist" className="gift-store-grid scroll-mt-14 bg-[#1B1B19] px-4 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F1C40F] px-3 py-2 font-mono text-[11px] font-black tracking-[0.15em] text-[#1B1B19]">
              <Mail className="h-4 w-4" aria-hidden="true" />
              WAITLIST OPEN
            </div>
            <h2 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-[-0.045em] sm:text-6xl">
              Get the first signal.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#BEB9AF]">
              Tell us which concept you want. We’ll use the response to decide what gets produced and notify you when Drop 001 or a Risk Takers giveaway becomes available.
            </p>

            <div className="mt-8 border-l-4 border-[#F1C40F] bg-[#292926] p-5">
              <p className="font-mono text-xs font-black tracking-[0.16em] text-[#F1C40F]">WAITLIST, NOT CHECKOUT</p>
              <p className="mt-2 text-sm leading-6 text-[#D1CCC2]">No card, shipping address, or payment is requested. This form only records your contact details and product interest.</p>
            </div>
          </div>

          <MerchWaitlistForm selectedInterest={selectedInterest} onInterestChange={setSelectedInterest} />
        </div>
      </section>

      <section className="bg-[#F5F0E4] px-4 py-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 border-t-2 border-[#1B1B19] pt-10 md:grid-cols-[1fr_1fr_1fr_auto]">
          <div>
            <p className="text-lg font-black">RISK TAKERS</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#5D5A52]">Real stories, real tradeoffs, practical playbooks—and field gear for the people doing the work.</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em]">Drop 001</p>
            <a href="#collection" className="mt-3 block text-sm text-[#555249] hover:text-black">Preview collection</a>
            <a href="#merch-waitlist" className="mt-2 block text-sm text-[#555249] hover:text-black">Join waitlist</a>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em]">Policies</p>
            <Link to="/privacy" className="mt-3 block text-sm text-[#555249] hover:text-black">Privacy</Link>
            <Link to="/terms" className="mt-2 block text-sm text-[#555249] hover:text-black">Terms</Link>
          </div>
          <img src="/merch/risk-takers-logo-bug.png" alt="Risk Takers" className="h-20 w-20 rounded-md" />
        </div>
      </section>
    </main>
  );
}
