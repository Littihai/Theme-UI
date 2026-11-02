import { useNavigate } from "react-router-dom";
import { useUi } from "@/app/providers/UiProvider";
import { TONE } from "@/constants/icons";
import { useI18n, type Lang } from "@/app/providers/I18nProvider";
import { dateLocale } from "@/lib/dates";
import { useAnchoredPanel } from "@/hooks/useAnchoredPanel";
import { markAllRead, markRead, useNotifications } from "@/lib/notifications";
import type { AppNotification } from "@/types";

const timeAgo = (iso: string, lang: Lang, t: (k: string, v?: Record<string, string | number>) => string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return t("notif.justNow");
  if (s < 3600) return t("notif.minAgo", { n: Math.floor(s / 60) });
  if (s < 86400) return t("notif.hrAgo", { n: Math.floor(s / 3600) });
  return new Date(iso).toLocaleDateString(dateLocale(lang));
};

/** Notification Center drop-down (the bell): the list from lib/notifications, newest first. */
export function NotificationsPanel() {
  const { panel, closeAll } = useUi();
  const { lang, t } = useI18n();
  const nav = useNavigate();
  const items = useNotifications();
  const place = useAnchoredPanel("hdr-bell", panel === "notif", 370);   // hangs from the bell

  if (panel !== "notif") return null;

  function open(n: AppNotification) {
    if (!n.isRead) markRead(n.id);
    closeAll();
    if (n.linkUrl) nav(n.linkUrl);
  }

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <>
      <div onClick={closeAll} style={overlay} />
      <div className="menu-slide" style={place ? { ...sheet, top: place.top, right: place.right, width: place.width } : sheet}>
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--color-neutral-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600 }}>
            {t("notif.title")}{unread > 0 ? ` (${unread})` : ""}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} style={{ background: "transparent", border: 0, color: "var(--color-accent-700)", fontSize: 12, fontWeight: 600 }}>
              {t("notif.markAll")}
            </button>
          )}
        </div>
        <div className="scroll-thin" style={{ maxHeight: 400, overflow: "auto" }}>
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => open(n)}
              style={{
                display: "flex",
                gap: 11,
                width: "100%",
                textAlign: "left",
                border: 0,
                padding: "13px 16px",
                borderBottom: "1px solid var(--color-neutral-200)",
                background: n.isRead ? "var(--color-surface)" : "var(--color-accent-100)",
                color: "var(--color-text)",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 6, flex: "none", background: n.isRead ? "var(--color-neutral-300)" : TONE[n.tone].solid }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 600 }}>{n.title}</div>
                {n.body && <div style={{ fontSize: 12.5, color: "var(--color-neutral-600)", marginTop: 1 }}>{n.body}</div>}
                <div style={{ fontSize: 11, color: "var(--color-neutral-500)", marginTop: 4 }}>{timeAgo(n.createdAt, lang, t)}</div>
              </div>
            </button>
          ))}

          {items.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--color-neutral-500)", fontSize: 13 }}>{t("notif.empty")}</div>
          )}
        </div>
      </div>
    </>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 40,
  // a drop-down, not a modal: the page behind is not dimmed, a click on it just closes the panel
  background: "transparent",
} as const;

const sheet = {
  position: "fixed",
  top: 60,
  right: 12,
  width: "min(370px, calc(100vw - 24px))",
  zIndex: 50,
  background: "var(--color-surface)",
  border: "1px solid var(--color-neutral-200)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-lg)",
  overflow: "hidden",
} as const;
