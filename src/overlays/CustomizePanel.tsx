import { useEffect, useRef } from "react";
import { useUi } from "@/app/providers/UiProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { useAppearance } from "@/app/providers/AppearanceProvider";
import { useOpenSettings } from "@/modules/settings/settingsNav";
import { AppearanceControls } from "@/modules/settings/AppearanceControls";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Customize: an off-canvas panel that slides in from the right edge and holds every look-and-layout choice. It does not dim
 * or block the page (the point is to watch the change happen as you pick it); the close button, Esc, or the brush in the top
 * bar closes it. Opened from the brush in the top bar or the account menu. Edge-to-edge or floating follows its own
 * "Offcanvas style" choice.
 */
export function CustomizePanel() {
  const { panel, closeAll } = useUi();
  const { t } = useI18n();
  const ap = useAppearance();
  const openSettings = useOpenSettings();
  const open = panel === "customize";
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // focus moves into the panel when it opens and back to the brush when it closes
  useEffect(() => {
    if (open) closeRef.current?.focus();
    else if (wasOpen.current) document.getElementById("hdr-customize")?.focus();
    wasOpen.current = open;
  }, [open]);

  if (!open) return null;

  return (
    <aside id="cz-panel" role="dialog" aria-modal="false" aria-labelledby="cz-title" className="app-offcanvas">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "16px 18px 12px", borderBottom: "1px solid var(--color-neutral-200)" }}>
        <div style={{ minWidth: 0 }}>
          <h2 id="cz-title" style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "var(--text-xl)", fontWeight: 600 }}>{t("cz.title")}</h2>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-neutral-600)", marginTop: 2 }}>{t("cz.subtitle")}</div>
        </div>
        <button ref={closeRef} onClick={closeAll} className="btn-icon" aria-label={t("common.close")} title={`${t("common.close")} (Esc)`}>
          <Icon name="x" size={18} />
        </button>
      </div>

      <div className="scroll-thin" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 18px 24px" }}>
        <AppearanceControls compact />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 18px", borderTop: "1px solid var(--color-neutral-200)", background: "var(--color-surface)" }}>
        <Button variant="secondary" onClick={ap.reset} disabled={!ap.changed} title={t("cz.resetHint")}>{t("cz.reset")}</Button>
        <Button variant="ghost" onClick={() => { closeAll(); openSettings("general"); }}>{t("cz.openSettings")}<Icon name="arrowRight" size={13} /></Button>
      </div>
    </aside>
  );
}
