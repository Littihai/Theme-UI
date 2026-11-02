import { useLayoutEffect, useState } from "react";

export interface PanelPlace { top: number; right: number; width: number }

/**
 * Where a drop-down panel goes so it hangs from the button that opened it: its top edge just under the button and its
 * right edge on the button's right edge (kept 12px inside the window). Read from the button itself, so it stays right
 * when the page is centred in a wide window, when a banner pushes the top bar down, and on a phone.
 * Re-measured when the window is resized or scrolled. Null until measured (or if the button is not on the page).
 */
export function useAnchoredPanel(anchorId: string, open: boolean, preferredWidth: number): PanelPlace | null {
  const [place, setPlace] = useState<PanelPlace | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = document.getElementById(anchorId);
      if (!el) { setPlace(null); return; }
      const r = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;   // without the scroll bar: that is what "right:" counts from
      const width = Math.min(preferredWidth, vw - 24);
      const right = Math.min(Math.max(vw - r.right, 12), vw - width - 12);
      setPlace({ top: Math.round(r.bottom + 8), right: Math.round(right), width });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [anchorId, open, preferredWidth]);

  return place;
}
