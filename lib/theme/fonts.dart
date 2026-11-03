import 'package:flutter/services.dart';

import 'appearance.dart';

/// Inter + Noto Sans Thai are bundled through pubspec.yaml and load with the app. IBM Plex Sans Thai and Sarabun are
/// plain assets, fetched and registered only when a person picks them, so the first load stays small on the web.
final Set<FontFamily> _loaded = {FontFamily.inter, FontFamily.system};

const Map<FontFamily, (String, List<String>)> _lazy = {
  FontFamily.plex: ('IBMPlexSansThai', ['IBMPlexSansThai-Regular', 'IBMPlexSansThai-Medium', 'IBMPlexSansThai-SemiBold', 'IBMPlexSansThai-Bold']),
  FontFamily.sarabun: ('Sarabun', ['Sarabun-Regular', 'Sarabun-Medium', 'Sarabun-SemiBold', 'Sarabun-Bold']),
};

/// Makes sure the typeface is registered before the theme asks for it. Returns at once for the bundled ones.
Future<void> ensureFont(FontFamily f) async {
  if (_loaded.contains(f)) return;
  final entry = _lazy[f];
  if (entry == null) return;
  final loader = FontLoader(entry.$1);
  for (final file in entry.$2) {
    loader.addFont(rootBundle.load('assets/fonts/lazy/$file.ttf'));
  }
  await loader.load();
  _loaded.add(f);
}

bool fontReady(FontFamily f) => _loaded.contains(f);
