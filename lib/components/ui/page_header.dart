import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../app/scope.dart';
import '../../constants/icons.dart';
import '../../theme/tokens.dart';

/// Every page opens with the same header: a small pre-title, the title, one line under it, and the actions on the right
/// (one primary at most). On a phone the actions wrap under the title.
class PageHeader extends StatelessWidget {
  const PageHeader({super.key, this.pre, required this.title, this.subtitle, this.actions, this.crumbs, this.bottom});
  final String? pre;
  final String title;
  final String? subtitle;
  final List<Widget>? actions;
  final List<CrumbItem>? crumbs;

  /// tabs or filters under the title row
  final Widget? bottom;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final mobile = context.isMobile;
    final titleBlock = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (crumbs != null) Padding(padding: const EdgeInsets.only(bottom: 6), child: Breadcrumb(items: crumbs!)),
        if (pre != null) Text(pre!.toUpperCase(), style: TextStyle(color: t.muted, fontSize: AppTokens.textXs, fontWeight: FontWeight.w600, letterSpacing: 0.6)),
        Text(title, style: context.textTheme.headlineSmall),
        if (subtitle != null) Padding(padding: const EdgeInsets.only(top: 2), child: Text(subtitle!, style: TextStyle(color: t.muted, fontSize: AppTokens.textMd))),
      ],
    );
    final acts = actions == null ? null : Wrap(spacing: 8, runSpacing: 8, children: actions!);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (mobile || acts == null) ...[titleBlock, if (acts != null) Padding(padding: const EdgeInsets.only(top: 12), child: acts)]
        else
          Row(crossAxisAlignment: CrossAxisAlignment.end, children: [Expanded(child: titleBlock), const SizedBox(width: 16), acts]),
        if (bottom != null) Padding(padding: const EdgeInsets.only(top: 14), child: bottom!),
      ],
    );
  }
}

class CrumbItem {
  const CrumbItem(this.label, {this.path});
  final String label;
  final String? path;
}

/// Links up the path, the current page last; past four levels the middle folds into "…" (click to unfold).
class Breadcrumb extends StatefulWidget {
  const Breadcrumb({super.key, required this.items});
  final List<CrumbItem> items;

  @override
  State<Breadcrumb> createState() => _BreadcrumbState();
}

class _BreadcrumbState extends State<Breadcrumb> {
  bool _open = false;

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    final items = widget.items;
    final fold = items.length > 4 && !_open;
    final shown = fold ? [items.first, null, ...items.sublist(items.length - 2)] : items.cast<CrumbItem?>();
    final style = TextStyle(fontSize: AppTokens.textSm, color: t.muted);
    return Semantics(
      label: context.t('crumb.label'),
      child: Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          for (var i = 0; i < shown.length; i++) ...[
            if (i > 0) Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: AppIconW(AppIcon.chevronRight, size: 14, color: t.n400)),
            if (shown[i] == null)
              Tooltip(
                message: context.t('crumb.more'),
                child: InkWell(onTap: () => setState(() => _open = true), borderRadius: t.rSm, child: Padding(padding: const EdgeInsets.symmetric(horizontal: 4), child: Text('…', style: style))),
              )
            else if (i == shown.length - 1 || shown[i]!.path == null)
              Text(shown[i]!.label, style: style.copyWith(color: i == shown.length - 1 ? t.text : null, fontWeight: i == shown.length - 1 ? FontWeight.w500 : null))
            else
              InkWell(
                onTap: () => context.go(shown[i]!.path!),
                borderRadius: t.rSm,
                child: Padding(padding: const EdgeInsets.symmetric(horizontal: 2), child: Text(shown[i]!.label, style: style.copyWith(color: t.a800))),
              ),
          ],
        ],
      ),
    );
  }
}
