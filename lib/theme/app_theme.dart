import 'package:flutter/material.dart';

import 'tokens.dart';

/// Material's [ThemeData] built from the tokens, so the stock widgets (dialogs, menus, text fields, tooltips) wear the
/// same colours, radii and typeface as the kit. Nothing in the app reads `Theme.of(context).colorScheme` directly;
/// it reads `context.tokens`. This mapping exists for the widgets Flutter draws on its own.
ThemeData buildTheme(AppTokens t) {
  final brightness = t.dark ? Brightness.dark : Brightness.light;
  final scheme = ColorScheme(
    brightness: brightness,
    primary: t.accent,
    onPrimary: t.onAccent,
    primaryContainer: t.a100,
    onPrimaryContainer: t.a800,
    secondary: t.accent2,
    onSecondary: t.onAccent,
    error: t.danger,
    onError: t.toneOnSolid,
    surface: t.surface,
    onSurface: t.text,
    surfaceContainerHighest: t.n100,
    onSurfaceVariant: t.n600,
    outline: t.n300,
    outlineVariant: t.divider,
    shadow: Colors.black,
    scrim: t.scrim,
  );

  TextStyle st(double size, {FontWeight weight = FontWeight.w400, double? height, Color? color}) => TextStyle(
        fontSize: size,
        fontWeight: weight,
        height: height ?? 1.45,
        color: color ?? t.text,
        fontFamily: t.fontFamily,
        fontFamilyFallback: t.fontFallback,
      );

  final textTheme = TextTheme(
    displayLarge: st(44, weight: FontWeight.w700, height: 1.1),
    displayMedium: st(36, weight: FontWeight.w700, height: 1.15),
    displaySmall: st(AppTokens.text3xl, weight: FontWeight.w700, height: 1.2),
    headlineMedium: st(AppTokens.text3xl, weight: FontWeight.w600, height: 1.2),
    headlineSmall: st(AppTokens.text2xl, weight: FontWeight.w600, height: 1.25),
    titleLarge: st(AppTokens.textXl, weight: FontWeight.w600, height: 1.3),
    titleMedium: st(AppTokens.textLg, weight: FontWeight.w600, height: 1.35),
    titleSmall: st(AppTokens.textMd, weight: FontWeight.w600),
    bodyLarge: st(AppTokens.textLg),
    bodyMedium: st(AppTokens.textMd),
    bodySmall: st(AppTokens.textSm, color: t.muted),
    labelLarge: st(AppTokens.textMd, weight: FontWeight.w500),
    labelMedium: st(AppTokens.textSm, weight: FontWeight.w500),
    labelSmall: st(AppTokens.textXs, weight: FontWeight.w500, color: t.muted),
  );

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: scheme,
    scaffoldBackgroundColor: t.bg,
    canvasColor: t.surface,
    cardColor: t.surface,
    dividerColor: t.divider,
    hoverColor: t.hover,
    highlightColor: t.pressed,
    splashColor: t.accent.withValues(alpha: 0.10),
    focusColor: t.focusRing,
    fontFamily: t.fontFamily,
    fontFamilyFallback: t.fontFallback,
    textTheme: textTheme,
    extensions: [t],
    visualDensity: VisualDensity.standard,
    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    splashFactory: InkSparkle.splashFactory,
    pageTransitionsTheme: const PageTransitionsTheme(builders: {
      TargetPlatform.android: FadeForwardsPageTransitionsBuilder(),
      TargetPlatform.iOS: FadeForwardsPageTransitionsBuilder(),
      TargetPlatform.windows: FadeForwardsPageTransitionsBuilder(),
      TargetPlatform.macOS: FadeForwardsPageTransitionsBuilder(),
      TargetPlatform.linux: FadeForwardsPageTransitionsBuilder(),
    }),
    dividerTheme: DividerThemeData(color: t.divider, thickness: 1, space: 1),
    iconTheme: IconThemeData(color: t.n700, size: 18),
    tooltipTheme: TooltipThemeData(
      decoration: BoxDecoration(color: t.n900, borderRadius: t.rMd),
      textStyle: st(AppTokens.textXs, color: t.dark ? t.bg : t.surface),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      waitDuration: const Duration(milliseconds: 400),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: t.surface,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      hintStyle: st(AppTokens.textMd, color: t.n500),
      labelStyle: st(AppTokens.textSm, color: t.n700),
      border: OutlineInputBorder(borderRadius: t.rMd, borderSide: BorderSide(color: t.n300)),
      enabledBorder: OutlineInputBorder(borderRadius: t.rMd, borderSide: BorderSide(color: t.n300)),
      focusedBorder: OutlineInputBorder(borderRadius: t.rMd, borderSide: BorderSide(color: t.accent, width: 1.5)),
      errorBorder: OutlineInputBorder(borderRadius: t.rMd, borderSide: BorderSide(color: t.danger)),
      focusedErrorBorder: OutlineInputBorder(borderRadius: t.rMd, borderSide: BorderSide(color: t.danger, width: 1.5)),
      errorStyle: st(AppTokens.textXs, color: t.stopFg),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: t.surface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: t.rXl),
      titleTextStyle: textTheme.titleLarge,
      contentTextStyle: textTheme.bodyMedium,
    ),
    popupMenuTheme: PopupMenuThemeData(
      color: t.surface,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: t.rLg, side: BorderSide(color: t.divider)),
      textStyle: textTheme.bodyMedium,
    ),
    checkboxTheme: CheckboxThemeData(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(3)),
      side: BorderSide(color: t.n400, width: 1.5),
      fillColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? t.accent : Colors.transparent),
      checkColor: WidgetStatePropertyAll(t.onAccent),
    ),
    scrollbarTheme: ScrollbarThemeData(
      thumbColor: WidgetStatePropertyAll(t.n400.withValues(alpha: 0.7)),
      radius: const Radius.circular(8),
      thickness: const WidgetStatePropertyAll(8),
    ),
    snackBarTheme: SnackBarThemeData(backgroundColor: t.brandDeep, contentTextStyle: st(AppTokens.textMd, color: t.onBrandDeep)),
    textSelectionTheme: TextSelectionThemeData(cursorColor: t.accent, selectionColor: t.a200, selectionHandleColor: t.accent),
  );
}
