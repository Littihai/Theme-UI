import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';

/// Which column a list is sorted by: click to sort, again to reverse, once more to clear.
class SortState {
  const SortState({this.key, this.desc = false});
  final String? key;
  final bool desc;

  SortState next(String k) => key != k ? SortState(key: k) : desc ? const SortState() : SortState(key: k, desc: true);

  /// The rows in this order; [pick] gives the sortable value of a row for a key.
  List<T> apply<T>(List<T> rows, Comparable<Object>? Function(T row, String key) pick) {
    final k = key;
    if (k == null) return rows;
    final out = List<T>.of(rows);
    out.sort((a, b) {
      final x = pick(a, k);
      final y = pick(b, k);
      final c = x == null ? (y == null ? 0 : -1) : y == null ? 1 : x.compareTo(y);
      return desc ? -c : c;
    });
    return out;
  }
}

class TableCol {
  const TableCol(this.label, {this.flex = 1, this.width, this.numeric = false, this.sortKey});
  final String label;
  final int flex;
  final double? width;
  final bool numeric;
  final String? sortKey;
}

/// The list page's table: a header row with sortable columns, rows that react to hover and click, a checkbox column
/// when [onSelect] is given. On a phone each row becomes the card [cardBuilder] draws.
class AppTable<T> extends StatelessWidget {
  const AppTable({
    super.key,
    required this.columns,
    required this.rows,
    required this.cells,
    required this.keyOf,
    this.onRowTap,
    this.selected,
    this.onSelect,
    this.onSelectAll,
    this.sort,
    this.onSort,
    this.cardBuilder,
    this.empty,
    this.dense = false,
  });

  final List<TableCol> columns;
  final List<T> rows;
  final List<Widget> Function(T row) cells;
  final Object Function(T row) keyOf;
  final void Function(T row)? onRowTap;
  final Set<Object>? selected;
  final void Function(T row, bool on)? onSelect;
  final void Function(bool on)? onSelectAll;
  final SortState? sort;
  final ValueChanged<SortState>? onSort;
  final Widget Function(T row)? cardBuilder;
  final Widget? empty;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    if (rows.isEmpty && empty != null) return empty!;
    if (context.isMobile && cardBuilder != null) {
      return Column(children: [for (final r in rows) Padding(key: ValueKey(keyOf(r)), padding: const EdgeInsets.only(bottom: 10), child: cardBuilder!(r))]);
    }
    final selectable = onSelect != null;
    final allOn = selectable && rows.isNotEmpty && rows.every((r) => selected!.contains(keyOf(r)));
    final rowH = dense ? 40.0 : 48.0;

    Widget cell(int i, Widget child) {
      final c = columns[i];
      final aligned = Align(alignment: c.numeric ? Alignment.centerRight : Alignment.centerLeft, child: child);
      final padded = Padding(padding: const EdgeInsets.symmetric(horizontal: 10), child: aligned);
      return c.width != null ? SizedBox(width: c.width, child: padded) : Expanded(flex: c.flex, child: padded);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          height: 40,
          decoration: BoxDecoration(color: t.n50, border: Border(bottom: BorderSide(color: t.divider))),
          child: Row(children: [
            if (selectable)
              SizedBox(
                width: 44,
                child: Center(
                  child: Tooltip(
                    message: context.t('demo.tbl.pickPage'),
                    child: SizedBox(width: 20, height: 20, child: Checkbox(value: allOn, onChanged: onSelectAll == null ? null : (v) => onSelectAll!(v ?? false))),
                  ),
                ),
              ),
            for (var i = 0; i < columns.length; i++)
              cell(i, _HeaderCell(col: columns[i], sort: sort, onSort: onSort)),
          ]),
        ),
        for (final r in rows)
          _Row(
            key: ValueKey(keyOf(r)),
            height: rowH,
            selected: selected?.contains(keyOf(r)) ?? false,
            onTap: onRowTap == null ? null : () => onRowTap!(r),
            children: [
              if (selectable)
                SizedBox(
                  width: 44,
                  child: Center(child: SizedBox(width: 20, height: 20, child: Checkbox(value: selected!.contains(keyOf(r)), onChanged: (v) => onSelect!(r, v ?? false)))),
                ),
              ...cells(r).indexed.map((e) => cell(e.$1, DefaultTextStyle.merge(style: TextStyle(fontSize: AppTokens.textSm, color: t.text), overflow: TextOverflow.ellipsis, child: e.$2))),
            ],
          ),
      ],
    );
  }
}

class _HeaderCell extends StatelessWidget {
  const _HeaderCell({required this.col, this.sort, this.onSort});
  final TableCol col;
  final SortState? sort;
  final ValueChanged<SortState>? onSort;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final style = TextStyle(fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, color: t.n700, letterSpacing: 0.2);
    final k = col.sortKey;
    if (k == null || onSort == null) return Text(col.label.toUpperCase(), style: style, overflow: TextOverflow.ellipsis);
    final active = sort?.key == k;
    return Tooltip(
      message: context.t('table.sortHint'),
      child: InkWell(
        onTap: () => onSort!((sort ?? const SortState()).next(k)),
        borderRadius: t.rSm,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Flexible(child: Text(col.label.toUpperCase(), style: style.copyWith(color: active ? t.a800 : null), overflow: TextOverflow.ellipsis)),
            const SizedBox(width: 3),
            AppIconW(active ? (sort!.desc ? AppIcon.chevronDown : AppIcon.chevronUp) : AppIcon.unfold, size: 14, color: active ? t.a800 : t.n400),
          ]),
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({super.key, required this.height, required this.selected, this.onTap, required this.children});
  final double height;
  final bool selected;
  final VoidCallback? onTap;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Material(
      color: selected ? t.a100.withValues(alpha: 0.6) : Colors.transparent,
      child: InkWell(
        onTap: onTap,
        hoverColor: t.hover,
        child: Container(
          height: height,
          decoration: BoxDecoration(border: Border(bottom: BorderSide(color: t.divider))),
          child: Row(children: children),
        ),
      ),
    );
  }
}

/// A row of a list on a phone: a title line, a status and a few labelled values.
class RowCard extends StatelessWidget {
  const RowCard({super.key, required this.title, this.trailing, required this.lines, this.onTap, this.leading});
  final Widget title;
  final Widget? trailing;
  final Widget? leading;
  final List<(String, String)> lines;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Material(
      color: t.surface,
      borderRadius: t.rLg,
      child: InkWell(
        onTap: onTap,
        borderRadius: t.rLg,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(borderRadius: t.rLg, border: Border.all(color: t.divider)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Row(children: [
              if (leading != null) ...[leading!, const SizedBox(width: 10)],
              Expanded(child: DefaultTextStyle.merge(style: TextStyle(fontWeight: FontWeight.w600, fontSize: AppTokens.textMd, color: t.text), child: title)),
              ?trailing,
            ]),
            const SizedBox(height: 6),
            for (final (k, v) in lines)
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Row(children: [
                  SizedBox(width: 90, child: Text(k, style: TextStyle(color: t.muted, fontSize: AppTokens.textXs))),
                  Expanded(child: Text(v, style: TextStyle(fontSize: AppTokens.textSm, color: t.text))),
                ]),
              ),
          ]),
        ),
      ),
    );
  }
}
