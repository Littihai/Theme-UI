import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import '../app/scope.dart';
import '../theme/theme_store.dart';

/// The colour-scheme switch, drawn as a circle: the old look is captured as an image, the theme swaps underneath,
/// and a hole grows out of the pressed point until the whole old picture is gone. Registers itself as the ThemeStore's
/// reveal handler while mounted; without it (or with reduced motion) the store swaps the theme plainly.
class ThemeReveal extends StatefulWidget {
  const ThemeReveal({super.key, required this.child});
  final Widget child;

  @override
  State<ThemeReveal> createState() => _ThemeRevealState();
}

class _ThemeRevealState extends State<ThemeReveal> with SingleTickerProviderStateMixin {
  final _boundary = GlobalKey();
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 520));
  ThemeStore? _store;
  ui.Image? _old;
  Offset _origin = Offset.zero;
  Size _size = Size.zero;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final store = context.stores.theme;
    if (store != _store) {
      _store?.reveal = null;
      _store = store..reveal = _handle;
    }
  }

  @override
  void dispose() {
    // the cached store: an inherited lookup is not allowed from dispose
    if (_store?.reveal == _handle) _store?.reveal = null;
    _old?.dispose();
    _c.dispose();
    super.dispose();
  }

  Future<void> _handle(Offset origin, VoidCallback commit) async {
    final ro = _boundary.currentContext?.findRenderObject();
    if (ro is! RenderRepaintBoundary || _old != null) {
      commit();
      return;
    }
    ui.Image img;
    try {
      img = await ro.toImage(pixelRatio: MediaQuery.devicePixelRatioOf(context));
    } catch (_) {
      commit();
      return;
    }
    if (!mounted) {
      img.dispose();
      commit();
      return;
    }
    setState(() {
      _old = img;
      _origin = origin;
      _size = ro.size;
    });
    commit();
    await _c.forward(from: 0);
    if (!mounted) return;
    setState(() {
      _old?.dispose();
      _old = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        RepaintBoundary(key: _boundary, child: widget.child),
        if (_old != null)
          Positioned.fill(
            child: IgnorePointer(
              child: AnimatedBuilder(
                animation: _c,
                builder: (context, _) {
                  final t = Curves.easeInOutCubic.transform(_c.value);
                  final far = [Offset.zero, Offset(_size.width, 0), Offset(0, _size.height), Offset(_size.width, _size.height)]
                      .map((p) => (p - _origin).distance)
                      .fold<double>(0, math.max);
                  return ClipPath(
                    clipper: _HoleClipper(_origin, far * t),
                    child: RawImage(image: _old, fit: BoxFit.fill, width: _size.width, height: _size.height),
                  );
                },
              ),
            ),
          ),
      ],
    );
  }
}

/// Everything except a circle: the old picture stays outside the growing hole.
class _HoleClipper extends CustomClipper<Path> {
  _HoleClipper(this.center, this.radius);
  final Offset center;
  final double radius;

  @override
  Path getClip(Size size) {
    final rect = Path()..addRect(Offset.zero & size);
    if (radius <= 0) return rect;
    final hole = Path()..addOval(Rect.fromCircle(center: center, radius: radius));
    return Path.combine(PathOperation.difference, rect, hole);
  }

  @override
  bool shouldReclip(_HoleClipper old) => old.radius != radius || old.center != center;
}

/// The centre of the pressed widget, in the app's coordinates: the origin the circle grows from.
Offset originOf(BuildContext context) {
  final box = context.findRenderObject();
  if (box is! RenderBox || !box.hasSize) return Offset.zero;
  return box.localToGlobal(box.size.center(Offset.zero));
}
