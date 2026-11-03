import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:theme_ui/i18n/dict.dart';
import 'package:theme_ui/i18n/errors.dart';
import 'package:theme_ui/util/prefs.dart';

void main() {
  test('every key has both languages, non-empty', () {
    for (final e in dict.entries) {
      expect(e.value.th.trim(), isNotEmpty, reason: '${e.key} has no Thai');
      expect(e.value.en.trim(), isNotEmpty, reason: '${e.key} has no English');
    }
    expect(dict.length, greaterThan(500));
  });

  test('t() fills placeholders and falls back to the key', () async {
    SharedPreferences.setMockInitialValues({});
    final i18n = I18nStore(await Prefs.load());
    expect(i18n.lang, Lang.en);
    expect(i18n.t('pager.page', {'n': 3}), 'Page 3');
    expect(i18n.t('no.such.key'), 'no.such.key');
    await i18n.setLang(Lang.th);
    expect(i18n.t('common.save'), 'บันทึก');
    expect(tr('common.cancel'), 'ยกเลิก');
  });

  test('language is remembered per device', () async {
    SharedPreferences.setMockInitialValues({'flutter.app.lang': 'th'});
    final i18n = I18nStore(await Prefs.load());
    expect(i18n.lang, Lang.th);
  });

  test('failure messages prefer a precise code, then the server, then the status', () {
    expect(failureMessage(404, 'ENDPOINT_NOT_FOUND', null, null, Lang.en), contains("doesn't have this endpoint"));
    expect(failureMessage(422, 'PRICE_TOO_LOW', 'Price must be above cost', null, Lang.en), 'Price must be above cost');
    expect(failureMessage(422, 'UNPROCESSABLE', 'ไม่ผ่าน', null, Lang.en), statusText[422]!.en);
    expect(failureMessage(503, null, '', 30, Lang.en), endsWith('You can try again in 30 s'));
    expect(failureMessage(599, null, null, null, Lang.th), statusText[500]!.th);
  });
}
