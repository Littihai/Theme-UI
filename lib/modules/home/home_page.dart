import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/scope.dart';
import '../../components/charts/charts.dart';
import '../../components/ui/badge.dart';
import '../../components/ui/button.dart';
import '../../components/ui/data_table.dart';
import '../../components/ui/page_header.dart';
import '../../components/ui/panel.dart';
import '../../components/ui/stat_tile.dart';
import '../../components/ui/timeline.dart';
import '../../constants/icons.dart';
import '../../constants/nav.dart';
import '../../layouts/app_shell.dart';
import '../../theme/tokens.dart';
import '../../util/format.dart';
import '../showcase/sample_data.dart';

/// "My overview": what is waiting on the person and how the week is going, on the sample data.
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final user = context.stores.auth.user!;
    final lang = context.i18n.lang;
    final pending = orders.where((o) => o.status == OrderStatus.pending).length;
    final shipped = orders.where((o) => o.status == OrderStatus.shipped).length;
    final total = orders.fold<int>(0, (a, o) => a + o.amount);
    final latest = orders.take(5).toList();
    final byStatus = amountByStatus(orders);
    final delta = weeklyOrders.last - weeklyOrders[weeklyOrders.length - 2];

    return ShellPage(
      child: PageBody(children: [
        PageHeader(
          title: context.t('home.title'),
          subtitle: context.t('home.sub'),
          actions: [AppButton(label: context.t('home.openKit'), variant: ButtonVariant.primary, icon: AppIcon.beaker, onPressed: () => context.go('/components'))],
        ),
        Panel(
          tone: StatusTone.accent,
          child: Row(children: [
            Avatar(user.initials, size: 44),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(context.t('home.welcome', {'name': user.first}), style: context.textTheme.titleMedium),
                const SizedBox(height: 2),
                Text(context.t('home.welcomeBody', {'n': pending}), style: TextStyle(color: t.muted, fontSize: AppTokens.textSm)),
              ]),
            ),
            if (!context.isMobile) AppButton(label: context.t('home.readManual'), icon: AppIcon.note, onPressed: () => context.go('/manual')),
          ]),
        ),
        TileGrid(children: [
          StatTile(label: context.t('home.t.pending'), value: pending, icon: AppIcon.hourglass, tone: StatusTone.warn, onTap: () => context.go('/tables')),
          StatTile(label: context.t('home.t.shipped'), value: shipped, icon: AppIcon.paperAirplane, tone: StatusTone.ok, onTap: () => context.go('/tables')),
          StatTile(label: context.t('demo.t.total'), value: total, icon: AppIcon.meter, tone: StatusTone.accent, format: fmtMoney),
          StatTile(label: context.t('demo.charts.customers'), value: customers.length, icon: AppIcon.organization, tone: StatusTone.neutral),
        ]),
        Cols(flex: const [3, 2], children: [
          Panel(
            title: context.t('home.c.trend'),
            subtitle: context.t('home.c.trendSub'),
            actions: [StatusBadge('${delta >= 0 ? '+' : ''}$delta ${context.t('home.c.vsLastWeek')}', tone: delta >= 0 ? StatusTone.ok : StatusTone.stop)],
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
        Cols(flex: const [3, 2], children: [
          Panel(
            title: context.t('home.latest'),
            subtitle: context.t('home.latestSub'),
            actions: [AppButton(label: context.t('home.openAll'), variant: ButtonVariant.tertiary, size: ButtonSize.sm, trailing: AppIcon.arrowRight, onPressed: () => context.go('/tables'))],
            padding: EdgeInsets.zero,
            child: AppTable<Order>(
              columns: [TableCol(context.t('demo.col.id'), width: 130), TableCol(context.t('demo.col.customer'), flex: 2), TableCol(context.t('demo.col.amount'), numeric: true), TableCol(context.t('demo.col.status'), width: 120)],
              rows: latest,
              keyOf: (o) => o.id,
              onRowTap: (_) => context.go('/document'),
              cells: (o) => [Text(o.id), Text(o.customer), Text(fmtMoney(o.amount)), StatusBadge(context.t('demo.status.${o.status.name}'), tone: statusTone[o.status]!, small: true)],
              cardBuilder: (o) => RowCard(title: Text(o.id), trailing: StatusBadge(context.t('demo.status.${o.status.name}'), tone: statusTone[o.status]!, small: true), lines: [(context.t('demo.col.customer'), o.customer), (context.t('demo.col.amount'), fmtMoney(o.amount))], onTap: () => context.go('/document')),
            ),
          ),
          Panel(
            title: context.t('home.c.activity'),
            subtitle: context.t('home.c.activitySub'),
            child: Timeline(items: [
              TimelineItem(title: context.t('home.act.shipped', {'id': orders[0].id}), sub: orders[0].customer, when: fmtDate(orders[0].createdAt, lang), tone: StatusTone.accent),
              TimelineItem(title: context.t('home.act.approved', {'id': orders[1].id}), sub: orders[1].customer, when: fmtDate(orders[1].createdAt, lang), tone: StatusTone.ok),
              TimelineItem(title: context.t('home.act.created', {'id': orders[2].id}), sub: orders[2].customer, when: fmtDate(orders[2].createdAt, lang), tone: StatusTone.neutral),
              TimelineItem(title: context.t('home.act.next'), hollow: true),
            ]),
          ),
        ]),
        Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          SectionHeading(context.t('home.explore'), desc: context.t('home.exploreSub')),
          TileGrid(children: [
            for (final e in navGroups.expand((g) => g.entries))
              if (e.permission == null || context.stores.auth.can(e.permission!))
                Panel(
                  onTap: () => context.go(e.path),
                  child: Row(children: [
                    Container(width: 36, height: 36, decoration: BoxDecoration(color: t.a100, borderRadius: t.rMd), child: Center(child: AppIconW(e.icon, size: 18, color: t.a800))),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(context.t(e.labelKey), style: TextStyle(fontWeight: FontWeight.w600, fontSize: AppTokens.textMd, color: t.text)),
                        Text(context.t(e.descKey), maxLines: 2, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
                      ]),
                    ),
                  ]),
                ),
          ]),
        ]),
      ]),
    );
  }
}
