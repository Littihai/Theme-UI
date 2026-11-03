import 'package:flutter/foundation.dart';

/// Desktop / mobile: there is no page to reload; the caller re-checks on its own.
void reloadPage() {}

/// What runs the app, for Settings > About.
String runtimeName() => defaultTargetPlatform.name;
