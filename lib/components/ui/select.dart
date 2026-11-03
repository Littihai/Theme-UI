import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';
import 'badge.dart';

class SelectOption<T> {
  const SelectOption(this.value, this.label, {this.group, this.tone, this.hint});
  final T value;
  final String label;
  final String? group;
  final StatusTone? tone;
  final String? hint;
}

/// A drop-down that can search, group its options and colour them by tone. Arrow keys move, Enter picks, Esc closes.
class AppSelect<T> extends StatefulWidget {
  const AppSelect({
    super.key,
    required this.value,
    required this.options,
    required this.onChanged,
    this.placeholder,
    this.searchable = false,
    this.clearable = false,
    this.small = false,
    this.width,
    this.enabled = true,
  });

  final T? value;
  final List<SelectOption<T>> options;
  final ValueChanged<T?> onChanged;
  final String? placeholder;
  final bool searchable;
  final bool clearable;
  final bool small;
  final double? width;
  final bool enabled;

  @override
  State<AppSelect<T>> createState() => _AppSelectState<T>();
}

class _AppSelectState<T> extends State<AppSelect<T>> {
  final _link = LayerLink();
  final _controller = OverlayPortalController();
  final _search = TextEditingController();
  final _searchFocus = FocusNode();
  final _focus = FocusNode();
  int _cursor = 0;
  String _q = '';

  @override
  void dispose() {
    _search.dispose();
    _searchFocus.dispose();
    _focus.dispose();
    super.dispose();
  }

  List<SelectOption<T>> get _visible {
    if (_q.isEmpty) return widget.options;
    final q = _q.toLowerCase();
    return widget.options.where((o) => o.label.toLowerCase().contains(q) || (o.hint?.toLowerCase().contains(q) ?? false)).toList();
  }

  void _open() {
    if (!widget.enabled) return;
    setState(() {
      _q = '';
      _search.clear();
      _cursor = widget.options.indexWhere((o) => o.value == widget.value).clamp(0, widget.options.length);
    });
    _controller.show();
    if (widget.searchable) WidgetsBinding.instance.addPostFrameCallback((_) => _searchFocus.requestFocus());
  }

  void _close() {
    if (_controller.isShowing) _controller.hide();
    _focus.requestFocus();
  }

  void _pick(SelectOption<T> o) {
    widget.onChanged(o.value);
    _close();
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    final k = e.logicalKey;
    if (!_controller.isShowing) {
      if (k == LogicalKeyboardKey.enter || k == LogicalKeyboardKey.space || k == LogicalKeyboardKey.arrowDown) {
        _open();
        return KeyEventResult.handled;
      }
      return KeyEventResult.ignored;
    }
    final vis = _visible;
    if (k == LogicalKeyboardKey.escape) {
      _close();
      return KeyEventResult.handled;
    }
    if (k == LogicalKeyboardKey.arrowDown) {
      setState(() => _cursor = vis.isEmpty ? 0 : (_cursor + 1) % vis.length);
      return KeyEventResult.handled;
    }
    if (k == LogicalKeyboardKey.arrowUp) {
      setState(() => _cursor = vis.isEmpty ? 0 : (_cursor - 1 + vis.length) % vis.length);
      return KeyEventResult.handled;
    }
    if (k == LogicalKeyboardKey.enter) {
      if (_cursor >= 0 && _cursor < vis.length) _pick(vis[_cursor]);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final h = widget.small ? AppTokens.controlHSm : AppTokens.controlH;
    final current = widget.options.cast<SelectOption<T>?>().firstWhere((o) => o!.value == widget.value, orElse: () => null);

    return Focus(
      focusNode: _focus,
      onKeyEvent: _onKey,
      child: CompositedTransformTarget(
        link: _link,
        child: OverlayPortal(
          controller: _controller,
          overlayChildBuilder: (context) => _Menu<T>(
            link: _link,
            width: widget.width,
            options: _visible,
            cursor: _cursor,
            value: widget.value,
            searchable: widget.searchable,
            search: _search,
            searchFocus: _searchFocus,
            query: _q,
            onQuery: (q) => setState(() {
              _q = q;
              _cursor = 0;
            }),
            onPick: _pick,
            onClose: _close,
            onKey: _onKey,
          ),
          child: Opacity(
            opacity: widget.enabled ? 1 : 0.55,
            child: Material(
              color: t.surface,
              borderRadius: t.rMd,
              child: InkWell(
                onTap: widget.enabled ? _open : null,
                borderRadius: t.rMd,
                focusColor: t.focusRing.withValues(alpha: 0.25),
                canRequestFocus: false,
                child: Container(
                  height: h,
                  width: widget.width,
                  padding: const EdgeInsets.only(left: 12, right: 6),
                  decoration: BoxDecoration(borderRadius: t.rMd, border: Border.all(color: _focus.hasFocus ? t.accent : t.n300, width: _focus.hasFocus ? 1.5 : 1)),
                  child: Row(children: [
                    if (current?.tone != null) ...[ToneDot(current!.tone!), const SizedBox(width: 8)],
                    Expanded(
                      child: Text(
                        current?.label ?? widget.placeholder ?? context.t('select.placeholder'),
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: widget.small ? AppTokens.textSm : AppTokens.textMd, color: current == null ? t.n500 : t.text),
                      ),
                    ),
                    if (widget.clearable && current != null)
                      IconButton(
                        onPressed: () => widget.onChanged(null),
                        tooltip: context.t('select.clear'),
                        icon: AppIconW(AppIcon.x, size: 14, color: t.n500),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 24, minHeight: 24),
                      ),
                    AppIconW(AppIcon.chevronDown, size: 18, color: t.n500),
                  ]),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Menu<T> extends StatelessWidget {
  const _Menu({
    required this.link,
    this.width,
    required this.options,
    required this.cursor,
    required this.value,
    required this.searchable,
    required this.search,
    required this.searchFocus,
    required this.query,
    required this.onQuery,
    required this.onPick,
    required this.onClose,
    required this.onKey,
  });

  final LayerLink link;
  final double? width;
  final List<SelectOption<T>> options;
  final int cursor;
  final T? value;
  final bool searchable;
  final TextEditingController search;
  final FocusNode searchFocus;
  final String query;
  final ValueChanged<String> onQuery;
  final void Function(SelectOption<T>) onPick;
  final VoidCallback onClose;
  final KeyEventResult Function(FocusNode, KeyEvent) onKey;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final w = width ?? (link.leaderSize?.width ?? 240);
    String? lastGroup;
    final items = <Widget>[];
    for (var i = 0; i < options.length; i++) {
      final o = options[i];
      if (o.group != null && o.group != lastGroup) {
        lastGroup = o.group;
        items.add(Padding(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
          child: Text(o.group!.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: t.muted, letterSpacing: 0.4)),
        ));
      }
      final hot = i == cursor;
      items.add(InkWell(
        onTap: () => onPick(o),
        child: Container(
          color: hot ? t.a100 : null,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(children: [
            if (o.tone != null) ...[ToneDot(o.tone!), const SizedBox(width: 8)],
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(o.label, style: TextStyle(fontSize: AppTokens.textMd, color: t.text, fontWeight: o.value == value ? FontWeight.w600 : null)),
                if (o.hint != null) Text(o.hint!, style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
              ]),
            ),
            if (o.value == value) AppIconW(AppIcon.check, size: 16, color: t.a800),
          ]),
        ),
      ));
    }

    return Stack(children: [
      Positioned.fill(child: GestureDetector(behavior: HitTestBehavior.opaque, onTap: onClose)),
      CompositedTransformFollower(
        link: link,
        targetAnchor: Alignment.bottomLeft,
        followerAnchor: Alignment.topLeft,
        offset: const Offset(0, 4),
        showWhenUnlinked: false,
        child: Align(
          alignment: Alignment.topLeft,
          child: Material(
            color: t.surface,
            borderRadius: t.rLg,
            elevation: 0,
            child: Container(
              width: w,
              constraints: const BoxConstraints(maxHeight: 320),
              decoration: BoxDecoration(borderRadius: t.rLg, border: Border.all(color: t.divider), boxShadow: t.shadowLg),
              clipBehavior: Clip.antiAlias,
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                if (searchable)
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: Focus(
                      onKeyEvent: (n, e) => (e.logicalKey == LogicalKeyboardKey.arrowDown || e.logicalKey == LogicalKeyboardKey.arrowUp || e.logicalKey == LogicalKeyboardKey.enter || e.logicalKey == LogicalKeyboardKey.escape) ? onKey(n, e) : KeyEventResult.ignored,
                      child: SizedBox(
                        height: AppTokens.controlHSm,
                        child: TextField(
                          controller: search,
                          focusNode: searchFocus,
                          onChanged: onQuery,
                          style: TextStyle(fontSize: AppTokens.textSm, color: t.text),
                          decoration: InputDecoration(
                            hintText: context.t('select.search'),
                            prefixIcon: Padding(padding: const EdgeInsets.only(left: 10, right: 6), child: AppIconW(AppIcon.search, size: 15, color: t.n500)),
                            prefixIconConstraints: const BoxConstraints(),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                          ),
                        ),
                      ),
                    ),
                  ),
                Flexible(
                  child: options.isEmpty
                      ? Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(query.isEmpty ? context.t('select.none') : context.t('select.noMatch', {'q': query}), style: TextStyle(fontSize: AppTokens.textSm, fontWeight: FontWeight.w600, color: t.text)),
                            if (query.isNotEmpty) Text(context.t('select.noMatchHint'), style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
                          ]),
                        )
                      : ListView(shrinkWrap: true, padding: const EdgeInsets.symmetric(vertical: 4), children: items),
                ),
              ]),
            ),
          ),
        ),
      ),
    ]);
  }
}
