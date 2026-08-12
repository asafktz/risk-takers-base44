import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Gift,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { setSEO, absoluteUrl } from '@/lib/seo';
import { formatMerchPrice, merchProducts, merchProvider } from '@/config/merch';


const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Risk Takers Gift Store',
  url: absoluteUrl('/gift-store'),
  description: 'Risk Takers apparel, desk gear, and gifts for AI and cybersecurity operators.',
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


function ProductCard({ product, index }) {
  const isWide = index === 0 || index === 3 || index === 5;
  const imagePosition = product.id === 'operators-desk-kit' ? 'object-center' : 'object-center';

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
          className={`h-full w-full object-cover ${imagePosition} transition-transform duration-700 group-hover:scale-[1.025]`}
          loading={index < 2 ? 'eager' : 'lazy'}
        />
        <span className="absolute left-4 top-4 border-2 border-[#1B1B19] bg-[#F1C40F] px-3 py-1 font-mono text-[11px] font-black tracking-[0.14em] text-[#1B1B19]">
          {product.badge}
        </span>
        <span className="absolute bottom-4 right-4 border-2 border-[#1B1B19] bg-[#F5F0E4] px-3 py-1 text-sm font-black text-[#1B1B19]">
          {product.category}
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
          <p className="shrink-0 text-2xl font-black text-[#1B1B19]">{formatMerchPrice(product.price)}</p>
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

        <div className="mt-7">
          {product.providerUrl ? (
            <a
              href={product.providerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-between bg-[#1B1B19] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#9A7B00] sm:w-auto sm:min-w-56"
            >
              Choose yours
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-between border-2 border-[#1B1B19] bg-[#DCD7CB] px-5 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-[#5E5B54] sm:w-auto sm:min-w-56"
              title="Checkout activates after the fulfillment storefront is connected"
            >
              Checkout at launch
              <PackageCheck className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}


function SupplyStamp({ icon: Icon, title, body }) {
  return (
    <div className="border-l border-[#4B4943] pl-5 first:border-l-0 first:pl-0">
      <Icon className="mb-3 h-6 w-6 text-[#F1C40F]" strokeWidth={2.2} aria-hidden="true" />
      <p className="text-sm font-black uppercase tracking-[0.08em] text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[#BEB9AF]">{body}</p>
    </div>
  );
}


export default function GiftStore() {
  useEffect(() => {
    setSEO({
      title: 'Gift Store',
      description: 'Shop Risk Takers apparel, desk gear, and gifts made for AI and cybersecurity operators.',
      path: '/gift-store',
      image: absoluteUrl('/merch/hero/risk-takers-gift-store-hero.png'),
      jsonLd: [collectionJsonLd],
    });
  }, []);

  const primaryShopUrl = merchProvider.shopUrl || '#collection';

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
        .gift-store-paper {
          clip-path: polygon(0 2%, 5% 0, 11% 2%, 18% 0, 26% 1.5%, 35% 0, 44% 2%, 53% 0, 63% 1.5%, 72% 0, 83% 2%, 92% 0, 100% 1.5%, 100% 98%, 92% 100%, 82% 98.5%, 72% 100%, 62% 98%, 51% 100%, 41% 98.5%, 31% 100%, 20% 98%, 10% 100%, 0 98.5%);
        }
      `}</style>

      <section
        className="gift-store-grid relative isolate min-h-[760px] overflow-hidden bg-[#151513] text-white"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(14,14,13,.97) 0%, rgba(14,14,13,.89) 35%, rgba(14,14,13,.28) 70%, rgba(14,14,13,.48) 100%), url('/merch/hero/risk-takers-gift-store-hero.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-2 gift-store-hazard" />
        <div className="mx-auto flex min-h-[760px] max-w-6xl items-center px-4 py-20 sm:px-8">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 border border-[#F1C40F] bg-[#1B1B19]/80 px-3 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-[#F1C40F] backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              RISK TAKERS / FIELD SUPPLY / DROP 001
            </div>

            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.91] tracking-[-0.055em] text-[#F5F0E4] sm:text-7xl lg:text-[6.7rem]">
              Hardware for
              <span className="block text-[#F1C40F]">bold operators.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-[#D0CBC0] sm:text-xl">
              Premium gear for people working at the edge of AI, cybersecurity, and consequential decisions. Built to wear. Better to give.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={primaryShopUrl}
                target={merchProvider.isConnected ? '_blank' : undefined}
                rel={merchProvider.isConnected ? 'noreferrer' : undefined}
                className="inline-flex items-center justify-center gap-3 bg-[#F1C40F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#1B1B19] transition-colors hover:bg-[#F8D84B]"
              >
                Browse the drop
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#gift-it"
                className="inline-flex items-center justify-center gap-3 border border-[#77736A] bg-[#1B1B19]/70 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors hover:border-white"
              >
                <Gift className="h-4 w-4" aria-hidden="true" />
                How gifting works
              </a>
            </div>

            {!merchProvider.isConnected && (
              <p className="mt-5 font-mono text-xs leading-5 text-[#9E9A91]">
                COLLECTION PREVIEW — checkout activates after the fulfillment account and product proofs are approved.
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#E8E3D7] [clip-path:polygon(0_52%,4%_18%,9%_63%,15%_30%,22%_66%,28%_23%,35%_58%,41%_19%,48%_64%,55%_26%,62%_70%,68%_31%,75%_62%,82%_19%,89%_56%,95%_26%,100%_60%,100%_100%,0_100%)]" />
      </section>

      <section className="border-y-2 border-[#1B1B19] bg-[#F1C40F]">
        <div className="mx-auto grid max-w-6xl gap-0 px-4 py-6 sm:grid-cols-3 sm:px-8">
          {[
            ['01', 'NO MINIMUMS', 'Made only when ordered.'],
            ['02', 'ONE-USE GIFT LINKS', 'They choose size and address.'],
            ['03', 'FULFILLED END TO END', 'Print, payment, shipping, support.'],
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

      <section id="collection" className="px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <p className="font-mono text-xs font-black tracking-[0.18em] text-[#806C12]">THE FIRST DROP</p>
              <h2 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.045em] sm:text-6xl">
                For the operator who has enough tote bags.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#4B4943] lg:justify-self-end">
              Six sharp, useful pieces with a credible retail price—not generic swag with a logo pasted on. Each design has a print-ready production file and a matching storefront mockup.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {merchProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section id="gift-it" className="gift-store-grid bg-[#1B1B19] px-4 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#F1C40F] px-3 py-2 font-mono text-[11px] font-black tracking-[0.15em] text-[#1B1B19]">
                <Gift className="h-4 w-4" aria-hidden="true" />
                GIFT WITHOUT THE GUESSWORK
              </div>
              <h2 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-[-0.045em] sm:text-6xl">
                Give retail value. Keep the logistics.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#BEB9AF]">
                Send one claim link instead of asking for a size, color, and shipping address. The recipient checks out for $0; production starts only after they choose.
              </p>

              <div className="mt-9 border-l-4 border-[#F1C40F] bg-[#292926] p-5">
                <p className="font-mono text-xs font-black tracking-[0.16em] text-[#F1C40F]">RECOMMENDED GIVEAWAY</p>
                <p className="mt-2 text-2xl font-black">Operator&apos;s Desk Kit</p>
                <p className="mt-1 text-sm leading-6 text-[#BEB9AF]">A $77 retail gift built from a useful desk mat and mug—high visibility, no sizing risk.</p>
              </div>
            </div>

            <ol className="space-y-4">
              {[
                ['Create the claim', 'Choose one product or bundle and generate a unique one-use giveaway link.'],
                ['They choose the details', 'The recipient selects size or color and enters their own delivery address.'],
                ['The partner fulfills', 'The recipient pays nothing. Your account covers product cost and destination-based shipping.'],
              ].map(([title, body], index) => (
                <li key={title} className="grid grid-cols-[64px_1fr] gap-5 border border-[#46463F] bg-[#22221F] p-5 sm:p-6">
                  <span className="font-mono text-4xl font-black text-[#F1C40F]">0{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-[-0.02em]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#BEB9AF]">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-[#2B2A27] px-4 py-12 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <SupplyStamp icon={PackageCheck} title="Made on demand" body="No inventory or minimum order quantity." />
          <SupplyStamp icon={Truck} title="Worldwide delivery" body="Shipping options are calculated for the destination." />
          <SupplyStamp icon={ShieldCheck} title="Partner checkout" body="Payments, tax calculation, and order confirmation are handled securely." />
          <SupplyStamp icon={Gift} title="Gift ready" body="Single-use claim links can cover the item and shipping." />
        </div>
      </section>

      <section className="bg-[#F5F0E4] px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="gift-store-paper grid overflow-hidden bg-[#F1C40F] px-6 py-14 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
            <div>
              <p className="font-mono text-xs font-black tracking-[0.18em]">FIELD SUPPLY / STATUS</p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-none tracking-[-0.04em] sm:text-5xl">
                The collection is built. The checkout is the last mile.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#3F3B2E]">
                Print files, mockups, product pricing, and the native store experience are ready. Live sales and giveaways begin after the fulfillment account, product proofs, payout identity, and billing method are approved.
              </p>
            </div>

            {merchProvider.isConnected ? (
              <a
                href={merchProvider.shopUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center justify-center gap-3 bg-[#1B1B19] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white lg:mt-0"
              >
                Open the store
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center justify-center gap-3 bg-[#1B1B19] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white lg:mt-0"
              >
                Ask about the drop
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>

          <div className="mt-14 grid gap-10 border-t-2 border-[#1B1B19] pt-10 md:grid-cols-[1fr_1fr_1fr_auto]">
            <div>
              <p className="text-lg font-black">RISK TAKERS</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[#5D5A52]">Real stories, real tradeoffs, practical playbooks—and now field gear for the people doing the work.</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em]">Store</p>
              <a href="#collection" className="mt-3 block text-sm text-[#555249] hover:text-black">Collection</a>
              <a href="#gift-it" className="mt-2 block text-sm text-[#555249] hover:text-black">Gift it</a>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em]">Policies</p>
              <Link to="/privacy" className="mt-3 block text-sm text-[#555249] hover:text-black">Privacy</Link>
              <Link to="/terms" className="mt-2 block text-sm text-[#555249] hover:text-black">Terms</Link>
            </div>
            <img src="/merch/risk-takers-logo-bug.png" alt="Risk Takers" className="h-20 w-20 rounded-md" />
          </div>
        </div>
      </section>
    </main>
  );
}
