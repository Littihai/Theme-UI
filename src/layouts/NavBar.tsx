import { useEffect, useRef } from "react";
import { useUi } from "@/app/providers/UiProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { useEscapeLayer } from "@/hooks/useEscapeLayer";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useOpenSettings } from "@/modules/settings/settingsNav";
import { useNavGroups, type NavEntry } from "./useNavItems";

/**
 * The phone navigation drawer (docs/decisions/0038). On a desktop the navigation lives in the header
 * (Home + the application mega menu, layouts/MegaMenu.tsx); this renders nothing there.
 * The drawer shows the same groups the mega menu shows, plus Settings at the end — the
 * header's account chip is avatar-only on a phone, so the drawer carries the entry.
 * It is modal: focus moves in, Tab wraps, Esc / the scrim / picking an entry closes it,
 * and the menu button gets focus back.
 */
export function NavBar() {
  const { mobile, navOpen, setNavOpen } = useUi();
  const { t } = useI18n();
  const openSettings = useOpenSettings();
  const { home, direct, groups, pathname, signedIn } = useNavGroups();

  useEffect(() => { setNavOpen(false); }, [pathname, setNavOpen]);
  useEscapeLayer(() => setNavOpen(false), navOpen);
  useScrollLock(mobile && navOpen);   // the drawer covers the page: the page must not scroll under it
  const drawerRef = useRef<HTMLElement>(null);
  useFocusTrap(drawerRef, mobile && navOpen);

  if (!signedIn || !mobile || !navOpen) return null;

  const row = (e: NavEntry, pick: () => void) => (
    <button key={e.id} onClick={() => { setNavOpen(false); pick(); }}
      aria-current={e.active ? "page" : undefined}
      className="nav-item"
      style={{ display: "flex", alignItems: "center", gap: 10, border: 0, background: e.active ? "var(--color-neutral-100)" : undefined, padding: "12px 16px", width: "100%", fontSize: 14.5, fontWeight: 500, color: "var(--color-neutral-800)", textAlign: "left" }}>
      <Icon name={e.icon} size={18} color="var(--color-neutral-600)" />
      {e.label}
    </button>
  );

  return (
    <>
      <div aria-hidden onClick={() => setNavOpen(false)} className="app-nav-scrim" />
      <nav ref={drawerRef} id="app-nav" role="dialog" aria-modal="true" aria-label={t("nav.menu")} className="app-nav-drawer">
        {row(home, home.onPick)}
        {direct.map((e) => row(e, e.onPick))}
        {groups.map((g) => (
          <div key={g.key} role="group" aria-label={g.label}>
            <div className="eyebrow" style={{ fontWeight: 700, color: "var(--color-neutral-500)", padding: "12px 16px 4px", borderTop: "1px solid var(--color-neutral-200)" }}>{g.label}</div>
            {g.entries.map((e) => row(e, e.onPick))}
          </div>
        ))}
        <div style={{ borderTop: "1px solid var(--color-neutral-200)" }}>
          {row({ id: "settings", label: t("menu.settings"), desc: "", icon: "gear", active: false, onPick: () => {} }, () => openSettings(null))}
        </div>
      </nav>
    </>
  );
}
