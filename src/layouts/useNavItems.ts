import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { usePermissions } from "@/app/providers/PermissionProvider";
import { useI18n } from "@/app/providers/I18nProvider";
import { NAV_DIRECT, NAV_GROUPS, NAV_HOME, type NavEntryDef } from "@/constants/nav";
import type { IconName } from "@/types";

/** One destination in the navigation, ready to draw. */
export interface NavEntry {
  id: string;
  label: string;
  /** one line under the label in the mega menu and the drawer */
  desc: string;
  icon: IconName;
  active: boolean;
  onPick: () => void;
}

/** A column of the mega menu; the drawer and the sidebar show the same groups vertically. */
export interface NavGroupEntry {
  key: string;
  label: string;
  entries: NavEntry[];
}

/**
 * The main menu as data (docs/decisions/0038): Home and the direct links, then every group of constants/nav.ts
 * with the entries the person may open. The mega menu, the phone drawer and the sidebar all draw from this, so
 * they can never disagree about what the person may open or where they are. Settings is NOT here: it lives in the
 * account menu (and the drawer, which has no account menu button of its own).
 */
export function useNavGroups() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { can } = usePermissions();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`));
  const allowed = (d: NavEntryDef) => !d.permission || can(d.permission);
  const entry = (d: NavEntryDef): NavEntry => ({
    id: d.id,
    label: t(d.labelKey),
    desc: d.descKey ? t(d.descKey) : "",
    icon: d.icon,
    active: isActive(d.path),
    onPick: () => nav(d.path),
  });

  const home = entry(NAV_HOME);
  const direct = NAV_DIRECT.filter(allowed).map(entry);
  const groups: NavGroupEntry[] = NAV_GROUPS
    .map((g) => ({ key: g.key, label: t(g.labelKey), entries: g.entries.filter(allowed).map(entry) }))
    .filter((g) => g.entries.length > 0);

  // the mega trigger is "where you are" whenever the current page is one of its destinations
  const anyActive = groups.some((g) => g.entries.some((e) => e.active));

  return { home, direct, groups, anyActive, pathname, signedIn: !!user };
}
