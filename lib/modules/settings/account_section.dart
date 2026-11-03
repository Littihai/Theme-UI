import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../components/ui/badge.dart';
import '../../components/ui/button.dart';
import '../../components/ui/panel.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';
import 'settings_ui.dart';

/// Settings > Account: the details from the employee record, security, sign-out.
class AccountSection extends StatelessWidget {
  const AccountSection({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final user = context.stores.auth.user;
    if (user == null) return Text(context.t('set.denied'), style: TextStyle(color: t.muted));
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      SettingsBlock(
        title: context.t('set.accountInfo'),
        desc: context.t('set.accountInfoDesc'),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Row(children: [
            Avatar(user.initials, size: 48),
            const SizedBox(width: 14),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(user.name, style: context.textTheme.titleMedium),
              Row(children: [
                StatusBadge(context.t('set.active'), tone: StatusTone.ok, dot: true),
                const SizedBox(width: 8),
                Text(user.role, style: TextStyle(fontSize: AppTokens.textSm, color: t.muted)),
              ]),
            ]),
          ]),
          const SizedBox(height: 14),
          KeyValue(context.t('set.username'), Text(user.username)),
          KeyValue(context.t('set.position'), Text(user.role)),
          if (user.dept != null) KeyValue(context.t('set.dept'), Text(user.dept!)),
          if (user.email != null) KeyValue(context.t('set.email'), Text(user.email!)),
          KeyValue(
            context.t('set.permissions'),
            user.permissions == null
                ? StatusBadge(context.t('set.permAll'), tone: StatusTone.accent)
                : Wrap(spacing: 6, runSpacing: 6, children: [for (final p in user.permissions!) StatusBadge(p, tone: StatusTone.neutral)]),
          ),
        ]),
      ),
      SettingsBlock(
        title: context.t('set.security'),
        desc: context.t('set.passwordDesc'),
        child: Row(children: [
          AppButton(label: context.t('set.changePassword'), icon: AppIcon.key, onPressed: () => context.stores.toasts.info(context.t('set.changePassword'), text: context.t('set.notInDemo'))),
        ]),
      ),
      SettingsBlock(
        title: context.t('menu.signOut'),
        desc: context.t('set.signOutDesc'),
        child: Row(children: [
          AppButton(label: context.t('menu.signOut'), icon: AppIcon.signOut, variant: ButtonVariant.danger, onPressed: () => context.stores.auth.logout()),
        ]),
      ),
    ]);
  }
}
