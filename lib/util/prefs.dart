import 'package:shared_preferences/shared_preferences.dart';

import '../constants/brand.dart';

/// The per-device settings (theme, language, Customize, the remembered session) behind one small wrapper, so every
/// store writes `app.<name>` and a test can swap the backing store with `SharedPreferences.setMockInitialValues`.
class Prefs {
  Prefs(this._sp);

  final SharedPreferences _sp;

  static Future<Prefs> load() async => Prefs(await SharedPreferences.getInstance());

  String? get(String name) => _sp.getString(storageKey(name));

  /// Stores [value]; null removes the key (a default is never written, so a cleared storage means the defaults).
  Future<void> set(String name, String? value) =>
      value == null ? _sp.remove(storageKey(name)) : _sp.setString(storageKey(name), value);
}
