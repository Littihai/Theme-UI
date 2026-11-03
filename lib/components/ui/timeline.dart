import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../theme/tokens.dart';

class TimelineItem {
  const TimelineItem({required this.title, this.sub, this.when, this.tone = StatusTone.accent, this.hollow = false});
  final String title;
  final String? sub;
  final String? when;
  final StatusTone tone;

  /// a step that has not happened yet
  final bool hollow;
}

/// A document's history: when, what, by whom; a hollow dot is a step still to come.
class Timeline extends StatelessWidget {
  const Timeline({super.key, required this.items});
  final List<TimelineItem> items;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (var i = 0; i < items.length; i++)
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(
                  width: 24,
                  child: Column(children: [
                    const SizedBox(height: 4),
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: items[i].hollow ? t.surface : t.tone(items[i].tone).solid,
                        border: Border.all(color: items[i].hollow ? t.n400 : t.tone(items[i].tone).solid, width: 2),
                      ),
                    ),
                    if (i < items.length - 1) Expanded(child: Container(width: 2, color: t.n200)),
                  ]),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: i < items.length - 1 ? 16 : 0),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Expanded(child: Text(items[i].title, style: TextStyle(fontWeight: FontWeight.w600, fontSize: AppTokens.textMd, color: items[i].hollow ? t.muted : t.text))),
                        if (items[i].when != null) Text(items[i].when!, style: TextStyle(color: t.muted, fontSize: AppTokens.textXs)),
                      ]),
                      if (items[i].sub != null) Text(items[i].sub!, style: TextStyle(color: t.muted, fontSize: AppTokens.textSm)),
                    ]),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
