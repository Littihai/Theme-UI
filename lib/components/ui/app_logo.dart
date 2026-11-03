import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/brand.dart';

/// The mark: two stacked diamond layers (a stack of screens). Replace [LogoPainter] with your own drawing on a
/// 100×100 canvas and web/favicon.svg repeats it for the browser tab.
class AppLogo extends StatelessWidget {
  const AppLogo({super.key, this.size = 28, this.color, this.tile = false});
  final double size;
  final Color? color;

  /// draws on a rounded accent tile with the mark in the on-accent colour
  final bool tile;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final mark = CustomPaint(size: Size.square(size), painter: LogoPainter(color ?? (tile ? t.onAccent : t.accent)));
    if (!tile) return mark;
    return Container(
      width: size * 1.35,
      height: size * 1.35,
      decoration: BoxDecoration(color: t.accent, borderRadius: BorderRadius.circular(size * 0.3)),
      alignment: Alignment.center,
      child: mark,
    );
  }
}

class LogoPainter extends CustomPainter {
  LogoPainter(this.color);
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 100;
    Path diamond(double cy, double w, double h) => Path()
      ..moveTo(50 * s, (cy - h) * s)
      ..lineTo((50 + w) * s, cy * s)
      ..lineTo(50 * s, (cy + h) * s)
      ..lineTo((50 - w) * s, cy * s)
      ..close();
    // the lower layer: an outline
    canvas.drawPath(diamond(62, 40, 22), Paint()
      ..color = color.withValues(alpha: 0.55)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 7 * s
      ..strokeJoin = StrokeJoin.round);
    // the upper layer: solid
    canvas.drawPath(diamond(40, 40, 22), Paint()..color = color);
  }

  @override
  bool shouldRepaint(LogoPainter old) => old.color != color;
}

/// The mark and the wordmark side by side (header, sidebar, sign-in).
class BrandLockup extends StatelessWidget {
  const BrandLockup({super.key, this.size = 26, this.onTap, this.wordStyle, this.light = false});
  final double size;
  final VoidCallback? onTap;
  final TextStyle? wordStyle;

  /// white wordmark (on the dark brand panel)
  final bool light;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final row = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        AppLogo(size: size, color: light ? t.onBrandDeep : null),
        SizedBox(width: size * 0.35),
        Text(
          Brand.word,
          style: (wordStyle ?? TextStyle(fontSize: size * 0.7, fontWeight: FontWeight.w700, letterSpacing: -0.3)).copyWith(color: light ? t.onBrandDeep : t.text, height: 1),
        ),
      ],
    );
    if (onTap == null) return row;
    return Semantics(
      label: Brand.name,
      button: true,
      child: InkWell(onTap: onTap, borderRadius: t.rMd, child: Padding(padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4), child: row)),
    );
  }
}
