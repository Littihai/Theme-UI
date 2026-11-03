import 'icons.dart';

/// The main menu as data. The mega menu (desktop), the phone drawer and the sidebar all draw from this, so they can
/// never disagree about what the person may open or where they are (layouts/nav_items.dart turns it into entries).
///
/// A new module: add its entry here, its route in app/router.dart, its words in i18n, and (when it is gated) the
/// permission code the API enforces; a person without it never sees the entry.
class NavEntryDef {
  const NavEntryDef({required this.id, required this.path, required this.icon, required this.labelKey, this.descKey = '', this.permission});

  final String id;
  final String path;
  final AppIcon icon;

  /// dictionary keys ({ th, en } in lib/i18n)
  final String labelKey;

  /// one line under the label in the mega menu and the drawer; '' for none
  final String descKey;

  /// a permission code (APP.MODULE.ACTION); null = everyone signed in
  final String? permission;
}

class NavGroupDef {
  const NavGroupDef({required this.key, required this.labelKey, required this.entries});
  final String key;
  final String labelKey;
  final List<NavEntryDef> entries;
}

/// Home: a direct link on every surface.
const navHome = NavEntryDef(id: 'home', path: '/', icon: AppIcon.home, labelKey: 'nav.home');

/// Direct links beside Home in the header row (keep to one or two: the row has to fit a phone's landscape width).
const navDirect = [
  NavEntryDef(id: 'components', path: '/components', icon: AppIcon.beaker, labelKey: 'nav.components', descKey: 'nav.componentsDesc'),
];

/// The columns of the mega menu, in reading order.
const navGroups = [
  NavGroupDef(key: 'kit', labelKey: 'navgroup.kit', entries: [
    NavEntryDef(id: 'components', path: '/components', icon: AppIcon.beaker, labelKey: 'nav.components', descKey: 'nav.componentsDesc'),
    NavEntryDef(id: 'tables', path: '/tables', icon: AppIcon.log, labelKey: 'nav.tables', descKey: 'nav.tablesDesc'),
    NavEntryDef(id: 'charts', path: '/charts', icon: AppIcon.graph, labelKey: 'nav.charts', descKey: 'nav.chartsDesc'),
  ]),
  NavGroupDef(key: 'pages', labelKey: 'navgroup.pages', entries: [
    NavEntryDef(id: 'document', path: '/document', icon: AppIcon.fileCheck, labelKey: 'nav.document', descKey: 'nav.documentDesc'),
    NavEntryDef(id: 'manual', path: '/manual', icon: AppIcon.note, labelKey: 'nav.manual', descKey: 'nav.manualDesc'),
    NavEntryDef(id: 'admin', path: '/admin', icon: AppIcon.shieldLock, labelKey: 'nav.admin', descKey: 'nav.adminDesc', permission: 'ADMIN.PANEL.VIEW'),
  ]),
];

/// Every entry once (home, the direct links, the groups), for the palette and the footer.
List<NavEntryDef> allNavEntries() {
  final seen = <String>{};
  final out = <NavEntryDef>[];
  for (final e in [navHome, ...navDirect, for (final g in navGroups) ...g.entries]) {
    if (seen.add(e.id)) out.add(e);
  }
  return out;
}
