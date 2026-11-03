import 'package:flutter/material.dart';

import 'appearance.dart';

/// Design-system tokens, as a [ThemeExtension] every widget reads with `context.tokens`. Retune colours, radii and
/// elevation in [AppTokens.build]; a widget never holds a hex value.
///
/// The light palette is the default; `dark` mirrors the ramps rather than recolouring them: `n100` is still "the
/// faintest tint above the surface" and `a700` is still "accent text", so a widget written against the light theme
/// reads correctly in the dark one. Accent, grey base, contrast, corner radius and typeface (the Customize choices)
/// are folded in by [AppTokens.build] exactly as the CSS of the React starter did.
class AppTokens extends ThemeExtension<AppTokens> {
  const AppTokens({
    required this.dark,
    required this.bg,
    required this.surface,
    required this.text,
    required this.accent,
    required this.accent2,
    required this.divider,
    required this.onAccent,
    required this.scrim,
    required this.brandDeep,
    required this.n50,
    required this.n100,
    required this.n200,
    required this.n300,
    required this.n400,
    required this.n500,
    required this.n600,
    required this.n700,
    required this.n800,
    required this.n900,
    required this.a100,
    required this.a200,
    required this.a300,
    required this.a400,
    required this.a500,
    required this.a600,
    required this.a700,
    required this.a800,
    required this.a900,
    required this.warnFg,
    required this.warnBg,
    required this.warnSolid,
    required this.okFg,
    required this.okBg,
    required this.okSolid,
    required this.stopFg,
    required this.stopBg,
    required this.stopSolid,
    required this.danger,
    required this.chart1,
    required this.chart2,
    required this.chart3,
    required this.chart4,
    required this.chart5,
    required this.shadowSm,
    required this.shadowMd,
    required this.shadowLg,
    required this.radiusSm,
    required this.radiusMd,
    required this.radiusLg,
    required this.radiusXl,
    required this.pageMax,
    required this.fontFamily,
    required this.fontFallback,
  });

  final bool dark;

  // base ground
  final Color bg;
  final Color surface;
  final Color text;
  final Color accent;
  final Color accent2;
  final Color divider;

  /// text/icons that sit on an accent fill
  final Color onAccent;

  /// dimmed backdrop behind modals
  final Color scrim;

  /// deep brand panel (sign-in hero, toasts): dark in both themes, white text
  final Color brandDeep;
  Color get onBrandDeep => const Color(0xFFFFFFFF);

  /// text on a solid status fill (red/green/amber): white in both themes
  Color get toneOnSolid => const Color(0xFFFFFFFF);

  // neutral ramp
  final Color n50, n100, n200, n300, n400, n500, n600, n700, n800, n900;
  Color get muted => n600;

  // accent ramp
  final Color a100, a200, a300, a400, a500, a600, a700, a800, a900;

  // status tones
  final Color warnFg, warnBg, warnSolid, okFg, okBg, okSolid, stopFg, stopBg, stopSolid, danger;

  // chart series
  final Color chart1, chart2, chart3, chart4, chart5;
  List<Color> get chartSeries => [chart1, chart2, chart3, chart4, chart5];

  // elevation
  final List<BoxShadow> shadowSm, shadowMd, shadowLg;

  // radius
  final double radiusSm, radiusMd, radiusLg, radiusXl;
  BorderRadius get rSm => BorderRadius.circular(radiusSm);
  BorderRadius get rMd => BorderRadius.circular(radiusMd);
  BorderRadius get rLg => BorderRadius.circular(radiusLg);
  BorderRadius get rXl => BorderRadius.circular(radiusXl);

  /// page frame: the widest the content of a page runs (infinity = fluid)
  final double pageMax;
  static const double pagePad = 24;
  static const double pagePadPhone = 16;

  /// type scale: seven steps, nothing in between (labels 12, body 13/14, titles 16/18/22, big numbers 28)
  static const double textXs = 12, textSm = 13, textMd = 14, textLg = 16, textXl = 18, text2xl = 22, text3xl = 28;

  /// one height for every control on a row (button, field, drop-down): md everywhere, sm in tables and dense toolbars
  static const double controlH = 44, controlHSm = 36, controlHLg = 52;

  /// the typeface (null = the platform's own) and what fills in the Thai glyphs it lacks
  final String? fontFamily;
  final List<String> fontFallback;

  /// The three colours of a status tone (text, soft fill, solid fill).
  ToneColors tone(StatusTone t) => switch (t) {
        StatusTone.warn => ToneColors(warnFg, warnBg, warnSolid),
        StatusTone.ok => ToneColors(okFg, okBg, okSolid),
        StatusTone.stop => ToneColors(stopFg, stopBg, stopSolid),
        StatusTone.accent => ToneColors(a800, a100, accent),
        StatusTone.neutral => ToneColors(n700, n100, n400),
      };

  /// A faint hover tint of the text colour.
  Color get hover => text.withValues(alpha: 0.05);
  Color get pressed => text.withValues(alpha: 0.09);
  Color get focusRing => accent.withValues(alpha: 0.45);

  @override
  AppTokens copyWith() => this;

  @override
  AppTokens lerp(ThemeExtension<AppTokens>? other, double t) => t < 0.5 || other is! AppTokens ? this : other;

  // ───────────────────────────── the palettes ─────────────────────────────

  /// Builds the tokens for one combination of the Customize choices.
  factory AppTokens.build({
    required bool dark,
    Accent accent = Accent.steel,
    GreyBase base = GreyBase.slate,
    Contrast contrast = Contrast.standard,
    CornerRadius radius = CornerRadius.sm,
    FontFamily font = FontFamily.inter,
    PageWidth container = PageWidth.standard,
  }) {
    final g = (dark ? _darkBases : _lightBases)[base]!;
    var n = List<Color>.of(g.neutral);
    var text = g.text;
    var divider = text.withValues(alpha: 0.14);
    if (contrast == Contrast.high) {
      final hc = dark ? _highContrastDark : _highContrastLight;
      text = hc.first;
      divider = text.withValues(alpha: dark ? 0.40 : 0.38);
      n = [n[0], n[1], ...hc.skip(1).toList().reversed];
    }
    final ramp = _accentRamp(accent, dark);
    final tones = dark ? _darkTones : _lightTones;
    final shadowBase = dark ? const Color(0xFF000000) : const Color(0xFF182433);
    final r = _radii[radius]!;
    final f = _fonts[font]!;
    return AppTokens(
      dark: dark,
      bg: g.bg,
      surface: g.surface,
      text: text,
      accent: ramp.accent,
      accent2: ramp.accent2,
      divider: divider,
      onAccent: dark ? const Color(0xFF0F1418) : const Color(0xFFFFFFFF),
      scrim: dark ? const Color(0xFF000000).withValues(alpha: 0.62) : g.text.withValues(alpha: 0.5),
      brandDeep: g.brandDeep,
      n50: n[0], n100: n[1], n200: n[2], n300: n[3], n400: n[4], n500: n[5], n600: n[6], n700: n[7], n800: n[8], n900: n[9],
      a100: ramp.a[0], a200: ramp.a[1], a300: ramp.a[2], a400: ramp.a[3], a500: ramp.a[4], a600: ramp.a[5], a700: ramp.a[6], a800: ramp.a[7], a900: ramp.a[8],
      warnFg: tones[0], warnBg: tones[1], warnSolid: tones[2],
      okFg: tones[3], okBg: tones[4], okSolid: tones[5],
      stopFg: tones[6], stopBg: tones[7], stopSolid: tones[8],
      danger: tones[9],
      chart1: ramp.chart1, chart2: tones[10], chart3: tones[11], chart4: tones[12], chart5: tones[13],
      shadowSm: [BoxShadow(color: shadowBase.withValues(alpha: dark ? 0.45 : 0.08), offset: const Offset(0, 1), blurRadius: 2)],
      shadowMd: [BoxShadow(color: shadowBase.withValues(alpha: dark ? 0.50 : 0.12), offset: const Offset(0, 4), blurRadius: 12)],
      shadowLg: [BoxShadow(color: shadowBase.withValues(alpha: dark ? 0.60 : 0.18), offset: const Offset(0, 12), blurRadius: 32)],
      radiusSm: r[0], radiusMd: r[1], radiusLg: r[2], radiusXl: r[3],
      pageMax: _pageMax[container]!,
      fontFamily: f.family,
      fontFallback: f.fallback,
    );
  }

  static const Map<PageWidth, double> _pageMax = {PageWidth.narrow: 1140, PageWidth.standard: 1320, PageWidth.wide: 1640, PageWidth.fluid: double.infinity};

  static const Map<CornerRadius, List<double>> _radii = {
    CornerRadius.none: [0, 0, 0, 0],
    CornerRadius.sm: [3, 4, 6, 8],
    CornerRadius.md: [4, 6, 10, 14],
    CornerRadius.lg: [6, 9, 14, 20],
    CornerRadius.xl: [8, 12, 18, 26],
  };

  static const Map<FontFamily, ({String? family, List<String> fallback})> _fonts = {
    FontFamily.inter: (family: 'Inter', fallback: ['NotoSansThai']),
    FontFamily.plex: (family: 'IBMPlexSansThai', fallback: ['NotoSansThai']),
    FontFamily.sarabun: (family: 'Sarabun', fallback: ['NotoSansThai']),
    FontFamily.system: (family: null, fallback: ['Segoe UI', 'Leelawadee UI', 'NotoSansThai']),
  };

  // text, then n800 … n200 (n50/n100 keep the base's values)
  static const _highContrastLight = [Color(0xFF000000), Color(0xFF000000), Color(0xFF1A1A1C), Color(0xFF2F2F31), Color(0xFF454547), Color(0xFF58585B), Color(0xFF77777A), Color(0xFF8C8C90), Color(0xFFA9A9AD)];
  static const _highContrastDark = [Color(0xFFFFFFFF), Color(0xFFFFFFFF), Color(0xFFF0F1F2), Color(0xFFDCDEE0), Color(0xFFC6C9CD), Color(0xFFAEB2B7), Color(0xFF8A9096), Color(0xFF6F757C), Color(0xFF565C63)];

  // warn fg/bg/solid, ok fg/bg/solid, stop fg/bg/solid, danger, chart2..5
  static const _lightTones = [
    Color(0xFF9A5B00), Color(0xFFFDF1D6), Color(0xFFF59F00),
    Color(0xFF1F7A32), Color(0xFFE3F5E7), Color(0xFF2FB344),
    Color(0xFFA62828), Color(0xFFFBE4E4), Color(0xFFD63939),
    Color(0xFFD63939),
    Color(0xFFF59F00), Color(0xFF2FB344), Color(0xFFD63939), Color(0xFF4263EB),
  ];
  static const _darkTones = [
    Color(0xFFF5C25A), Color(0xFF3A2C0B), Color(0xFFF59F00),
    Color(0xFF7FD48F), Color(0xFF14301C), Color(0xFF2FB344),
    Color(0xFFF08A8A), Color(0xFF3B1818), Color(0xFFD63939),
    Color(0xFFEF6B6B),
    Color(0xFFF5B73D), Color(0xFF4CCF63), Color(0xFFEF6B6B), Color(0xFF7C8CF5),
  ];

  /// The grey base: the page, the surface, the text, the deep brand panel and the neutral ramp 50…900. Every base keeps
  /// the lightness of every step (so every text/background pair keeps its contrast) and changes only hue and saturation.
  static const Map<GreyBase, _Base> _lightBases = {
    GreyBase.slate: _Base(0xFFF6F8FB, 0xFFFFFFFF, 0xFF182433, 0xFF182433, [0xFFF8FAFC, 0xFFF6F8FB, 0xFFE6E7E9, 0xFFD6DBE1, 0xFFBBC3CD, 0xFF929DAB, 0xFF667382, 0xFF49566C, 0xFF2C3B4E, 0xFF182433]),
    GreyBase.gray: _Base(0xFFF7F8FA, 0xFFFFFFFF, 0xFF1E232D, 0xFF1E232D, [0xFFF9FAFB, 0xFFF7F8FA, 0xFFE7E7E8, 0xFFD8DADF, 0xFFBFC2C9, 0xFF989CA5, 0xFF6C717C, 0xFF515764, 0xFF343A46, 0xFF1E232D]),
    GreyBase.zinc: _Base(0xFFF8F8F9, 0xFFFFFFFF, 0xFF232328, 0xFF232328, [0xFFFAFAFA, 0xFFF8F8F9, 0xFFE7E7E8, 0xFFDBDBDC, 0xFFC3C3C5, 0xFF9C9CA0, 0xFF727276, 0xFF58585D, 0xFF3A3A40, 0xFF232328]),
    GreyBase.neutral: _Base(0xFFF8F8F8, 0xFFFFFFFF, 0xFF262626, 0xFF262626, [0xFFFAFAFA, 0xFFF8F8F8, 0xFFE8E8E8, 0xFFDCDCDC, 0xFFC4C4C4, 0xFF9E9E9E, 0xFF727272, 0xFF5A5A5A, 0xFF3D3D3D, 0xFF262626]),
    GreyBase.stone: _Base(0xFFF9F9F8, 0xFFFFFFFF, 0xFF2B2620, 0xFF2B2620, [0xFFFBFAF9, 0xFFF9F9F8, 0xFFE8E8E7, 0xFFDEDCD9, 0xFFC8C4C0, 0xFFA39F9A, 0xFF78726C, 0xFF625B53, 0xFF443D36, 0xFF2B2620]),
  };
  static const Map<GreyBase, _Base> _darkBases = {
    GreyBase.slate: _Base(0xFF121B27, 0xFF182433, 0xFFE6E9EE, 0xFF0F1722, [0xFF1D2A3B, 0xFF1F2D40, 0xFF263548, 0xFF33465C, 0xFF4D6178, 0xFF7D8DA1, 0xFF9AA8BA, 0xFFB6C1CE, 0xFFD0D8E1, 0xFFE6E9EE]),
    GreyBase.gray: _Base(0xFF171B22, 0xFF1E232D, 0xFFE8E9EC, 0xFF13171E, [0xFF242934, 0xFF262C39, 0xFF2E3440, 0xFF3C4453, 0xFF575F6E, 0xFF858C99, 0xFFA1A7B3, 0xFFBBC0C9, 0xFFD4D7DD, 0xFFE8E9EC]),
    GreyBase.zinc: _Base(0xFF1B1B1E, 0xFF232328, 0xFFE9E9EB, 0xFF17171A, [0xFF2A2A2E, 0xFF2D2D32, 0xFF34343A, 0xFF44444B, 0xFF5F5F66, 0xFF8C8C92, 0xFFA7A7AD, 0xFFC0C0C4, 0xFFD7D7DA, 0xFFE9E9EB]),
    GreyBase.neutral: _Base(0xFF1C1C1C, 0xFF262626, 0xFFEAEAEA, 0xFF181818, [0xFF2C2C2C, 0xFF303030, 0xFF373737, 0xFF484848, 0xFF626262, 0xFF8F8F8F, 0xFFAAAAAA, 0xFFC2C2C2, 0xFFD8D8D8, 0xFFEAEAEA]),
    GreyBase.stone: _Base(0xFF211D18, 0xFF2B2620, 0xFFECEAE8, 0xFF1C1915, [0xFF322C26, 0xFF363029, 0xFF3E3730, 0xFF50483F, 0xFF6B635A, 0xFF968F88, 0xFFB0AAA4, 0xFFC7C2BD, 0xFFDCD9D5, 0xFFECEAE8]),
  };

  /// One base colour per palette for every accent but the default; the ramp is mixed from it, so a new colour is one line.
  static const Map<Accent, (Color, Color)> accentSeeds = {
    Accent.teal: (Color(0xFF2F7F86), Color(0xFF62B5BB)),
    Accent.green: (Color(0xFF3F7F58), Color(0xFF6FBD8F)),
    Accent.violet: (Color(0xFF6B5FB0), Color(0xFFA69CE3)),
    Accent.rose: (Color(0xFFB0566F), Color(0xFFE58EA5)),
    Accent.amber: (Color(0xFFA8612A), Color(0xFFE3A463)),
    Accent.indigo: (Color(0xFF4C58C4), Color(0xFF8D96EE)),
    Accent.azure: (Color(0xFF0B78A8), Color(0xFF5CBDE8)),
    Accent.slate: (Color(0xFF4F6076), Color(0xFF9FB0C4)),
  };

  /// The swatch of an accent on the picker (its light-theme colour).
  static Color swatch(Accent a) => a == Accent.steel ? const Color(0xFF066FD1) : accentSeeds[a]!.$1;

  static _Ramp _accentRamp(Accent accent, bool dark) {
    if (accent == Accent.steel) {
      return dark
          ? const _Ramp(Color(0xFF4299E1), Color(0xFF63B3ED), [Color(0xFF12263D), Color(0xFF163355), Color(0xFF1C4676), Color(0xFF2A64A3), Color(0xFF3B82CC), Color(0xFF4299E1), Color(0xFF6CB2EE), Color(0xFF9CCBF4), Color(0xFFCFE5FA)], Color(0xFF4299E1))
          : const _Ramp(Color(0xFF066FD1), Color(0xFF4299E1), [Color(0xFFE7F1FB), Color(0xFFCFE3F7), Color(0xFF9FC8EF), Color(0xFF6FAEE7), Color(0xFF3F94DE), Color(0xFF066FD1), Color(0xFF0558A6), Color(0xFF04427C), Color(0xFF022C52)], Color(0xFF066FD1));
    }
    final seed = dark ? accentSeeds[accent]!.$2 : accentSeeds[accent]!.$1;
    if (dark) {
      const ink = Color(0xFF1C1F23);
      const white = Color(0xFFFFFFFF);
      return _Ramp(seed, mix(seed, 0.85, ink), [mix(seed, 0.14, ink), mix(seed, 0.22, ink), mix(seed, 0.34, ink), mix(seed, 0.50, ink), mix(seed, 0.72, ink), seed, mix(seed, 0.75, white), mix(seed, 0.50, white), mix(seed, 0.30, white)], seed);
    }
    const white = Color(0xFFFFFFFF);
    const black = Color(0xFF000000);
    return _Ramp(seed, mix(seed, 0.82, white), [mix(seed, 0.10, white), mix(seed, 0.22, white), mix(seed, 0.38, white), mix(seed, 0.60, white), mix(seed, 0.80, white), seed, mix(seed, 0.75, black), mix(seed, 0.50, black), mix(seed, 0.33, black)], seed);
  }

  /// `color-mix(in srgb, c pct, other)`: [pct] of [c] over [other].
  static Color mix(Color c, double pct, Color other) => Color.lerp(other, c, pct)!;
}

enum StatusTone { warn, accent, ok, stop, neutral }

class ToneColors {
  const ToneColors(this.fg, this.bg, this.solid);
  final Color fg;
  final Color bg;
  final Color solid;
}

class _Base {
  const _Base(this.bgV, this.surfaceV, this.textV, this.brandDeepV, this.neutralV);
  final int bgV, surfaceV, textV, brandDeepV;
  final List<int> neutralV;
  Color get bg => Color(bgV);
  Color get surface => Color(surfaceV);
  Color get text => Color(textV);
  Color get brandDeep => Color(brandDeepV);
  List<Color> get neutral => neutralV.map(Color.new).toList();
}

class _Ramp {
  const _Ramp(this.accent, this.accent2, this.a, this.chart1);
  final Color accent;
  final Color accent2;
  final List<Color> a;
  final Color chart1;
}
