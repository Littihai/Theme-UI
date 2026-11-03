import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../theme/tokens.dart';
import '../../util/format.dart';

/// Hand-drawn charts on the tokens: a line chart, a donut and a bar list. No chart library underneath: an overview page
/// needs three shapes, and these animate, theme and translate with the rest of the app.

class ChartSeries {
  const ChartSeries(this.label, this.values, {this.color});
  final String label;
  final List<num> values;
  final Color? color;
}

/// Two or three series over the same labels (weeks, months), with a grid and the last point marked.
class LineChart extends StatelessWidget {
  const LineChart({super.key, required this.labels, required this.series, this.height = 220});
  final List<String> labels;
  final List<ChartSeries> series;
  final double height;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ChartLegend(items: [for (var i = 0; i < series.length; i++) (series[i].label, series[i].color ?? t.chartSeries[i % 5])]),
        const SizedBox(height: 8),
        SizedBox(
          height: height,
          child: CustomPaint(
            painter: _LinePainter(
              labels: labels,
              series: series,
              colors: [for (var i = 0; i < series.length; i++) series[i].color ?? t.chartSeries[i % 5]],
              grid: t.n200,
              text: t.muted,
              textStyle: TextStyle(fontSize: AppTokens.textXs, color: t.muted, fontFamily: t.fontFamily, fontFamilyFallback: t.fontFallback),
              textDirection: Directionality.of(context),
            ),
          ),
        ),
      ],
    );
  }
}

class _LinePainter extends CustomPainter {
  _LinePainter({required this.labels, required this.series, required this.colors, required this.grid, required this.text, required this.textStyle, required this.textDirection});
  final List<String> labels;
  final List<ChartSeries> series;
  final List<Color> colors;
  final Color grid;
  final Color text;
  final TextStyle textStyle;
  final TextDirection textDirection;

  @override
  void paint(Canvas canvas, Size size) {
    const padL = 36.0, padB = 22.0, padT = 8.0, padR = 8.0;
    final w = size.width - padL - padR;
    final h = size.height - padT - padB;
    final maxV = series.expand((s) => s.values).fold<num>(0, math.max);
    final top = _niceMax(maxV.toDouble());
    final gridPaint = Paint()
      ..color = grid
      ..strokeWidth = 1;
    // horizontal grid, 4 steps
    for (var i = 0; i <= 4; i++) {
      final y = padT + h - h * i / 4;
      canvas.drawLine(Offset(padL, y), Offset(padL + w, y), gridPaint);
      final tp = TextPainter(text: TextSpan(text: fmtCompact(top * i / 4), style: textStyle), textDirection: textDirection)..layout();
      tp.paint(canvas, Offset(padL - tp.width - 6, y - tp.height / 2));
    }
    final n = labels.length;
    double x(int i) => n <= 1 ? padL + w / 2 : padL + w * i / (n - 1);
    double y(num v) => padT + h - (top == 0 ? 0 : h * v / top);
    for (var i = 0; i < n; i++) {
      final tp = TextPainter(text: TextSpan(text: labels[i], style: textStyle), textDirection: textDirection)..layout();
      tp.paint(canvas, Offset(x(i) - tp.width / 2, padT + h + 6));
    }
    for (var s = 0; s < series.length; s++) {
      final vals = series[s].values;
      final path = Path();
      for (var i = 0; i < vals.length && i < n; i++) {
        final p = Offset(x(i), y(vals[i]));
        i == 0 ? path.moveTo(p.dx, p.dy) : path.lineTo(p.dx, p.dy);
      }
      // the area under the first series, faint
      if (s == 0 && vals.isNotEmpty) {
        final area = Path.from(path)
          ..lineTo(x(math.min(vals.length, n) - 1), padT + h)
          ..lineTo(x(0), padT + h)
          ..close();
        canvas.drawPath(area, Paint()..color = colors[s].withValues(alpha: 0.10));
      }
      canvas.drawPath(path, Paint()
        ..color = colors[s]
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..strokeJoin = StrokeJoin.round
        ..strokeCap = StrokeCap.round);
      if (vals.isNotEmpty) {
        final last = Offset(x(math.min(vals.length, n) - 1), y(vals[math.min(vals.length, n) - 1]));
        canvas.drawCircle(last, 4, Paint()..color = colors[s]);
      }
    }
  }

  static double _niceMax(double v) {
    if (v <= 0) return 10;
    final mag = math.pow(10, (math.log(v) / math.ln10).floor()).toDouble();
    final f = v / mag;
    final nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return nice * mag;
  }

  @override
  bool shouldRepaint(_LinePainter old) => old.series != series || old.labels != labels || old.colors != colors || old.grid != grid;
}

class ChartSlice {
  const ChartSlice(this.label, this.value, {this.color, this.sub});
  final String label;
  final num value;
  final Color? color;
  final String? sub;
}

/// Share of a total, with the total in the middle and a legend beside it.
class DonutChart extends StatelessWidget {
  const DonutChart({super.key, required this.slices, this.size = 160, this.centerLabel, this.centerValue, this.format});
  final List<ChartSlice> slices;
  final double size;
  final String? centerLabel;
  final String? centerValue;
  final String Function(num)? format;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final total = slices.fold<num>(0, (a, s) => a + s.value);
    final colors = [for (var i = 0; i < slices.length; i++) slices[i].color ?? t.chartSeries[i % 5]];
    final fmt = format ?? fmtInt;
    final ring = SizedBox(
      width: size,
      height: size,
      child: Stack(alignment: Alignment.center, children: [
        CustomPaint(size: Size.square(size), painter: _DonutPainter(slices: slices, colors: colors, track: t.n200)),
        Column(mainAxisSize: MainAxisSize.min, children: [
          Text(centerValue ?? fmt(total), style: TextStyle(fontSize: AppTokens.textXl, fontWeight: FontWeight.w700, color: t.text)),
          if (centerLabel != null) Text(centerLabel!, style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
        ]),
      ]),
    );
    final legend = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < slices.length; i++)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 3),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Container(width: 10, height: 10, decoration: BoxDecoration(color: colors[i], borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 8),
              Text(slices[i].label, style: TextStyle(fontSize: AppTokens.textSm, color: t.text)),
              const SizedBox(width: 8),
              Text('${fmt(slices[i].value)}${total == 0 ? '' : ' · ${(slices[i].value / total * 100).round()}%'}', style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
            ]),
          ),
      ],
    );
    return Wrap(spacing: 24, runSpacing: 12, crossAxisAlignment: WrapCrossAlignment.center, children: [ring, legend]);
  }
}

class _DonutPainter extends CustomPainter {
  _DonutPainter({required this.slices, required this.colors, required this.track});
  final List<ChartSlice> slices;
  final List<Color> colors;
  final Color track;

  @override
  void paint(Canvas canvas, Size size) {
    final total = slices.fold<num>(0, (a, s) => a + s.value);
    final stroke = size.width * 0.14;
    final rect = Rect.fromLTWH(stroke / 2, stroke / 2, size.width - stroke, size.height - stroke);
    canvas.drawArc(rect, 0, math.pi * 2, false, Paint()
      ..color = track
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke);
    if (total == 0) return;
    var start = -math.pi / 2;
    for (var i = 0; i < slices.length; i++) {
      final sweep = math.pi * 2 * slices[i].value / total;
      canvas.drawArc(rect, start, sweep - 0.02, false, Paint()
        ..color = colors[i]
        ..style = PaintingStyle.stroke
        ..strokeWidth = stroke);
      start += sweep;
    }
  }

  @override
  bool shouldRepaint(_DonutPainter old) => old.slices != slices || old.colors != colors;
}

class BarItem {
  const BarItem(this.label, this.value, {this.sub, this.onTap});
  final String label;
  final num value;
  final String? sub;
  final VoidCallback? onTap;
}

/// Horizontal bars, largest first: a ranking (top customers, busiest lines).
class BarList extends StatelessWidget {
  const BarList({super.key, required this.items, this.color, this.format});
  final List<BarItem> items;
  final Color? color;
  final String Function(num)? format;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final max = items.fold<num>(0, (a, b) => math.max(a, b.value));
    final fmt = format ?? fmtInt;
    final c = color ?? t.chart1;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final it in items)
          InkWell(
            onTap: it.onTap,
            borderRadius: t.rSm,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 2),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Row(children: [
                  Expanded(child: Text(it.label, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: AppTokens.textSm, color: t.text))),
                  if (it.sub != null) Padding(padding: const EdgeInsets.only(right: 8), child: Text(it.sub!, style: TextStyle(fontSize: AppTokens.textXs, color: t.muted))),
                  Text(fmt(it.value), style: TextStyle(fontSize: AppTokens.textSm, fontWeight: FontWeight.w600, color: t.text, fontFeatures: const [FontFeature.tabularFigures()])),
                ]),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(3),
                  child: LinearProgressIndicator(value: max == 0 ? 0 : it.value / max, minHeight: 6, backgroundColor: t.n100, color: c),
                ),
              ]),
            ),
          ),
      ],
    );
  }
}

class ChartLegend extends StatelessWidget {
  const ChartLegend({super.key, required this.items});
  final List<(String, Color)> items;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Wrap(spacing: 14, children: [
      for (final (label, c) in items)
        Row(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 10, height: 10, decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(2))),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
        ]),
    ]);
  }
}
