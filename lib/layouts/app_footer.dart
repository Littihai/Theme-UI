import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../app/scope.dart';
import '../components/ui/app_logo.dart';
import '../constants/brand.dart';
import '../constants/nav.dart';
import '../modules/settings/settings_nav.dart';
import '../theme/tokens.dart';
import 'nav_items.dart';

/// The footer of the signed-in app: the brand and its tagline, the pages, help, and the small print.
class AppFooter extends StatelessWidget {
  const AppFooter({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final nav = NavModel(auth: context.stores.auth, currentPath: GoRouterState.of(context).uri.path);
    final link = TextStyle(fontSize: AppTokens.textSm, color: t.n700);
    final head = TextStyle(fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, color: t.muted, letterSpacing: 0.5);

    Widget col(String title, List<(String, VoidCallback)> links) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title.toUpperCase(), style: head),
            const SizedBox(height: 8),
            for (final (label, go) in links)
              InkWell(onTap: go, borderRadius: t.rSm, child: Padding(padding: const EdgeInsets.symmetric(vertical: 3), child: Text(label, style: link))),
          ],
        );

    final cols = [
      col(context.t('ft.platform'), [for (final e in [navHome, ...nav.groups.expand((g) => g.entries)]) (context.t(e.labelKey), () => context.go(e.path))]),
      col(context.t('ft.help'), [
        (context.t('nav.manual'), () => context.go('/manual')),
        (context.t('set.about.support'), () => openSettings(context, SettingsSection.about)),
        (context.t('set.title'), () => openSettings(context, SettingsSection.general)),
      ]),
      col(context.t('ft.about'), [
        ('${context.t('set.about.version')} $appVersion', () => openSettings(context, SettingsSection.about)),
        (Brand.company, () => openSettings(context, SettingsSection.about)),
      ]),
    ];
    final brand = Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const BrandLockup(size: 22),
      const SizedBox(height: 8),
      Text(context.pick(Brand.tagline), style: TextStyle(fontSize: AppTokens.textSm, color: t.muted)),
    ]);
    final mobile = context.isTight;
    return Container(
      decoration: BoxDecoration(color: t.surface, border: Border(top: BorderSide(color: t.divider))),
      padding: EdgeInsets.symmetric(horizontal: context.pagePad, vertical: 28),
      child: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: t.pageMax),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            if (mobile) ...[brand, const SizedBox(height: 20), Wrap(spacing: 40, runSpacing: 20, children: cols)]
            else
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Expanded(flex: 2, child: brand), for (final c in cols) Expanded(child: c)]),
            const SizedBox(height: 24),
            Divider(color: t.divider),
            const SizedBox(height: 12),
            Text('© ${DateTime.now().year} ${Brand.company} · ${context.t('footer.rights')}', style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
          ]),
        ),
      ),
    );
  }
}
