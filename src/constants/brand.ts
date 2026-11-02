/**
 * The one place a new project renames itself. Everything that shows the product's name (header, sidebar, footer,
 * sign-in page, browser tab, About) reads from here; the logo lives in components/ui/AppLogo.tsx.
 *
 * STORAGE_PREFIX and EVENT_PREFIX namespace this app's localStorage keys and window events, so two apps on the same
 * origin never read each other's theme or session. `public/theme-init.js` runs before React and carries its own copy
 * of the prefix — change both together.
 */
export const BRAND = {
  /** the product name, as written (title case) */
  name: "Theme UI",
  /** the wordmark beside the logo mark */
  word: "theme ui",
  /** the organisation on the footer's small print and the About section */
  company: "Your Company Co., Ltd.",
  /** one line under the brand in the footer and on the sign-in page: what the system is */
  tagline: { th: "แม่แบบหน้าจอสำหรับระบบภายในองค์กร", en: "A UI starter for internal business applications" },
};

/** localStorage keys: `${STORAGE_PREFIX}.<name>` (must match public/theme-init.js) */
export const STORAGE_PREFIX = "app";
export const storageKey = (name: string) => `${STORAGE_PREFIX}.${name}`;

/** window event names: `${EVENT_PREFIX}:<name>` */
export const EVENT_PREFIX = "app";
export const eventName = (name: string) => `${EVENT_PREFIX}:${name}`;

/** the language every device starts in until the person picks one */
export const DEFAULT_LANG: "th" | "en" = "en";

/** the starting rows-per-page of every paged list (house rule: a list that can pass 10 rows is paged) */
export const DEFAULT_PAGE_SIZE = 10;
