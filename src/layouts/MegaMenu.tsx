import { Fragment, useEffect, useRef, useState } from "react";
import { useI18n } from "@/app/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import { useEscapeLayer } from "@/hooks/useEscapeLayer";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useNavGroups } from "./useNavItems";

/**
 * The Linear-style application menu in the header (docs/decisions/0038): Home is a plain link, and one
 * trigger opens a wide panel of every module the person may open, grouped as columns, each entry
 * an icon, a name and a one-line description. Picking one navigates and closes; Esc, a click
 * outside, or losing the page closes too. Focus moves into the panel, Tab wraps, arrows walk the
 * entries, and the trigger gets focus back (useFocusTrap). The panel clamps to the window edge
 * with offset metrics — its own rect lies while the pop animation scales it.
 */
export function MegaMenu() {
  const { t } = useI18n();
  const { home, direct, groups, anyActive, pathname } = useNavGroups();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEscapeLayer(() => setOpen(false), open);
  useFocusTrap(panelRef, open);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);

  // the panel would open at the trigger's left edge; slide it left so it never crosses the
  // window. Offset metrics, not the panel's rect: the pop animation scales it while it mounts.
  const clampPanel = (el: HTMLDivElement | null) => {
    if (!el) return;
    const anchor = el.parentElement?.getBoundingClientRect();
    if (!anchor) return;
    const over = anchor.left + el.offsetLeft + el.offsetWidth - (document.documentElement.clientWidth - 8);
    if (over > 0) el.style.left = `${el.offsetLeft - over}px`;
  };

  // arrows walk the entries in reading order; Tab (wrapped by the trap) still works
  const onPanelKey = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    if (items.length === 0) return;
    e.preventDefault();
    const at = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "Home" ? 0
      : e.key === "End" ? items.length - 1
      : e.key === "ArrowDown" || e.key === "ArrowRight" ? (at + 1 + items.length) % items.length
      : (at - 1 + items.length) % items.length;
    items[next].focus();
  };

  const navButton = (label: string, active: boolean, props: React.ButtonHTMLAttributes<HTMLButtonElement>, chevron = false) => (
    <button
      {...props}
      className="nav-item"
      aria-current={active && !chevron ? "page" : undefined}
      style={{
        position: "relative", display: "flex", alignItems: "center", gap: 7, border: 0,
        padding: "8px 12px", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", borderRadius: "var(--radius-md)",
        color: active ? "var(--color-text)" : "var(--color-neutral-800)",
      }}
    >
      <span>{label}</span>
      {chevron && <Icon name="chevronDown" size={13} color="var(--color-neutral-600)" />}
      {active && <span aria-hidden style={{ position: "absolute", left: 12, right: 12, bottom: 0, height: 2, background: "var(--color-text)" }} />}
    </button>
  );

  return (
    // the desktop's navigation landmark (QA L3): the drawer and the sidebar carry their own <nav>
    <nav ref={rootRef} aria-label={t("nav.menu")} style={{ display: "flex", alignItems: "center", gap: 2, position: "relative" }}>
      {navButton(home.label, home.active, { onClick: home.onPick })}
      {direct.map((d) => <Fragment key={d.id}>{navButton(d.label, d.active, { onClick: d.onPick })}</Fragment>)}
      {navButton(t("nav.mega"), anyActive || open, {
        onClick: () => setOpen((o) => !o),
        "aria-haspopup": "menu",
        "aria-expanded": open,
      }, true)}

      {open && (
        <div
          ref={(el) => { (panelRef as React.MutableRefObject<HTMLDivElement | null>).current = el; clampPanel(el); }}
          className="menu-slide"
          role="menu"
          aria-label={t("nav.mega")}
          onKeyDown={onPanelKey}
          style={{
            position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 45,
            // the columns wrap instead of scrolling (QA M1): the width asks for one column per
            // group, the viewport caps it, and auto-fit folds the groups into rows that fit
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10,
            width: `min(calc(100vw - 16px), ${groups.length * 250}px)`,
            padding: 14, background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)",
            borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)",
          }}
        >
          {groups.map((g) => (
            <div key={g.key} role="group" aria-label={g.label} style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ fontWeight: 700, color: "var(--color-neutral-500)", padding: "2px 10px 6px" }}>{g.label}</div>
              {g.entries.map((e) => (
                <button
                  key={e.id}
                  role="menuitem"
                  onClick={() => { setOpen(false); e.onPick(); }}
                  className="navmenu-item"
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10, width: "100%", border: 0,
                    borderRadius: "var(--radius-md)", padding: "8px 10px", textAlign: "left",
                    background: e.active ? "var(--color-neutral-100)" : "transparent", color: "var(--color-text)",
                  }}
                >
                  <Icon name={e.icon} size={16} color="var(--color-neutral-600)" style={{ marginTop: 2 }} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13.5, fontWeight: e.active ? 700 : 600 }}>{e.label}</span>
                    <span style={{ display: "block", fontSize: 12, color: "var(--color-neutral-600)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
