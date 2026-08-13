import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
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
  return (
    <article id={product.id} className="group scroll-mt-24">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#D9D7D1]">
        <img
          src={product.image}
          alt={`${product.name} product concept`}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.018]"
          loading={index < 3 ? 'eager' : 'lazy'}
        />
      </div>

      <div className="border-t border-[#1B1B19]/15 pt-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6D695F]">
              {product.category}
            </p>
            <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#1B1B19]">
              {product.name}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#777269]">Planned retail</p>
            <p className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#1B1B19]">
              {formatMerchPrice(product.retailValue)}
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-lg text-[15px] leading-6 text-[#59564F]">{product.description}</p>

        <p className="mt-4 text-xs font-medium leading-5 text-[#777269]">
          {product.details.join(' · ')}
        </p>

        <button
          type="button"
          onClick={() => onJoin(product.id)}
          aria-controls="merch-waitlist"
          className="mt-5 inline-flex items-center gap-2 border-b border-[#1B1B19] pb-1 text-sm font-semibold text-[#1B1B19] transition-colors hover:border-[#A88C00] hover:text-[#806C12] focus:outline-none focus:ring-2 focus:ring-[#C7A900] focus:ring-offset-4"
        >
          Notify me about this piece
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}


function MerchWaitlistForm({ selectedInterest, onInterestChange }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [status, setStatus] = useState('idle');

  const selectedProduct = merchProducts.find((product) => product.id === selectedInterest);
  const interestLabel = selectedProduct?.name || 'the full Edition 01 collection';

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
      <div className="border border-black/10 bg-[#F5F3EE] p-7 text-[#1B1B19] sm:p-10" role="status" aria-live="polite">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C7A900]">
          <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <h3 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">You’re on the list.</h3>
        <p className="mt-3 max-w-xl text-base leading-7 text-[#59564F]">
          We recorded your interest in {interestLabel}. We’ll email you when the first Risk Takers drop or giveaway opens.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-xs font-bold uppercase tracking-[0.14em] underline underline-offset-4"
        >
          Add another email
        </button>
      </div>
    );
  }

  const fieldClass = 'min-h-12 border border-[#C9C5BB] bg-white px-4 text-base font-medium normal-case tracking-normal text-[#1B1B19] outline-none transition focus:border-[#1B1B19] focus:ring-2 focus:ring-[#C7A900]';

  return (
    <form onSubmit={handleSubmit} className="border border-black/10 bg-[#F5F3EE] p-6 text-[#1B1B19] sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F5A51]">
          Name
          <input
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            className={fieldClass}
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F5A51]">
          Email
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
            className={fieldClass}
            placeholder="you@company.com"
          />
        </label>
      </div>

      <label className="mt-5 grid gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5F5A51]">
        Most interested in
        <select
          value={selectedInterest}
          onChange={(event) => onInterestChange(event.target.value)}
          className={fieldClass}
        >
          <option value="full-drop">The full Edition 01 collection</option>
          {merchProducts.map((product) => (
            <option key={product.id} value={product.id}>{product.name}</option>
          ))}
        </select>
      </label>

      <PrivacyCollectionNotice className="mt-5" />

      {status === 'error' && (
        <div className="mt-5 flex items-start gap-3 border border-[#A53B31] bg-[#FFF0ED] p-4 text-sm font-semibold text-[#7D251E]" role="alert">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          We couldn’t add you just now. Please try again.
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 bg-[#1B1B19] px-6 text-sm font-bold text-white transition-colors hover:bg-[#353530] focus:outline-none focus:ring-2 focus:ring-[#C7A900] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
      >
        {status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Mail className="h-5 w-5" aria-hidden="true" />}
        {status === 'loading' ? 'Joining…' : 'Join the merch waitlist'}
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-[#777269]">
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
      description: 'Preview Risk Takers apparel and desk gear, then join the waitlist for Edition 01.',
      path: '/gift-store',
      image: absoluteUrl('/merch/hero/risk-takers-merch-real-v2.png'),
      jsonLd: [collectionJsonLd],
    });
  }, []);

  const openWaitlist = (interest = 'full-drop') => {
    setSelectedInterest(interest);
    window.requestAnimationFrame(() => waitlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <main className="min-h-screen bg-[#E9E7E1] font-sans text-[#1B1B19]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .gift-store-page { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>

      <div className="gift-store-page">
        <section className="border-b border-[#1B1B19]/15">
          <div className="mx-auto grid max-w-7xl lg:min-h-[740px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24 xl:px-16">
              <div className="max-w-2xl">
                <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#625E55]">
                  <span className="h-2 w-2 rounded-full bg-[#C7A900]" />
                  Risk Takers / Edition 01 / WAITLIST ONLY
                </p>

                <h1 className="mt-8 text-5xl font-semibold leading-[0.96] tracking-[-0.06em] sm:text-7xl lg:text-[5.5rem]">
                  Gear for people who make the call.
                </h1>

                <p className="mt-7 max-w-xl text-lg leading-8 text-[#59564F]">
                  A restrained first collection for the people operating where AI, security, and judgment meet. Preview the pieces and tell us what should be made first.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openWaitlist()}
                    className="inline-flex min-h-13 items-center justify-center gap-3 bg-[#1B1B19] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#353530] focus:outline-none focus:ring-2 focus:ring-[#C7A900] focus:ring-offset-4"
                  >
                    Join the waitlist
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <a
                    href="#collection"
                    className="inline-flex min-h-13 items-center justify-center border border-[#1B1B19]/35 px-6 py-4 text-sm font-bold text-[#1B1B19] transition-colors hover:border-[#1B1B19] hover:bg-white/35"
                  >
                    View the collection
                  </a>
                </div>

                <p className="mt-6 text-xs leading-5 text-[#777269]">
                  Concept preview only — nothing on this page is for sale yet.
                </p>
              </div>
            </div>

            <figure className="border-t border-[#1B1B19]/15 bg-[#D8D5CE] lg:border-l lg:border-t-0">
              <img
                src="/merch/hero/risk-takers-merch-real-v2.png"
                alt="Risk Takers apparel and desk collection"
                className="h-full min-h-[480px] w-full object-cover object-center lg:min-h-[740px]"
                decoding="async"
              />
            </figure>
          </div>
        </section>

        <section className="border-b border-[#1B1B19]/15 bg-[#F0EEE9]">
          <div className="mx-auto grid max-w-7xl divide-y divide-[#1B1B19]/10 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              ['01', 'Six physical concepts'],
              ['02', 'Planned retail values'],
              ['03', 'Produced by demand'],
            ].map(([number, label]) => (
              <div key={number} className="flex items-center gap-4 py-5 md:px-8 md:first:pl-0">
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#9A8308]">{number}</span>
                <span className="text-sm font-medium text-[#555149]">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="collection" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 grid gap-7 border-b border-[#1B1B19]/15 pb-10 lg:grid-cols-[1fr_.75fr] lg:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#82720E]">Edition 01</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">The first collection.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-[#59564F] lg:justify-self-end">
                Apparel and desk pieces designed to feel at home in the real world—not like security conference swag. Values are directional until production is confirmed.
              </p>
            </div>

            <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
              {merchProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} onJoin={openWaitlist} />
              ))}
            </div>
          </div>
        </section>

        <section ref={waitlistRef} id="merch-waitlist" className="scroll-mt-14 bg-[#1B1B19] px-5 py-20 text-white sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="max-w-xl">
              <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D0B61A]">
                <span className="h-2 w-2 rounded-full bg-[#D0B61A]" />
                Waitlist open
              </p>
              <h2 className="mt-7 text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-6xl">
                Help choose what gets made.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#BDB9B0]">
                Pick the piece you want most. We’ll use the signal to prioritize production and email you when Edition 01 or a Risk Takers giveaway opens.
              </p>

              <div className="mt-10 border-t border-white/15 pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">Waitlist, not checkout</p>
                <p className="mt-3 text-sm leading-6 text-[#9E9A92]">
                  No card, shipping address, or payment is requested. This only records your contact details and product interest.
                </p>
              </div>
            </div>

            <MerchWaitlistForm selectedInterest={selectedInterest} onInterestChange={setSelectedInterest} />
          </div>
        </section>

        <footer className="bg-[#F0EEE9] px-5 py-12 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 border-t border-[#1B1B19]/15 pt-8 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <div>
              <img src="/merch/risk-takers-logo-bug.png" alt="Risk Takers" className="h-14 w-14 rounded-sm" />
              <p className="mt-4 max-w-md text-sm leading-6 text-[#68645C]">Stories, tradeoffs, and useful objects for people who own the outcome.</p>
            </div>
            <a href="#collection" className="text-sm font-medium text-[#555149] hover:text-black">Collection</a>
            <div className="flex gap-5">
              <Link to="/privacy" className="text-sm font-medium text-[#555149] hover:text-black">Privacy</Link>
              <Link to="/terms" className="text-sm font-medium text-[#555149] hover:text-black">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
