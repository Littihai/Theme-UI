import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../components/ui/button.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';
import 'about_section.dart';
import 'account_section.dart';
import 'general_section.dart';
import 'settings_nav.dart';

/// The Settings window: sections on the left, the chosen one on the right; on a phone the sections are a row of tabs.
/// It floats over the page (the route is drawn non-opaque on the root navigator) and Esc / the backdrop close it.
class SettingsModal extends StatelessWidget {
  const SettingsModal({super.key, required this.section});
  final SettingsSection section;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final tight = context.isTight;
    final body = switch (section) {
      SettingsSection.general => const GeneralSection(),
      SettingsSection.account => const AccountSection(),
      SettingsSection.about => const AboutSection(),
    };

    final nav = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final group in {for (final s in SettingsSection.values) s.groupKey}) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
            child: Text(context.t(group).toUpperCase(), style: TextStyle(fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, color: t.muted, letterSpacing: 0.5)),
          ),
          for (final s in SettingsSection.values.where((s) => s.groupKey == group))
            Material(
              color: s == section ? t.a100 : Colors.transparent,
              borderRadius: t.rMd,
              child: InkWell(
                onTap: () => openSettings(context, s),
                borderRadius: t.rMd,
                hoverColor: t.hover,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(children: [
                    AppIconW(s.icon, size: 16, color: s == section ? t.a800 : t.n600),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(context.t(s.labelKey), style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w500, color: s == section ? t.a800 : t.text)),
                        Text(context.t(s.descKey), maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
                      ]),
                    ),
                  ]),
                ),
              ),
            ),
        ],
      ],
    );

    final tabs = SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(children: [
        for (final s in SettingsSection.values)
          Padding(
            padding: const EdgeInsets.only(right: 6),
            child: AppButton(label: context.t(s.labelKey), icon: s.icon, size: ButtonSize.sm, variant: s == section ? ButtonVariant.primary : ButtonVariant.ghost, onPressed: () => openSettings(context, s)),
          ),
      ]),
    );

    final window = Material(
      color: t.surface,
      borderRadius: tight ? BorderRadius.zero : t.rXl,
      clipBehavior: Clip.antiAlias,
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Container(
          height: 52,
          padding: const EdgeInsets.fromLTRB(20, 0, 10, 0),
          decoration: BoxDecoration(border: Border(bottom: BorderSide(color: t.divider))),
          child: Row(children: [
            Text(context.t('set.title'), style: context.textTheme.titleMedium),
            const Spacer(),
            IconBtn(icon: AppIcon.x, label: context.t('common.close'), onPressed: () => closeSettings(context)),
          ]),
        ),
        if (tight) Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: tabs),
        Expanded(
          child: tight
              ? SingleChildScrollView(padding: const EdgeInsets.all(20), child: body)
              : Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                  Container(width: 250, padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: t.n50, border: Border(right: BorderSide(color: t.divider))), child: nav),
                  Expanded(child: SingleChildScrollView(padding: const EdgeInsets.all(24), child: body)),
                ]),
        ),
      ]),
    );

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => closeSettings(context),
        child: Center(
          child: GestureDetector(
            onTap: () {},
            child: tight
                ? SizedBox.expand(child: window)
                : ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 960, maxHeight: 660),
                    child: Padding(padding: const EdgeInsets.all(24), child: DecoratedBox(decoration: BoxDecoration(borderRadius: t.rXl, boxShadow: t.shadowLg), child: window)),
                  ),
          ),
        ),
      ),
    );
  }
}
