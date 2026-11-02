import type { FontFamily } from "./appearance";

/**
 * The typefaces on offer. Inter (with Noto Sans Thai for Thai text) is bundled with the app and is the default;
 * the others are separate chunks fetched only when somebody picks them (or opens the font picker, to show the samples).
 * Each @fontsource subset file is itself downloaded by the browser only if the page uses a glyph from it.
 * The family stacks live in styles/tokens.css, next to the other design tokens.
 */
const loaders: Record<FontFamily, (() => Promise<unknown>) | null> = {
  inter: null,
  system: null,
  plex: () => Promise.all([
    import("@fontsource/ibm-plex-sans-thai/latin-400.css"), import("@fontsource/ibm-plex-sans-thai/latin-500.css"),
    import("@fontsource/ibm-plex-sans-thai/latin-600.css"), import("@fontsource/ibm-plex-sans-thai/latin-700.css"),
    import("@fontsource/ibm-plex-sans-thai/thai-400.css"), import("@fontsource/ibm-plex-sans-thai/thai-500.css"),
    import("@fontsource/ibm-plex-sans-thai/thai-600.css"), import("@fontsource/ibm-plex-sans-thai/thai-700.css"),
  ]),
  sarabun: () => Promise.all([
    import("@fontsource/sarabun/latin-400.css"), import("@fontsource/sarabun/latin-500.css"),
    import("@fontsource/sarabun/latin-600.css"), import("@fontsource/sarabun/latin-700.css"),
    import("@fontsource/sarabun/thai-400.css"), import("@fontsource/sarabun/thai-500.css"),
    import("@fontsource/sarabun/thai-600.css"), import("@fontsource/sarabun/thai-700.css"),
  ]),
};

const started = new Map<FontFamily, Promise<unknown>>();

/** Fetch a typeface's stylesheet once; resolves when it is in. A failure (offline) leaves the fallback stack in use. */
export function loadFont(id: FontFamily): Promise<unknown> {
  const load = loaders[id];
  if (!load) return Promise.resolve();
  let p = started.get(id);
  if (!p) {
    p = load().catch(() => { started.delete(id); });
    started.set(id, p);
  }
  return p;
}

export const loadAllFonts = () => Promise.all((Object.keys(loaders) as FontFamily[]).map(loadFont));

/** The stack a sample is drawn in, whatever font is active (the picker shows every option in its own face). */
export const FONT_SAMPLE_STACK: Record<FontFamily, string> = {
  inter: '"Inter", "Noto Sans Thai", system-ui, sans-serif',
  plex: '"IBM Plex Sans Thai", "Noto Sans Thai", system-ui, sans-serif',
  sarabun: '"Sarabun", "Noto Sans Thai", system-ui, sans-serif',
  system: 'system-ui, -apple-system, "Segoe UI", "Leelawadee UI", "Noto Sans Thai", sans-serif',
};
