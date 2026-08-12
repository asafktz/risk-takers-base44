const trimUrl = (value = '') => value.trim().replace(/\/$/, '');

const shopDomain = (import.meta.env.VITE_FOURTHWALL_SHOP_DOMAIN || '')
  .trim()
  .replace(/^https?:\/\//i, '')
  .replace(/\/$/, '');

const productUrl = (override, productSlug) => {
  const explicit = trimUrl(override);
  if (explicit) return explicit;
  if (!shopDomain || !productSlug) return '';
  return `https://${shopDomain}/products/${productSlug}`;
};

export const merchProducts = [
  {
    id: 'human-in-the-loop-tee',
    name: 'Human in the Loop Tee',
    shortName: 'Control Layer Tee',
    category: 'Heavyweight tee',
    price: 39,
    description: 'A reminder that the best AI system still needs judgment at the edge.',
    details: ['Garment-dyed heavyweight cotton', 'Unisex fit', 'Black / S–3XL'],
    image: '/merch/mockups/tee-human-in-the-loop.jpg',
    artwork: '/merch/artwork/human-in-the-loop-print-4500x5400.png',
    providerSlug: 'human-in-the-loop-tee',
    providerUrl: productUrl(import.meta.env.VITE_FOURTHWALL_HUMAN_LOOP_URL, 'human-in-the-loop-tee'),
    badge: 'DROP 001',
  },
  {
    id: 'zero-trust-high-agency-hoodie',
    name: 'Zero Trust / High Agency Hoodie',
    shortName: 'High Agency Hoodie',
    category: 'Premium hoodie',
    price: 79,
    description: 'Verify the system. Trust the operator. Built for people who own the outcome.',
    details: ['Premium midweight fleece', 'Unisex fit', 'Black / S–3XL'],
    image: '/merch/mockups/hoodie-zero-trust-high-agency.jpg',
    artwork: '/merch/artwork/zero-trust-high-agency-print-4500x5400.png',
    providerSlug: 'zero-trust-high-agency-hoodie',
    providerUrl: productUrl(import.meta.env.VITE_FOURTHWALL_ZERO_TRUST_URL, 'zero-trust-high-agency-hoodie'),
    badge: 'SIGNATURE',
  },
  {
    id: 'prompt-injection-fuel-mug',
    name: 'Prompt Injection Fuel Mug',
    shortName: 'Prompt Fuel Mug',
    category: 'Ceramic mug',
    price: 28,
    description: 'Caffeine is useful. An authentication boundary it is not.',
    details: ['Ceramic', 'Dishwasher safe', '11 oz / warm white'],
    image: '/merch/mockups/mug-prompt-injection-fuel.jpg',
    artwork: '/merch/artwork/prompt-injection-fuel-mug-print-4800x2000.png',
    providerSlug: 'prompt-injection-fuel-mug',
    providerUrl: productUrl(import.meta.env.VITE_FOURTHWALL_PROMPT_FUEL_URL, 'prompt-injection-fuel-mug'),
    badge: 'OPERATOR FUEL',
  },
  {
    id: 'attack-surface-desk-mat',
    name: 'Attack Surface Desk Mat',
    shortName: 'Attack Surface Mat',
    category: 'Extended desk mat',
    price: 49,
    description: 'Map the surface. Make the move. Verify everything before you ship.',
    details: ['31.5 × 15.5 in', 'Stitched edge', 'Non-slip rubber base'],
    image: '/merch/mockups/deskmat-attack-surface.jpg',
    artwork: '/merch/artwork/attack-surface-desk-mat-print-6000x2600.png',
    providerSlug: 'attack-surface-desk-mat',
    providerUrl: productUrl(import.meta.env.VITE_FOURTHWALL_ATTACK_SURFACE_URL, 'attack-surface-desk-mat'),
    badge: 'BEST GIFT VALUE',
  },
  {
    id: 'take-the-risk-sticker',
    name: 'Take the Risk Sticker',
    shortName: 'Outcome Sticker',
    category: 'Die-cut sticker',
    price: 8,
    description: 'The smallest possible reminder to make the call and own what follows.',
    details: ['Weather-resistant vinyl', 'Die-cut finish', 'Approx. 3 in'],
    image: '/merch/mockups/sticker-take-the-risk.jpg',
    artwork: '/merch/artwork/take-the-risk-sticker-print-3000x3000.png',
    providerSlug: 'take-the-risk-own-the-outcome-sticker',
    providerUrl: productUrl(import.meta.env.VITE_FOURTHWALL_STICKER_URL, 'take-the-risk-own-the-outcome-sticker'),
    badge: 'ADD-ON',
  },
  {
    id: 'operators-desk-kit',
    name: "Operator's Desk Kit",
    shortName: 'Desk Kit',
    category: 'Gift bundle',
    price: 77,
    description: 'The Attack Surface desk mat and Prompt Injection Fuel mug in one high-value operator gift.',
    details: ['Two-piece bundle', 'One claim link', 'Recipient enters shipping'],
    image: '/merch/hero/risk-takers-gift-store-hero.png',
    artwork: '',
    providerSlug: 'operators-desk-kit',
    providerUrl: productUrl(import.meta.env.VITE_FOURTHWALL_DESK_KIT_URL, 'operators-desk-kit'),
    badge: 'GIFT PICK',
  },
];

export const merchProvider = {
  name: 'Fourthwall',
  shopDomain,
  shopUrl: shopDomain ? `https://${shopDomain}` : '',
  isConnected: Boolean(shopDomain && merchProducts.some((product) => product.providerUrl)),
};

export const formatMerchPrice = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
