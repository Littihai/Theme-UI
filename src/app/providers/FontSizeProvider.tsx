import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { FONT_SCALE, FONT_SIZE_KEY, savedFontSize, type FontSize } from "@/lib/fontSize";

interface FontSizeContextValue {
  size: FontSize;
  /** the zoom factor in effect (see lib/fontSize.ts) */
  scale: number;
  setSize: (s: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSizeState] = useState<FontSize>(savedFontSize);

  // CSS reads html[data-size] (styles/global.css); set it in the same commit as the state
  useEffect(() => { document.documentElement.dataset.size = size; }, [size]);

  const setSize = useCallback((s: FontSize) => {
    setSizeState(s);
    try {
      localStorage.setItem(FONT_SIZE_KEY, s);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ size, scale: FONT_SCALE[size], setSize }), [size, setSize]);
  return <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>;
}

export function useFontSize(): FontSizeContextValue {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error("useFontSize must be used inside <FontSizeProvider>");
  return ctx;
}
