import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../app/scope.dart';

/// A panel hung under a trigger (the bell, the account chip, the Apps button): opens on the trigger, closes on a tap
/// outside, on Esc, or when the panel asks. The panel never runs off the right edge of the window.
class AnchoredPanel extends StatefulWidget {
  const AnchoredPanel({super.key, required this.trigger, required this.panel, this.width = 320, this.alignRight = true, this.gap = 6});

  final Widget Function(BuildContext context, VoidCallback toggle, bool open) trigger;
  final Widget Function(BuildContext context, VoidCallback close) panel;
  final double width;
  final bool alignRight;
  final double gap;

  @override
  State<AnchoredPanel> createState() => AnchoredPanelState();
}

class AnchoredPanelState extends State<AnchoredPanel> {
  final _link = LayerLink();
  final _controller = OverlayPortalController();

  bool get isOpen => _controller.isShowing;

  void open() {
    if (!_controller.isShowing) setState(_controller.show);
  }

  void close() {
    if (_controller.isShowing) setState(_controller.hide);
  }

  void toggle() => _controller.isShowing ? close() : open();

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _link,
      child: OverlayPortal(
        controller: _controller,
        overlayChildBuilder: (context) {
          final t = context.tokens;
          final w = widget.width.clamp(0, context.width - 16).toDouble();
          return Stack(children: [
            Positioned.fill(child: GestureDetector(behavior: HitTestBehavior.opaque, onTap: close)),
            CompositedTransformFollower(
              link: _link,
              targetAnchor: widget.alignRight ? Alignment.bottomRight : Alignment.bottomLeft,
              followerAnchor: widget.alignRight ? Alignment.topRight : Alignment.topLeft,
              offset: Offset(0, widget.gap),
              showWhenUnlinked: false,
              child: Align(
                alignment: widget.alignRight ? Alignment.topRight : Alignment.topLeft,
                child: Focus(
                  autofocus: true,
                  onKeyEvent: (n, e) {
                    if (e is KeyDownEvent && e.logicalKey == LogicalKeyboardKey.escape) {
                      close();
                      return KeyEventResult.handled;
                    }
                    return KeyEventResult.ignored;
                  },
                  child: Material(
                    color: t.surface,
                    borderRadius: t.rLg,
                    child: Container(
                      width: w,
                      constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height - 80),
                      decoration: BoxDecoration(borderRadius: t.rLg, border: Border.all(color: t.divider), boxShadow: t.shadowLg),
                      clipBehavior: Clip.antiAlias,
                      child: widget.panel(context, close),
                    ),
                  ),
                ),
              ),
            ),
          ]);
        },
        child: widget.trigger(context, toggle, _controller.isShowing),
      ),
    );
  }
}
