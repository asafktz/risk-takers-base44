interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Navigator {
  readonly globalPrivacyControl?: boolean;
}

interface Window {
  __rtFlareaConsent?: boolean;
  __rtPrivacyOptOut?: boolean;
  srConsent?: (consent: boolean) => void;
}
