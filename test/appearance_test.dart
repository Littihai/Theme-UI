import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:theme_ui/theme/appearance.dart';
import 'package:theme_ui/theme/theme_store.dart';
import 'package:theme_ui/theme/tokens.dart';
import 'package:theme_ui/util/prefs.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('defaults are never written; a choice is written under its own key', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await Prefs.load();
    final store = AppearanceStore(prefs);
    expect(store.state, AppearanceState.defaults);
    await store.update(store.state.copyWith(accent: Accent.teal, nav: NavLayout.rail));
    expect(prefs.get('accent'), 'teal');
    expect(prefs.get('nav'), 'rail');
    expect(prefs.get('font'), isNull);
    await store.reset();
    expect(prefs.get('accent'), isNull);
    expect(store.state.isCustomised, isFalse);
  });

  test('an unknown stored value falls back to the default', () async {
    SharedPreferences.setMockInitialValues({'flutter.app.radius': 'huge', 'flutter.app.base': 'zinc'});
    final s = AppearanceState.read(await Prefs.load());
    expect(s.radius, CornerRadius.sm);
    expect(s.base, GreyBase.zinc);
  });

  test('tokens: the accent ramp follows the accent, the grey base keeps its lightness', () {
    final steel = AppTokens.build(dark: false);
    final teal = AppTokens.build(dark: false, accent: Accent.teal);
    expect(steel.accent, const Color(0xFF066FD1));
    expect(teal.accent, AppTokens.accentSeeds[Accent.teal]!.$1);
    expect(teal.a600, teal.accent);
    expect(teal.a100.computeLuminance(), greaterThan(teal.a900.computeLuminance()));
    final dark = AppTokens.build(dark: true, base: GreyBase.stone);
    expect(dark.bg.computeLuminance(), lessThan(dark.text.computeLuminance()));
    expect(AppTokens.build(dark: false, radius: CornerRadius.none).radiusXl, 0);
    expect(AppTokens.build(dark: false, container: PageWidth.fluid).pageMax, double.infinity);
  });

  test('high contrast keeps the text darkest and the ramp ordered', () {
    final hc = AppTokens.build(dark: false, contrast: Contrast.high);
    expect(hc.text, const Color(0xFF000000));
    expect(hc.n200.computeLuminance(), greaterThan(hc.n800.computeLuminance()));
  });

  test('the colour scheme swaps plainly without a reveal handler', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await Prefs.load();
    final theme = ThemeStore(prefs);
    expect(theme.pref, ThemePref.system);
    await theme.setPref(ThemePref.dark, origin: const Offset(10, 10));
    expect(theme.isDark, isTrue);
    expect(prefs.get('theme'), 'dark');
    await theme.setPref(ThemePref.system);
    expect(prefs.get('theme'), isNull);
    theme.dispose();
  });
}
