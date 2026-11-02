import { useEffect } from "react";
import { useUi } from "@/app/providers/UiProvider";
import { useOpenSettings } from "@/modules/settings/settingsNav";

/** Global hotkeys: Ctrl/Cmd-K opens the command palette, Ctrl/Cmd-, opens Settings, Esc closes overlays. */
export function useHotkeys(enabled: boolean) {
  const { setPaletteOpen, closeAll } = useUi();
  const openSettings = useOpenSettings();
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        closeAll();
        openSettings("general");
      }
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, setPaletteOpen, closeAll, openSettings]);
}
