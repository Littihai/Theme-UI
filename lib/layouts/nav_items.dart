import '../constants/nav.dart';
import '../state/auth_store.dart';

/// The menu, narrowed to what the signed-in person may open, plus where they are.
class NavModel {
  NavModel({required AuthStore auth, required this.currentPath})
      : home = navHome,
        direct = navDirect.where((e) => _allowed(auth, e)).toList(),
        groups = [
          for (final g in navGroups)
            if (g.entries.any((e) => _allowed(auth, e))) NavGroupDef(key: g.key, labelKey: g.labelKey, entries: g.entries.where((e) => _allowed(auth, e)).toList()),
        ];

  final String currentPath;
  final NavEntryDef home;
  final List<NavEntryDef> direct;
  final List<NavGroupDef> groups;

  static bool _allowed(AuthStore auth, NavEntryDef e) => e.permission == null || auth.can(e.permission!);

  /// Home is active only at "/"; another entry is active on its path and anything under it.
  bool isActive(NavEntryDef e) => e.path == '/' ? currentPath == '/' : currentPath == e.path || currentPath.startsWith('${e.path}/');

  /// True while any entry of the groups is active (the Apps button lights up).
  bool get anyGroupActive => groups.any((g) => g.entries.any(isActive));

  /// The entry that owns the current page, for the page title in the drawer.
  NavEntryDef? get current {
    for (final e in [home, ...direct, for (final g in groups) ...g.entries]) {
      if (isActive(e)) return e;
    }
    return null;
  }
}
