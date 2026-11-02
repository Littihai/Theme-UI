/**
 * Whether motion should be kept to a minimum right now: the person's own choice (Customize > Motion, an attribute on
 * <html>) wins; "auto" follows the operating system. For non-React code (the theme switch, dialogs); React code can use
 * hooks/useReducedMotion, which re-renders when it changes.
 */
export function reducedMotion(): boolean {
  if (typeof document === "undefined") return false;
  const m = document.documentElement.dataset.motion;
  if (m === "reduce") return true;
  if (m === "full") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
