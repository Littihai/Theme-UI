import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../theme/tokens.dart';

/// A block of a settings section: a title, one line of help, the controls.
class SettingsBlock extends StatelessWidget {
  const SettingsBlock({super.key, required this.title, this.desc, this.trailing, required this.child});
  final String title;
  final String? desc;
  final Widget? trailing;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Padding(
      padding: const EdgeInsets.only(bottom: 28),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: context.textTheme.titleMedium),
              if (desc != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(desc!, style: TextStyle(fontSize: AppTokens.textSm, color: t.muted))),
            ]),
          ),
          ?trailing,
        ]),
        const SizedBox(height: 14),
        child,
      ]),
    );
  }
}
