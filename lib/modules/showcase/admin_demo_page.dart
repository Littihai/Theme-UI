import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../components/ui/badge.dart';
import '../../components/ui/page_header.dart';
import '../../components/ui/panel.dart';
import '../../layouts/app_shell.dart';
import '../../theme/tokens.dart';

/// A page gated on ADMIN.PANEL.VIEW (the route wraps it in RequireCan): what the person holds, and the sample accounts.
class AdminDemoPage extends StatelessWidget {
  const AdminDemoPage({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final auth = context.stores.auth;
    final user = auth.user!;
    return ShellPage(
      child: PageBody(children: [
        PageHeader(pre: context.t('navgroup.pages'), title: context.t('nav.admin'), subtitle: context.t('demo.admin.sub')),
        Cols(children: [
          Panel(
            title: context.t('demo.admin.mine'),
            subtitle: context.t('demo.admin.mineDesc', {'name': user.name}),
            child: user.permissions == null
                ? StatusBadge(context.t('set.permAll'), tone: StatusTone.accent)
                : Wrap(spacing: 6, runSpacing: 6, children: [for (final p in user.permissions!) StatusBadge(p, tone: StatusTone.ok)]),
          ),
          Panel(
            title: context.t('demo.admin.account'),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              for (final a in auth.directory)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(children: [
                    Avatar(a.initials, size: 30, tone: a.allPermissions ? StatusTone.accent : StatusTone.neutral),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('${a.username} · ${a.name}', style: TextStyle(fontWeight: FontWeight.w600, fontSize: AppTokens.textMd, color: t.text)),
                        Text(a.permissions == null ? context.t('set.permAll') : a.permissions!.join(', '), style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
                      ]),
                    ),
                    StatusBadge(a.role, tone: a.allPermissions ? StatusTone.accent : StatusTone.neutral),
                  ]),
                ),
            ]),
          ),
        ]),
      ]),
    );
  }
}
