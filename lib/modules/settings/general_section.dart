import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../components/ui/button.dart';
import '../../components/ui/panel.dart';
import '../../constants/icons.dart';
import '../../i18n/dict.dart';
import '../../theme/theme_store.dart';
import '../../theme/tokens.dart';
import 'appearance_controls.dart';
import 'settings_ui.dart';

/// Settings > General: appearance, language, keyboard shortcuts.
class GeneralSection extends StatelessWidget {
  const GeneralSection({super.key});

  @override
  Widget build(BuildContext context) {
    final s = context.stores;
    final t = context.tokens;
    final sample = Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: t.n50, borderRadius: t.rMd, border: Border.all(color: t.divider)),
      child: Text(context.t('set.fontSizeSample'), style: TextStyle(fontSize: AppTokens.textMd, color: t.text)),
    );
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      SettingsBlock(
        title: context.t('set.appearance'),
        trailing: AppButton(
          label: context.t('set.appearanceReset'),
          size: ButtonSize.sm,
          icon: AppIcon.history,
          tooltip: context.t('set.appearanceResetHint'),
          onPressed: () {
            s.appearance.reset();
            s.theme.setPref(ThemePref.system);
            s.fontSize.setSize(TextSize.m);
          },
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [const AppearanceControls(), sample]),
      ),
      SettingsBlock(
        title: context.t('set.language'),
        desc: context.t('set.languageDesc'),
        child: OptionRow<Lang>(
          title: context.t('set.languageLabel'),
          value: s.i18n.lang,
          onChanged: s.i18n.setLang,
          options: const [OptionItem(Lang.th, 'ไทย'), OptionItem(Lang.en, 'English')],
        ),
      ),
      SettingsBlock(
        title: context.t('set.shortcuts'),
        desc: context.t('set.shortcutsDesc'),
        child: Column(children: [
          _Shortcut(keys: const ['Ctrl', 'K'], label: context.t('set.sc.search')),
          _Shortcut(keys: const ['Ctrl', ','], label: context.t('set.sc.settings')),
          _Shortcut(keys: const ['Esc'], label: context.t('set.sc.close')),
        ]),
      ),
    ]);
  }
}

class _Shortcut extends StatelessWidget {
  const _Shortcut({required this.keys, required this.label});
  final List<String> keys;
  final String label;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(children: [
        Expanded(child: Text(label, style: TextStyle(fontSize: AppTokens.textMd, color: t.text))),
        for (var i = 0; i < keys.length; i++) ...[if (i > 0) Padding(padding: const EdgeInsets.symmetric(horizontal: 3), child: Text('+', style: TextStyle(color: t.muted))), Kbd(keys[i])],
      ]),
    );
  }
}
