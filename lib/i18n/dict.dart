import 'package:flutter/foundation.dart';

import '../constants/brand.dart';
import '../util/prefs.dart';
import 'dict_appearance.dart';
import 'dict_core.dart';
import 'dict_demo.dart';
import 'dict_landing.dart';
import 'l.dart';

export 'l.dart';

/// The platform's bilingual dictionary (Thai / English). Keys are dotted namespaces. Add both languages for every
/// string; a missing key falls back to the key itself (visible in dev). A module keeps its own words in
/// `dict_<module>.dart` and spreads them in here, like the demo's.
final Map<String, L> dict = {...coreDict, ...appearanceDict, ...demoDict, ...landingDict};

/// The language choice, remembered per device, and the `t()` every widget reads words through.
class I18nStore extends ChangeNotifier {
  I18nStore(this._prefs) : _lang = Lang.parse(_prefs.get('lang')) ?? defaultLang {
    current = this;
  }

  /// The store for code outside the widget tree (the API client's failure messages). Set by the constructor.
  static I18nStore? current;

  final Prefs _prefs;
  Lang _lang;

  Lang get lang => _lang;
  bool get th => _lang == Lang.th;

  Future<void> setLang(Lang lang) async {
    if (lang == _lang) return;
    _lang = lang;
    notifyListeners();
    await _prefs.set('lang', lang.name);
  }

  Future<void> toggle() => setLang(_lang == Lang.th ? Lang.en : Lang.th);

  /// The word for [key] in the current language, with `{name}` placeholders filled from [vars].
  String t(String key, [Map<String, Object?>? vars]) {
    final entry = dict[key];
    var s = entry == null ? key : entry.of(_lang);
    if (vars != null) vars.forEach((k, v) => s = s.replaceAll('{$k}', '$v'));
    return s;
  }

  /// A bilingual value from data (not the dictionary) in the current language.
  String pick(L l) => l.of(_lang);
}

/// Translate outside the widget tree (falls back to English when no store exists yet, e.g. in a unit test).
String tr(String key, [Map<String, Object?>? vars]) {
  final store = I18nStore.current;
  if (store != null) return store.t(key, vars);
  var s = dict[key]?.en ?? key;
  if (vars != null) vars.forEach((k, v) => s = s.replaceAll('{$k}', '$v'));
  return s;
}
