import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULTS, applyAppearance, isCustomised, savedAll, store,
  type Accent, type AppearanceState, type Contrast, type Motion,
} from "@/lib/appearance";
import { loadFont } from "@/lib/fonts";

interface AppearanceValue extends AppearanceState {
  /** change one choice; it is applied to the page and remembered on this device at once */
  set: <K extends keyof AppearanceState>(key: K, value: AppearanceState[K]) => void;
  setAccent: (v: Accent) => void;
  setContrast: (v: Contrast) => void;
  setMotion: (v: Motion) => void;
  /** every choice back to its default (colour scheme and text size are left alone) */
  reset: () => void;
  /** true while anything differs from the defaults */
  changed: boolean;
}

const Ctx = createContext<AppearanceValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppearanceState>(savedAll);

  useEffect(() => { applyAppearance(state); }, [state]);
  // the chosen typeface's files are fetched on demand (the default is already bundled)
  useEffect(() => { void loadFont(state.font); }, [state.font]);

  const set = useCallback(<K extends keyof AppearanceState>(key: K, value: AppearanceState[K]) => {
    store(key, value);
    setState((s) => (s[key] === value ? s : { ...s, [key]: value }));
  }, []);
  const reset = useCallback(() => {
    (Object.keys(DEFAULTS) as (keyof AppearanceState)[]).forEach((k) => store(k, DEFAULTS[k] as never));
    setState(DEFAULTS);
  }, []);

  const value = useMemo<AppearanceValue>(() => ({
    ...state,
    set,
    setAccent: (v) => set("accent", v),
    setContrast: (v) => set("contrast", v),
    setMotion: (v) => set("motion", v),
    reset,
    changed: isCustomised(state),
  }), [state, set, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppearance(): AppearanceValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppearance must be used inside <AppearanceProvider>");
  return ctx;
}
