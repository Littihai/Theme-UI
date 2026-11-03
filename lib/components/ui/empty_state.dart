import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';
import 'badge.dart';

/// Says what to do next, not just "no data".
class EmptyState extends StatelessWidget {
  const EmptyState({super.key, this.icon = AppIcon.inbox, required this.title, this.hint, this.action, this.compact = false});
  final AppIcon icon;
  final String title;
  final String? hint;
  final Widget? action;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Padding(
      padding: EdgeInsets.symmetric(vertical: compact ? 20 : 40, horizontal: 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 48, height: 48, decoration: BoxDecoration(color: t.n100, borderRadius: t.rLg), child: Center(child: AppIconW(icon, size: 24, color: t.n500))),
          const SizedBox(height: 12),
          Text(title, textAlign: TextAlign.center, style: TextStyle(fontSize: AppTokens.textLg, fontWeight: FontWeight.w600, color: t.text)),
          if (hint != null) Padding(padding: const EdgeInsets.only(top: 4), child: Text(hint!, textAlign: TextAlign.center, style: TextStyle(color: t.muted, fontSize: AppTokens.textMd))),
          if (action != null) Padding(padding: const EdgeInsets.only(top: 14), child: action!),
        ],
      ),
    );
  }
}

/// A stand-in for a module with no data yet; keeps the look instead of a blank page.
class ComingSoon extends StatelessWidget {
  const ComingSoon({super.key, required this.name, this.icon = AppIcon.tools});
  final String name;
  final AppIcon icon;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: t.surface, borderRadius: t.rLg, border: Border.all(color: t.divider)),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          StatusBadge(context.t('soon.badge'), tone: StatusTone.warn),
          const SizedBox(height: 10),
          Row(children: [
            AppIconW(icon, size: 22, color: t.n500),
            const SizedBox(width: 10),
            Expanded(child: Text(context.t('soon.title', {'name': name}), style: context.textTheme.titleMedium)),
          ]),
          const SizedBox(height: 6),
          Text(context.t('soon.body'), style: TextStyle(color: t.muted, fontSize: AppTokens.textMd)),
        ],
      ),
    );
  }
}
