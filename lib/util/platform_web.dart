import 'package:web/web.dart' as web;

/// Web: reload the page (the status bar's "Reload").
void reloadPage() => web.window.location.reload();

/// The browser, for Settings > About (so IT support knows what to look at).
String runtimeName() {
  final ua = web.window.navigator.userAgent;
  if (ua.contains('Edg/')) return 'Microsoft Edge';
  if (ua.contains('OPR/')) return 'Opera';
  if (ua.contains('Chrome/')) return 'Chrome';
  if (ua.contains('Firefox/')) return 'Firefox';
  if (ua.contains('Safari/')) return 'Safari';
  return 'Browser';
}
