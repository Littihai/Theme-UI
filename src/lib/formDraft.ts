import { useEffect, useRef } from "react";
import { storageKey } from "@/constants/brand";

/**
 * Unsaved form input kept on the device, so a user who leaves the page, taps outside a
 * dialog, or has the tablet kill the tab (low memory while the camera is open) comes
 * back to what they typed. One draft per form and user (the key names both); it is
 * removed once the form is saved or discarded, and forgotten after MAX_AGE_DAYS.
 *
 * localStorage may be unavailable (private mode, quota): every call degrades to "no
 * draft" instead of throwing.
 */
const PREFIX = `${storageKey("draft")}.`;
const MAX_AGE_DAYS = 14;

export interface Draft<T> { value: T; savedAt: number }

export function readDraft<T>(key: string): Draft<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft<T>;
    if (!d || typeof d.savedAt !== "number" || Date.now() - d.savedAt > MAX_AGE_DAYS * 86_400_000) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return d;
  } catch {
    return null;
  }
}

export function writeDraft<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ value, savedAt: Date.now() } satisfies Draft<T>));
  } catch { /* storage full or blocked: nothing to keep */ }
}

export function clearDraft(key: string) {
  try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
}

/**
 * Saves `value` as the draft while `dirty` (debounced), and at once when the page is
 * hidden or closed — the moment a tablet switches to the camera app, before the
 * browser may be killed. A form that goes back to clean drops its draft.
 * Call the returned `finish()` once the form is saved or thrown away: it removes the
 * draft and stops any later write (the form's unmount would otherwise save it again).
 */
export function useDraftAutosave<T>(key: string | null, value: T, dirty: boolean): { finish: () => void } {
  const latest = useRef({ key, value, dirty });
  latest.current = { key, value, dirty };
  const finished = useRef(false);

  useEffect(() => {
    if (!key || finished.current) return;
    const h = window.setTimeout(() => {
      if (finished.current) return;
      if (dirty) writeDraft(key, value); else clearDraft(key);
    }, 300);
    return () => window.clearTimeout(h);
  }, [key, value, dirty]);

  useEffect(() => {
    const flush = () => {
      const { key: k, value: v, dirty: d } = latest.current;
      if (k && d && !finished.current) writeDraft(k, v);
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      flush(); // the form is closing (route change, dialog closed): keep what was typed
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return {
    finish: () => {
      finished.current = true;
      if (latest.current.key) clearDraft(latest.current.key);
    },
  };
}
