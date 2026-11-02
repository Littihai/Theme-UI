import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { storageKey } from "@/constants/brand";

/**
 * Light / dark / follow-the-OS theme. The preference is per device (like the
 * language), stored in localStorage; `public/theme-init.js` applies it before the
 * first paint and this provider takes over once React is running.
 *
 * Theming itself is pure CSS: `<html data-theme="dark">` swaps the color tokens
 * in styles/tokens.css, so components never branch on the theme.
 */
export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = storageKey("theme");
const MEDIA = "(prefers-color-scheme: dark)";

interface ThemeContextValue {
  /** What the viewer picked. */
  pref: ThemePref;
  /** What is on screen right now ("system" resolved against the OS). */
  resolved: ResolvedTheme;
  setPref: (p: ThemePref) => void;
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

  const resolved: ResolvedTheme = pref === "dark" || (pref === "system" && osDark) ? "dark" : "light";

  useEffect(() => {
    const root = document.documentElement;
    if (resolved === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  }, [resolved]);

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ pref, resolved, setPref }), [pref, resolved, setPref]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
