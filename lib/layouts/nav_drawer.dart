import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app/scope.dart';
import '../components/ui/app_logo.dart';
import '../components/ui/badge.dart';
import '../components/ui/button.dart';
import '../constants/icons.dart';
import '../modules/settings/settings_nav.dart';
import '../theme/tokens.dart';
import 'mega_menu.dart';
import 'nav_items.dart';
import 'public_frame.dart';

/// The phone menu, behind the three bars: every page, then the person and the quick switches.
class NavDrawer extends StatelessWidget {
  const NavDrawer({super.key, required this.nav, required this.floating});
  final NavModel nav;
  final bool floating;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final user = context.stores.auth.user;
    void goTo(String path) {
      Navigator.of(context).pop();
      context.go(path);
    }

    return Drawer(
      backgroundColor: t.surface,
      width: 300,
      shape: floating ? RoundedRectangleBorder(borderRadius: t.rXl) : const RoundedRectangleBorder(),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
              child: Row(children: [
                const BrandLockup(size: 24),
                const Spacer(),
                IconBtn(icon: AppIcon.x, label: context.t('nav.closeMenu'), onPressed: () => Navigator.of(context).pop()),
              ]),
            ),
            Divider(color: t.divider),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(8),
                children: [
                  MenuEntryTile(entry: nav.home, active: nav.isActive(nav.home), onTap: () => goTo('/')),
                  for (final g in nav.groups) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 14, 12, 4),
                      child: Text(context.t(g.labelKey).toUpperCase(), style: TextStyle(fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, color: t.muted, letterSpacing: 0.5)),
                    ),
                    for (final e in g.entries) MenuEntryTile(entry: e, active: nav.isActive(e), onTap: () => goTo(e.path)),
                  ],
                ],
              ),
            ),
            Divider(color: t.divider),
            if (user != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 8, 4),
                child: Row(children: [
                  Avatar(user.initials, size: 34),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(user.name, style: TextStyle(fontWeight: FontWeight.w600, fontSize: AppTokens.textMd, color: t.text)),
                      Text(user.role, style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
                    ]),
                  ),
                  const LangToggle(),
                  const ThemeToggle(),
                ]),
              ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
              child: Row(children: [
                Expanded(child: AppButton(label: context.t('menu.settings'), size: ButtonSize.sm, icon: AppIcon.gear, expand: true, onPressed: () {
                  Navigator.of(context).pop();
                  openSettings(context, SettingsSection.general);
                })),
                const SizedBox(width: 8),
                Expanded(child: AppButton(label: context.t('menu.signOut'), size: ButtonSize.sm, icon: AppIcon.signOut, variant: ButtonVariant.ghost, expand: true, onPressed: () {
                  Navigator.of(context).pop();
                  context.stores.auth.logout();
                })),
              ]),
            ),
          ],
        ),
      ),
    );
  }
}
