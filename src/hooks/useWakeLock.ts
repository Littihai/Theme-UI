import { useEffect } from "react";

type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener?: (type: "release", cb: () => void) => void };
type NavigatorWakeLock = Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> } };

/**
 * Keeps the screen on while a scanning page is open (a handheld that sleeps mid-pick loses the picker's place).
 * Uses the Screen Wake Lock API when the browser has it, re-acquires after the tab comes back to the front, and
 * releases on leave. Silent where the API is missing or refused (desktop browsers, battery saver).
 */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const nav = navigator as NavigatorWakeLock;
    if (!nav.wakeLock) return;
    let lock: WakeLockSentinelLike | null = null;
    let gone = false;
    const acquire = async () => {
      if (gone || document.visibilityState !== "visible") return;
      try { lock = await nav.wakeLock!.request("screen"); } catch { lock = null; }
    };
    const onVisible = () => { if (document.visibilityState === "visible") void acquire(); };
    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      gone = true;
      document.removeEventListener("visibilitychange", onVisible);
      void lock?.release().catch(() => undefined);
    };
  }, [enabled]);
}
