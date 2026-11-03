import 'package:flutter/material.dart';

import '../app/scope.dart';
import '../components/ui/button.dart';
import '../constants/icons.dart';
import '../modules/settings/appearance_controls.dart';
import '../modules/settings/settings_nav.dart';
import '../theme/appearance.dart';
import '../theme/theme_store.dart';
import '../theme/tokens.dart';

/// The Customize panel (the brush in the header): the end drawer of the shell with every look and layout choice.
class CustomizeDrawer extends StatelessWidget {
  const CustomizeDrawer({super.key, required this.floating});
  final bool floating;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final s = context.stores;
    final customised = s.appearance.state.isCustomised || s.theme.pref != ThemePref.system || s.fontSize.size != TextSize.m;
    return Drawer(
      backgroundColor: t.surface,
      width: (context.width - 24).clamp(280, 400).toDouble(),
      shape: floating ? RoundedRectangleBorder(borderRadius: t.rXl) : const RoundedRectangleBorder(),
      child: SafeArea(
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 10, 8),
            child: Row(children: [
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(context.t('cz.title'), style: context.textTheme.titleMedium),
                  Text(context.t('cz.subtitle'), style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
                ]),
              ),
              IconBtn(icon: AppIcon.x, label: context.t('common.close'), onPressed: () => Navigator.of(context).pop()),
            ]),
          ),
          Divider(color: t.divider),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(context.t('cz.group.appearance').toUpperCase(), style: TextStyle(fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, color: t.muted, letterSpacing: 0.5))),
                const AppearanceControls(layout: true, compact: true),
              ]),
            ),
          ),
          Divider(color: t.divider),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(children: [
              Expanded(
                child: Tooltip(
                  message: context.t('cz.resetHint'),
                  child: AppButton(
                    label: context.t('cz.reset'),
                    size: ButtonSize.sm,
                    icon: AppIcon.history,
                    expand: true,
                    onPressed: customised
                        ? () {
                            s.appearance.reset();
                            s.theme.setPref(ThemePref.system);
                            s.fontSize.setSize(TextSize.m);
                          }
                        : null,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              AppButton(label: context.t('cz.openSettings'), size: ButtonSize.sm, variant: ButtonVariant.tertiary, trailing: AppIcon.arrowRight, onPressed: () {
                Navigator.of(context).pop();
                openSettings(context, SettingsSection.general);
              }),
            ]),
          ),
        ]),
      ),
    );
  }
}

/// True while any Customize choice differs from the defaults (the panel's reset button).
bool appearanceCustomised(AppearanceState a) => a.isCustomised;
