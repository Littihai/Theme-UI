import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DICT, LANG_KEY, type Lang } from "@/i18n/dict";
import { DEFAULT_LANG } from "@/constants/brand";

export type { Lang };

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  /** Translate a dotted key; interpolates {name} style vars. Falls back to the key. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Pick from an inline { th, en } pair (used for backend / catalog data). */
  pick: (pair: { th: string; en: string } | undefined | null) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** The viewer's saved choice, or null when they have never picked one on this device. */
function savedLang(): Lang | null {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "th" || saved === "en") return saved;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Thai / English. Every visible string has { th, en } in src/i18n (house rule: no text in components). The choice is
 * per device, like the theme; `public/theme-init.js` reads the same key so the loading screen is already in the
 * right language.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => savedLang() ?? DEFAULT_LANG);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(() => setLangState((l) => (l === "th" ? "en" : "th")), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const entry = DICT[key];
      let s = entry ? entry[lang] : key;
      if (vars) for (const k in vars) s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
      return s;
    },
    [lang],
  );

  const pick = useCallback(
    (pair: { th: string; en: string } | undefined | null) => (pair ? pair[lang] : ""),
    [lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, toggleLang, t, pick }),
    [lang, setLang, toggleLang, t, pick],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
