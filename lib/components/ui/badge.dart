import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../theme/tokens.dart';

/// Five tones: accent (information), ok (done), warn (waiting / careful), stop (refused / failed), neutral (draft).
class StatusBadge extends StatelessWidget {
  const StatusBadge(this.label, {super.key, this.tone = StatusTone.neutral, this.dot = false, this.small = false});
  final String label;
  final StatusTone tone;

  /// a coloured dot before the label (a row's status in a dense table)
  final bool dot;
  final bool small;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final c = t.tone(tone);
    return Container(
      padding: EdgeInsets.symmetric(horizontal: small ? 6 : 8, vertical: small ? 1 : 3),
      decoration: BoxDecoration(color: c.bg, borderRadius: t.rSm),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (dot) ...[Container(width: 6, height: 6, decoration: BoxDecoration(color: c.solid, shape: BoxShape.circle)), const SizedBox(width: 6)],
          Flexible(child: Text(label, overflow: TextOverflow.ellipsis, softWrap: false, style: TextStyle(color: c.fg, fontSize: small ? 11 : AppTokens.textXs, fontWeight: FontWeight.w600, height: 1.3))),
        ],
      ),
    );
  }
}

/// A small coloured dot on its own (a live status beside a label).
class ToneDot extends StatelessWidget {
  const ToneDot(this.tone, {super.key, this.size = 8});
  final StatusTone tone;
  final double size;

  @override
  Widget build(BuildContext context) =>
      Container(width: size, height: size, decoration: BoxDecoration(color: context.tokens.tone(tone).solid, shape: BoxShape.circle));
}

/// The person's picture, or their initials until they add one.
class Avatar extends StatelessWidget {
  const Avatar(this.initials, {super.key, this.size = 32, this.tone});
  final String initials;
  final double size;
  final StatusTone? tone;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final c = t.tone(tone ?? StatusTone.accent);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: c.bg, shape: BoxShape.circle, border: Border.all(color: c.solid.withValues(alpha: 0.35))),
      alignment: Alignment.center,
      child: Text(initials, style: TextStyle(color: c.fg, fontSize: size * 0.38, fontWeight: FontWeight.w700, height: 1)),
    );
  }
}
