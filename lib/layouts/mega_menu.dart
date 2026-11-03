import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app/scope.dart';
import '../constants/icons.dart';
import '../constants/nav.dart';
import '../overlays/anchored.dart';
import '../theme/tokens.dart';
import 'nav_items.dart';

/// The Apps button of the single-row header and the columns it drops down (docs/decisions/0038).
class MegaMenu extends StatelessWidget {
  const MegaMenu({super.key, required this.nav});
  final NavModel nav;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final cols = nav.groups.length;
    return AnchoredPanel(
      alignRight: false,
      width: (cols * 260 + 16).toDouble(),
      trigger: (context, toggle, open) => _NavChip(
        label: context.t('nav.mega'),
        icon: AppIcon.apps,
        trailing: open ? AppIcon.chevronUp : AppIcon.chevronDown,
        active: open || nav.anyGroupActive,
        onTap: toggle,
      ),
      panel: (context, close) => Padding(
        padding: const EdgeInsets.all(8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (final g in nav.groups)
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 8, 12, 6),
                      child: Text(context.t(g.labelKey).toUpperCase(), style: TextStyle(fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, color: t.muted, letterSpacing: 0.5)),
                    ),
                    for (final e in g.entries) MenuEntryTile(entry: e, active: nav.isActive(e), onTap: () {
                      close();
                      context.go(e.path);
                    }),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// One entry of the mega menu or the drawer: icon, label, one line under it.
class MenuEntryTile extends StatelessWidget {
  const MenuEntryTile({super.key, required this.entry, required this.active, required this.onTap});
  final NavEntryDef entry;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Material(
      color: active ? t.a100 : Colors.transparent,
      borderRadius: t.rMd,
      child: InkWell(
        onTap: onTap,
        borderRadius: t.rMd,
        hoverColor: t.hover,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(width: 30, height: 30, decoration: BoxDecoration(color: active ? t.a200 : t.n100, borderRadius: t.rMd), child: Center(child: AppIconW(entry.icon, size: 16, color: active ? t.a800 : t.n700))),
            const SizedBox(width: 10),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(context.t(entry.labelKey), style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w500, color: active ? t.a800 : t.text)),
                if (entry.descKey.isNotEmpty) Text(context.t(entry.descKey), maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}

/// A link in the header row (Home, the direct links, the Apps trigger).
class _NavChip extends StatelessWidget {
  const _NavChip({required this.label, required this.icon, this.trailing, required this.active, required this.onTap});
  final String label;
  final AppIcon icon;
  final AppIcon? trailing;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => NavChip(label: label, icon: icon, trailing: trailing, active: active, onTap: onTap);
}

class NavChip extends StatelessWidget {
  const NavChip({super.key, required this.label, required this.icon, this.trailing, required this.active, required this.onTap});
  final String label;
  final AppIcon icon;
  final AppIcon? trailing;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Material(
      color: active ? t.a100 : Colors.transparent,
      borderRadius: t.rMd,
      child: InkWell(
        onTap: onTap,
        borderRadius: t.rMd,
        hoverColor: t.hover,
        child: Container(
          height: 36,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            AppIconW(icon, size: 16, color: active ? t.a800 : t.n600),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w500, color: active ? t.a800 : t.n800)),
            if (trailing != null) ...[const SizedBox(width: 2), AppIconW(trailing!, size: 16, color: active ? t.a800 : t.n500)],
          ]),
        ),
      ),
    );
  }
}
