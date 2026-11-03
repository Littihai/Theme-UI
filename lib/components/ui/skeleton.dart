import 'package:flutter/material.dart';

import '../../app/scope.dart';

/// Grey shapes where the content will be, instead of a line of "Loading…".
class Skeleton extends StatefulWidget {
  const Skeleton({super.key, this.width = double.infinity, this.height = 14, this.radius, this.circle = false});
  final double width;
  final double height;
  final double? radius;
  final bool circle;

  @override
  State<Skeleton> createState() => _SkeletonState();
}

class _SkeletonState extends State<Skeleton> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (context.reducedMotion) {
      _c.stop();
    } else if (!_c.isAnimating) {
      _c.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return FadeTransition(
      opacity: Tween(begin: 0.55, end: 1.0).animate(_c),
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: t.n200,
          shape: widget.circle ? BoxShape.circle : BoxShape.rectangle,
          borderRadius: widget.circle ? null : BorderRadius.circular(widget.radius ?? t.radiusSm),
        ),
      ),
    );
  }
}

/// A paragraph of lines, the last one shorter.
class SkeletonLines extends StatelessWidget {
  const SkeletonLines({super.key, this.lines = 3});
  final int lines;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (var i = 0; i < lines; i++)
            Padding(
              padding: EdgeInsets.only(bottom: i == lines - 1 ? 0 : 8),
              child: FractionallySizedBox(alignment: Alignment.centerLeft, widthFactor: i == lines - 1 ? 0.6 : 1, child: const Skeleton()),
            ),
        ],
      );
}

/// Rows of a table while it loads.
class SkeletonTable extends StatelessWidget {
  const SkeletonTable({super.key, this.rows = 5, this.cols = 4});
  final int rows;
  final int cols;

  @override
  Widget build(BuildContext context) => Column(
        children: [
          for (var r = 0; r < rows; r++)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(children: [
                for (var c = 0; c < cols; c++) Expanded(flex: c == 0 ? 2 : 1, child: const Padding(padding: EdgeInsets.only(right: 16), child: Skeleton(height: 12, width: double.infinity))),
              ]),
            ),
        ],
      );
}
