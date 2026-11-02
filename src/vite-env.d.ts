/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_API_TARGET?: string;
  /** the path the app is hosted under ("/" by default; see vite.config.ts) */
  readonly VITE_BASE?: string;
  /** contact details for the footer, the account menu and About (lib/support.ts); unset = the placeholders */
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_CONTACT_PHONE?: string;
  readonly VITE_CONTACT_GITHUB?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** package.json version, injected by vite.config.ts `define`. */
declare const __APP_VERSION__: string;
/** ISO timestamp of the build, injected by vite.config.ts `define`. */
declare const __BUILD_TIME__: string;
