import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app/scope.dart';
import '../components/ui/app_logo.dart';
import '../components/ui/button.dart';
import '../constants/icons.dart';
import '../constants/nav.dart';
import '../theme/appearance.dart';
import '../theme/tokens.dart';
import 'nav_items.dart';

/// The sidebar (docs/decisions/0002): the brand, Home, the groups. `rail` narrows it to icons with tooltips; the
/// button at the bottom flips between the two (and remembers it, like every Customize choice).
class SideNav extends StatelessWidget {
  const SideNav({super.key, required this.nav, required this.rail, required this.floating});
  final NavModel nav;
  final bool rail;
  final bool floating;

  static const double width = 240;
  static const double railWidth = 64;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final appearance = context.stores.appearance;
    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(
          height: 60,
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: rail ? 0 : 14),
            child: rail ? Center(child: InkWell(onTap: () => context.go('/'), borderRadius: BorderRadius.circular(8), child: const Padding(padding: EdgeInsets.all(4), child: AppLogo(size: 26)))) : Align(alignment: Alignment.centerLeft, child: BrandLockup(size: 24, onTap: () => context.go('/'))),
          ),
        ),
        Divider(color: t.divider),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
            children: [
              _Item(entry: nav.home, active: nav.isActive(nav.home), rail: rail),
              for (final g in nav.groups) ...[
                if (!rail)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(10, 14, 10, 4),
                    child: Text(context.t(g.labelKey).toUpperCase(), style: TextStyle(fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, color: t.muted, letterSpacing: 0.5)),
                  )
                else
                  Padding(padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 12), child: Divider(color: t.divider)),
                for (final e in g.entries) _Item(entry: e, active: nav.isActive(e), rail: rail),
              ],
            ],
          ),
        ),
        Divider(color: t.divider),
        Padding(
          padding: const EdgeInsets.all(8),
          child: rail
              ? IconBtn(icon: AppIcon.sidebarExpand, label: context.t('cz.nav.expand'), onPressed: () => appearance.update(appearance.state.copyWith(nav: NavLayout.side)))
              : AppButton(label: context.t('cz.nav.collapse'), variant: ButtonVariant.ghost, size: ButtonSize.sm, icon: AppIcon.sidebarCollapse, expand: true, onPressed: () => appearance.update(appearance.state.copyWith(nav: NavLayout.rail))),
        ),
      ],
    );
    return Container(
      width: rail ? railWidth : width,
      margin: floating ? const EdgeInsets.fromLTRB(12, 12, 0, 12) : EdgeInsets.zero,
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius: floating ? t.rXl : null,
        border: floating ? Border.all(color: t.divider) : Border(right: BorderSide(color: t.divider)),
        boxShadow: floating ? t.shadowMd : null,
      ),
      clipBehavior: floating ? Clip.antiAlias : Clip.none,
      child: body,
    );
  }
}

class _Item extends StatelessWidget {
  const _Item({required this.entry, required this.active, required this.rail});
  final NavEntryDef entry;
  final bool active;
  final bool rail;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final label = context.t(entry.labelKey);
    final tile = Material(
      color: active ? t.a100 : Colors.transparent,
      borderRadius: t.rMd,
      child: InkWell(
        onTap: () => context.go(entry.path),
        borderRadius: t.rMd,
        hoverColor: t.hover,
        child: Container(
          height: 38,
          padding: EdgeInsets.symmetric(horizontal: rail ? 0 : 10),
          child: Row(mainAxisAlignment: rail ? MainAxisAlignment.center : MainAxisAlignment.start, children: [
            AppIconW(entry.icon, size: 18, color: active ? t.a800 : t.n600),
            if (!rail) ...[
              const SizedBox(width: 10),
              Expanded(child: Text(label, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w500, color: active ? t.a800 : t.n800))),
            ],
          ]),
        ),
      ),
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: rail ? Tooltip(message: label, preferBelow: false, child: tile) : tile,
    );
  }
}

