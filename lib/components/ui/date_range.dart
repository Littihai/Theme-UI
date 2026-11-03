import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../util/format.dart';
import 'button.dart';

class DateRange {
  const DateRange(this.from, this.to);
  final DateTime from;
  final DateTime to;

  bool contains(DateTime d) => !d.isBefore(from) && d.isBefore(to.add(const Duration(days: 1)));

  static DateRange lastDays(int n, [DateTime? now]) {
    final today = _day(now ?? DateTime.now());
    return DateRange(today.subtract(Duration(days: n - 1)), today);
  }

  static DateRange thisMonth([DateTime? now]) {
    final d = now ?? DateTime.now();
    return DateRange(DateTime(d.year, d.month, 1), DateTime(d.year, d.month + 1, 0));
  }

  static DateRange thisQuarter([DateTime? now]) {
    final d = now ?? DateTime.now();
    final q0 = ((d.month - 1) ~/ 3) * 3 + 1;
    return DateRange(DateTime(d.year, q0, 1), DateTime(d.year, q0 + 3, 0));
  }

  static DateTime _day(DateTime d) => DateTime(d.year, d.month, d.day);
}

/// From / To with the usual presets; the Material range picker for anything else.
class DateRangeField extends StatelessWidget {
  const DateRangeField({super.key, required this.value, required this.onChanged, this.small = true});
  final DateRange? value;
  final ValueChanged<DateRange?> onChanged;
  final bool small;

  Future<void> _pick(BuildContext context) async {
    final now = DateTime.now();
    final r = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 3),
      lastDate: DateTime(now.year + 1, 12, 31),
      initialDateRange: value == null ? null : DateTimeRange(start: value!.from, end: value!.to),
      builder: (ctx, child) => Theme(data: Theme.of(ctx), child: child!),
    );
    if (r != null) onChanged(DateRange(r.start, r.end));
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.i18n.lang;
    final label = value == null ? context.t('filter.date') : '${fmtDate(value!.from, lang)} – ${fmtDate(value!.to, lang)}';
    return PopupMenuButton<String>(
      tooltip: context.t('filter.date'),
      position: PopupMenuPosition.under,
      onSelected: (k) {
        switch (k) {
          case '7d':
            onChanged(DateRange.lastDays(7));
          case 'month':
            onChanged(DateRange.thisMonth());
          case 'quarter':
            onChanged(DateRange.thisQuarter());
          case 'pick':
            _pick(context);
          case 'clear':
            onChanged(null);
        }
      },
      itemBuilder: (ctx) => [
        PopupMenuItem(value: '7d', child: Text(ctx.t('range.7d'))),
        PopupMenuItem(value: 'month', child: Text(ctx.t('range.month'))),
        PopupMenuItem(value: 'quarter', child: Text(ctx.t('range.quarter'))),
        PopupMenuItem(value: 'pick', child: Text('${ctx.t('range.from')} / ${ctx.t('range.to')}…')),
        if (value != null) PopupMenuItem(value: 'clear', child: Text(ctx.t('filter.clearAll'))),
      ],
      child: IgnorePointer(
        child: AppButton(label: label, icon: AppIcon.calendar, size: small ? ButtonSize.sm : ButtonSize.md, trailing: AppIcon.chevronDown, onPressed: () {}),
      ),
    );
  }
}

/// A plain date for a card or a line of a table.
String dateLabel(BuildContext context, DateTime d) => fmtDate(d, context.i18n.lang);

Color dateTone(BuildContext context) => context.tokens.muted;
