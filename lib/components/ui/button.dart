import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';

/// One primary per page · secondary the usual action · tertiary a quiet link-like action · danger only for what cannot
/// be undone · ghost for toolbars.
enum ButtonVariant { primary, secondary, tertiary, danger, ghost }

/// sm for tables and dense toolbars · md everywhere · lg for a page's one big call to action.
enum ButtonSize { sm, md, lg }

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = ButtonVariant.secondary,
    this.size = ButtonSize.md,
    this.icon,
    this.trailing,
    this.busy = false,
    this.count,
    this.expand = false,
    this.autofocus = false,
    this.tooltip,
  });

  final String label;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final AppIcon? icon;
  final AppIcon? trailing;

  /// shows a spinner and blocks a second press
  final bool busy;

  /// a small number after the label (what is waiting)
  final int? count;
  final bool expand;
  final bool autofocus;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final enabled = onPressed != null && !busy;
    final (bg, fg, border) = switch (variant) {
      ButtonVariant.primary => (t.accent, t.onAccent, null),
      ButtonVariant.secondary => (t.surface, t.text, t.n300),
      ButtonVariant.tertiary => (Colors.transparent, t.a800, null),
      ButtonVariant.danger => (t.stopSolid, t.toneOnSolid, null),
      ButtonVariant.ghost => (Colors.transparent, t.n700, null),
    };
    final (h, padX, fs, ic) = switch (size) {
      ButtonSize.sm => (AppTokens.controlHSm, 12.0, AppTokens.textSm, 16.0),
      ButtonSize.md => (AppTokens.controlH, 16.0, AppTokens.textMd, 18.0),
      ButtonSize.lg => (AppTokens.controlHLg, 22.0, AppTokens.textLg, 20.0),
    };
    final hoverTint = variant == ButtonVariant.primary || variant == ButtonVariant.danger
        ? Colors.black.withValues(alpha: 0.10)
        : variant == ButtonVariant.tertiary
            ? t.a100
            : t.hover;

    Widget child = Row(
      mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (busy)
          SizedBox(width: ic, height: ic, child: CircularProgressIndicator(strokeWidth: 2, color: fg))
        else if (icon != null)
          AppIconW(icon!, size: ic, color: fg),
        if (busy || icon != null) const SizedBox(width: 8),
        Flexible(child: Text(label, overflow: TextOverflow.ellipsis, style: TextStyle(color: fg, fontSize: fs, fontWeight: FontWeight.w500, height: 1.2))),
        if (count != null) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
            decoration: BoxDecoration(color: fg.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(10)),
            child: Text('$count', style: TextStyle(color: fg, fontSize: AppTokens.textXs, fontWeight: FontWeight.w600)),
          ),
        ],
        if (trailing != null) ...[const SizedBox(width: 6), AppIconW(trailing!, size: ic, color: fg)],
      ],
    );

    child = Opacity(
      opacity: enabled ? 1 : 0.55,
      child: Material(
        color: bg,
        borderRadius: t.rMd,
        child: InkWell(
          onTap: enabled ? onPressed : null,
          autofocus: autofocus,
          borderRadius: t.rMd,
          hoverColor: hoverTint,
          focusColor: t.focusRing.withValues(alpha: 0.25),
          child: Container(
            height: h,
            padding: EdgeInsets.symmetric(horizontal: padX),
            decoration: BoxDecoration(borderRadius: t.rMd, border: border == null ? null : Border.all(color: border)),
            child: child,
          ),
        ),
      ),
    );
    if (tooltip != null) child = Tooltip(message: tooltip!, child: child);
    return expand ? SizedBox(width: double.infinity, child: child) : child;
  }
}

/// An icon-only button: [label] is its tooltip and what a screen reader says.
class IconBtn extends StatelessWidget {
  const IconBtn({
    super.key,
    required this.icon,
    required this.label,
    this.onPressed,
    this.size = 36,
    this.iconSize = 18,
    this.active = false,
    this.badge,
    this.color,
    this.bordered = false,
  });

  final AppIcon icon;
  final String label;
  final VoidCallback? onPressed;
  final double size;
  final double iconSize;
  final bool active;

  /// a count on the corner (the bell's unread); 0 or null hides it
  final int? badge;
  final Color? color;
  final bool bordered;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final fg = color ?? (active ? t.a800 : t.n700);
    return Tooltip(
      message: label,
      child: Semantics(
        button: true,
        label: label,
        child: Material(
          color: active ? t.a100 : Colors.transparent,
          borderRadius: t.rMd,
          child: InkWell(
            onTap: onPressed,
            borderRadius: t.rMd,
            hoverColor: t.hover,
            focusColor: t.focusRing.withValues(alpha: 0.25),
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(borderRadius: t.rMd, border: bordered ? Border.all(color: t.n300) : null),
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Center(child: AppIconW(icon, size: iconSize, color: fg)),
                  if ((badge ?? 0) > 0)
                    Positioned(
                      top: 4,
                      right: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                        decoration: BoxDecoration(color: t.stopSolid, borderRadius: BorderRadius.circular(8), border: Border.all(color: t.surface, width: 1.5)),
                        child: Center(child: Text(badge! > 99 ? '99+' : '$badge', style: TextStyle(color: t.toneOnSolid, fontSize: 10, fontWeight: FontWeight.w700, height: 1))),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
