import 'package:flutter/material.dart';

import '../util/prefs.dart';

enum ThemePref {
  light,
  dark,
  system;

  static ThemePref? parse(String? s) => values.cast<ThemePref?>().firstWhere((v) => v!.name == s, orElse: () => null);
}

/// How the colour-scheme switch is drawn: given the point the person pressed, paint the new look inside a circle that
/// grows out of it (overlays/theme_reveal.dart registers itself here). [commit] swaps the theme; the handler decides when.
typedef ThemeRevealHandler = Future<void> Function(Offset origin, VoidCallback commit);

/// The colour scheme (light / dark / follow the device), remembered per device. Widgets read [isDark]; the tokens
/// are rebuilt from it in app/app.dart.
class ThemeStore extends ChangeNotifier with WidgetsBindingObserver {
  ThemeStore(this._prefs) : _pref = ThemePref.parse(_prefs.get('theme')) ?? ThemePref.system {
    WidgetsBinding.instance.addObserver(this);
  }

  final Prefs _prefs;
  ThemePref _pref;

  /// Set by the ThemeReveal widget while it is mounted; null means a plain swap.
  ThemeRevealHandler? reveal;

  ThemePref get pref => _pref;

  Brightness get platformBrightness => WidgetsBinding.instance.platformDispatcher.platformBrightness;

  bool get isDark => _pref == ThemePref.dark || (_pref == ThemePref.system && platformBrightness == Brightness.dark);

  @override
  void didChangePlatformBrightness() {
    if (_pref == ThemePref.system) notifyListeners();
  }

  /// Switches the scheme. With an [origin] (the pressed button's centre) and a reveal handler mounted, the change is
  /// painted as a growing circle; [reduced] (the person asked for less motion) or no origin means a plain swap.
  Future<void> setPref(ThemePref pref, {Offset? origin, bool reduced = false}) async {
    if (pref == _pref) return;
    final wasDark = isDark;
    void commit() {
      _pref = pref;
      notifyListeners();
      _prefs.set('theme', pref == ThemePref.system ? null : pref.name);
    }

    final handler = reveal;
    if (origin != null && handler != null && !reduced && wasDark != (pref == ThemePref.dark || (pref == ThemePref.system && platformBrightness == Brightness.dark))) {
      await handler(origin, commit);
    } else {
      commit();
    }
  }

  Future<void> toggle({Offset? origin, bool reduced = false}) =>
      setPref(isDark ? ThemePref.light : ThemePref.dark, origin: origin, reduced: reduced);

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}

/// Text size S / M / L: scales the whole interface, remembered per device.
enum TextSize {
  s(0.92),
  m(1.0),
  l(1.12);

  const TextSize(this.scale);
  final double scale;

  static TextSize? parse(String? s) => values.cast<TextSize?>().firstWhere((v) => v!.name == s, orElse: () => null);
}

class FontSizeStore extends ChangeNotifier {
  FontSizeStore(this._prefs) : _size = TextSize.parse(_prefs.get('fontSize')) ?? TextSize.m;

  final Prefs _prefs;
  TextSize _size;

  TextSize get size => _size;

  Future<void> setSize(TextSize s) async {
    if (s == _size) return;
    _size = s;
    notifyListeners();
    await _prefs.set('fontSize', s == TextSize.m ? null : s.name);
  }
}
