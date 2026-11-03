import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/scope.dart';
import '../../components/ui/badge.dart';
import '../../components/ui/bulk_bar.dart';
import '../../components/ui/button.dart';
import '../../components/ui/data_table.dart';
import '../../components/ui/date_range.dart';
import '../../components/ui/empty_state.dart';
import '../../components/ui/field.dart';
import '../../components/ui/page_header.dart';
import '../../components/ui/pager.dart';
import '../../components/ui/panel.dart';
import '../../components/ui/select.dart';
import '../../constants/icons.dart';
import '../../layouts/app_shell.dart';
import '../../overlays/confirm_dialog.dart';
import '../../theme/tokens.dart';
import '../../util/csv.dart';
import '../../util/format.dart';
import 'sample_data.dart';

/// The complete list page: search, filter, sort, page, CSV export, bulk actions, and cards on a phone.
class TablesPage extends StatefulWidget {
  const TablesPage({super.key});

  @override
  State<TablesPage> createState() => _TablesPageState();
}

class _TablesPageState extends State<TablesPage> {
  late List<Order> _rows = List.of(orders);
  final _search = TextEditingController();
  String _q = '';
  OrderStatus? _status;
  String? _owner;
  DateRange? _range;
  SortState _sort = const SortState();
  final _paged = Paged();
  final Set<Object> _selected = {};

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<Order> get _filtered {
    final q = _q.toLowerCase();
    var rows = _rows.where((o) {
      if (q.isNotEmpty && !(o.id.toLowerCase().contains(q) || o.customer.toLowerCase().contains(q) || o.item.toLowerCase().contains(q))) return false;
      if (_status != null && o.status != _status) return false;
      if (_owner != null && o.owner != _owner) return false;
      if (_range != null && !_range!.contains(o.createdAt)) return false;
      return true;
    }).toList();
    rows = _sort.apply(rows, (o, k) => switch (k) {
          'id' => o.id,
          'customer' => o.customer,
          'qty' => o.qty,
          'amount' => o.amount,
          'status' => o.status.index,
          'when' => o.createdAt,
          'owner' => o.owner,
          _ => null,
        });
    return rows;
  }

  void _clearFilters() => setState(() {
        _q = '';
        _search.clear();
        _status = null;
        _owner = null;
        _range = null;
        _paged.page = 1;
      });

  Future<void> _approveSelected() async {
    final n = _selected.length;
    final ok = await confirm(context, title: context.t('demo.tbl.approveQ', {'n': n}), text: context.t('demo.tbl.approveText'), okLabel: context.t('demo.tbl.approve'));
    if (!ok || !mounted) return;
    var changed = 0;
    setState(() {
      _rows = [
        for (final o in _rows)
          if (_selected.contains(o.id) && o.status == OrderStatus.pending) (() {
            changed++;
            return o.copyWith(status: OrderStatus.approved);
          })()
          else
            o,
      ];
      _selected.clear();
    });
    context.stores.toasts.success(context.t('demo.tbl.approved', {'n': changed}));
  }

  Future<void> _deleteSelected() async {
    final n = _selected.length;
    final ok = await confirm(context, title: context.t('demo.tbl.deleteQ', {'n': n}), text: context.t('demo.tbl.deleteText'), okLabel: context.t('demo.nav.delete'), danger: true);
    if (!ok || !mounted) return;
    setState(() {
      _rows.removeWhere((o) => _selected.contains(o.id));
      _selected.clear();
    });
    context.stores.toasts.warn(context.t('demo.tbl.deleted', {'n': n}));
  }

  Future<void> _export(List<Order> rows) async {
    final csv = toCsv([
      ['id', 'customer', 'item', 'qty', 'amount', 'status', 'created', 'owner'],
      for (final o in rows) [o.id, o.customer, o.item, o.qty, o.amount, o.status.name, isoDate(o.createdAt), o.owner],
    ]);
    final copied = await saveText('orders.csv', csv);
    if (!mounted) return;
    context.stores.toasts.success(copied ? context.t('error.copied') : context.t('table.export'), text: context.t('table.exportHint', {'n': rows.length}));
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final lang = context.i18n.lang;
    final filtered = _filtered;
    final page = _paged.slice(filtered);
    final filters = <ActiveFilter>[
      if (_q.isNotEmpty) ActiveFilter(context.t('filter.search'), _q, () => setState(() {
            _q = '';
            _search.clear();
          })),
      if (_status != null) ActiveFilter(context.t('demo.col.status'), context.t('demo.status.${_status!.name}'), () => setState(() => _status = null)),
      if (_owner != null) ActiveFilter(context.t('demo.col.owner'), _owner!, () => setState(() => _owner = null)),
      if (_range != null) ActiveFilter(context.t('filter.date'), '${fmtDate(_range!.from, lang)} – ${fmtDate(_range!.to, lang)}', () => setState(() => _range = null)),
    ];
    StatusBadge badge(Order o) => StatusBadge(context.t('demo.status.${o.status.name}'), tone: statusTone[o.status]!, small: true);

    return ShellPage(
      child: PageBody(children: [
        PageHeader(
          pre: context.t('navgroup.kit'),
          title: context.t('nav.tables'),
          subtitle: context.t('demo.tbl.sub'),
          actions: [
            AppButton(label: context.t('table.export'), icon: AppIcon.download, tooltip: context.t('table.exportHint', {'n': filtered.length}), onPressed: () => _export(filtered)),
            AppButton(label: context.t('demo.nav.new'), variant: ButtonVariant.primary, icon: AppIcon.plus, onPressed: () => context.stores.toasts.info(context.t('demo.nav.new'), text: context.t('demo.tbl.newHint'))),
          ],
        ),
        Panel(
          padding: EdgeInsets.zero,
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Padding(
              padding: const EdgeInsets.all(12),
              child: Wrap(spacing: 8, runSpacing: 8, crossAxisAlignment: WrapCrossAlignment.center, children: [
                SizedBox(
                  width: context.isMobile ? double.infinity : 280,
                  child: AppTextField(
                    controller: _search,
                    placeholder: context.t('demo.tbl.searchPh'),
                    prefixIcon: AppIcon.search,
                    small: true,
                    onChanged: (v) => setState(() {
                      _q = v.trim();
                      _paged.page = 1;
                    }),
                  ),
                ),
                AppSelect<OrderStatus>(
                  value: _status,
                  width: 170,
                  small: true,
                  clearable: true,
                  placeholder: context.t('demo.col.status'),
                  options: [for (final s in OrderStatus.values) SelectOption(s, context.t('demo.status.${s.name}'), tone: statusTone[s])],
                  onChanged: (v) => setState(() {
                    _status = v;
                    _paged.page = 1;
                  }),
                ),
                AppSelect<String>(
                  value: _owner,
                  width: 160,
                  small: true,
                  clearable: true,
                  searchable: true,
                  placeholder: context.t('demo.col.owner'),
                  options: [for (final o in owners) SelectOption(o, o)],
                  onChanged: (v) => setState(() {
                    _owner = v;
                    _paged.page = 1;
                  }),
                ),
                DateRangeField(value: _range, onChanged: (r) => setState(() {
                      _range = r;
                      _paged.page = 1;
                    })),
              ]),
            ),
            if (filters.isNotEmpty) Padding(padding: const EdgeInsets.fromLTRB(12, 0, 12, 10), child: ActiveFilters(filters: filters, found: filtered.length, onClearAll: _clearFilters)),
            if (_selected.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
                child: BulkBar(count: _selected.length, onClear: () => setState(_selected.clear), actions: [
                  AppButton(label: context.t('demo.tbl.approve'), size: ButtonSize.sm, icon: AppIcon.check, onPressed: _approveSelected),
                  AppButton(label: context.t('demo.nav.delete'), size: ButtonSize.sm, variant: ButtonVariant.danger, icon: AppIcon.trash, onPressed: _deleteSelected),
                ]),
              ),
            AppTable<Order>(
              columns: [
                TableCol(context.t('demo.col.id'), width: 130, sortKey: 'id'),
                TableCol(context.t('demo.col.customer'), flex: 2, sortKey: 'customer'),
                TableCol(context.t('demo.col.item'), flex: 2),
                TableCol(context.t('demo.col.qty'), numeric: true, sortKey: 'qty'),
                TableCol(context.t('demo.col.amount'), numeric: true, sortKey: 'amount'),
                TableCol(context.t('demo.col.status'), width: 120, sortKey: 'status'),
                TableCol(context.t('demo.col.when'), width: 120, sortKey: 'when'),
                TableCol(context.t('demo.col.owner'), sortKey: 'owner'),
              ],
              rows: page,
              keyOf: (o) => o.id,
              sort: _sort,
              onSort: (s) => setState(() => _sort = s),
              selected: _selected,
              onSelect: (o, on) => setState(() => on ? _selected.add(o.id) : _selected.remove(o.id)),
              onSelectAll: (on) => setState(() => on ? _selected.addAll(page.map((o) => o.id)) : _selected.removeAll(page.map((o) => o.id))),
              onRowTap: (_) => context.go('/document'),
              cells: (o) => [Text(o.id), Text(o.customer), Text(o.item), Text(fmtInt(o.qty)), Text(fmtMoney(o.amount)), badge(o), Text(fmtDate(o.createdAt, lang)), Text(o.owner)],
              cardBuilder: (o) => RowCard(
                leading: SizedBox(width: 20, height: 20, child: Checkbox(value: _selected.contains(o.id), onChanged: (v) => setState(() => (v ?? false) ? _selected.add(o.id) : _selected.remove(o.id)))),
                title: Text(o.id),
                trailing: badge(o),
                lines: [(context.t('demo.col.customer'), o.customer), (context.t('demo.col.item'), o.item), (context.t('demo.col.amount'), fmtMoney(o.amount)), (context.t('demo.col.when'), fmtDate(o.createdAt, lang))],
                onTap: () => context.go('/document'),
              ),
              empty: EmptyState(icon: AppIcon.search, title: context.t('demo.tbl.empty'), hint: context.t('demo.tbl.emptyHint'), action: AppButton(label: context.t('filter.clearAll'), onPressed: _clearFilters)),
            ),
            if (filtered.isNotEmpty)
              Padding(
                padding: const EdgeInsets.all(12),
                child: Pager(paged: _paged, total: filtered.length, onChanged: () => setState(() {})),
              ),
          ]),
        ),
        Text(context.t('demo.nav.mobileNote'), style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
      ]),
    );
  }
}
