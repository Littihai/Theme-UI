import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../components/ui/badge.dart';
import '../../constants/icons.dart';
import '../../theme/appearance.dart';
import '../../theme/tokens.dart';

/// The small illustrations of the landing page, drawn with widgets on the tokens (no images to re-colour).

/// A miniature of the app: the top bar, a sidebar, tiles and a chart.
class HeroMock extends StatelessWidget {
  const HeroMock({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    Widget bar(double w, {Color? c, double h = 6}) => Container(width: w, height: h, decoration: BoxDecoration(color: c ?? t.n200, borderRadius: BorderRadius.circular(3)));
    Widget tile(Color c) => Expanded(
          child: Container(
            height: 54,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: t.surface, borderRadius: t.rMd, border: Border.all(color: t.divider)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [bar(30), const SizedBox(height: 8), bar(42, c: c, h: 10)]),
          ),
        );
    return Container(
      decoration: BoxDecoration(color: t.bg, borderRadius: t.rXl, border: Border.all(color: t.divider), boxShadow: t.shadowLg),
      clipBehavior: Clip.antiAlias,
      child: Column(children: [
        Container(
          height: 36,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(color: t.surface, border: Border(bottom: BorderSide(color: t.divider))),
          child: Row(children: [
            Container(width: 14, height: 14, decoration: BoxDecoration(color: t.accent, borderRadius: BorderRadius.circular(4))),
            const SizedBox(width: 8),
            bar(46, c: t.n300),
            const Spacer(),
            bar(70, c: t.n100, h: 16),
            const SizedBox(width: 8),
            Container(width: 16, height: 16, decoration: BoxDecoration(color: t.a200, shape: BoxShape.circle)),
          ]),
        ),
        SizedBox(
          height: 190,
          child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Container(
              width: 64,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: t.surface, border: Border(right: BorderSide(color: t.divider))),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                for (var i = 0; i < 5; i++) Padding(padding: const EdgeInsets.only(bottom: 10), child: bar(i == 1 ? 44 : 32, c: i == 1 ? t.a300 : null)),
              ]),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                  Row(children: [tile(t.chart1), const SizedBox(width: 8), tile(t.chart3), const SizedBox(width: 8), tile(t.chart2)]),
                  const SizedBox(height: 8),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: t.surface, borderRadius: t.rMd, border: Border.all(color: t.divider)),
                      child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
                        for (final h in [0.4, 0.55, 0.45, 0.7, 0.6, 0.85, 0.75, 1.0])
                          Expanded(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 3), child: FractionallySizedBox(heightFactor: h, child: Container(decoration: BoxDecoration(color: t.a300, borderRadius: BorderRadius.circular(3)))))),
                      ]),
                    ),
                  ),
                ]),
              ),
            ),
          ]),
        ),
      ]),
    );
  }
}

class MiniTheme extends StatelessWidget {
  const MiniTheme({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Row(children: [
        for (final a in Accent.values.take(6)) Padding(padding: const EdgeInsets.only(right: 6), child: Container(width: 16, height: 16, decoration: BoxDecoration(color: AppTokens.swatch(a), shape: BoxShape.circle))),
      ]),
      const SizedBox(height: 10),
      Row(children: [
        Container(width: 54, height: 30, decoration: BoxDecoration(color: const Color(0xFFF6F8FB), borderRadius: t.rMd, border: Border.all(color: t.n300)), child: const Center(child: AppIconW(AppIcon.sun, size: 14, color: Color(0xFF49566C)))),
        const SizedBox(width: 6),
        Container(width: 54, height: 30, decoration: BoxDecoration(color: const Color(0xFF182433), borderRadius: t.rMd), child: const Center(child: AppIconW(AppIcon.moon, size: 14, color: Color(0xFFE6E9EE)))),
      ]),
    ]);
  }
}

class MiniLang extends StatelessWidget {
  const MiniLang({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    Widget pill(String s, bool on) => Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(color: on ? t.accent : t.n100, borderRadius: BorderRadius.circular(999)),
          child: Text(s, style: TextStyle(color: on ? t.onAccent : t.n700, fontSize: 12, fontWeight: FontWeight.w700)),
        );
    return Row(mainAxisSize: MainAxisSize.min, children: [pill('TH', context.i18n.th), const SizedBox(width: 6), pill('EN', !context.i18n.th)]);
  }
}

class MiniRoles extends StatelessWidget {
  const MiniRoles({super.key});

  @override
  Widget build(BuildContext context) => const Wrap(spacing: 6, runSpacing: 6, children: [
        StatusBadge('ADMIN.PANEL.VIEW', tone: StatusTone.ok),
        StatusBadge('DEMO.VIEW', tone: StatusTone.accent),
        StatusBadge('ORDERS.APPROVE', tone: StatusTone.warn),
      ]);
}

class MiniKit extends StatelessWidget {
  const MiniKit({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    Widget btn(Color bg, Color fg, {Color? border}) => Container(width: 52, height: 22, decoration: BoxDecoration(color: bg, borderRadius: t.rSm, border: border == null ? null : Border.all(color: border)), child: Center(child: Container(width: 24, height: 5, decoration: BoxDecoration(color: fg, borderRadius: BorderRadius.circular(3)))));
    return Wrap(spacing: 6, runSpacing: 6, crossAxisAlignment: WrapCrossAlignment.center, children: [
      btn(t.accent, t.onAccent),
      btn(t.surface, t.n500, border: t.n300),
      btn(t.stopSolid, t.toneOnSolid),
      Container(width: 36, height: 18, padding: const EdgeInsets.all(2), decoration: BoxDecoration(color: t.accent, borderRadius: BorderRadius.circular(9)), child: Align(alignment: Alignment.centerRight, child: Container(width: 14, height: 14, decoration: BoxDecoration(color: t.surface, shape: BoxShape.circle)))),
    ]);
  }
}

class MiniTable extends StatelessWidget {
  const MiniTable({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
      for (var i = 0; i < 3; i++)
        Container(
          padding: const EdgeInsets.symmetric(vertical: 5),
          decoration: BoxDecoration(border: Border(bottom: BorderSide(color: t.divider))),
          child: Row(children: [
            Container(width: 40, height: 5, decoration: BoxDecoration(color: t.n300, borderRadius: BorderRadius.circular(3))),
            const SizedBox(width: 10),
            Expanded(child: Container(height: 5, decoration: BoxDecoration(color: t.n200, borderRadius: BorderRadius.circular(3)))),
            const SizedBox(width: 10),
            ToneDot([StatusTone.ok, StatusTone.warn, StatusTone.accent][i]),
          ]),
        ),
    ]);
  }
}

class MiniApi extends StatelessWidget {
  const MiniApi({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: t.n100, borderRadius: t.rMd),
      child: Text('{ success, message,\n  data, errors }', style: TextStyle(fontFamily: 'monospace', fontFamilyFallback: const ['Consolas', 'monospace'], fontSize: 11, color: t.a800, height: 1.4)),
    );
  }
}
