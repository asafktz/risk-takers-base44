interface ImportMetaEnv {
  readonly VITE_FOURTHWALL_SHOP_DOMAIN?: string;
  readonly VITE_FOURTHWALL_HUMAN_LOOP_URL?: string;
  readonly VITE_FOURTHWALL_ZERO_TRUST_URL?: string;
  readonly VITE_FOURTHWALL_PROMPT_FUEL_URL?: string;
  readonly VITE_FOURTHWALL_ATTACK_SURFACE_URL?: string;
  readonly VITE_FOURTHWALL_STICKER_URL?: string;
  readonly VITE_FOURTHWALL_DESK_KIT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
