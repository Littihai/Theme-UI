import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../theme/tokens.dart';

/// On/off for a settings row. The real control is a toggle: Space flips it, a screen reader reads its state.
class AppSwitch extends StatelessWidget {
  const AppSwitch({super.key, required this.value, required this.onChanged, this.label, this.enabled = true});
  final bool value;
  final ValueChanged<bool> onChanged;
  final String? label;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final reduced = context.reducedMotion;
    final track = AnimatedContainer(
      duration: Duration(milliseconds: reduced ? 0 : 160),
      width: 40,
      height: 22,
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(color: value ? t.accent : t.n400, borderRadius: BorderRadius.circular(11)),
      child: AnimatedAlign(
        duration: Duration(milliseconds: reduced ? 0 : 160),
        alignment: value ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(width: 18, height: 18, decoration: BoxDecoration(color: t.surface, shape: BoxShape.circle, boxShadow: t.shadowSm)),
      ),
    );
    return Semantics(
      toggled: value,
      label: label,
      child: Opacity(
        opacity: enabled ? 1 : 0.5,
        child: InkWell(
          onTap: enabled ? () => onChanged(!value) : null,
          borderRadius: BorderRadius.circular(14),
          focusColor: t.focusRing.withValues(alpha: 0.25),
          child: Padding(
            padding: const EdgeInsets.all(3),
            child: label == null
                ? track
                : Row(mainAxisSize: MainAxisSize.min, children: [track, const SizedBox(width: 10), Text(label!, style: const TextStyle(fontSize: AppTokens.textMd))]),
          ),
        ),
      ),
    );
  }
}
