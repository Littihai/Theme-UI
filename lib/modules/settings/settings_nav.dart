import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

import '../../constants/icons.dart';

/// The sections of the Settings window. A module that needs one adds it here, its words in i18n and its widget in
/// settings_modal.dart.
enum SettingsSection {
  general(AppIcon.sliders, 'set.nav.general', 'set.desc.general', 'set.group.personal'),
  account(AppIcon.person, 'set.nav.account', 'set.desc.account', 'set.group.personal'),
  about(AppIcon.info, 'set.nav.about', 'set.desc.about', 'set.group.other');

  const SettingsSection(this.icon, this.labelKey, this.descKey, this.groupKey);
  final AppIcon icon;
  final String labelKey;
  final String descKey;
  final String groupKey;
}

SettingsSection settingsSection(String? name) =>
    SettingsSection.values.cast<SettingsSection?>().firstWhere((s) => s!.name == name, orElse: () => null) ?? SettingsSection.general;

bool isSettingsPath(String path) => path == '/settings' || path.startsWith('/settings/');

/// Opens the window over the current page (its URL changes to /settings/<section>, so a refresh brings it back).
void openSettings(BuildContext context, SettingsSection section) {
  final here = GoRouterState.of(context).uri.path;
  if (isSettingsPath(here)) {
    context.replace('/settings/${section.name}');
  } else {
    context.push('/settings/${section.name}');
  }
}

/// Closes the window: back to the page under it, or Home when it was opened by its URL.
void closeSettings(BuildContext context) {
  if (context.canPop()) {
    context.pop();
  } else {
    context.go('/');
  }
}
