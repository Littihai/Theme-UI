import 'package:flutter/material.dart';
import 'package:flutter_web_plugins/url_strategy.dart';

import 'app/app.dart';
import 'app/scope.dart';
import 'theme/fonts.dart';
import 'util/prefs.dart';

/// Reads the per-device settings and re-checks the saved session BEFORE the first frame, so a dark-mode person never
/// sees a white flash and a refresh never bounces to /login (web/index.html keeps its loading screen up meanwhile).
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // a widget that threw while building: the crash card instead of the grey box, with a way out
  ErrorWidget.builder = (details) => CrashCard(details: details);
  usePathUrlStrategy();
  final prefs = await Prefs.load();
  // per-machine values come in as --dart-define (see .env.example); the default is the same origin
  const apiBase = String.fromEnvironment('API_BASE', defaultValue: '/api/v1');
  final stores = AppStores(prefs: prefs, apiBase: apiBase);
  await Future.wait([stores.auth.boot(), ensureFont(stores.appearance.state.font)]);
  runApp(ThemeUiApp(stores: stores));
}
