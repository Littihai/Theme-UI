import { useState, type FocusEvent, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppearance } from "@/app/providers/AppearanceProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { BrandLockup } from "@/components/ui/AppLogo";
import { useOpenSettings } from "@/modules/settings/settingsNav";
import { useNavGroups, type NavEntry } from "./useNavItems";

/**
 * The menu as a sidebar (Customize > Navigation: "Sidebar" and "Icon sidebar"), docs/decisions/0038: the same
 * groups the mega menu shows, as one vertical list — group labels in the wide mode, thin dividers
 * in the rail (a 68px rail has no room for words, and every icon already carries its tooltip).
 * Settings stays in the footer: the sidebar is this mode's one fixed surface, and the account
 * menu's entry (where the top bar's button moved) also remains.
 */
export function SideNav({ rail }: { rail: boolean }) {
  const { t } = useI18n();
  const nav = useNavigate();
  const { set } = useAppearance();
  const openSettings = useOpenSettings();
  const { home, direct, groups, signedIn } = useNavGroups();
  // the rail's labels: a tooltip beside the icon on hover AND on keyboard focus (a title attribute only does hover)
  const [tip, setTip] = useState<{ text: string; top: number; left: number } | null>(null);
  const showTip = (text: string) => (ev: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>) => {
    if (!rail) return;
    const r = ev.currentTarget.getBoundingClientRect();
    setTip({ text, top: r.top + r.height / 2, left: r.right + 8 });
  };
  const hideTip = () => setTip(null);

  if (!signedIn) return null;

  const row = (e: NavEntry, pick?: () => void) => (
    <button
      key={e.id}
      onClick={pick ?? e.onPick}
      className="side-item"
      aria-label={rail ? e.label : undefined}
      onMouseEnter={showTip(e.label)}
      onMouseLeave={hideTip}
      onFocus={showTip(e.label)}
      onBlur={hideTip}
      aria-current={e.active ? "page" : undefined}
    >
      <Icon name={e.icon} size={18} className="side-ico" />
      <span className="side-label">{e.label}</span>
    </button>
  );

  return (
    <aside className="app-side" aria-label={t("nav.menu")}>
      <BrandLockup onClick={() => nav("/")} className="side-brand" wordClassName="side-word" />
      <nav id="app-nav" className="side-scroll" aria-label={t("nav.menu")}>
        {row(home)}
        {direct.map((e) => row(e))}
        {groups.map((g) => (
          <div key={g.key} role="group" aria-label={g.label}>
            {rail
              ? <div aria-hidden style={{ height: 1, background: "var(--color-neutral-200)", margin: "6px 10px" }} />
              : <div className="eyebrow" style={{ fontWeight: 700, color: "var(--color-neutral-500)", padding: "12px 14px 4px" }}>{g.label}</div>}
            {g.entries.map((e) => row(e))}
          </div>
        ))}
      </nav>
      <div className="side-foot">
        {row({ id: "settings", label: t("menu.settings"), desc: "", icon: "gear", active: false, onPick: () => {} }, () => openSettings("general"))}
        <button
          className="side-item"
          onClick={() => { hideTip(); set("nav", rail ? "side" : "rail"); }}
          aria-label={rail ? t("cz.nav.expand") : t("cz.nav.collapse")}
          onMouseEnter={showTip(t("cz.nav.expand"))}
          onMouseLeave={hideTip}
          onFocus={showTip(t("cz.nav.expand"))}
          onBlur={hideTip}
        >
          <Icon name={rail ? "sidebarExpand" : "sidebarCollapse"} size={18} className="side-ico" />
          <span className="side-label">{t("cz.nav.collapse")}</span>
        </button>
      </div>
      {rail && tip && <span role="tooltip" className="rail-tip" style={{ top: tip.top, left: tip.left }}>{tip.text}</span>}
    </aside>
  );
}
