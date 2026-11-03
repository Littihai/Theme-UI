import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/scope.dart';
import '../../components/charts/charts.dart';
import '../../components/ui/empty_state.dart';
import '../../components/ui/page_header.dart';
import '../../components/ui/panel.dart';
import '../../components/ui/stat_tile.dart';
import '../../constants/icons.dart';
import '../../layouts/app_shell.dart';
import '../../theme/tokens.dart';
import '../../util/format.dart';
import 'sample_data.dart';

/// The overview pattern: stat tiles, then chart cards that reflow by width.
class ChartsPage extends StatelessWidget {
  const ChartsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final total = orders.fold<int>(0, (a, o) => a + o.amount);
    final late = orders.where((o) => o.status == OrderStatus.pending && DateTime.now().difference(o.createdAt).inDays > 14).length;
    final backlog = orders.where((o) => o.status == OrderStatus.approved).length;
    final byStatus = amountByStatus(orders);
    final byCustomer = amountByCustomer(orders);
    return ShellPage(
      child: PageBody(children: [
        PageHeader(pre: context.t('navgroup.kit'), title: context.t('nav.charts'), subtitle: context.t('demo.charts.sub')),
        TileGrid(children: [
          StatTile(label: context.t('demo.charts.total'), value: total, icon: AppIcon.meter, format: fmtMoney),
          StatTile(label: context.t('demo.t.late'), value: late, icon: AppIcon.alert, tone: late > 0 ? StatusTone.stop : StatusTone.ok, note: context.t('demo.charts.lateSub')),
          StatTile(label: context.t('demo.charts.customers'), value: customers.length, icon: AppIcon.organization, tone: StatusTone.neutral),
          StatTile(label: context.t('demo.status.approved'), value: backlog, icon: AppIcon.package, tone: StatusTone.warn, note: context.t('demo.charts.backlog')),
        ]),
        Cols(flex: const [3, 2], children: [
          Panel(
            title: context.t('home.c.trend'),
            subtitle: context.t('home.c.trendSub'),
            child: LineChart(labels: weekLabels, series: [ChartSeries(context.t('home.c.orders'), weeklyOrders), ChartSeries(context.t('home.c.shipped'), weeklyShipped)]),
          ),
          Panel(
            title: context.t('home.c.byStatus'),
            subtitle: context.t('home.c.byStatusSub'),
            child: DonutChart(
              slices: [for (final s in byStatus) ChartSlice(context.t('demo.status.${s.status.name}'), s.value / 1000, color: t.tone(statusTone[s.status]!).solid)],
              centerLabel: context.t('home.c.thousand'),
              format: (n) => fmtInt(n.round()),
            ),
          ),
        ]),
        Cols(children: [
          Panel(
            title: context.t('demo.charts.byCustomer'),
            subtitle: context.t('demo.charts.byCustomerSub'),
            child: BarList(items: [for (final c in byCustomer) BarItem(c.label, c.value, sub: '${c.n}', onTap: () => context.go('/tables'))], format: fmtMoney),
          ),
          Panel(
            title: context.t('demo.charts.emptyTitle'),
            subtitle: context.t('demo.charts.emptySub'),
            child: EmptyState(icon: AppIcon.graph, title: context.t('home.c.empty'), hint: context.t('demo.state.emptyHint'), compact: true),
          ),
        ]),
      ]),
    );
  }
}
