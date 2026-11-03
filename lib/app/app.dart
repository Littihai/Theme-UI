import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';

import '../constants/brand.dart';
import '../i18n/errors.dart';
import '../overlays/theme_reveal.dart';
import '../overlays/toast.dart';
import '../services/api_client.dart';
import '../theme/app_theme.dart';
import '../theme/appearance.dart';
import '../theme/fonts.dart';
import '../theme/tokens.dart';
import '../util/platform.dart';
import 'router.dart';
import 'scope.dart';

/// What a page shows where a widget threw (ErrorWidget.builder): the title, a reload, nothing technical.
class CrashCard extends StatelessWidget {
  const CrashCard({super.key, required this.details});
  final FlutterErrorDetails details;

  @override
  Widget build(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    final i18n = scope?.stores.i18n;
    final t = Theme.of(context).extension<AppTokens>();
    final title = i18n?.t('error.crash.title') ?? 'Something went wrong';
    final desc = i18n?.t('error.crash.desc') ?? 'The page hit an unexpected error.';
    final reload = i18n?.t('error.reload') ?? 'Reload page';
    return Material(
      color: t?.surface ?? const Color(0xFFFFFFFF),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: t?.text)),
            const SizedBox(height: 6),
            Text(desc, textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: t?.muted)),
            const SizedBox(height: 14),
            TextButton(onPressed: reloadPage, child: Text(reload)),
          ]),
        ),
      ),
    );
  }
}

/// The root: the stores above everything, the tokens rebuilt from the colour scheme and the Customize choices, and
/// the router. Toasts and the colour-scheme reveal sit between the app and its pages.
class ThemeUiApp extends StatefulWidget {
  const ThemeUiApp({super.key, required this.stores});
  final AppStores stores;

  @override
  State<ThemeUiApp> createState() => _ThemeUiAppState();
}

class _ThemeUiAppState extends State<ThemeUiApp> {
  late final GoRouter _router = buildRouter(widget.stores);
  StreamSubscription<ApiEvent>? _events;
  int _generation = 0;
  FontFamily? _loadingFont;

  @override
  void initState() {
    super.initState();
    _events = widget.stores.api.events.listen((e) {
      if (e is ModuleDisabled) {
        widget.stores.toasts.warn(widget.stores.i18n.t('module.disabled.title'), text: widget.stores.i18n.t('module.disabled.desc'));
      }
      if (e is SessionExpired) {
        widget.stores.auth.sessionExpired();
        widget.stores.toasts.warn(widget.stores.i18n.t('error.k.signin'), text: statusMessage(401, widget.stores.i18n.lang));
      }
    });
  }

  @override
  void dispose() {
    _events?.cancel();
    _router.dispose();
    super.dispose();
  }

  /// A lazily bundled typeface is registered before the theme asks for it; Inter stays until then.
  FontFamily _font(FontFamily wanted) {
    if (fontReady(wanted)) return wanted;
    if (_loadingFont != wanted) {
      _loadingFont = wanted;
      ensureFont(wanted).then((_) {
        if (mounted) setState(() => _loadingFont = null);
      });
    }
    return FontFamily.inter;
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.stores;
    return ListenableBuilder(
      listenable: s.listenable,
      builder: (context, _) {
        final a = s.appearance.state;
        final tokens = AppTokens.build(
          dark: s.theme.isDark,
          accent: a.accent,
          base: a.base,
          contrast: a.contrast,
          radius: a.radius,
          font: _font(a.font),
          container: a.container,
        );
        return AppScope(
          stores: s,
          generation: ++_generation,
          child: MaterialApp.router(
            title: Brand.name,
            debugShowCheckedModeBanner: false,
            theme: buildTheme(tokens),
            routerConfig: _router,
            locale: Locale(s.i18n.lang.name),
            supportedLocales: const [Locale('en'), Locale('th')],
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            builder: (context, child) => MediaQuery(
              data: MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(s.fontSize.size.scale)),
              child: ThemeReveal(child: ToastHost(child: child ?? const SizedBox.shrink())),
            ),
          ),
        );
      },
    );
  }
}
