import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';
import 'button.dart';

/// Appears while rows are ticked: how many, and what can be done to them at once.
class BulkBar extends StatelessWidget {
  const BulkBar({super.key, required this.count, required this.onClear, required this.actions});
  final int count;
  final VoidCallback onClear;
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    if (count == 0) return const SizedBox.shrink();
    return Semantics(
      label: context.t('bulk.label'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(color: t.a100, borderRadius: t.rMd, border: Border.all(color: t.a300)),
        child: Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 8,
          runSpacing: 8,
          children: [
            Text(context.t('bulk.selected', {'n': count}), style: TextStyle(color: t.a800, fontWeight: FontWeight.w600, fontSize: AppTokens.textSm)),
            AppButton(label: context.t('bulk.clear'), variant: ButtonVariant.tertiary, size: ButtonSize.sm, icon: AppIcon.x, onPressed: onClear),
            ...actions,
          ],
        ),
      ),
    );
  }
}

class ActiveFilter {
  const ActiveFilter(this.name, this.label, this.onRemove);
  final String name;
  final String label;
  final VoidCallback onRemove;
}

/// Says what is filtering the list and how many rows are left; each chip removes its filter.
class ActiveFilters extends StatelessWidget {
  const ActiveFilters({super.key, required this.filters, required this.found, this.onClearAll});
  final List<ActiveFilter> filters;
  final int found;
  final VoidCallback? onClearAll;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    if (filters.isEmpty) return const SizedBox.shrink();
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 6,
      runSpacing: 6,
      children: [
        for (final f in filters)
          Tooltip(
            message: context.t('filter.remove', {'name': f.name}),
            child: Material(
              color: t.n100,
              borderRadius: BorderRadius.circular(999),
              child: InkWell(
                onTap: f.onRemove,
                borderRadius: BorderRadius.circular(999),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(10, 4, 6, 4),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Text('${f.name}: ', style: TextStyle(color: t.muted, fontSize: AppTokens.textXs)),
                    Text(f.label, style: TextStyle(color: t.text, fontSize: AppTokens.textXs, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 4),
                    AppIconW(AppIcon.x, size: 12, color: t.n500),
                  ]),
                ),
              ),
            ),
          ),
        Text(context.t('filter.found', {'n': found}), style: TextStyle(color: t.muted, fontSize: AppTokens.textXs)),
        if (onClearAll != null) AppButton(label: context.t('filter.clearAll'), variant: ButtonVariant.tertiary, size: ButtonSize.sm, onPressed: onClearAll),
      ],
    );
  }
}
