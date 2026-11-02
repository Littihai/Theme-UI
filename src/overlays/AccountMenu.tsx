import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { useUi } from "@/app/providers/UiProvider";
import { useI18n, type Lang } from "@/app/providers/I18nProvider";
import { useTheme, type ThemePref } from "@/app/providers/ThemeProvider";
import { useFontSize } from "@/app/providers/FontSizeProvider";
import { FONT_SIZES } from "@/lib/fontSize";
import { Avatar } from "@/components/ui/Avatar";
import { useOpenSettings, type SettingsSectionId } from "@/modules/settings/settingsNav";
import { Icon } from "@/components/ui/Icon";
import { supportMailto } from "@/lib/support";
import { useAnchoredPanel } from "@/hooks/useAnchoredPanel";

type Sub = "lang" | "theme" | "size" | null;

/**
 * Account menu, opened from the account chip at the right of the top bar. It drops down from that chip.
 * Everything here is a real action — settings, the quick choices (language, colour scheme, text size), support,
 * about, sign out.
 */
export function AccountMenu() {
  const { user, logout } = useAuth();
  const { panel, closeAll, mobile, setPanel } = useUi();
  const { t, lang, setLang } = useI18n();
  const { pref, setPref } = useTheme();
  const { size, setSize } = useFontSize();
  const openSettings = useOpenSettings();
  const nav = useNavigate();
  const [sub, setSub] = useState<Sub>(null);
  const place = useAnchoredPanel("hdr-account", panel === "profile", 268);   // hangs from the account chip

  const hoverTimer = useRef<number | undefined>(undefined);

  // a closed menu forgets which flyout was open
  useEffect(() => { if (panel !== "profile") setSub(null); }, [panel]);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  // Hover intent: while a flyout is open, switching to another row waits a beat,
  // so a diagonal move toward the flyout that grazes a neighbouring row does not
  // swap the flyout out from under the pointer. Entering the flyout cancels it.
  const hoverTo = (next: Sub) => {
    window.clearTimeout(hoverTimer.current);
    if (sub === null || next === sub) { setSub(next); return; }
    hoverTimer.current = window.setTimeout(() => setSub(next), 220);
  };
  const holdSub = () => window.clearTimeout(hoverTimer.current);
  const toggleSub = (next: Exclude<Sub, null>) => { holdSub(); setSub(sub === next ? null : next); };

  if (panel !== "profile" || !user) return null;

  const open = (section: SettingsSectionId | null) => { closeAll(); openSettings(section); };

  const themes: { v: ThemePref; label: string }[] = [
    { v: "light", label: t("set.theme.light") },
    { v: "dark", label: t("set.theme.dark") },
    { v: "system", label: t("set.theme.system") },
  ];
  const langs: { v: Lang; label: string }[] = [
    { v: "th", label: "ไทย" },
    { v: "en", label: "English" },
  ];

  return (
    <>
      <div onClick={() => { setSub(null); closeAll(); }} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
      <div
        role="menu"
        aria-label={t("acct.menu")}
        className="menu-slide"
        onKeyDown={(e) => e.key === "Escape" && closeAll()}
        style={{
          position: "fixed",
          right: place?.right ?? 12,
          top: place?.top ?? 60,
          width: place?.width ?? (mobile ? "min(268px, calc(100vw - 24px))" : 268),
          zIndex: 50,
          background: "var(--color-surface)",
          border: "1px solid var(--color-neutral-200)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: 6,
        }}
      >
        {/* identity */}
        <div style={{ padding: "8px 10px 10px", display: "flex", gap: 10, alignItems: "center" }}>
          <Avatar initials={user.initials} size={34} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--color-neutral-600)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.username} · {user.role}
            </div>
          </div>
        </div>
        <Sep />

        <Item icon={<Icon name="gear" />} label={t("menu.settings")} hint="Ctrl+," onClick={() => open(mobile ? null : "general")} onHover={() => hoverTo(null)} />
        <Item icon={<Icon name="person" />} label={t("acct.myAccount")} onClick={() => open("account")} onHover={() => hoverTo(null)} />
        <Item icon={<Icon name="paintbrush" />} label={t("cz.menuItem")} onClick={() => { closeAll(); setPanel("customize"); }} onHover={() => hoverTo(null)} />

        <Flyout
          icon={<Icon name="globe" />}
          label={t("set.language")}
          value={lang === "th" ? "ไทย" : "English"}
          open={sub === "lang"}
          onOpen={() => hoverTo("lang")}
          onToggle={() => toggleSub("lang")}
          onPanelEnter={holdSub}
        >
          {langs.map((l) => (
            <Check key={l.v} on={lang === l.v} label={l.label} onClick={() => setLang(l.v)} />
          ))}
        </Flyout>

        <Flyout
          icon={<Icon name="moon" />}
          label={t("set.appearance")}
          value={themes.find((x) => x.v === pref)?.label ?? ""}
          open={sub === "theme"}
          onOpen={() => hoverTo("theme")}
          onToggle={() => toggleSub("theme")}
          onPanelEnter={holdSub}
        >
          {themes.map((x) => (
            <Check key={x.v} on={pref === x.v} label={x.label} onClick={() => setPref(x.v)} />
          ))}
        </Flyout>

        <Flyout
          icon={<Icon name="sliders" />}
          label={t("set.fontSize")}
          value={size.toUpperCase()}
          open={sub === "size"}
          onOpen={() => hoverTo("size")}
          onToggle={() => toggleSub("size")}
          onPanelEnter={holdSub}
        >
          {FONT_SIZES.map((v) => (
            <Check key={v} on={size === v} label={`${v.toUpperCase()} · ${t(v === "s" ? "set.fontSizeS" : v === "m" ? "set.fontSizeM" : "set.fontSizeL")}`} onClick={() => setSize(v)} />
          ))}
        </Flyout>

        <Item icon={<Icon name="mail" />} label={t("support.menu")}
          onClick={() => { closeAll(); window.location.href = supportMailto({ subject: t("support.subject"), who: user.username }); }} onHover={() => hoverTo(null)} />
        <Item icon={<Icon name="info" />} label={t("set.nav.about")} onClick={() => open("about")} onHover={() => hoverTo(null)} />

        <Sep />
        <Item
          icon={<Icon name="signOut" />}
          label={t("menu.signOut")}
          danger
          onClick={async () => { await logout(); closeAll(); nav("/login"); }}
          onHover={() => hoverTo(null)}
        />
      </div>
    </>
  );
}

const rowBase = {
  display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left" as const,
  border: 0, borderRadius: "var(--radius-md)", minHeight: 40, padding: "8px 10px", fontSize: 13.5, background: "transparent", color: "var(--color-text)",
};

function Item({ icon, label, hint, onClick, onHover, danger }: {
  icon: ReactNode; label: string; hint?: string; onClick: () => void; onHover?: () => void; danger?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      role="menuitem"
      onClick={onClick}
      onMouseEnter={() => { setHover(true); onHover?.(); }}
      onMouseLeave={() => setHover(false)}
      style={{ ...rowBase, background: hover ? "var(--color-neutral-100)" : "transparent", color: danger ? "var(--tone-danger)" : "var(--color-text)" }}
    >
      <span aria-hidden style={{ width: 18, display: "grid", placeItems: "center", color: danger ? "var(--tone-danger)" : "var(--color-neutral-600)" }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {hint && <span style={{ fontSize: 11, color: "var(--color-neutral-500)", fontFamily: "var(--font-heading)" }}>{hint}</span>}
    </button>
  );
}

/** A row that opens a side panel (hover on desktop, tap on touch). */
function Flyout({ icon, label, value, open, onOpen, onToggle, onPanelEnter, children }: {
  icon: ReactNode; label: string; value: string; open: boolean; onOpen: () => void; onToggle: () => void; onPanelEnter: () => void; children: ReactNode;
}) {
  // a phone has no room beside the menu: the panel opens below its row instead
  const { mobile } = useUi();
  return (
    <div style={{ position: "relative" }}>
      <button
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
        onMouseEnter={onOpen}
        style={{ ...rowBase, background: open ? "var(--color-neutral-100)" : "transparent" }}
      >
        <span aria-hidden style={{ width: 18, display: "grid", placeItems: "center", color: "var(--color-neutral-600)" }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        <span style={{ fontSize: 12, color: "var(--color-neutral-500)" }}>{value}</span>
        <Icon name="chevronRight" size={14} color="var(--color-neutral-500)" />
      </button>
      {open && (
        <div
          role="menu"
          className="menu-slide"
          onMouseEnter={onPanelEnter}
          style={{
            position: "absolute", zIndex: 51,
            ...(mobile ? { left: 0, right: 0, top: "calc(100% + 4px)" } : { right: "calc(100% + 10px)", top: -6, minWidth: 180 }),
            background: "var(--color-surface)", border: "1px solid var(--color-neutral-200)", borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)", padding: 6,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function Check({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      role="menuitemradio"
      aria-checked={on}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...rowBase, fontSize: 13, padding: "7px 10px", background: hover ? "var(--color-neutral-100)" : "transparent", fontWeight: on ? 600 : 400 }}
    >
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      {on && (
        <Icon name="check" size={15} color="var(--color-accent)" />
      )}
    </button>
  );
}

function Sep() {
  return <div role="separator" style={{ height: 1, background: "var(--color-neutral-200)", margin: "5px 4px" }} />;
}
