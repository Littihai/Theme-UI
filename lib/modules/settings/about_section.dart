import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/scope.dart';
import '../../components/ui/button.dart';
import '../../components/ui/panel.dart';
import '../../constants/brand.dart';
import '../../constants/icons.dart';
import '../../theme/theme_store.dart';
import '../../util/platform.dart';
import 'settings_ui.dart';

/// Settings > About: the version and the device, for IT support; how to reach them.
class AboutSection extends StatelessWidget {
  const AboutSection({super.key});

  @override
  Widget build(BuildContext context) {
    final s = context.stores;
    final themeName = switch (s.theme.pref) {
      ThemePref.light => context.t('set.theme.light'),
      ThemePref.dark => context.t('set.theme.dark'),
      ThemePref.system => '${context.t('set.theme.system')} (${context.t(s.theme.isDark ? 'set.theme.dark' : 'set.theme.light')})',
    };
    final lines = [
      '${Brand.name} $appVersion',
      '${context.t('set.about.theme')}: $themeName',
      '${context.t('set.about.lang')}: ${s.i18n.lang.name}',
      '${context.t('set.about.browser')}: ${runtimeName()}${kIsWeb ? ' (web)' : ''}',
    ].join('\n');
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      SettingsBlock(
        title: context.t('set.about.app'),
        child: Column(children: [
          KeyValue(context.t('set.about.product'), const Text(Brand.name)),
          KeyValue(context.t('set.about.company'), const Text(Brand.company)),
          KeyValue(context.t('set.about.version'), const Text(appVersion)),
          KeyValue(context.t('set.about.built'), const Text(kReleaseMode ? 'release' : 'debug')),
        ]),
      ),
      SettingsBlock(
        title: context.t('set.about.device'),
        child: Column(children: [
          KeyValue(context.t('set.about.theme'), Text(themeName)),
          KeyValue(context.t('set.about.lang'), Text(s.i18n.th ? 'ไทย' : 'English')),
          KeyValue(context.t('set.about.browser'), Text('${runtimeName()}${kIsWeb ? ' · web' : ''}')),
        ]),
      ),
      SettingsBlock(
        title: context.t('set.about.support'),
        desc: context.t('set.about.supportDesc'),
        child: Wrap(spacing: 8, runSpacing: 8, children: [
          AppButton(label: Brand.supportEmail, icon: AppIcon.mail, onPressed: () {
            Clipboard.setData(ClipboardData(text: '${context.t('support.subject')}: ${Brand.name}\n$lines'));
            s.toasts.success(context.t('error.copied'));
          }),
          AppButton(label: context.t('error.copyRef'), variant: ButtonVariant.tertiary, icon: AppIcon.copy, onPressed: () {
            Clipboard.setData(ClipboardData(text: lines));
            s.toasts.success(context.t('error.copied'));
          }),
        ]),
      ),
    ]);
  }
}
