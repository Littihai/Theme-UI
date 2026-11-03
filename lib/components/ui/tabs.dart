import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';

class TabItem {
  const TabItem(this.id, this.label, {this.icon, this.count, this.hot = false});
  final String id;
  final String label;
  final AppIcon? icon;
  final int? count;

  /// the count is urgent (red)
  final bool hot;
}

/// An underlined row on a desktop; wrapping pills on a phone (or always, with [pills]).
class AppTabs extends StatelessWidget {
  const AppTabs({super.key, required this.tabs, required this.active, required this.onPick, this.pills = false});
  final List<TabItem> tabs;
  final String active;
  final ValueChanged<String> onPick;
  final bool pills;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final asPills = pills || context.isMobile;
    if (asPills) {
      return Wrap(
        spacing: 6,
        runSpacing: 6,
        children: [
          for (final tab in tabs)
            _Pill(tab: tab, active: tab.id == active, onTap: () => onPick(tab.id)),
        ],
      );
    }
    return Container(
      decoration: BoxDecoration(border: Border(bottom: BorderSide(color: t.divider))),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            for (final tab in tabs)
              _Underlined(tab: tab, active: tab.id == active, onTap: () => onPick(tab.id)),
          ],
        ),
      ),
    );
  }
}

class _Label extends StatelessWidget {
  const _Label({required this.tab, required this.color});
  final TabItem tab;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (tab.icon != null) ...[AppIconW(tab.icon!, size: 16, color: color), const SizedBox(width: 6)],
        Text(tab.label, style: TextStyle(color: color, fontSize: AppTokens.textMd, fontWeight: FontWeight.w500)),
        if (tab.count != null) ...[
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
            decoration: BoxDecoration(color: tab.hot ? t.stopBg : t.n100, borderRadius: BorderRadius.circular(10)),
            child: Text('${tab.count}', style: TextStyle(color: tab.hot ? t.stopFg : t.n700, fontSize: AppTokens.textXs, fontWeight: FontWeight.w600)),
          ),
        ],
      ],
    );
  }
}

class _Underlined extends StatelessWidget {
  const _Underlined({required this.tab, required this.active, required this.onTap});
  final TabItem tab;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return InkWell(
      onTap: onTap,
      hoverColor: t.hover,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: active ? t.accent : Colors.transparent, width: 2))),
        child: _Label(tab: tab, color: active ? t.text : t.n600),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.tab, required this.active, required this.onTap});
  final TabItem tab;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Material(
      color: active ? t.a100 : t.surface,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(999), border: Border.all(color: active ? t.a300 : t.n300)),
          child: _Label(tab: tab, color: active ? t.a800 : t.n700),
        ),
      ),
    );
  }
}
