import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';
import '../../util/format.dart';

/// A number that counts up from zero the first time it is shown (skipped with reduced motion).
class CountUp extends StatefulWidget {
  const CountUp(this.value, {super.key, this.style, this.format, this.duration = const Duration(milliseconds: 900)});
  final num value;
  final TextStyle? style;
  final String Function(num)? format;
  final Duration duration;

  @override
  State<CountUp> createState() => _CountUpState();
}

class _CountUpState extends State<CountUp> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: widget.duration);
  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    if (context.reducedMotion) {
      _c.value = 1;
    } else {
      _c.forward();
    }
  }

  @override
  void didUpdateWidget(CountUp old) {
    super.didUpdateWidget(old);
    if (old.value != widget.value) _c.forward(from: 0);
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fmt = widget.format ?? fmtInt;
    return AnimatedBuilder(
      animation: _c,
      builder: (_, _) {
        final v = widget.value * Curves.easeOutCubic.transform(_c.value);
        return Text(fmt(widget.value is int ? v.round() : v), style: widget.style);
      },
    );
  }
}

/// One number with an icon, a tone and a note; clickable with [onTap].
class StatTile extends StatelessWidget {
  const StatTile({super.key, required this.label, required this.value, this.icon, this.tone = StatusTone.accent, this.note, this.onTap, this.format});
  final String label;
  final num value;
  final AppIcon? icon;
  final StatusTone tone;
  final String? note;
  final VoidCallback? onTap;
  final String Function(num)? format;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final c = t.tone(tone);
    final body = Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: t.surface, borderRadius: t.rLg, border: Border.all(color: t.divider), boxShadow: t.shadowSm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (icon != null) ...[
            Container(width: 38, height: 38, decoration: BoxDecoration(color: c.bg, borderRadius: t.rMd), child: Center(child: AppIconW(icon!, size: 20, color: c.fg))),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(color: t.muted, fontSize: AppTokens.textSm, fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                CountUp(value, format: format, style: TextStyle(fontSize: AppTokens.text3xl, fontWeight: FontWeight.w700, height: 1.15, color: t.text)),
                if (note != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(note!, style: TextStyle(color: c.fg, fontSize: AppTokens.textXs, fontWeight: FontWeight.w500))),
              ],
            ),
          ),
          if (onTap != null) AppIconW(AppIcon.chevronRight, size: 16, color: t.n400),
        ],
      ),
    );
    if (onTap == null) return body;
    return Material(color: Colors.transparent, child: InkWell(onTap: onTap, borderRadius: t.rLg, hoverColor: t.hover, child: body));
  }
}

/// A row of tiles: four across on a desktop, two on a tablet, one on a phone.
class TileGrid extends StatelessWidget {
  const TileGrid({super.key, required this.children, this.gap = 16});
  final List<Widget> children;
  final double gap;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, c) {
      final cols = c.maxWidth < 520 ? 1 : c.maxWidth < 1000 ? 2 : (children.length < 4 ? children.length : 4);
      final w = (c.maxWidth - gap * (cols - 1)) / cols;
      return Wrap(spacing: gap, runSpacing: gap, children: [for (final ch in children) SizedBox(width: w, child: ch)]);
    });
  }
}
