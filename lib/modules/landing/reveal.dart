import 'package:flutter/material.dart';

import '../../app/scope.dart';

/// Fades and rises into place the first time it scrolls into view (a plain child with reduced motion).
class Reveal extends StatefulWidget {
  const Reveal({super.key, required this.child, this.delay = 0});
  final Widget child;
  final int delay;

  @override
  State<Reveal> createState() => _RevealState();
}

class _RevealState extends State<Reveal> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 650));
  ScrollPosition? _pos;
  bool _shown = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (context.reducedMotion) {
      _c.value = 1;
      _shown = true;
      return;
    }
    final pos = Scrollable.maybeOf(context)?.position;
    if (pos != _pos) {
      _pos?.removeListener(_check);
      _pos = pos;
      _pos?.addListener(_check);
    }
    WidgetsBinding.instance.addPostFrameCallback((_) => _check());
  }

  void _check() {
    if (_shown || !mounted) return;
    final box = context.findRenderObject();
    if (box is! RenderBox || !box.hasSize) return;
    final top = box.localToGlobal(Offset.zero).dy;
    final h = MediaQuery.sizeOf(context).height;
    if (top < h * 0.92) {
      _shown = true;
      _pos?.removeListener(_check);
      Future<void>.delayed(Duration(milliseconds: widget.delay), () {
        if (mounted) _c.forward();
      });
    }
  }

  @override
  void dispose() {
    _pos?.removeListener(_check);
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final curve = CurvedAnimation(parent: _c, curve: Curves.easeOutCubic);
    return FadeTransition(
      opacity: curve,
      child: SlideTransition(position: Tween(begin: const Offset(0, 0.08), end: Offset.zero).animate(curve), child: widget.child),
    );
  }
}

/// Tilts toward the pointer while hovered (a card that feels lifted); still with reduced motion or on touch.
class Tilt extends StatefulWidget {
  const Tilt({super.key, required this.child, this.max = 6});
  final Widget child;
  final double max;

  @override
  State<Tilt> createState() => _TiltState();
}

class _TiltState extends State<Tilt> {
  Offset _rel = Offset.zero;
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    if (context.reducedMotion) return widget.child;
    final rad = widget.max * 3.14159 / 180;
    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit: (_) => setState(() {
        _hover = false;
        _rel = Offset.zero;
      }),
      onHover: (e) {
        final box = context.findRenderObject();
        if (box is! RenderBox) return;
        final p = box.globalToLocal(e.position);
        setState(() => _rel = Offset(p.dx / box.size.width - 0.5, p.dy / box.size.height - 0.5));
      },
      child: AnimatedContainer(
        duration: Duration(milliseconds: _hover ? 80 : 300),
        transformAlignment: Alignment.center,
        transform: Matrix4.identity()
          ..setEntry(3, 2, 0.0015)
          ..rotateX(-_rel.dy * rad)
          ..rotateY(_rel.dx * rad)
          ..scaleByDouble(_hover ? 1.015 : 1.0, _hover ? 1.015 : 1.0, 1.0, 1.0),
        child: widget.child,
      ),
    );
  }
}
