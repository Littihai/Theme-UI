import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../app/scope.dart';
import '../components/ui/panel.dart';
import '../constants/icons.dart';
import '../constants/nav.dart';
import '../modules/settings/settings_nav.dart';
import '../theme/tokens.dart';

/// Ctrl-K: every page and every settings section the person may open, filtered as they type. Arrow keys move,
/// Enter opens, Esc closes.
Future<void> showCommandPalette(BuildContext context) => showDialog<void>(
      context: context,
      barrierColor: context.tokens.scrim,
      builder: (_) => const _Palette(),
    );

class _Hit {
  const _Hit({required this.group, required this.icon, required this.label, this.desc, required this.go});
  final String group;
  final AppIcon icon;
  final String label;
  final String? desc;
  final void Function(BuildContext) go;
}

class _Palette extends StatefulWidget {
  const _Palette();

  @override
  State<_Palette> createState() => _PaletteState();
}

class _PaletteState extends State<_Palette> {
  final _c = TextEditingController();
  String _q = '';
  int _cursor = 0;

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  List<_Hit> _hits(BuildContext context) {
    final auth = context.stores.auth;
    final all = <_Hit>[
      for (final e in allNavEntries())
        if (e.permission == null || auth.can(e.permission!))
          _Hit(group: context.t('palette.pages'), icon: e.icon, label: context.t(e.labelKey), desc: e.descKey.isEmpty ? null : context.t(e.descKey), go: (c) => c.go(e.path)),
      for (final s in SettingsSection.values)
        _Hit(group: context.t('palette.settings'), icon: s.icon, label: '${context.t('set.title')} · ${context.t(s.labelKey)}', desc: context.t(s.descKey), go: (c) => openSettings(c, s)),
    ];
    if (_q.isEmpty) return all;
    final q = _q.toLowerCase();
    return all.where((h) => h.label.toLowerCase().contains(q) || (h.desc?.toLowerCase().contains(q) ?? false)).toList();
  }

  void _open(_Hit h) {
    Navigator.of(context).pop();
    h.go(context);
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final hits = _hits(context);
    if (_cursor >= hits.length) _cursor = 0;
    return Dialog(
      alignment: Alignment.topCenter,
      insetPadding: EdgeInsets.fromLTRB(16, context.isMobile ? 24 : 80, 16, 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 560, maxHeight: 480),
        child: Focus(
          onKeyEvent: (n, e) {
            if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
            if (e.logicalKey == LogicalKeyboardKey.arrowDown) {
              setState(() => _cursor = hits.isEmpty ? 0 : (_cursor + 1) % hits.length);
              return KeyEventResult.handled;
            }
            if (e.logicalKey == LogicalKeyboardKey.arrowUp) {
              setState(() => _cursor = hits.isEmpty ? 0 : (_cursor - 1 + hits.length) % hits.length);
              return KeyEventResult.handled;
            }
            if (e.logicalKey == LogicalKeyboardKey.enter && hits.isNotEmpty) {
              _open(hits[_cursor]);
              return KeyEventResult.handled;
            }
            return KeyEventResult.ignored;
          },
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
              child: Row(children: [
                AppIconW(AppIcon.search, size: 18, color: t.n500),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _c,
                    autofocus: true,
                    onChanged: (v) => setState(() {
                      _q = v.trim();
                      _cursor = 0;
                    }),
                    style: TextStyle(fontSize: AppTokens.textLg, color: t.text),
                    decoration: InputDecoration(hintText: context.t('palette.searchPh'), border: InputBorder.none, enabledBorder: InputBorder.none, focusedBorder: InputBorder.none, filled: false, contentPadding: EdgeInsets.zero),
                  ),
                ),
                const Kbd('Esc'),
              ]),
            ),
            Divider(color: t.divider),
            Flexible(
              child: hits.isEmpty
                  ? Padding(padding: const EdgeInsets.all(20), child: Text(context.t('palette.empty'), style: TextStyle(color: t.muted)))
                  : ListView.builder(
                      shrinkWrap: true,
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      itemCount: hits.length,
                      itemBuilder: (context, i) {
                        final h = hits[i];
                        final showGroup = i == 0 || hits[i - 1].group != h.group;
                        return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                          if (showGroup)
                            Padding(
                              padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                              child: Text(h.group.toUpperCase(), style: TextStyle(fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, color: t.muted, letterSpacing: 0.5)),
                            ),
                          InkWell(
                            onTap: () => _open(h),
                            child: Container(
                              color: i == _cursor ? t.a100 : null,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
                              child: Row(children: [
                                AppIconW(h.icon, size: 18, color: i == _cursor ? t.a800 : t.n600),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                    Text(h.label, style: TextStyle(fontSize: AppTokens.textMd, fontWeight: FontWeight.w500, color: t.text)),
                                    if (h.desc != null) Text(h.desc!, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: AppTokens.textXs, color: t.muted)),
                                  ]),
                                ),
                                if (i == _cursor) const Kbd('↵'),
                              ]),
                            ),
                          ),
                        ]);
                      },
                    ),
            ),
          ]),
        ),
      ),
    );
  }
}
