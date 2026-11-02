/**
 * Text size S / M / L — for readers whose eyesight differs. It scales the whole
 * interface (text, buttons, spacing) with CSS `zoom` on <html>, because sizes in
 * this app are fixed px values that a root font-size could not reach. The size is
 * per device (like theme and language) in localStorage; `public/theme-init.js`
 * applies it before first paint. Layout code that reads the viewport in JS must
 * divide by `uiScale()` — it is what the browser's own zoom does to CSS widths.
 */
import { storageKey } from "@/constants/brand";

export type FontSize = "s" | "m" | "l";

export const FONT_SIZES: readonly FontSize[] = ["s", "m", "l"];
export const FONT_SCALE: Record<FontSize, number> = { s: 0.92, m: 1, l: 1.18 };
export const FONT_SIZE_KEY = storageKey("fontSize");

export function savedFontSize(): FontSize {
  try {
    const v = localStorage.getItem(FONT_SIZE_KEY);
    if (v === "s" || v === "m" || v === "l") return v;
  } catch {
    /* storage blocked — medium */
  }
  return "m";
}

/** The scale currently applied to the page (1 when none). */
export function uiScale(): number {
  const v = document.documentElement.dataset.size;
  return v === "s" || v === "m" || v === "l" ? FONT_SCALE[v] : 1;
}
