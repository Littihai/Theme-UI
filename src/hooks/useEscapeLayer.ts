import { useEffect, useRef } from "react";

/**
 * Esc closes only the top-most overlay.
 *
 * Overlays stack (Settings window → "add user" dialog → …). With independent
 * keydown listeners one Esc closed every layer at once and threw away the form
 * underneath. Each overlay registers here instead; the latest registration wins
 * and the ones below wait their turn. An open confirmation dialog on top keeps Esc for itself.
 *
 * The handler gets the event so a layer can decline (e.g. while typing) — return
 * `false` to leave the key alone.
 */
type Handler = (e: KeyboardEvent) => boolean | void;

const stack: { current: Handler }[] = [];

function onKey(e: KeyboardEvent) {
  if (e.key !== "Escape" || e.defaultPrevented || stack.length === 0) return;
  if (document.querySelector(".dz-scrim")) return;
  const top = stack[stack.length - 1];
  if (top.current(e) !== false) e.preventDefault();
}

export function useEscapeLayer(onEscape: Handler, enabled = true) {
  const ref = useRef<Handler>(onEscape);
  ref.current = onEscape;

  useEffect(() => {
    if (!enabled) return;
    const entry = { get current() { return ref.current; } };
    if (stack.length === 0) window.addEventListener("keydown", onKey);
    stack.push(entry);
    return () => {
      const i = stack.indexOf(entry);
      if (i >= 0) stack.splice(i, 1);
      if (stack.length === 0) window.removeEventListener("keydown", onKey);
    };
  }, [enabled]);
}
