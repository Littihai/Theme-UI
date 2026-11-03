import 'package:flutter/foundation.dart';

import '../util/prefs.dart';

/// Everything the person can customise about how the app looks and is laid out, all per device, like the colour
/// scheme and the language. A default is never written to storage, so a cleared storage means exactly the defaults.
/// Colour scheme (light / dark / system) and text size have their own stores; this file is the rest.

enum Accent { steel, teal, green, violet, rose, amber, indigo, azure, slate }

enum Contrast { standard, high }

enum Motion { auto, reduce, full }

/// typeface; every option reads Thai
enum FontFamily { inter, plex, sarabun, system }

/// the grey palette behind every surface
enum GreyBase { slate, gray, zinc, neutral, stone }

enum CornerRadius { none, sm, md, lg, xl }

/// where the main menu lives: a bar under the top bar, a sidebar, or a sidebar of icons only
enum NavLayout { top, side, rail }

enum PageWidth { narrow, standard, wide, fluid }

/// what stays on screen while the page scrolls: the top bar only, the top bar and the menu, nothing
enum Sticky { header, all, none }

/// the bars and side panels: flush with the window edges, or inset and floating on a shadow
enum Edges { attached, floating }

@immutable
class AppearanceState {
  const AppearanceState({
    this.accent = Accent.steel,
    this.contrast = Contrast.standard,
    this.motion = Motion.auto,
    this.font = FontFamily.inter,
    this.base = GreyBase.slate,
    this.radius = CornerRadius.sm,
    this.nav = NavLayout.top,
    this.container = PageWidth.standard,
    this.sticky = Sticky.header,
    this.navStyle = Edges.attached,
    this.panelStyle = Edges.attached,
  });

  static const defaults = AppearanceState();

  final Accent accent;
  final Contrast contrast;
  final Motion motion;
  final FontFamily font;
  final GreyBase base;
  final CornerRadius radius;
  final NavLayout nav;
  final PageWidth container;
  final Sticky sticky;
  final Edges navStyle;
  final Edges panelStyle;

  AppearanceState copyWith({
    Accent? accent,
    Contrast? contrast,
    Motion? motion,
    FontFamily? font,
    GreyBase? base,
    CornerRadius? radius,
    NavLayout? nav,
    PageWidth? container,
    Sticky? sticky,
    Edges? navStyle,
    Edges? panelStyle,
  }) =>
      AppearanceState(
        accent: accent ?? this.accent,
        contrast: contrast ?? this.contrast,
        motion: motion ?? this.motion,
        font: font ?? this.font,
        base: base ?? this.base,
        radius: radius ?? this.radius,
        nav: nav ?? this.nav,
        container: container ?? this.container,
        sticky: sticky ?? this.sticky,
        navStyle: navStyle ?? this.navStyle,
        panelStyle: panelStyle ?? this.panelStyle,
      );

  /// Storage name → value name, in one place so reading and writing cannot disagree.
  Map<String, Enum> get entries => {
        'accent': accent,
        'contrast': contrast,
        'motion': motion,
        'font': font,
        'base': base,
        'radius': radius,
        'nav': nav,
        'container': container,
        'sticky': sticky,
        'navStyle': navStyle,
        'panelStyle': panelStyle,
      };

  /// True while anything differs from the defaults.
  bool get isCustomised => this != defaults;

  @override
  bool operator ==(Object other) => other is AppearanceState && mapEquals(entries, other.entries);

  @override
  int get hashCode => Object.hashAll(entries.values);

  /// The saved state: a stored value that is not one of the allowed names falls back to the default.
  static AppearanceState read(Prefs p) {
    T pick<T extends Enum>(String name, List<T> values, T def) {
      final s = p.get(name);
      return values.cast<T?>().firstWhere((v) => v!.name == s, orElse: () => null) ?? def;
    }

    return AppearanceState(
      accent: pick('accent', Accent.values, Accent.steel),
      contrast: pick('contrast', Contrast.values, Contrast.standard),
      motion: pick('motion', Motion.values, Motion.auto),
      font: pick('font', FontFamily.values, FontFamily.inter),
      base: pick('base', GreyBase.values, GreyBase.slate),
      radius: pick('radius', CornerRadius.values, CornerRadius.sm),
      nav: pick('nav', NavLayout.values, NavLayout.top),
      container: pick('container', PageWidth.values, PageWidth.standard),
      sticky: pick('sticky', Sticky.values, Sticky.header),
      navStyle: pick('navStyle', Edges.values, Edges.attached),
      panelStyle: pick('panelStyle', Edges.values, Edges.attached),
    );
  }
}

/// The Customize choices as a store: read once at start, written per changed key (a default removes the key).
class AppearanceStore extends ChangeNotifier {
  AppearanceStore(this._prefs) : _state = AppearanceState.read(_prefs);

  final Prefs _prefs;
  AppearanceState _state;

  AppearanceState get state => _state;

  Future<void> update(AppearanceState next) async {
    if (next == _state) return;
    final before = _state.entries;
    final after = next.entries;
    final defaults = AppearanceState.defaults.entries;
    _state = next;
    notifyListeners();
    for (final k in after.keys) {
      if (before[k] != after[k]) await _prefs.set(k, after[k] == defaults[k] ? null : after[k]!.name);
    }
  }

  Future<void> reset() => update(AppearanceState.defaults);
}
