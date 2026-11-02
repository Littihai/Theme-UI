import { useEffect } from "react";
import { lockPageScroll } from "@/lib/scrollLock";

/**
 * Holds the page-scroll lock while a modal, drawer or dialog is open (`enabled`), and releases it when the
 * overlay unmounts or `enabled` turns false. Every overlay with a scrim uses this, so the page behind never
 * scrolls under it; nested overlays are fine (the lock is counted, see lib/scrollLock.ts).
 */
export function useScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    return lockPageScroll();
  }, [enabled]);
}
