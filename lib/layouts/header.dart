import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app/scope.dart';
import '../components/ui/app_logo.dart';
import '../components/ui/button.dart';
import '../components/ui/panel.dart';
import '../constants/icons.dart';
import '../overlays/account_menu.dart';
import '../overlays/notifications_panel.dart';
import '../theme/appearance.dart';
import '../theme/tokens.dart';
import 'app_shell.dart';
import 'mega_menu.dart';
import 'nav_items.dart';
import 'public_frame.dart';

/// The single row at the top (docs/decisions/0038): the brand, Home and the direct links, the Apps mega menu; then
/// search, language, colour scheme, the bell, Customize and the account chip. With a sidebar the brand moves there.
class AppHeader extends StatelessWidget {
  const AppHeader({super.key, required this.nav});
  final NavModel nav;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final shell = ShellScope.of(context);
    final mobile = context.isMobile;
    final narrow = context.isNarrow;
    final layout = context.stores.appearance.state.nav;
    final withSidebar = !mobile && layout != NavLayout.top;
    final floating = context.stores.appearance.state.navStyle == Edges.floating;

    final row = Row(children: [
      if (mobile) ...[
        IconBtn(icon: AppIcon.threeBars, label: context.t('nav.menu'), onPressed: shell.openDrawer),
        const SizedBox(width: 4),
      ],
      if (!withSidebar) BrandLockup(size: 24, onTap: () => context.go('/')),
      if (!mobile && !withSidebar) ...[
        const SizedBox(width: 16),
        NavChip(label: context.t('nav.home'), icon: AppIcon.home, active: nav.isActive(nav.home), onTap: () => context.go('/')),
        for (final e in nav.direct) NavChip(label: context.t(e.labelKey), icon: e.icon, active: nav.isActive(e), onTap: () => context.go(e.path)),
        if (nav.groups.isNotEmpty) MegaMenu(nav: nav),
      ],
      const Spacer(),
      if (!narrow)
        _SearchBox(onTap: shell.openPalette)
      else
        IconBtn(icon: AppIcon.search, label: context.t('header.search'), onPressed: shell.openPalette),
      if (!mobile) ...[
        const SizedBox(width: 2),
        const ScreenWidthToggle(),
        const LangToggle(),
        const ThemeToggle(),
      ],
      const SizedBox(width: 2),
      const NotificationsBell(),
      const SizedBox(width: 2),
      IconBtn(icon: AppIcon.paintbrush, label: context.t('cz.title'), onPressed: shell.openCustomize),
      const SizedBox(width: 6),
      const AccountMenu(),
    ]);

    return Container(
      height: 60,
      margin: floating ? EdgeInsets.fromLTRB(withSidebar ? 12 : 12, 12, 12, 0) : EdgeInsets.zero,
      padding: EdgeInsets.symmetric(horizontal: mobile ? 8 : 16),
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius: floating ? t.rXl : null,
        border: floating ? Border.all(color: t.divider) : Border(bottom: BorderSide(color: t.divider)),
        boxShadow: floating ? t.shadowMd : null,
      ),
      child: row,
    );
  }
}

class _SearchBox extends StatelessWidget {
  const _SearchBox({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Semantics(
      button: true,
      label: context.t('header.search'),
      child: InkWell(
        onTap: onTap,
        borderRadius: t.rMd,
        child: Container(
          width: 240,
          height: 36,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(color: t.n100, borderRadius: t.rMd, border: Border.all(color: t.n200)),
          child: Row(children: [
            AppIconW(AppIcon.search, size: 15, color: t.n500),
            const SizedBox(width: 8),
            Expanded(child: Text(context.t('header.searchAll'), overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: AppTokens.textSm, color: t.n500))),
            const Kbd('Ctrl'),
            const SizedBox(width: 3),
            const Kbd('K'),
          ]),
        ),
      ),
    );
  }
}
