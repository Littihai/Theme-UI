import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { TOUCH_QUERY, usesPhoneLayout } from "@/lib/layout";
import { useFontSize } from "@/app/providers/FontSizeProvider";
import { toast } from "@/overlays/Toast";

export type OverlayPanel = "notif" | "profile" | "customize" | null;

interface UiContextValue {
  /** viewport width, drives responsive breakpoints (narrow < 1180, tight < 900) */
  width: number;
  narrow: boolean;
  tight: boolean;
  /**
   * phone layout — phones and touch tablets (see lib/layout.ts): the sidebar becomes
   * an off-canvas drawer opened from the header, settings become stacked screens
   */
  mobile: boolean;

  collapsed: boolean;
  toggleSidebar: () => void;
  expanded: boolean;
  /** mobile drawer open/closed (always false on wider screens) */
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;

  panel: OverlayPanel;
  setPanel: (p: OverlayPanel) => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;

  favs: string[];
  toggleFav: (id: string) => void;

  /** a short success message in the toast corner (overlays/Toast) */
  flash: (msg: string) => void;

  closeAll: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  // text size zooms the page, so the width layout code sees is the viewport divided by it
  const { scale } = useFontSize();
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth / scale : 1440));
  const [touch, setTouch] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.(TOUCH_QUERY).matches);
  const [collapsed, setCollapsed] = useState(false);
  const [navOpenRaw, setNavOpen] = useState(false);
  const [panel, setPanel] = useState<OverlayPanel>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [favs, setFavs] = useState<string[]>(["production", "planning"]);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth / scale);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [scale]);

  // a keyboard/trackpad attached to a tablet can change the primary pointer
  useEffect(() => {
    const mq = window.matchMedia?.(TOUCH_QUERY);
    if (!mq) return;
    const onChange = () => setTouch(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const narrow = width < 1180;
  const tight = width < 900;
  const mobile = usesPhoneLayout(width, touch);
  const expanded = !collapsed && !narrow;
  const navOpen = mobile && navOpenRaw;

  // leaving the phone layout (rotate, resize) must not leave a hidden drawer "open"
  useEffect(() => {
    if (!mobile) setNavOpen(false);
  }, [mobile]);

  const flash = useCallback((msg: string) => toast({ tone: "success", title: msg }), []);

  const closeAll = useCallback(() => {
    setPanel(null);
    setPaletteOpen(false);
  }, []);

  const value = useMemo<UiContextValue>(
    () => ({
      width,
      narrow,
      tight,
      mobile,
      collapsed,
      toggleSidebar: () => setCollapsed((c) => !c),
      expanded,
      navOpen,
      setNavOpen,
      panel,
      setPanel,
      paletteOpen,
      setPaletteOpen,
      favs,
      toggleFav: (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : f.concat(id))),
      flash,
      closeAll,
    }),
    [width, narrow, tight, mobile, collapsed, expanded, navOpen, panel, paletteOpen, favs, flash, closeAll],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}
