import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../i18n/dict.dart';
import '../overlays/toast.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../state/auth_store.dart';
import '../state/notifications_store.dart';
import '../theme/appearance.dart';
import '../theme/theme_store.dart';
import '../theme/tokens.dart';
import '../util/prefs.dart';

/// Every store of the shell, built once in main.dart and handed to the tree through [AppScope]. A page reads them
/// with `context.stores`, `context.i18n`, `context.t(...)`, `context.tokens`.
class AppStores {
  AppStores({required this.prefs, http.Client? httpClient, String apiBase = '/api/v1', AuthService? authService})
      : theme = ThemeStore(prefs),
        fontSize = FontSizeStore(prefs),
        appearance = AppearanceStore(prefs),
        i18n = I18nStore(prefs),
        api = ApiClient(base: apiBase, client: httpClient, prefs: prefs),
        notifications = NotificationStore(),
        toasts = ToastStore() {
    auth = AuthStore(authService ?? AuthService(prefs));
  }

  final Prefs prefs;
  final ThemeStore theme;
  final FontSizeStore fontSize;
  final AppearanceStore appearance;
  final I18nStore i18n;
  final ApiClient api;
  late final AuthStore auth;
  final NotificationStore notifications;
  final ToastStore toasts;

  /// Everything a page may depend on (toasts draw themselves and stay out of this).
  Listenable get listenable => Listenable.merge([theme, fontSize, appearance, i18n, auth, notifications]);

  void dispose() {
    theme.dispose();
    fontSize.dispose();
    appearance.dispose();
    i18n.dispose();
    api.dispose();
    auth.dispose();
    notifications.dispose();
    toasts.dispose();
  }
}

/// Hands the stores down the tree. The root rebuilds it (with a new [generation]) whenever a store changes, so every
/// widget that called [of] rebuilds too: the app is small enough that this plain model beats a selector library.
class AppScope extends InheritedWidget {
  const AppScope({super.key, required this.stores, required this.generation, required super.child});

  final AppStores stores;
  final int generation;

  static AppStores of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    assert(scope != null, 'AppScope is missing above this widget');
    return scope!.stores;
  }

  @override
  bool updateShouldNotify(AppScope oldWidget) => oldWidget.generation != generation;
}

/// The desktop breakpoints the header and the Settings window use, and the phone layout.
abstract final class Breakpoints {
  /// under this width the layout is a phone: drawer menu, cards instead of tables
  static const double mobile = 768;
  static const double tight = 900;
  static const double narrow = 1180;
}

extension AppContext on BuildContext {
  AppStores get stores => AppScope.of(this);
  I18nStore get i18n => stores.i18n;

  /// The word for [key] in the current language.
  String t(String key, [Map<String, Object?>? vars]) => stores.i18n.t(key, vars);

  /// A bilingual value from data in the current language.
  String pick(L l) => stores.i18n.pick(l);

  AppTokens get tokens => Theme.of(this).extension<AppTokens>()!;
  TextTheme get textTheme => Theme.of(this).textTheme;

  double get width => MediaQuery.sizeOf(this).width;
  bool get isMobile => width < Breakpoints.mobile;
  bool get isTight => width < Breakpoints.tight;
  bool get isNarrow => width < Breakpoints.narrow;

  /// True when animation should be skipped: the person chose reduced motion, or asked the OS for it.
  bool get reducedMotion => switch (stores.appearance.state.motion) {
        Motion.reduce => true,
        Motion.full => false,
        Motion.auto => MediaQuery.disableAnimationsOf(this),
      };

  /// The page padding at this width.
  double get pagePad => isMobile ? AppTokens.pagePadPhone : AppTokens.pagePad;
}
