import { createContext, useCallback, useContext, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { storageKey } from "@/constants/brand";
import { reducedMotion } from "@/lib/motion";

/**
 * Light / dark / follow-the-OS theme. The preference is per device (like the language), stored in localStorage;
 * `public/theme-init.js` applies it before the first paint and this provider takes over once React is running.
 *
 * Theming itself is pure CSS: `<html data-theme="dark">` swaps the color tokens in styles/tokens.css, so components
 * never branch on the theme. A switch from a button plays as a circle growing out of that button (the View
 * Transitions API, where the browser has it; a plain swap elsewhere and with reduced motion).
 */
export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** where the switch was asked for, in viewport pixels: the circle grows from there */
export interface ThemeOrigin { x: number; y: number }

const STORAGE_KEY = storageKey("theme");
const MEDIA = "(prefers-color-scheme: dark)";

interface ThemeContextValue {
  /** What the viewer picked. */
  pref: ThemePref;
  /** What is on screen right now ("system" resolved against the OS). */
  resolved: ResolvedTheme;
  /** `origin` (the button that was pressed, see clickOrigin) makes the change spread from there. */
  setPref: (p: ThemePref, origin?: ThemeOrigin) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function savedPref(): ThemePref {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "light";
}

function systemDark(): boolean {
  try {
    return window.matchMedia(MEDIA).matches;
  } catch {
    return false;
  }
}

function resolveTheme(pref: ThemePref, osDark: boolean): ResolvedTheme {
  return pref === "dark" || (pref === "system" && osDark) ? "dark" : "light";
}

function paint(resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (resolved === "dark") root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");
}

/** The centre of the control that was pressed (a keyboard press has no pointer position), for `setPref`. */
export function clickOrigin(e: MouseEvent<HTMLElement>): ThemeOrigin {
  if (e.clientX || e.clientY) return { x: e.clientX, y: e.clientY };
  const r = e.currentTarget.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(savedPref);
  const [osDark, setOsDark] = useState<boolean>(systemDark);

  // follow the OS while the viewer is on "system"
  useEffect(() => {
    if (pref !== "system") return;
    let mq: MediaQueryList;
    try {
      mq = window.matchMedia(MEDIA);
    } catch {
      return;
    }
    const onChange = (e: MediaQueryListEvent) => setOsDark(e.matches);
    setOsDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const resolved = resolveTheme(pref, osDark);

  useEffect(() => { paint(resolved); }, [resolved]);

  const setPref = useCallback((p: ThemePref, origin?: ThemeOrigin) => {
    const commit = () => {
      setPrefState(p);
      try {
        localStorage.setItem(STORAGE_KEY, p);
      } catch {
        /* ignore */
      }
    };
    const next = resolveTheme(p, systemDark());
    const current: ResolvedTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const doc = document as ViewTransitionDocument;
    if (next === current || !doc.startViewTransition || reducedMotion()) { commit(); return; }

    // the new look is painted in a circle that grows from the button until it covers the window
    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? 0;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const root = document.documentElement;
    root.classList.add("theme-switching");
    const transition = doc.startViewTransition(() => {
      flushSync(commit);   // the React tree re-renders inside the transition's snapshot
      paint(next);         // and the tokens swap in the same frame (the effect above repeats it harmlessly)
    });
    transition.ready
      .then(() => root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 520, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      ))
      .catch(() => { /* the browser skipped the transition: the swap already happened */ });
    transition.finished.finally(() => root.classList.remove("theme-switching"));
  }, []);

  const value = useMemo(() => ({ pref, resolved, setPref }), [pref, resolved, setPref]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
