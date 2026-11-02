import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useUi } from "@/app/providers/UiProvider";
import { usePermissions } from "@/app/providers/PermissionProvider";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/app/providers/I18nProvider";
import { useNavGroups } from "@/layouts/useNavItems";
import { useOpenSettings, visibleSettingsSections } from "@/modules/settings/settingsNav";
import type { IconName } from "@/types";

interface Item { id: string; icon: IconName; label: string; sub?: string; run: () => void }
interface Group { key: string; label: string; items: Item[] }

const MAX = { pages: 8, settings: 6 };

/**
 * Ctrl-K palette: every page of the menu and — once something is typed — the Settings sections. Limited to what the
 * person may open. Matching ignores case. Arrow keys move, Enter opens, Esc closes.
 *
 * A module that wants its documents searchable adds a group here: ask its service a moment after typing stops (see
 * the `useEffect` pattern) and map the hits to items.
 */
export function CommandPalette() {
  const { paletteOpen, closeAll } = useUi();
  const { t } = useI18n();
  const { can } = usePermissions();
  const openSettings = useOpenSettings();
  const { home, direct, groups: navGroups } = useNavGroups();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  // each time the palette opens: start clean
  useEffect(() => { if (!paletteOpen) { setQ(""); setActive(0); } }, [paletteOpen]);
  useEffect(() => setActive(0), [q]);

  const groups = useMemo<Group[]>(() => {
    const query = q.trim().toLowerCase();
    const match = (...texts: (string | null | undefined)[]) => !query || texts.some((x) => (x ?? "").toLowerCase().includes(query));

    const pages: Item[] = [home, ...direct, ...navGroups.flatMap((g) => g.entries)]
      .filter((e, i, all) => all.findIndex((x) => x.id === e.id) === i)   // a direct link is also in a group: once
      .filter((e) => match(e.label, e.desc))
      .slice(0, MAX.pages)
      .map((e) => ({ id: `page:${e.id}`, icon: e.icon, label: e.label, sub: e.desc || undefined, run: () => { closeAll(); e.onPick(); } }));

    const settings: Item[] = query
      ? visibleSettingsSections(can)
          .filter((s) => match(t(s.labelKey), t(s.descKey)))
          .slice(0, MAX.settings)
          .map((s) => ({ id: `set:${s.id}`, icon: s.icon, label: t(s.labelKey), sub: t(s.descKey), run: () => { closeAll(); openSettings(s.id); } }))
      : [];

    return [
      { key: "pages", label: t("palette.pages"), items: pages },
      { key: "settings", label: t("palette.settings"), items: settings },
    ].filter((g) => g.items.length);
  }, [q, home, direct, navGroups, can, t, closeAll, openSettings]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  if (!paletteOpen) return null;
  const empty = flat.length === 0;

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); flat[active]?.run(); }
  }

  let index = -1;
  return (
    <div
      onClick={closeAll}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(29,31,32,.28)",
        backdropFilter: "blur(2px)",
        display: "flex",
        justifyContent: "center",
        paddingTop: "12vh",
        animation: "fade .12s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("palette.searchPh")}
        style={{
          width: "min(620px,92vw)",
          height: "fit-content",
          background: "var(--color-surface)",
          border: "1px solid var(--color-neutral-200)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          animation: "pop .16s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--color-neutral-200)" }}>
          <Icon name="search" color="var(--color-neutral-500)" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder={t("palette.searchPh")}
            aria-label={t("palette.searchPh")}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={flat[active] ? `palette-opt-${active}` : undefined}
            style={{ flex: 1, border: 0, outline: "none", fontSize: 14.5, background: "transparent" }}
          />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 11, border: "1px solid var(--color-neutral-300)", borderRadius: 4, padding: "1px 6px", color: "var(--color-neutral-600)" }}>
            ESC
          </span>
        </div>
        <div id="palette-list" role="listbox" className="scroll-thin" style={{ maxHeight: "52vh", overflow: "auto", padding: 6 }}>
          {groups.map((g) => (
            <div key={g.key} role="group" aria-label={g.label} style={{ padding: "6px 4px" }}>
              <div className="eyebrow" style={{ fontWeight: 700, color: "var(--color-neutral-500)", padding: "4px 8px" }}>
                {g.label}
              </div>
              {g.items.map((it) => {
                const i = ++index;
                const on = i === active;
                return (
                  <button
                    key={it.id}
                    id={`palette-opt-${i}`}
                    role="option"
                    aria-selected={on}
                    tabIndex={-1}
                    onClick={it.run}
                    onMouseEnter={() => setActive(i)}
                    style={{
                      display: "flex", width: "100%", alignItems: "center", gap: 11, border: 0, borderRadius: "var(--radius-md)",
                      padding: "9px", textAlign: "left", background: on ? "var(--color-neutral-100)" : "transparent", color: "var(--color-text)",
                    }}
                  >
                    <Icon name={it.icon} size={16} color="var(--color-neutral-600)" />
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 13.5 }}>{it.label}</span>
                      {it.sub && <span style={{ fontSize: 11.5, color: "var(--color-neutral-500)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.sub}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
          {empty && (
            <div style={{ padding: 34, textAlign: "center", color: "var(--color-neutral-500)", fontSize: 13 }}>{t("palette.empty")}</div>
          )}
        </div>
      </div>
    </div>
  );
}
