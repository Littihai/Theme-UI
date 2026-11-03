import 'dart:async';

import 'package:flutter/material.dart';

import '../app/scope.dart';
import '../constants/icons.dart';
import '../theme/tokens.dart';

enum ToastKind { success, info, warn, error }

class ToastItem {
  ToastItem({required this.id, required this.kind, required this.title, this.text, this.actionLabel, this.onAction, this.onTap, required this.duration});
  final int id;
  final ToastKind kind;
  final String title;
  final String? text;
  final String? actionLabel;
  final VoidCallback? onAction;
  final VoidCallback? onTap;
  final Duration duration;
  Timer? timer;
}

/// The toast stack: the app reports what happened; a toast closes itself in 5 s, except an error, which stays until
/// dismissed. A mistake the person must fix is shown beside the field, never as a toast.
class ToastStore extends ChangeNotifier {
  final List<ToastItem> _items = [];
  int _seq = 0;

  List<ToastItem> get items => List.unmodifiable(_items);

  int show(ToastKind kind, String title, {String? text, String? actionLabel, VoidCallback? onAction, VoidCallback? onTap, Duration? duration}) {
    final d = duration ?? (kind == ToastKind.error ? Duration.zero : const Duration(seconds: 5));
    final item = ToastItem(id: ++_seq, kind: kind, title: title, text: text, actionLabel: actionLabel, onAction: onAction, onTap: onTap, duration: d);
    _items.add(item);
    if (_items.length > 4) dismiss(_items.first.id);
    if (d > Duration.zero) item.timer = Timer(d, () => dismiss(item.id));
    notifyListeners();
    return item.id;
  }

  int success(String title, {String? text, VoidCallback? onTap}) => show(ToastKind.success, title, text: text, onTap: onTap);
  int info(String title, {String? text, VoidCallback? onTap}) => show(ToastKind.info, title, text: text, onTap: onTap);
  int warn(String title, {String? text, String? actionLabel, VoidCallback? onAction}) =>
      show(ToastKind.warn, title, text: text, actionLabel: actionLabel, onAction: onAction);
  int error(String title, {String? text}) => show(ToastKind.error, title, text: text);

  void dismiss(int id) {
    final i = _items.indexWhere((t) => t.id == id);
    if (i < 0) return;
    _items[i].timer?.cancel();
    _items.removeAt(i);
    notifyListeners();
  }

  void clear() {
    for (final t in _items) {
      t.timer?.cancel();
    }
    _items.clear();
    notifyListeners();
  }
}

/// Draws the stack over the whole app (bottom-right on a desktop, top-centre on a phone).
class ToastHost extends StatelessWidget {
  const ToastHost({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final store = context.stores.toasts;
    return Stack(
      children: [
        child,
        ListenableBuilder(
          listenable: store,
          builder: (context, _) {
            final mobile = context.isMobile;
            final items = store.items;
            return Positioned(
              right: mobile ? 12 : 20,
              left: mobile ? 12 : null,
              bottom: mobile ? null : 20,
              top: mobile ? 12 : null,
              child: IgnorePointer(
                ignoring: items.isEmpty,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    for (final t in items)
                      Padding(
                        key: ValueKey(t.id),
                        padding: const EdgeInsets.only(top: 8),
                        child: _ToastCard(item: t, onClose: () => store.dismiss(t.id), width: mobile ? double.infinity : 360),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _ToastCard extends StatefulWidget {
  const _ToastCard({required this.item, required this.onClose, required this.width});
  final ToastItem item;
  final VoidCallback onClose;
  final double width;

  @override
  State<_ToastCard> createState() => _ToastCardState();
}

class _ToastCardState extends State<_ToastCard> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 220))..forward();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final item = widget.item;
    final (icon, color) = switch (item.kind) {
      ToastKind.success => (AppIcon.checkCircle, t.okSolid),
      ToastKind.info => (AppIcon.info, t.accent2),
      ToastKind.warn => (AppIcon.alert, t.warnSolid),
      ToastKind.error => (AppIcon.blocked, t.stopSolid),
    };
    final reduced = context.reducedMotion;
    final body = Material(
      color: t.brandDeep,
      borderRadius: t.rLg,
      elevation: 0,
      child: InkWell(
        onTap: item.onTap == null ? null : () {
          item.onTap!();
          widget.onClose();
        },
        borderRadius: t.rLg,
        child: Container(
          width: widget.width,
          padding: const EdgeInsets.fromLTRB(14, 12, 8, 12),
          decoration: BoxDecoration(borderRadius: t.rLg, boxShadow: t.shadowLg, border: Border(left: BorderSide(color: color, width: 3))),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(padding: const EdgeInsets.only(top: 1), child: AppIconW(icon, size: 18, color: color)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(item.title, style: TextStyle(color: t.onBrandDeep, fontWeight: FontWeight.w600, fontSize: AppTokens.textMd)),
                    if (item.text != null) ...[
                      const SizedBox(height: 2),
                      Text(item.text!, style: TextStyle(color: t.onBrandDeep.withValues(alpha: 0.78), fontSize: AppTokens.textSm)),
                    ],
                    if (item.actionLabel != null) ...[
                      const SizedBox(height: 6),
                      TextButton(
                        onPressed: () {
                          item.onAction?.call();
                          widget.onClose();
                        },
                        style: TextButton.styleFrom(foregroundColor: t.accent2, padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), minimumSize: Size.zero),
                        child: Text(item.actionLabel!),
                      ),
                    ],
                  ],
                ),
              ),
              // no Tooltip here: the host sits above the Navigator, where there is no Overlay for one
              Semantics(
                button: true,
                label: context.t('toast.close'),
                child: InkWell(
                  onTap: widget.onClose,
                  borderRadius: BorderRadius.circular(14),
                  child: SizedBox(width: 28, height: 28, child: Center(child: AppIconW(AppIcon.x, size: 16, color: t.onBrandDeep.withValues(alpha: 0.7)))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
    if (reduced) return body;
    return FadeTransition(
      opacity: CurvedAnimation(parent: _c, curve: Curves.easeOut),
      child: SlideTransition(
        position: Tween(begin: const Offset(0, 0.15), end: Offset.zero).animate(CurvedAnimation(parent: _c, curve: Curves.easeOutCubic)),
        child: body,
      ),
    );
  }
}
