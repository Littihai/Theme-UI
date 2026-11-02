import { createContext, useCallback, useContext } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import type { IconName } from "@/constants/icons";

/**
 * Settings live in one overlay window that is still a real route — `/settings/<section>` — so a section can be
 * bookmarked, linked from an e-mail, or reopened after a refresh.
 *
 * The page underneath stays mounted via the "background location" pattern: when settings open we remember where
 * the user was and keep rendering that page behind the overlay. A cold load of `/settings/...` has no background,
 * so the home page is shown behind it instead.
 */
export type SettingsSectionId = "general" | "account" | "about";

export type SettingsGroup = "personal" | "admin" | "other";

export interface SettingsSectionDef {
  id: SettingsSectionId;
  group: SettingsGroup;
  labelKey: string;
  descKey: string;
  icon: IconName;
  /** Any one of these permission codes shows the section; empty = everyone. */
  anyOf: string[];
}

/**
 * An admin section is gated on the same permission codes the API enforces, so the menu never offers a screen that
 * would only answer "no permission". Add one here, in SettingsSectionId, and in SettingsModal's SectionBody.
 */
export const SETTINGS_SECTIONS: SettingsSectionDef[] = [
  { id: "general", group: "personal", labelKey: "set.nav.general", descKey: "set.desc.general", icon: "gear", anyOf: [] },
  { id: "account", group: "personal", labelKey: "set.nav.account", descKey: "set.desc.account", icon: "person", anyOf: [] },
  { id: "about", group: "other", labelKey: "set.nav.about", descKey: "set.desc.about", icon: "info", anyOf: [] },
];

export const SETTINGS_GROUPS: { id: SettingsGroup; labelKey: string }[] = [
  { id: "personal", labelKey: "set.group.personal" },
  { id: "admin", labelKey: "set.group.admin" },
  { id: "other", labelKey: "set.group.other" },
];

export function visibleSettingsSections(can: (code: string) => boolean): SettingsSectionDef[] {
  return SETTINGS_SECTIONS.filter((s) => s.anyOf.length === 0 || s.anyOf.some(can));
}

export function isSettingsPath(pathname: string): boolean {
  return pathname === "/settings" || pathname.startsWith("/settings/");
}

export interface SettingsLocationState {
  backgroundLocation?: Location;
  /** phone layout: this section was pushed from the section list, so "back" pops it */
  fromList?: boolean;
}

/**
 * The browser's real location. Components rendered by the page routes see the *background* location while Settings
 * is open (that is how the page stays mounted), so they cannot tell from useLocation() that Settings is already up.
 * AppRoutes provides the real one here.
 */
export const RealLocationContext = createContext<Location | null>(null);

/**
 * Opens settings over the current page, or switches section if it is already open.
 * `null` opens the section list (the phone layout's first screen).
 */
export function useOpenSettings() {
  const nav = useNavigate();
  const routed = useLocation();
  const real = useContext(RealLocationContext) ?? routed;
  return useCallback(
    (section: SettingsSectionId | null = "general") => {
      const path = section ? `/settings/${section}` : "/settings";
      if (isSettingsPath(real.pathname)) {
        // already open: change section in place — pushing another entry would make
        // the close button step back into Settings instead of out of it
        nav(path, { replace: true, state: real.state });
        return;
      }
      nav(path, { state: { backgroundLocation: real } satisfies SettingsLocationState });
    },
    [nav, real],
  );
}
