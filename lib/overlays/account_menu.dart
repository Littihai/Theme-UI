import 'package:flutter/material.dart';

import '../app/scope.dart';
import '../components/ui/badge.dart';
import '../constants/icons.dart';
import '../layouts/app_shell.dart';
import '../modules/settings/settings_nav.dart';
import '../theme/tokens.dart';
import 'anchored.dart';

/// The chip at the right of the header and what drops from it: who is signed in, the account page, settings,
/// Customize and sign out.
class AccountMenu extends StatelessWidget {
  const AccountMenu({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final user = context.stores.auth.user;
    if (user == null) return const SizedBox.shrink();
    final mobile = context.isMobile;
    return AnchoredPanel(
      width: 260,
      trigger: (context, toggle, open) => Tooltip(
        message: context.t('acct.menu'),
        child: Material(
          color: open ? t.n100 : Colors.transparent,
          borderRadius: t.rMd,
          child: InkWell(
            onTap: toggle,
            borderRadius: t.rMd,
            hoverColor: t.hover,
            child: Padding(
              padding: EdgeInsets.fromLTRB(4, 4, mobile ? 4 : 10, 4),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Avatar(user.initials, size: 30),
                if (!mobile) ...[
                  const SizedBox(width: 8),
                  Text(user.first, style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w500, color: t.text)),
                  const SizedBox(width: 2),
                  AppIconW(AppIcon.chevronDown, size: 16, color: t.n500),
                ],
              ]),
            ),
          ),
        ),
      ),
      panel: (context, close) {
        final shell = ShellScope.of(context);
        Widget item(AppIcon icon, String label, VoidCallback onTap, {bool danger = false}) => InkWell(
              onTap: () {
                close();
                onTap();
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                child: Row(children: [
                  AppIconW(icon, size: 16, color: danger ? t.stopFg : t.n600),
                  const SizedBox(width: 10),
                  Text(label, style: TextStyle(fontSize: AppTokens.textMd, color: danger ? t.stopFg : t.text)),
                ]),
              ),
            );
        return Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            child: Row(children: [
              Avatar(user.initials, size: 36),
              const SizedBox(width: 10),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(user.name, style: TextStyle(fontWeight: FontWeight.w600, fontSize: AppTokens.textMd, color: t.text)),
                  Text('${user.role}${user.dept == null ? '' : ' · ${user.dept}'}', style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
                ]),
              ),
            ]),
          ),
          Divider(color: t.divider),
          item(AppIcon.person, context.t('acct.myAccount'), () => openSettings(context, SettingsSection.account)),
          item(AppIcon.gear, context.t('menu.settings'), () => openSettings(context, SettingsSection.general)),
          item(AppIcon.paintbrush, context.t('cz.menuItem'), shell.openCustomize),
          Divider(color: t.divider),
          item(AppIcon.signOut, context.t('menu.signOut'), () => context.stores.auth.logout(), danger: true),
          const SizedBox(height: 4),
        ]);
      },
    );
  }
}
