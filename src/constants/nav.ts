import type { IconName } from "@/constants/icons";

/**
 * The main menu as data. The mega menu (desktop), the phone drawer and the sidebar all draw from this, so they can
 * never disagree about what the person may open or where they are (layouts/useNavItems.ts turns it into entries).
 *
 * A new module: add its entry here, its route in app/routes.tsx, its words in i18n, and (when it is gated) the
 * permission code the API enforces — a person without it never sees the entry.
 */
export interface NavEntryDef {
  id: string;
  path: string;
  icon: IconName;
  /** dictionary keys ({ th, en } in src/i18n) */
  labelKey: string;
  /** one line under the label in the mega menu and the drawer; "" for none */
  descKey: string;
  /** a permission code (APP.MODULE.ACTION); omitted = everyone signed in */
  permission?: string;
}

export interface NavGroupDef {
  key: string;
  labelKey: string;
  entries: NavEntryDef[];
}

/** Home: a direct link on every surface. */
export const NAV_HOME: NavEntryDef = { id: "home", path: "/", icon: "home", labelKey: "nav.home", descKey: "" };

/** Direct links beside Home in the header row (keep to one or two: the row has to fit a phone's landscape width). */
export const NAV_DIRECT: NavEntryDef[] = [
  { id: "components", path: "/components", icon: "beaker", labelKey: "nav.components", descKey: "nav.componentsDesc" },
];

/** The columns of the mega menu, in reading order. */
export const NAV_GROUPS: NavGroupDef[] = [
  {
    key: "kit",
    labelKey: "navgroup.kit",
    entries: [
      { id: "components", path: "/components", icon: "beaker", labelKey: "nav.components", descKey: "nav.componentsDesc" },
      { id: "tables", path: "/tables", icon: "log", labelKey: "nav.tables", descKey: "nav.tablesDesc" },
      { id: "charts", path: "/charts", icon: "graph", labelKey: "nav.charts", descKey: "nav.chartsDesc" },
    ],
  },
  {
    key: "pages",
    labelKey: "navgroup.pages",
    entries: [
      { id: "document", path: "/document", icon: "fileCheck", labelKey: "nav.document", descKey: "nav.documentDesc" },
      { id: "manual", path: "/manual", icon: "note", labelKey: "nav.manual", descKey: "nav.manualDesc" },
      { id: "admin", path: "/admin", icon: "shieldLock", labelKey: "nav.admin", descKey: "nav.adminDesc", permission: "ADMIN.PANEL.VIEW" },
    ],
  },
];
