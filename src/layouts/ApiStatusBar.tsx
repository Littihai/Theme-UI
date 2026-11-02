import { useEffect, useState } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { API_EVENT } from "@/services/apiClient";

/**
 * One bar across the top when the browser is offline or the server stopped answering (the API client says so on
 * every call that never got an answer, and clears it on the next answer). Nothing else on the page has to show it.
 */

export function ApiStatusBar() {
  const { t } = useI18n();
  const [offline, setOffline] = useState(typeof navigator !== "undefined" && !navigator.onLine);
  const [down, setDown] = useState<string | null>(null);
  useEffect(() => {
    const on = () => setOffline(false), off = () => setOffline(true);
    const api = (e: Event) => { const d = (e as CustomEvent<string>).detail; setDown(d === "up" ? null : d); };
    window.addEventListener("online", on); window.addEventListener("offline", off); window.addEventListener(API_EVENT, api);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); window.removeEventListener(API_EVENT, api); };
  }, []);
  if (!offline && !down) return null;
  return (
    <div role="status" aria-live="polite" style={{ position: "sticky", top: 0, zIndex: 900, display: "flex", gap: 10, alignItems: "center", padding: "8px 16px", fontSize: 13, background: "var(--tone-warn-bg, #fffbeb)", color: "var(--tone-warn-fg, #b45309)", borderBottom: "1px solid color-mix(in srgb, var(--tone-warn-solid, #f59f00) 40%, transparent)" }}>
      <Icon name="alert" size={15} />
      <span style={{ flex: 1 }}>{offline ? t("net.offline") : down === "TIMEOUT" ? t("net.slow") : t("net.down")}</span>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}>{t("net.retry")}</button>
    </div>
  );
}
