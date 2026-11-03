import 'package:flutter/material.dart';

import '../../app/scope.dart';
import '../../theme/tokens.dart';

/// A card on the page: a surface with a hairline, an optional title row and the content.
class Panel extends StatelessWidget {
  const Panel({super.key, this.title, this.subtitle, this.actions, required this.child, this.padding, this.onTap, this.tone});
  final String? title;
  final String? subtitle;
  final List<Widget>? actions;
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  /// a coloured left edge
  final StatusTone? tone;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (title != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 12, 0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title!, style: context.textTheme.titleMedium),
                      if (subtitle != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(subtitle!, style: TextStyle(color: t.muted, fontSize: AppTokens.textSm))),
                    ],
                  ),
                ),
                if (actions != null) ...[const SizedBox(width: 8), ...actions!],
              ],
            ),
          ),
        Padding(padding: padding ?? const EdgeInsets.all(16), child: child),
      ],
    );
    final box = Container(
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius: t.rLg,
        border: Border.all(color: t.divider),
        boxShadow: t.shadowSm,
      ),
      clipBehavior: Clip.antiAlias,
      child: tone == null
          ? body
          : DecoratedBox(decoration: BoxDecoration(border: Border(left: BorderSide(color: t.tone(tone!).solid, width: 3))), child: body),
    );
    if (onTap == null) return box;
    return Material(
      color: Colors.transparent,
      child: InkWell(onTap: onTap, borderRadius: t.rLg, hoverColor: t.hover, child: box),
    );
  }
}

/// A heading above a block of the page or a section of the showcase.
class SectionHeading extends StatelessWidget {
  const SectionHeading(this.title, {super.key, this.desc, this.trailing});
  final String title;
  final String? desc;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: context.textTheme.titleMedium),
                if (desc != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(desc!, style: TextStyle(color: t.muted, fontSize: AppTokens.textSm))),
              ],
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

/// A key cap: "Ctrl", "K".
class Kbd extends StatelessWidget {
  const Kbd(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: t.n100, borderRadius: t.rSm, border: Border.all(color: t.n300)),
      child: Text(text, style: TextStyle(fontSize: 11, color: t.n700, fontWeight: FontWeight.w600, height: 1.3)),
    );
  }
}

/// A short labelled value (the About section, the account details).
class KeyValue extends StatelessWidget {
  const KeyValue(this.label, this.value, {super.key});
  final String label;
  final Widget value;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 140, child: Text(label, style: TextStyle(color: t.muted, fontSize: AppTokens.textSm))),
          Expanded(child: DefaultTextStyle.merge(style: const TextStyle(fontSize: AppTokens.textMd), child: value)),
        ],
      ),
    );
  }
}

/// Lays the page's content out at the page width with the house padding.
class PageBody extends StatelessWidget {
  const PageBody({super.key, required this.children, this.gap = 20});
  final List<Widget> children;
  final double gap;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final pad = context.pagePad;
    return Padding(
      padding: EdgeInsets.fromLTRB(pad, pad, pad, pad + 40),
      child: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: t.pageMax),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [for (var i = 0; i < children.length; i++) ...[if (i > 0) SizedBox(height: gap), children[i]]],
          ),
        ),
      ),
    );
  }
}

/// Two or three panels side by side on a desktop, stacked on a phone.
class Cols extends StatelessWidget {
  const Cols({super.key, required this.children, this.flex, this.gap = 20, this.stackBelow = Breakpoints.tight});
  final List<Widget> children;
  final List<int>? flex;
  final double gap;
  final double stackBelow;

  @override
  Widget build(BuildContext context) {
    if (context.width < stackBelow) {
      return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [for (var i = 0; i < children.length; i++) ...[if (i > 0) SizedBox(height: gap), children[i]]]);
    }
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < children.length; i++) ...[
          if (i > 0) SizedBox(width: gap),
          Expanded(flex: flex == null ? 1 : flex![i], child: children[i]),
        ],
      ],
    );
  }
}
