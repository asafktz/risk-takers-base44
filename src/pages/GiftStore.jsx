import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PrivacyCollectionNotice from '@/components/PrivacyCollectionNotice';
import { setSEO, absoluteUrl } from '@/lib/seo';
import { formatMerchPrice, merchProducts } from '@/config/merch';


const PUBLIC_CONFIG_ENDPOINT = '/api/merchPublicConfig';
const CHECKOUT_ENDPOINT = '/api/merchCheckout';
const PRIVATE_ACCESS_SESSION_KEY = 'risk-takers:merch-private-access';
const OPTION_LABELS = {
  color: 'Color',
  size: 'Size',
  description: 'Option',
};

const waitlistConfig = {
  salesState: 'waitlist',
  commerceEnabled: false,
  currency: 'USD',
  products: [],
};

function getPrivateAccessToken() {
  try {
    return window.sessionStorage.getItem(PRIVATE_ACCESS_SESSION_KEY) || '';
  } catch {
    return '';
  }
}

function commerceHeaders(withJson = false) {
  const token = getPrivateAccessToken();
  return {
    Accept: 'application/json',
    ...(withJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function safePublicConfig(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.products)) {
    throw new Error('The store returned an invalid availability response.');
  }

  const salesState = ['waitlist', 'private_test', 'live'].includes(value.salesState)
    ? value.salesState
    : 'waitlist';
  return {
    salesState,
    commerceEnabled: value.commerceEnabled === true && salesState !== 'waitlist',
    currency: value.currency === 'USD' ? 'USD' : 'USD',
    products: value.products.filter((product) => (
      product
      && typeof product.id === 'string'
      && Array.isArray(product.variants)
    )),
  };
}

function collectionJsonLd(isLive) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isLive ? 'Risk Takers Gift Store' : 'Risk Takers Merch Waitlist',
    url: absoluteUrl('/gift-store'),
    description: isLive
      ? 'Shop the first Risk Takers apparel and desk collection.'
      : 'Preview the first Risk Takers merch collection and join the waitlist.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: merchProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: isLive
          ? {
              '@type': 'Product',
              name: product.name,
              description: product.description,
              image: absoluteUrl(product.image),
              url: absoluteUrl(`/gift-store#${product.id}`),
              brand: { '@type': 'Brand', name: 'Risk Takers' },
              offers: {
                '@type': 'Offer',
                price: product.retailValue,
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: absoluteUrl(`/gift-store#${product.id}`),
              },
            }
          : {
              '@type': 'Thing',
              name: product.name,
              url: absoluteUrl(`/gift-store#${product.id}`),
            },
      })),
    },
  };
}

function selectionKey(selection = {}) {
  return Object.entries(selection)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
}

function itemKey(productId, selection) {
  return `${productId}::${selectionKey(selection)}`;
}

function availableVariants(product) {
  return (product?.variants || []).filter((variant) => variant.availability === 'available');
}

function optionKeysFor(variants) {
  const primary = ['color', 'size'].filter((key) => variants.some((variant) => variant.selection?.[key]));
  if (primary.length) {
    const primaryCombinations = new Set(variants.map((variant) => (
      primary.map((key) => variant.selection?.[key] || '').join('|')
    )));
    const needsDescription = primaryCombinations.size < variants.length
      && variants.some((variant) => variant.selection?.description);
    return needsDescription ? [...primary, 'description'] : primary;
  }
  return variants.some((variant) => variant.selection?.description) ? ['description'] : [];
}

function buildOptionModel(variants, requestedSelection) {
  const keys = optionKeysFor(variants);
  const resolvedSelection = {};
  const fields = keys.map((key) => {
    const candidates = variants.filter((variant) => (
      Object.entries(resolvedSelection).every(([selectedKey, selectedValue]) => (
        variant.selection?.[selectedKey] === selectedValue
      ))
    ));
    const values = [...new Set(candidates.map((variant) => variant.selection?.[key]).filter(Boolean))];
    const requested = requestedSelection[key];
    const value = values.includes(requested) ? requested : values.length === 1 ? values[0] : '';
    if (value) resolvedSelection[key] = value;
    return { key, label: OPTION_LABELS[key], values, value };
  });
  const complete = fields.every((field) => Boolean(field.value));
  const matches = complete
    ? variants.filter((variant) => Object.entries(resolvedSelection).every(([key, value]) => variant.selection?.[key] === value))
    : [];
  const selectedVariant = matches.length === 1 ? matches[0] : null;

  return {
    fields,
    resolvedSelection,
    complete: keys.length === 0 ? variants.length === 1 : complete && Boolean(selectedVariant),
    selectedVariant,
  };
}

function ProductCard({ product, providerProduct, commerceEnabled, configLoading, onJoin, onAdd }) {
  const [requestedSelection, setRequestedSelection] = useState({});
  const variants = useMemo(() => availableVariants(providerProduct), [providerProduct]);
  const optionModel = buildOptionModel(variants, requestedSelection);
  const available = commerceEnabled && providerProduct?.availability === 'available' && variants.length > 0;
  const displayedPrice = optionModel.selectedVariant?.retailValue || providerProduct?.retailValue || product.retailValue;

  const chooseOption = (key, value) => {
    const keys = optionKeysFor(variants);
    const changedIndex = keys.indexOf(key);
    setRequestedSelection((current) => {
      const next = { ...current, [key]: value };
      keys.slice(changedIndex + 1).forEach((laterKey) => delete next[laterKey]);
      return next;
    });
  };

  const addToBag = () => {
    if (!available || !optionModel.complete) return;
    onAdd({
      product,
      selection: optionModel.resolvedSelection,
      unitPrice: Number(displayedPrice) || product.retailValue,
    });
  };

  return (
    <article id={product.id} className="group scroll-mt-24">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#D9D7D1]">
        <img
          src={product.image}
          alt={commerceEnabled ? product.name : `${product.name} product preview`}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.018]"
          loading="lazy"
          decoding="async"
        />
        {commerceEnabled && (
          <span className="absolute left-4 top-4 bg-[#1B1B19] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            Made on demand
          </span>
        )}
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
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#777269]">
              {commerceEnabled ? 'Retail' : 'Planned retail'}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#1B1B19]">
              {formatMerchPrice(displayedPrice)}
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-lg text-[15px] leading-6 text-[#59564F]">{product.description}</p>

        <p className="mt-4 text-xs font-medium leading-5 text-[#777269]">
          {product.details.join(' · ')}
        </p>

        {configLoading && (
          <div className="mt-5 flex min-h-12 items-center gap-2 border border-[#1B1B19]/15 px-4 text-sm font-semibold text-[#68645C]" role="status">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Checking availability…
          </div>
        )}

        {!configLoading && commerceEnabled && (
          <div className="mt-5">
            {available && optionModel.fields.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {optionModel.fields.map((field) => (
                  <label key={field.key} className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5F5A51]">
                    {field.label}
                    <select
                      value={field.value}
                      onChange={(event) => chooseOption(field.key, event.target.value)}
                      className="min-h-11 border border-[#BEBAB0] bg-transparent px-3 text-sm font-semibold normal-case tracking-normal text-[#1B1B19] outline-none transition focus:border-[#1B1B19] focus:ring-2 focus:ring-[#C7A900]"
                    >
                      {field.values.length > 1 && <option value="">Choose {field.label.toLowerCase()}</option>}
                      {field.values.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addToBag}
              disabled={!available || !optionModel.complete}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#1B1B19] px-5 text-sm font-bold text-white transition-colors hover:bg-[#353530] focus:outline-none focus:ring-2 focus:ring-[#C7A900] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#AAA69D]"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {!available ? 'Currently unavailable' : optionModel.complete ? 'Add to bag' : 'Choose options'}
            </button>
          </div>
        )}

        {!configLoading && !commerceEnabled && (
          <button
            type="button"
            onClick={() => onJoin(product.id)}
            aria-controls="merch-waitlist"
            className="mt-5 inline-flex items-center gap-2 border-b border-[#1B1B19] pb-1 text-sm font-semibold text-[#1B1B19] transition-colors hover:border-[#A88C00] hover:text-[#806C12] focus:outline-none focus:ring-2 focus:ring-[#C7A900] focus:ring-offset-4"
          >
            Notify me about this piece
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
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


function CartDrawer({ open, items, checkoutStatus, checkoutError, onClose, onQuantity, onRemove, onCheckout }) {
  const returnFocusRef = useRef(null);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/55" />
        <DialogPrimitive.Content
          className="fixed inset-y-0 right-0 z-[101] flex w-full max-w-lg flex-col bg-[#F3F1EB] shadow-2xl focus:outline-none"
          onOpenAutoFocus={() => { returnFocusRef.current = document.activeElement; }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
          }}
        >
          <DialogPrimitive.Description className="sr-only">
            Review products in your bag, change quantities, and continue to secure checkout.
          </DialogPrimitive.Description>
        <div className="flex items-center justify-between border-b border-[#1B1B19]/15 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#88750B]">Edition 01</p>
            <DialogPrimitive.Title className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Your bag <span className="text-[#777269]">({itemCount})</span></DialogPrimitive.Title>
          </div>
          <DialogPrimitive.Close asChild>
            <button type="button" className="grid h-11 w-11 place-items-center border border-[#1B1B19]/20 hover:bg-white" aria-label="Close bag">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </DialogPrimitive.Close>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          {items.length === 0 ? (
            <div className="grid min-h-64 place-items-center border border-dashed border-[#1B1B19]/25 p-8 text-center">
              <div>
                <ShoppingBag className="mx-auto h-7 w-7 text-[#8A857B]" aria-hidden="true" />
                <p className="mt-4 text-lg font-semibold">Your bag is empty.</p>
                <button type="button" onClick={onClose} className="mt-4 border-b border-black pb-1 text-sm font-bold">Browse Edition 01</button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#1B1B19]/15 border-y border-[#1B1B19]/15">
              {items.map((item) => (
                <div key={item.key} className="grid grid-cols-[88px_1fr] gap-4 py-5">
                  <img src={item.product.image} alt="" className="aspect-[4/5] w-[88px] object-cover" />
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold leading-5">{item.product.name}</h3>
                        {Object.keys(item.selection).length > 0 && (
                          <p className="mt-1 text-xs leading-5 text-[#777269]">
                            {Object.entries(item.selection).map(([key, value]) => `${OPTION_LABELS[key]}: ${value}`).join(' · ')}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 text-sm font-semibold">{formatMerchPrice(item.unitPrice * item.quantity)}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center border border-[#1B1B19]/20 bg-white/40">
                        <button type="button" onClick={() => onQuantity(item.key, item.quantity - 1)} className="grid h-9 w-9 place-items-center hover:bg-white" aria-label={`Decrease ${item.product.name} quantity`}>
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                        <button type="button" onClick={() => onQuantity(item.key, item.quantity + 1)} disabled={item.quantity >= 5 || itemCount >= 10} className="grid h-9 w-9 place-items-center hover:bg-white disabled:cursor-not-allowed disabled:opacity-35" aria-label={`Increase ${item.product.name} quantity`}>
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                      <button type="button" onClick={() => onRemove(item.key)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#777269] underline underline-offset-4 hover:text-black">
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[#1B1B19]/15 bg-[#E9E7E1] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold">Subtotal</span>
            <span className="text-2xl font-semibold tracking-[-0.03em]">{formatMerchPrice(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#68645C]">Shipping and applicable taxes are calculated in secure checkout.</p>

          {checkoutError && (
            <div className="mt-4 flex items-start gap-3 border border-[#A53B31] bg-[#FFF0ED] p-3 text-sm font-semibold text-[#7D251E]" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {checkoutError}
            </div>
          )}

          <button
            type="button"
            onClick={onCheckout}
            disabled={items.length === 0 || checkoutStatus === 'loading'}
            className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-3 bg-[#1B1B19] px-6 text-sm font-bold text-white transition-colors hover:bg-[#353530] focus:outline-none focus:ring-2 focus:ring-[#C7A900] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkoutStatus === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-5 w-5" aria-hidden="true" />}
            {checkoutStatus === 'loading' ? 'Preparing secure checkout…' : 'Continue to secure checkout'}
          </button>
        </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}


export default function GiftStore() {
  const waitlistRef = useRef(null);
  const [selectedInterest, setSelectedInterest] = useState('full-drop');
  const [storeConfig, setStoreConfig] = useState(waitlistConfig);
  const [configStatus, setConfigStatus] = useState('loading');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartMessage, setCartMessage] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState('idle');
  const [checkoutError, setCheckoutError] = useState('');

  const commerceEnabled = storeConfig.commerceEnabled
    && ['private_test', 'live'].includes(storeConfig.salesState);
  const isLive = commerceEnabled && storeConfig.salesState === 'live';
  const providerProducts = useMemo(
    () => new Map(storeConfig.products.map((product) => [product.id, product])),
    [storeConfig.products],
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStoreConfig() {
      setConfigStatus('loading');
      try {
        const response = await fetch(PUBLIC_CONFIG_ENDPOINT, {
          method: 'GET',
          headers: commerceHeaders(),
          credentials: 'same-origin',
          signal: controller.signal,
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.error || 'Store availability could not be loaded.');
        setStoreConfig(safePublicConfig(result));
        setConfigStatus('ready');
      } catch (error) {
        if (error?.name === 'AbortError') return;
        console.error('Could not load merch availability:', error);
        setStoreConfig(waitlistConfig);
        setConfigStatus('error');
      }
    }

    loadStoreConfig();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setSEO({
      title: isLive ? 'Gift Store' : storeConfig.salesState === 'private_test' ? 'Private Gift Store' : 'Merch Waitlist',
      description: isLive
        ? 'Shop Risk Takers apparel and desk gear, made and fulfilled on demand.'
        : 'Preview Risk Takers apparel and desk gear, then join the waitlist for Edition 01.',
      path: '/gift-store',
      image: absoluteUrl('/merch/hero/risk-takers-merch-real-v2.jpg'),
      noindex: storeConfig.salesState === 'private_test',
      jsonLd: [collectionJsonLd(isLive)],
    });
  }, [isLive, storeConfig.salesState]);

  const openWaitlist = (interest = 'full-drop') => {
    setSelectedInterest(interest);
    window.requestAnimationFrame(() => waitlistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const addToBag = ({ product, selection, unitPrice }) => {
    setCheckoutError('');
    setCartMessage('');
    setCartItems((current) => {
      const key = itemKey(product.id, selection);
      const existing = current.find((item) => item.key === key);
      const total = current.reduce((sum, item) => sum + item.quantity, 0);
      if (total >= 10 || existing?.quantity >= 5) {
        setCartMessage('The bag is limited to 10 items and 5 of each option.');
        return current;
      }
      if (existing) {
        return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { key, product, selection, unitPrice, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const changeQuantity = (key, quantity) => {
    if (quantity < 1) {
      setCartItems((current) => current.filter((item) => item.key !== key));
      return;
    }
    setCartItems((current) => {
      const totalWithoutItem = current
        .filter((item) => item.key !== key)
        .reduce((sum, item) => sum + item.quantity, 0);
      const bounded = Math.min(5, quantity, 10 - totalWithoutItem);
      return current.map((item) => item.key === key ? { ...item, quantity: bounded } : item);
    });
  };

  const startCheckout = async () => {
    if (!cartItems.length) return;
    setCheckoutStatus('loading');
    setCheckoutError('');

    try {
      const response = await fetch(CHECKOUT_ENDPOINT, {
        method: 'POST',
        headers: commerceHeaders(true),
        credentials: 'same-origin',
        body: JSON.stringify({
          currency: 'USD',
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            selection: item.selection,
          })),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || 'Checkout could not be prepared. Please try again.');
      const checkoutUrl = new URL(result.checkoutUrl);
      if (checkoutUrl.protocol !== 'https:') throw new Error('Checkout returned an invalid destination.');
      window.location.assign(checkoutUrl.toString());
    } catch (error) {
      console.error('Could not prepare merch checkout:', error);
      setCheckoutError(error?.message || 'Checkout could not be prepared. Please try again.');
      setCheckoutStatus('error');
    }
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
                  <span className={`h-2 w-2 rounded-full ${commerceEnabled ? 'bg-[#5B792D]' : 'bg-[#C7A900]'}`} />
                  {configStatus === 'loading'
                    ? 'Risk Takers / Edition 01 / CHECKING AVAILABILITY'
                    : commerceEnabled
                      ? `Risk Takers / Edition 01 / ${isLive ? 'SHOP OPEN' : 'PRIVATE CHECKOUT'}`
                      : 'Risk Takers / Edition 01 / WAITLIST ONLY'}
                </p>

                <h1 className="mt-8 text-5xl font-semibold leading-[0.96] tracking-[-0.06em] sm:text-7xl lg:text-[5.5rem]">
                  Gear for people who make the call.
                </h1>

                <p className="mt-7 max-w-xl text-lg leading-8 text-[#59564F]">
                  {commerceEnabled
                    ? 'The first Risk Takers collection for people operating where AI, security, and judgment meet. Made on demand with secure hosted checkout.'
                    : 'A restrained first collection for the people operating where AI, security, and judgment meet. Preview the pieces and tell us what should be made first.'}
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  {commerceEnabled ? (
                    <>
                      <a href="#collection" className="inline-flex min-h-13 items-center justify-center gap-3 bg-[#1B1B19] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#353530] focus:outline-none focus:ring-2 focus:ring-[#C7A900] focus:ring-offset-4">
                        Shop Edition 01
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </a>
                      <button type="button" onClick={() => setCartOpen(true)} className="inline-flex min-h-13 items-center justify-center gap-3 border border-[#1B1B19]/35 px-6 py-4 text-sm font-bold text-[#1B1B19] transition-colors hover:border-[#1B1B19] hover:bg-white/35">
                        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                        Bag ({cartCount})
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => openWaitlist()} className="inline-flex min-h-13 items-center justify-center gap-3 bg-[#1B1B19] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#353530] focus:outline-none focus:ring-2 focus:ring-[#C7A900] focus:ring-offset-4">
                        Join the waitlist
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <a href="#collection" className="inline-flex min-h-13 items-center justify-center border border-[#1B1B19]/35 px-6 py-4 text-sm font-bold text-[#1B1B19] transition-colors hover:border-[#1B1B19] hover:bg-white/35">
                        View the collection
                      </a>
                    </>
                  )}
                </div>

                <p className="mt-6 text-xs leading-5 text-[#777269]">
                  {commerceEnabled
                    ? 'Secure hosted checkout. Shipping and taxes are calculated before payment.'
                    : 'Concept preview only — nothing on this page is for sale yet.'}
                </p>
              </div>
            </div>

            <figure className="border-t border-[#1B1B19]/15 bg-[#D8D5CE] lg:border-l lg:border-t-0">
              <img
                src="/merch/hero/risk-takers-merch-real-v2.jpg"
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
              ['01', commerceEnabled ? 'Six physical products' : 'Six physical concepts'],
              ['02', commerceEnabled ? 'Real retail pricing' : 'Planned retail values'],
              ['03', 'Made and fulfilled on demand'],
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
                {commerceEnabled
                  ? 'Apparel and desk pieces made only when ordered. Choose your options, add pieces to one bag, and finish through secure hosted checkout.'
                  : 'Apparel and desk pieces designed to feel at home in the real world—not like security conference swag. Values are directional until production is confirmed.'}
              </p>
            </div>

            {configStatus === 'error' && (
              <div className="mb-10 flex items-start gap-3 border border-[#9C8320] bg-[#FFF8D7] p-4 text-sm font-semibold text-[#69560B]" role="alert">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                Live availability could not be loaded. The collection is in preview mode and the waitlist remains open.
              </div>
            )}

            {cartMessage && (
              <div className="mb-10 flex items-start gap-3 border border-[#9C8320] bg-[#FFF8D7] p-4 text-sm font-semibold text-[#69560B]" role="status">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                {cartMessage}
              </div>
            )}

            <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
              {merchProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  providerProduct={providerProducts.get(product.id)}
                  commerceEnabled={commerceEnabled}
                  configLoading={configStatus === 'loading'}
                  onJoin={openWaitlist}
                  onAdd={addToBag}
                />
              ))}
            </div>
          </div>
        </section>

        {!commerceEnabled ? (
          <section ref={waitlistRef} id="merch-waitlist" className="scroll-mt-14 bg-[#1B1B19] px-5 py-20 text-white sm:px-8 sm:py-28">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div className="max-w-xl">
                <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D0B61A]">
                  <span className="h-2 w-2 rounded-full bg-[#D0B61A]" />
                  Waitlist open
                </p>
                <h2 className="mt-7 text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-6xl">Help choose what gets made.</h2>
                <p className="mt-6 text-lg leading-8 text-[#BDB9B0]">
                  Pick the piece you want most. We’ll use the signal to prioritize production and email you when Edition 01 or a Risk Takers giveaway opens.
                </p>
                <div className="mt-10 border-t border-white/15 pt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">Waitlist, not checkout</p>
                  <p className="mt-3 text-sm leading-6 text-[#9E9A92]">No card, shipping address, or payment is requested. This only records your contact details and product interest.</p>
                </div>
              </div>
              <MerchWaitlistForm selectedInterest={selectedInterest} onInterestChange={setSelectedInterest} />
            </div>
          </section>
        ) : (
          <section className="bg-[#1B1B19] px-5 py-20 text-white sm:px-8 sm:py-28">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-end">
              <div className="max-w-2xl">
                <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D0B61A]">
                  <span className="h-2 w-2 rounded-full bg-[#D0B61A]" />
                  Made for the order
                </p>
                <h2 className="mt-7 text-4xl font-semibold leading-[1] tracking-[-0.05em] sm:text-6xl">Useful objects. No warehouse theater.</h2>
              </div>
              <div className="grid gap-5 border-t border-white/15 pt-7 text-sm leading-6 text-[#BDB9B0] sm:grid-cols-2">
                <p><strong className="block text-white">Produced on demand</strong>Each piece enters production after checkout, reducing unsold inventory.</p>
                <p><strong className="block text-white">Hosted checkout</strong>Payment, address, tax, and shipping details are handled in a secure checkout.</p>
              </div>
            </div>
          </section>
        )}

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

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        checkoutStatus={checkoutStatus}
        checkoutError={checkoutError}
        onClose={() => setCartOpen(false)}
        onQuantity={changeQuantity}
        onRemove={(key) => setCartItems((current) => current.filter((item) => item.key !== key))}
        onCheckout={startCheckout}
      />
    </main>
  );
}
